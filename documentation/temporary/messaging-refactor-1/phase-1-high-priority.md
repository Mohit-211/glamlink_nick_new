# Phase 1: High Priority Refactoring

**Parent:** `MASTER-PLAN.md`
**Files in this phase:** 3
**Estimated effort:** Large (4-6 hours total)

---

## File 1: useConversation.ts

**Location:** `lib/features/crm/profile/support-messaging/hooks/useConversation.ts`
**Current:** 550 lines (550 Hook/JS, 0 TSX)
**Target:** Main hook ~150 lines, extracted hooks ~100-150 lines each

### Problems Identified

1. Hook logic is 550 lines - far exceeds 100 line threshold
2. Contains multiple distinct responsibilities mixed together:
   - Firestore real-time listeners (lines 101-203)
   - Message sending with optimistic updates (lines 205-256)
   - Mark as read functionality (lines 265-317)
   - Status/priority/tags updates with audit logging (lines 319-413)
   - Reactions handling (lines 415-470)
   - Batch messaging (lines 472-494)
   - Pagination/lazy loading (lines 496-531)
3. No subdirectory structure for hooks

### Refactoring Plan

#### Step 1: Create hooks subdirectory structure

```bash
mkdir -p lib/features/crm/profile/support-messaging/hooks/useConversation
```

#### Step 2: Extract `useConversationRealtime.ts` (Firestore listeners)

Extract lines 101-203 (real-time subscription logic):

```typescript
// hooks/useConversation/useConversationRealtime.ts
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { doc, collection, query, orderBy, onSnapshot, limit, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db as clientDb } from '@/lib/config/firebase';
import { useAuth } from '@/lib/features/auth/useAuth';
import type { Message } from '../../types';
import { COLLECTION_PATHS, PAGINATION_CONFIG } from '../../config';
import {
  setCurrentConversation,
  setMessages,
  setMessagesLoading,
  setError,
  toSerializableConversation,
  toSerializableMessage,
} from '../../store/supportMessagingSlice';
import type { AppDispatch } from '@/store/store';

interface UseConversationRealtimeProps {
  conversationId: string;
  onOldestMessageRef: (ref: QueryDocumentSnapshot<DocumentData> | null) => void;
  onHasMoreMessages: (hasMore: boolean) => void;
}

export function useConversationRealtime({
  conversationId,
  onOldestMessageRef,
  onHasMoreMessages,
}: UseConversationRealtimeProps) {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Helper function to map Firestore document to Message
  const mapDocToMessage = useCallback((docSnapshot: QueryDocumentSnapshot<DocumentData>): Message => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      senderId: data.senderId,
      senderEmail: data.senderEmail,
      senderName: data.senderName,
      content: data.content,
      timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
      readAt: data.readAt?.toDate?.() || (data.readAt ? new Date(data.readAt) : undefined),
      readBy: data.readBy || [],
      reactions: (data.reactions || []).map((r: { emoji: string; userId: string; userName: string; createdAt: { toDate?: () => Date } | string }) => ({
        emoji: r.emoji,
        userId: r.userId,
        userName: r.userName,
        createdAt: typeof r.createdAt === 'object' && r.createdAt?.toDate
          ? r.createdAt.toDate()
          : new Date(r.createdAt as string),
      })),
    };
  }, []);

  useEffect(() => {
    if (!conversationId || !user || !clientDb) {
      dispatch(setCurrentConversation(null));
      dispatch(setMessagesLoading(false));
      return;
    }

    dispatch(setMessagesLoading(true));
    dispatch(setError(null));
    onHasMoreMessages(true);
    onOldestMessageRef(null);

    const conversationRef = doc(clientDb, COLLECTION_PATHS.conversations, conversationId);
    const messagesRef = collection(clientDb, COLLECTION_PATHS.messages(conversationId));
    const messagesQuery = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(PAGINATION_CONFIG.messagesInitialLoad)
    );

    // Listen to conversation document
    const unsubConversation = onSnapshot(
      conversationRef,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          dispatch(setError('Conversation not found'));
          dispatch(setMessagesLoading(false));
          return;
        }

        const data = docSnapshot.data();
        const convData = {
          id: docSnapshot.id,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          adminId: data.adminId,
          status: data.status,
          priority: data.priority || 'normal',
          subject: data.subject,
          unreadByUser: data.unreadByUser || 0,
          unreadByAdmin: data.unreadByAdmin || 0,
          lastMessage: data.lastMessage
            ? {
                content: data.lastMessage.content,
                senderId: data.lastMessage.senderId,
                timestamp: data.lastMessage.timestamp?.toDate?.() || new Date(data.lastMessage.timestamp),
              }
            : null,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          tags: data.tags || [],
          metrics: data.metrics,
          messages: [] as Message[],
        };

        dispatch(
          setCurrentConversation({
            ...toSerializableConversation(convData),
            messages: [],
          })
        );
      },
      (err) => {
        console.error('Error listening to conversation:', err);
        dispatch(setError('Failed to load conversation'));
      }
    );

    // Listen to messages subcollection
    const unsubMessages = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map(mapDocToMessage).reverse();

        if (snapshot.docs.length > 0) {
          onOldestMessageRef(snapshot.docs[snapshot.docs.length - 1]);
        }

        onHasMoreMessages(snapshot.docs.length === PAGINATION_CONFIG.messagesInitialLoad);
        dispatch(setMessages(msgs.map(toSerializableMessage)));
      },
      (err) => {
        console.error('Error listening to messages:', err);
        dispatch(setError('Failed to load messages'));
        dispatch(setMessagesLoading(false));
      }
    );

    return () => {
      unsubConversation();
      unsubMessages();
    };
  }, [conversationId, user, dispatch, mapDocToMessage, onOldestMessageRef, onHasMoreMessages]);

  return { mapDocToMessage };
}
```

#### Step 3: Extract `useConversationMessages.ts` (Send, retry, batch)

Extract lines 205-256 (sendMessage), 258-263 (retryMessage), 472-494 (sendMessageBatch):

```typescript
// hooks/useConversation/useConversationMessages.ts
'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/features/auth/useAuth';
import type { Message } from '../../types';
import { sanitizeMessageContent } from '../../utils/sanitize';
import { sendMessageBatch as sendMessageBatchUtil, type BatchMessageInput } from '../../utils/messageBatch';

interface UseConversationMessagesProps {
  conversationId: string;
}

interface UseConversationMessagesReturn {
  optimisticMessages: Message[];
  sendMessage: (content: string, messageId?: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  sendMessageBatch: (contents: string[]) => Promise<void>;
  localError: string | null;
}

export function useConversationMessages({
  conversationId,
}: UseConversationMessagesProps): UseConversationMessagesReturn {
  const { user } = useAuth();
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, messageId?: string): Promise<void> => {
    const sanitized = sanitizeMessageContent(content);
    if (!conversationId || !user || !sanitized) return;

    const isRetry = !!messageId;
    const tempId = messageId || `temp_${Date.now()}`;

    if (isRetry) {
      setOptimisticMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, status: 'sending' as const } : m)
      );
    } else {
      const optimisticMessage: Message = {
        id: tempId,
        senderId: user.uid,
        senderEmail: user.email || '',
        senderName: user.displayName || user.email?.split('@')[0] || 'User',
        content: sanitized,
        timestamp: new Date(),
        status: 'sending',
      };
      setOptimisticMessages(prev => [...prev, optimisticMessage]);
    }

    try {
      const response = await fetch(`/api/support/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: sanitized }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to send message');
      setOptimisticMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, status: 'failed' as const } : m)
      );
      throw err;
    }
  }, [conversationId, user]);

  const retryMessage = useCallback(async (messageId: string): Promise<void> => {
    const message = optimisticMessages.find(m => m.id === messageId && m.status === 'failed');
    if (!message) return;
    await sendMessage(message.content, messageId);
  }, [optimisticMessages, sendMessage]);

  const sendMessageBatch = useCallback(async (contents: string[]): Promise<void> => {
    if (!user || contents.length === 0) return;

    const messages: BatchMessageInput[] = contents
      .map((content) => sanitizeMessageContent(content))
      .filter((content): content is string => !!content)
      .map((content) => ({
        content,
        senderId: user.uid,
        senderEmail: user.email || '',
        senderName: user.displayName || user.email?.split('@')[0] || 'User',
      }));

    if (messages.length === 0) return;

    const result = await sendMessageBatchUtil(conversationId, messages);

    if (!result.success) {
      setLocalError(result.error || 'Failed to send messages');
      throw new Error(result.error);
    }
  }, [conversationId, user]);

  // Clear optimistic messages when confirmed (to be called by parent)
  const clearConfirmedMessages = useCallback((confirmedContents: Set<string>) => {
    setOptimisticMessages(prev =>
      prev.filter(msg => !confirmedContents.has(msg.content))
    );
  }, []);

  return {
    optimisticMessages,
    sendMessage,
    retryMessage,
    sendMessageBatch,
    localError,
  };
}
```

#### Step 4: Extract `useConversationActions.ts` (Status, priority, tags, reactions)

Extract lines 319-470 (updateStatus, updatePriority, updateTags, addReaction, removeReaction):

```typescript
// hooks/useConversation/useConversationActions.ts
'use client';

import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db as clientDb } from '@/lib/config/firebase';
import { useAuth } from '@/lib/features/auth/useAuth';
import type { ConversationStatus, ConversationPriority, ConversationTag, ConversationWithMessages } from '../../types';
import { createAuditLog } from '../../utils/auditLog';
import { COLLECTION_PATHS } from '../../config';
import {
  updateConversationStatus,
  updateConversationPriority,
  updateConversationTags,
} from '../../store/supportMessagingSlice';
import type { AppDispatch } from '@/store/store';

interface UseConversationActionsProps {
  conversationId: string;
  conversation: ConversationWithMessages | null;
}

export function useConversationActions({
  conversationId,
  conversation,
}: UseConversationActionsProps) {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [localError, setLocalError] = useState<string | null>(null);

  const updateStatus = useCallback(async (status: ConversationStatus): Promise<void> => {
    if (!conversationId || !user || !clientDb) return;

    const oldStatus = conversation?.status;

    try {
      const conversationRef = doc(clientDb, COLLECTION_PATHS.conversations, conversationId);
      await updateDoc(conversationRef, {
        status,
        updatedAt: new Date(),
      });

      dispatch(updateConversationStatus({ id: conversationId, status }));

      await createAuditLog({
        conversationId,
        action: 'status_changed',
        oldValue: oldStatus,
        newValue: status,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userEmail: user.email || '',
      });
    } catch (err) {
      console.error('Error updating status:', err);
      setLocalError('Failed to update status');
      throw err;
    }
  }, [conversationId, user, dispatch, conversation?.status]);

  const updatePriority = useCallback(async (priority: ConversationPriority): Promise<void> => {
    if (!conversationId || !user || !clientDb) return;

    const oldPriority = conversation?.priority;

    try {
      const conversationRef = doc(clientDb, COLLECTION_PATHS.conversations, conversationId);
      await updateDoc(conversationRef, {
        priority,
        updatedAt: new Date(),
      });

      dispatch(updateConversationPriority({ id: conversationId, priority }));

      await createAuditLog({
        conversationId,
        action: 'priority_changed',
        oldValue: oldPriority,
        newValue: priority,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userEmail: user.email || '',
      });
    } catch (err) {
      console.error('Error updating priority:', err);
      setLocalError('Failed to update priority');
      throw err;
    }
  }, [conversationId, user, dispatch, conversation?.priority]);

  const updateTagsHandler = useCallback(async (tags: ConversationTag[]): Promise<void> => {
    if (!conversationId || !user || !clientDb) return;

    const oldTags = conversation?.tags || [];

    try {
      const conversationRef = doc(clientDb, COLLECTION_PATHS.conversations, conversationId);
      await updateDoc(conversationRef, {
        tags,
        updatedAt: new Date(),
      });

      dispatch(updateConversationTags({ id: conversationId, tags }));

      await createAuditLog({
        conversationId,
        action: 'tags_updated',
        oldValue: oldTags,
        newValue: tags,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userEmail: user.email || '',
      });
    } catch (err) {
      console.error('Error updating tags:', err);
      setLocalError('Failed to update tags');
      throw err;
    }
  }, [conversationId, user, dispatch, conversation?.tags]);

  const addReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    if (!conversationId || !user || !clientDb) return;

    try {
      const msgRef = doc(clientDb, COLLECTION_PATHS.messages(conversationId), messageId);
      await updateDoc(msgRef, {
        reactions: arrayUnion({
          emoji,
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || 'User',
          createdAt: new Date(),
        }),
      });
    } catch (err) {
      console.error('Error adding reaction:', err);
      setLocalError('Failed to add reaction');
      throw err;
    }
  }, [conversationId, user]);

  const removeReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    if (!conversationId || !user || !clientDb) return;

    try {
      const messages = conversation?.messages || [];
      const message = messages.find(m => m.id === messageId);
      if (!message?.reactions) return;

      const reactionToRemove = message.reactions.find(
        r => r.emoji === emoji && r.userId === user.uid
      );
      if (!reactionToRemove) return;

      const msgRef = doc(clientDb, COLLECTION_PATHS.messages(conversationId), messageId);
      const updatedReactions = message.reactions.filter(
        r => !(r.emoji === emoji && r.userId === user.uid)
      );

      await updateDoc(msgRef, {
        reactions: updatedReactions.map(r => ({
          emoji: r.emoji,
          userId: r.userId,
          userName: r.userName,
          createdAt: r.createdAt,
        })),
      });
    } catch (err) {
      console.error('Error removing reaction:', err);
      setLocalError('Failed to remove reaction');
      throw err;
    }
  }, [conversationId, user, conversation?.messages]);

  return {
    updateStatus,
    updatePriority,
    updateTags: updateTagsHandler,
    addReaction,
    removeReaction,
    actionsError: localError,
  };
}
```

#### Step 5: Extract `useConversationPagination.ts` (Load more messages)

Extract lines 496-531:

```typescript
// hooks/useConversation/useConversationPagination.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { collection, query, orderBy, startAfter, limit, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db as clientDb } from '@/lib/config/firebase';
import type { Message, ConversationWithMessages } from '../../types';
import { COLLECTION_PATHS, PAGINATION_CONFIG } from '../../config';
import { setMessages, toSerializableMessage } from '../../store/supportMessagingSlice';
import type { AppDispatch } from '@/store/store';

interface UseConversationPaginationProps {
  conversationId: string;
  conversation: ConversationWithMessages | null;
  mapDocToMessage: (doc: QueryDocumentSnapshot<DocumentData>) => Message;
}

export function useConversationPagination({
  conversationId,
  conversation,
  mapDocToMessage,
}: UseConversationPaginationProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const oldestMessageRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const setOldestMessageRef = useCallback((ref: QueryDocumentSnapshot<DocumentData> | null) => {
    oldestMessageRef.current = ref;
  }, []);

  const setHasMore = useCallback((hasMore: boolean) => {
    setHasMoreMessages(hasMore);
  }, []);

  const loadMoreMessages = useCallback(async (): Promise<void> => {
    if (!oldestMessageRef.current || !hasMoreMessages || isLoadingMore || !clientDb) return;

    setIsLoadingMore(true);

    try {
      const messagesRef = collection(clientDb, COLLECTION_PATHS.messages(conversationId));
      const moreQuery = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        startAfter(oldestMessageRef.current),
        limit(PAGINATION_CONFIG.messagesPerPage)
      );

      const snapshot = await getDocs(moreQuery);
      const olderMessages: Message[] = snapshot.docs.map(mapDocToMessage).reverse();

      if (snapshot.docs.length > 0) {
        oldestMessageRef.current = snapshot.docs[snapshot.docs.length - 1];
      }

      setHasMoreMessages(snapshot.docs.length === PAGINATION_CONFIG.messagesPerPage);

      if (olderMessages.length > 0 && conversation?.messages) {
        const allMessages = [...olderMessages, ...conversation.messages];
        dispatch(setMessages(allMessages.map(toSerializableMessage)));
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
      setLocalError('Failed to load more messages');
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, hasMoreMessages, isLoadingMore, conversation?.messages, dispatch, mapDocToMessage]);

  return {
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
    setOldestMessageRef,
    setHasMore,
    paginationError: localError,
  };
}
```

#### Step 6: Create new `useConversation/index.ts` that composes all hooks

```typescript
// hooks/useConversation/index.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc, writeBatch, arrayUnion } from 'firebase/firestore';
import { db as clientDb } from '@/lib/config/firebase';
import { useAuth } from '@/lib/features/auth/useAuth';
import type { ConversationWithMessages, Message, UseConversationReturn } from '../../types';
import { COLLECTION_PATHS, isAdminEmail } from '../../config';
import {
  updateConversationUnread,
  fromSerializableConversationWithMessages,
} from '../../store/supportMessagingSlice';
import { selectCurrentConversation, selectSupportMessaging } from '@/lib/features/store/hooks';
import type { AppDispatch } from '@/store/store';

import { useConversationRealtime } from './useConversationRealtime';
import { useConversationMessages } from './useConversationMessages';
import { useConversationActions } from './useConversationActions';
import { useConversationPagination } from './useConversationPagination';

export function useConversation(conversationId: string): UseConversationReturn {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const serializedConversation = useSelector(selectCurrentConversation);
  const { messagesLoading: isLoading, error } = useSelector(selectSupportMessaging);

  const [lastReadAt, setLastReadAt] = useState<Date | null>(null);

  // Convert serialized to typed
  const baseConversation: ConversationWithMessages | null = serializedConversation
    ? fromSerializableConversationWithMessages(serializedConversation)
    : null;

  // Compose child hooks
  const {
    optimisticMessages,
    sendMessage,
    retryMessage,
    sendMessageBatch,
    localError: messagesError,
  } = useConversationMessages({ conversationId });

  const {
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
    setOldestMessageRef,
    setHasMore,
    paginationError,
  } = useConversationPagination({
    conversationId,
    conversation: baseConversation,
    mapDocToMessage: () => ({} as Message), // Will be set by realtime hook
  });

  // Realtime hook
  const { mapDocToMessage } = useConversationRealtime({
    conversationId,
    onOldestMessageRef: setOldestMessageRef,
    onHasMoreMessages: setHasMore,
  });

  // Actions hook
  const {
    updateStatus,
    updatePriority,
    updateTags,
    addReaction,
    removeReaction,
    actionsError,
  } = useConversationActions({
    conversationId,
    conversation: baseConversation,
  });

  // Merge optimistic messages
  const conversation: ConversationWithMessages | null = baseConversation
    ? {
        ...baseConversation,
        messages: [...baseConversation.messages, ...optimisticMessages],
        lastReadAt: lastReadAt ?? undefined,
      }
    : null;

  // Clear optimistic messages when confirmed
  useEffect(() => {
    if (optimisticMessages.length > 0 && baseConversation?.messages) {
      const confirmedIds = new Set(
        baseConversation.messages
          .filter(m => !m.id.startsWith('temp_'))
          .map(m => m.content)
      );
      // This would trigger message hook to clear - simplified here
    }
  }, [baseConversation?.messages?.length, optimisticMessages.length]);

  // Mark as read
  const markAsRead = useCallback(async (): Promise<void> => {
    if (!conversationId || !user || !clientDb) return;

    const db = clientDb;
    const messages = baseConversation?.messages || [];

    if (messages.length > 0 && !lastReadAt) {
      const lastMessage = messages[messages.length - 1];
      setLastReadAt(lastMessage.timestamp);
    }

    try {
      const isAdmin = isAdminEmail(user.email);
      const conversationRef = doc(db, COLLECTION_PATHS.conversations, conversationId);

      const unreadMessages = messages.filter(
        m => m.senderId !== user.uid && !m.readAt && !m.id.startsWith('temp_')
      );

      if (unreadMessages.length > 0) {
        const batch = writeBatch(db);
        const now = new Date();

        unreadMessages.forEach(msg => {
          const msgRef = doc(db, COLLECTION_PATHS.messages(conversationId), msg.id);
          batch.update(msgRef, {
            readAt: now,
            readBy: arrayUnion(user.uid)
          });
        });

        await batch.commit();
      }

      await updateDoc(conversationRef, {
        [isAdmin ? 'unreadByAdmin' : 'unreadByUser']: 0,
      });

      dispatch(
        updateConversationUnread({
          id: conversationId,
          ...(isAdmin ? { unreadByAdmin: 0 } : { unreadByUser: 0 }),
        })
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [conversationId, user, dispatch, baseConversation?.messages, lastReadAt]);

  return {
    conversation,
    isLoading,
    error: error || messagesError || actionsError || paginationError,
    sendMessage,
    sendMessageBatch,
    retryMessage,
    markAsRead,
    updateStatus,
    updatePriority,
    updateTags,
    addReaction,
    removeReaction,
    hasMoreMessages,
    loadMoreMessages,
    isLoadingMore,
  };
}

// Re-export child hooks for direct use if needed
export { useConversationRealtime } from './useConversationRealtime';
export { useConversationMessages } from './useConversationMessages';
export { useConversationActions } from './useConversationActions';
export { useConversationPagination } from './useConversationPagination';
```

#### Step 7: Update imports in consuming files

Files that import `useConversation`:
- `components/ConversationView/useConversationView.ts` - Line 4: No change needed (path still works)

### Verification

- [ ] `hooks/useConversation/` directory created
- [ ] `useConversationRealtime.ts` created (~120 lines)
- [ ] `useConversationMessages.ts` created (~100 lines)
- [ ] `useConversationActions.ts` created (~150 lines)
- [ ] `useConversationPagination.ts` created (~80 lines)
- [ ] `index.ts` created (~150 lines, composes all)
- [ ] Main `useConversation.ts` removed or redirects to new location
- [ ] `npx tsc --noEmit` passes
- [ ] Feature still works in browser

---

## File 2: MessagesPage.tsx

**Location:** `lib/features/crm/profile/support-messaging/components/MessagesPage.tsx`
**Current:** 435 lines (105 Hook/JS, 330 TSX)
**Target:** Main component ~200 lines, extracted components ~100-150 lines each

### Problems Identified

1. Total lines exceeds 400 threshold
2. `ConversationItem` component (lines 301-434) is defined in same file - should be separate
3. Event handlers and state management mixed with JSX
4. Bulk actions logic (lines 56-89) could be extracted

### Refactoring Plan

#### Step 1: Create MessagesPage subdirectory

```bash
mkdir -p lib/features/crm/profile/support-messaging/components/MessagesPage
```

#### Step 2: Extract `ConversationItem.tsx`

Extract lines 301-434:

```typescript
// components/MessagesPage/ConversationItem.tsx
'use client';

import Link from 'next/link';
import { PriorityBadge } from '../PriorityBadge';
import { TagList } from '../TagBadge';
import { ResponseTimeDisplay } from '../ResponseTimeDisplay';
import { HighlightedText } from '../SearchInput';
import { highlightMatches } from '../../hooks/useConversationSearch';
import { STATUS_OPTIONS } from '../../config';
import { formatRelativeTime } from '../../utils/timeFormatting';
import type { Conversation } from '../../types';

interface ConversationItemProps {
  conversation: Conversation;
  isAdmin: boolean;
  bulkMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  searchQuery?: string;
}

export function ConversationItem({
  conversation,
  isAdmin,
  bulkMode = false,
  isSelected = false,
  onToggleSelect,
  searchQuery = '',
}: ConversationItemProps) {
  const basePath = isAdmin ? '/admin/messages' : '/profile/support';
  const unreadCount = isAdmin ? conversation.unreadByAdmin : conversation.unreadByUser;
  const statusConfig = STATUS_OPTIONS.find((s) => s.value === conversation.status);

  const subjectSegments = searchQuery ? highlightMatches(conversation.subject, searchQuery) : null;
  const userNameSegments = searchQuery && isAdmin ? highlightMatches(conversation.userName, searchQuery) : null;
  const lastMessageSegments = searchQuery && conversation.lastMessage
    ? highlightMatches(conversation.lastMessage.content, searchQuery)
    : null;

  const handleClick = (e: React.MouseEvent) => {
    if (bulkMode && onToggleSelect) {
      e.preventDefault();
      onToggleSelect();
    }
  };

  return (
    <Link
      href={`${basePath}/${conversation.id}`}
      onClick={handleClick}
      className={`block p-4 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-glamlink-purple/5' : ''
      }`}
    >
      {/* ... rest of JSX from original file lines 345-433 ... */}
    </Link>
  );
}
```

#### Step 3: Extract `useMessagesPage.ts` hook

```typescript
// components/MessagesPage/useMessagesPage.ts
'use client';

import { useState, useCallback } from 'react';
import { useConversations } from '../../hooks/useConversations';
import { useConversationSearch } from '../../hooks/useConversationSearch';
import type { ConversationStatus } from '../../types';

interface UseMessagesPageProps {
  isAdmin?: boolean;
}

export function useMessagesPage({ isAdmin = false }: UseMessagesPageProps) {
  const { conversations, isLoading, error, refetch, hasMore, loadMore, isLoadingMore } = useConversations();
  const {
    searchQuery,
    setSearchQuery,
    filteredConversations,
    isSearching,
    hasResults,
    debouncedQuery,
  } = useConversationSearch(conversations);

  const [showNewModal, setShowNewModal] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredConversations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredConversations.map((c) => c.id)));
    }
  }, [filteredConversations, selectedIds.size]);

  const handleBulkStatusUpdate = useCallback(async (status: ConversationStatus) => {
    if (selectedIds.size === 0) return;

    setBulkUpdating(true);
    try {
      const response = await fetch('/api/support/conversations/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversationIds: Array.from(selectedIds),
          updates: { status },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedIds(new Set());
        setBulkMode(false);
        refetch();
      } else {
        console.error('Bulk update failed:', data.error);
      }
    } catch (err) {
      console.error('Bulk update error:', err);
    } finally {
      setBulkUpdating(false);
    }
  }, [selectedIds, refetch]);

  const handleExitBulkMode = useCallback(() => {
    setBulkMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleCreateConversation = async (subject: string, message: string) => {
    const response = await fetch('/api/support/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subject, initialMessage: message }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create conversation');
    }
  };

  return {
    // Data
    conversations,
    filteredConversations,
    isLoading,
    error,
    hasMore,
    isLoadingMore,

    // Search
    searchQuery,
    setSearchQuery,
    isSearching,
    hasResults,
    debouncedQuery,

    // Modals
    showNewModal,
    setShowNewModal,

    // Bulk mode
    bulkMode,
    setBulkMode,
    selectedIds,
    bulkUpdating,

    // Handlers
    handleToggleSelect,
    handleSelectAll,
    handleBulkStatusUpdate,
    handleExitBulkMode,
    handleCreateConversation,
    loadMore,
  };
}
```

#### Step 4: Update main MessagesPage.tsx

```typescript
// components/MessagesPage/MessagesPage.tsx (simplified)
'use client';

import { NewConversationModal } from '../NewConversationModal';
import { LoadingSpinner } from '../LoadingSpinner';
import { SearchInput } from '../SearchInput';
import { MESSAGES, STATUS_OPTIONS } from '../../config';
import { useMessagesPage } from './useMessagesPage';
import { ConversationItem } from './ConversationItem';
import { BulkActionBar } from './BulkActionBar';
import { EmptyConversations } from './EmptyConversations';

interface MessagesPageProps {
  isAdmin?: boolean;
}

export function MessagesPage({ isAdmin = false }: MessagesPageProps) {
  const {
    conversations,
    filteredConversations,
    isLoading,
    error,
    // ... all other values from hook
  } = useMessagesPage({ isAdmin });

  if (isLoading) {
    return <LoadingSpinner message="Loading conversations..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - same as before */}
      {/* Search Input - same as before */}
      {/* Bulk Action Bar - extracted component */}
      {/* Conversations List using ConversationItem */}
      {/* New Conversation Modal */}
    </div>
  );
}
```

#### Step 5: Create index.ts

```typescript
// components/MessagesPage/index.ts
export { MessagesPage } from './MessagesPage';
export { ConversationItem } from './ConversationItem';
export { useMessagesPage } from './useMessagesPage';
```

### Verification

- [ ] `components/MessagesPage/` directory created
- [ ] `ConversationItem.tsx` extracted (~130 lines)
- [ ] `useMessagesPage.ts` created (~100 lines)
- [ ] `MessagesPage.tsx` simplified (~200 lines)
- [ ] `index.ts` created with exports
- [ ] Old `MessagesPage.tsx` removed or redirects
- [ ] `npx tsc --noEmit` passes
- [ ] Feature still works in browser

---

## File 3: useConversationView.ts

**Location:** `lib/features/crm/profile/support-messaging/components/ConversationView/useConversationView.ts`
**Current:** 414 lines (414 Hook/JS, 0 TSX)
**Target:** Main hook ~150 lines, extracted hooks ~80-100 lines each

### Problems Identified

1. Hook logic exceeds 400 lines
2. Multiple responsibilities:
   - Draft persistence (lines 153-184)
   - Typing indicator management (lines 193-211)
   - Message input handling with auto-resize (lines 213-232)
   - Send logic (lines 234-272)
   - File upload handling (lines 330-348)
3. Already in subdirectory, so structure is correct

### Refactoring Plan

#### Step 1: Extract `useDraftPersistence.ts`

```typescript
// components/ConversationView/useDraftPersistence.ts
'use client';

import { useState, useEffect, useRef } from 'react';

const getDraftKey = (conversationId: string) => `messaging_draft_${conversationId}`;

interface UseDraftPersistenceProps {
  conversationId: string;
}

export function useDraftPersistence({ conversationId }: UseDraftPersistenceProps) {
  const [message, setMessage] = useState('');
  const draftSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft on mount/conversation change
  useEffect(() => {
    if (conversationId) {
      const saved = localStorage.getItem(getDraftKey(conversationId));
      if (saved) {
        setMessage(saved);
      }
    }
  }, [conversationId]);

  // Save draft with debounce
  useEffect(() => {
    if (draftSaveRef.current) {
      clearTimeout(draftSaveRef.current);
    }

    draftSaveRef.current = setTimeout(() => {
      const key = getDraftKey(conversationId);
      if (message.trim()) {
        localStorage.setItem(key, message);
      } else {
        localStorage.removeItem(key);
      }
    }, 500);

    return () => {
      if (draftSaveRef.current) {
        clearTimeout(draftSaveRef.current);
      }
    };
  }, [message, conversationId]);

  const clearDraft = () => {
    localStorage.removeItem(getDraftKey(conversationId));
  };

  return {
    message,
    setMessage,
    clearDraft,
  };
}
```

#### Step 2: Extract `useMessageInput.ts`

```typescript
// components/ConversationView/useMessageInput.ts
'use client';

import { useCallback, useRef } from 'react';
import { MESSAGE_CONFIG } from '../../config';

interface UseMessageInputProps {
  message: string;
  setMessage: (value: string) => void;
  onTypingChange: (text: string) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

export function useMessageInput({
  message,
  setMessage,
  onTypingChange,
  messagesContainerRef,
}: UseMessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    onTypingChange(value);

    // Auto-resize the textarea
    const textarea = e.target;
    const messagesContainer = messagesContainerRef.current;
    const scrollTop = messagesContainer?.scrollTop || 0;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;

    if (messagesContainer) {
      messagesContainer.scrollTop = scrollTop;
    }
  }, [setMessage, onTypingChange, messagesContainerRef]);

  const charCount = message.length;
  const isNearLimit = charCount >= MESSAGE_CONFIG.maxLength * MESSAGE_CONFIG.warningThreshold;
  const isOverLimit = charCount > MESSAGE_CONFIG.maxLength;
  const charsRemaining = MESSAGE_CONFIG.maxLength - charCount;

  return {
    inputRef,
    handleInputChange,
    charCount,
    isNearLimit,
    isOverLimit,
    charsRemaining,
  };
}
```

#### Step 3: Update main useConversationView.ts to compose hooks

The main hook will import and compose these smaller hooks, reducing its size significantly.

### Verification

- [ ] `useDraftPersistence.ts` created (~50 lines)
- [ ] `useMessageInput.ts` created (~50 lines)
- [ ] Main `useConversationView.ts` simplified (~250 lines)
- [ ] `npx tsc --noEmit` passes
- [ ] Draft persistence still works
- [ ] Character count still works
- [ ] Feature still works in browser

---

## Phase 1 Completion Checklist

- [ ] All 3 files refactored
- [ ] No TypeScript errors
- [ ] All imports updated
- [ ] Manual testing passed for:
  - [ ] Conversations list loads
  - [ ] Search works
  - [ ] Bulk actions work
  - [ ] Single conversation view works
  - [ ] Send message works
  - [ ] Reactions work
  - [ ] Status/priority/tags update work
  - [ ] Draft persistence works
- [ ] Update MASTER-PLAN.md status
