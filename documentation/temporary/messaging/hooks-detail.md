# React Hooks - Support Messaging System

This document provides detailed documentation for each custom hook in the messaging system.

---

## Overview

The hooks layer provides the bridge between UI components and the data/state layers. Each hook:
1. Sets up Firestore real-time listeners
2. Dispatches updates to Redux
3. Provides actions for user interactions
4. Handles loading/error states

---

## useConversations

**Location:** `/lib/features/crm/profile/support-messaging/hooks/useConversations.ts`

**Purpose:** Fetches and maintains a real-time list of conversations for the current user.

### Return Type

```typescript
interface UseConversationsReturn {
  conversations: Conversation[];  // List of conversations
  isLoading: boolean;             // Loading state
  error: string | null;           // Error message if any
  refetch: () => Promise<void>;   // Manual refetch (rarely needed)
}
```

### How It Works

```typescript
export function useConversations(): UseConversationsReturn {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // 1. Select data from Redux (serialized form)
  const serializedConversations = useSelector(selectConversations);
  const { conversationsLoading, error } = useSelector(selectSupportMessaging);

  // 2. Convert back to Conversation objects with Date types
  const conversations = serializedConversations.map(fromSerializableConversation);

  // 3. Set up Firestore real-time listener on mount
  useEffect(() => {
    if (!user || !clientDb) {
      dispatch(setConversations([]));
      return;
    }

    // Build query based on user type
    const isAdmin = isAdminEmail(user.email);
    const q = isAdmin
      ? query(conversationsCollection, orderBy('updatedAt', 'desc'))
      : query(
          conversationsCollection,
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to Date objects
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      }));

      // Dispatch to Redux (converted to serializable)
      dispatch(setConversations(convos.map(toSerializableConversation)));
    });

    return () => unsubscribe();
  }, [user, dispatch]);

  return { conversations, isLoading, error, refetch };
}
```

### Key Behaviors

1. **Admin vs User Query:**
   - Admins see ALL conversations
   - Users see only their own conversations (filtered by `userId`)

2. **Real-time Updates:**
   - Uses Firestore `onSnapshot` for instant updates
   - New conversations appear immediately
   - Status changes reflect instantly

3. **Redux Integration:**
   - All data flows through Redux
   - Components re-render via Redux selectors

---

## useConversation

**Location:** `/lib/features/crm/profile/support-messaging/hooks/useConversation.ts`

**Purpose:** Manages a single conversation including messages, sending, and status updates.

### Return Type

```typescript
interface UseConversationReturn {
  conversation: ConversationWithMessages | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  updateStatus: (status: ConversationStatus) => Promise<void>;
}
```

### How It Works

```typescript
export function useConversation(conversationId: string): UseConversationReturn {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const serializedConversation = useSelector(selectCurrentConversation);
  const { messagesLoading, error } = useSelector(selectSupportMessaging);

  // Local state for optimistic messages
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  // Convert from Redux and merge optimistic messages
  const baseConversation = serializedConversation
    ? fromSerializableConversationWithMessages(serializedConversation)
    : null;

  const conversation = baseConversation
    ? { ...baseConversation, messages: [...baseConversation.messages, ...optimisticMessages] }
    : null;

  // TWO separate Firestore listeners:
  useEffect(() => {
    // Listener 1: Conversation document (metadata, status, lastMessage)
    const unsubConversation = onSnapshot(conversationRef, (doc) => {
      dispatch(setCurrentConversation({
        ...convData,
        messages: [],  // DON'T include messages here
      }));
    });

    // Listener 2: Messages subcollection
    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(/* ... */);
      dispatch(setMessages(msgs.map(toSerializableMessage)));
    });

    return () => {
      unsubConversation();
      unsubMessages();
    };
  }, [conversationId, user]);

  // ... sendMessage, markAsRead, updateStatus functions
}
```

### Critical Design Decision: Separate Listeners

The hook uses **two separate Firestore listeners**:

1. **Conversation Listener** - Watches the conversation document for:
   - Status changes
   - lastMessage updates
   - Unread count changes

2. **Messages Listener** - Watches the messages subcollection for:
   - New messages
   - Message read status updates

**Why?** When a message is sent, it updates both:
- The messages subcollection (adds new message)
- The conversation document (updates lastMessage)

If we used a single listener, the conversation update would trigger a state update that could clear messages (stale closure issue). By separating them, the messages listener independently manages message state.

### sendMessage Function

```typescript
const sendMessage = useCallback(async (content: string): Promise<void> => {
  if (!conversationId || !user || !content.trim()) return;

  // 1. Create optimistic message with temp ID
  const optimisticMessage: Message = {
    id: `temp_${Date.now()}`,
    senderId: user.uid,
    senderEmail: user.email || '',
    senderName: user.displayName || user.email?.split('@')[0] || 'User',
    content: content.trim(),
    timestamp: new Date(),
  };

  // 2. Add to local state IMMEDIATELY (appears in UI instantly)
  setOptimisticMessages(prev => [...prev, optimisticMessage]);

  try {
    // 3. Send to API (async, non-blocking for UI)
    const response = await fetch(`/api/support/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: content.trim() }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
    // Real message arrives via onSnapshot listener
    // Optimistic message gets cleared when real message content matches
  } catch (err) {
    // Remove optimistic message on error
    setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    throw err;
  }
}, [conversationId, user]);
```

### markAsRead Function

```typescript
const markAsRead = useCallback(async (): Promise<void> => {
  if (!conversationId || !user) return;

  const isAdmin = isAdminEmail(user.email);
  const conversationRef = doc(clientDb, COLLECTION_PATHS.conversations, conversationId);

  // Update the appropriate unread field based on user type
  await updateDoc(conversationRef, {
    [isAdmin ? 'unreadByAdmin' : 'unreadByUser']: 0,
  });

  // Also update Redux state locally
  dispatch(updateConversationUnread({
    id: conversationId,
    ...(isAdmin ? { unreadByAdmin: 0 } : { unreadByUser: 0 }),
  }));
}, [conversationId, user, dispatch]);
```

---

## useTypingIndicator

**Location:** `/lib/features/crm/profile/support-messaging/hooks/useTypingIndicator.ts`

**Purpose:** Manages real-time typing indicators for a conversation.

### Return Type

```typescript
interface UseTypingIndicatorReturn {
  typingUsers: TypingIndicator[];  // Users currently typing
  setTyping: (isTyping: boolean) => void;  // Update own typing status
}
```

### How It Works

```typescript
export function useTypingIndicator(conversationId: string): UseTypingIndicatorReturn {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingState = useRef<boolean>(false);

  // Listen to typing document
  useEffect(() => {
    const typingRef = doc(clientDb, `support_conversations/${conversationId}/typing`, 'current');

    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Only show typing for OTHER users, not yourself
        if (data.userId !== user.uid && data.isTyping) {
          // Check if typing status is still fresh (within 6 seconds)
          const ageMs = Date.now() - data.updatedAt.toDate().getTime();
          if (ageMs < 6000) {
            setTypingUsers([{
              conversationId,
              userId: data.userId,
              userName: data.userName,
              isTyping: true,
              updatedAt: data.updatedAt.toDate(),
            }]);
          } else {
            setTypingUsers([]);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [conversationId, user]);

  // Set own typing status
  const setTyping = useCallback(async (isTyping: boolean) => {
    // Debounce - don't update if state hasn't changed
    if (lastTypingState.current === isTyping) return;
    lastTypingState.current = isTyping;

    const typingRef = doc(clientDb, `support_conversations/${conversationId}/typing`, 'current');

    if (isTyping) {
      await setDoc(typingRef, {
        userId: user.uid,
        userName: user.displayName || 'User',
        isTyping: true,
        updatedAt: serverTimestamp(),
      });

      // Auto-clear after 3 seconds of no activity
      typingTimeoutRef.current = setTimeout(() => {
        lastTypingState.current = false;
        deleteDoc(typingRef);
      }, 3000);
    } else {
      await deleteDoc(typingRef);
    }
  }, [conversationId, user]);

  // Cleanup on unmount - clear typing status
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear typing when leaving conversation
      const typingRef = doc(clientDb, `support_conversations/${conversationId}/typing`, 'current');
      deleteDoc(typingRef).catch(() => {});
    };
  }, [conversationId, user]);

  return { typingUsers, setTyping };
}
```

### Key Features

1. **Debouncing**: Only sends updates when typing state actually changes
2. **Auto-timeout**: Clears typing status after 3 seconds of inactivity
3. **Stale detection**: Ignores typing indicators older than 6 seconds
4. **Self-filtering**: Never shows your own typing indicator to yourself
5. **Cleanup**: Clears typing status when leaving the conversation

---

## useAdminUnreadCount

**Location:** `/lib/features/crm/profile/support-messaging/hooks/useAdminUnreadCount.ts`

**Purpose:** Provides the total unread message count for admin sidebar badge.

### Return Type

```typescript
interface UseAdminUnreadCountReturn {
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

### How It Works

```typescript
export function useAdminUnreadCount(): UseAdminUnreadCountReturn {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const count = useSelector(selectAdminUnreadCount);

  useEffect(() => {
    // Only for admins
    if (!user || !isAdminEmail(user.email)) {
      dispatch(setAdminUnreadCount(0));
      return;
    }

    // Query all conversations with unread admin messages
    const q = query(
      collection(clientDb, COLLECTION_PATHS.conversations),
      where('unreadByAdmin', '>', 0)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.docs.forEach((doc) => {
        totalUnread += doc.data().unreadByAdmin || 0;
      });
      dispatch(setAdminUnreadCount(totalUnread));
    });

    return () => unsubscribe();
  }, [user, dispatch]);

  return { count, isLoading, error, refetch };
}
```

### Usage in Admin Sidebar

```typescript
// In app/admin/layout.tsx
const { count: unreadCount } = useAdminUnreadCount();

// Display badge
{unreadCount > 0 && (
  <span className="bg-red-500 text-white rounded-full px-2">
    {unreadCount > 99 ? '99+' : unreadCount}
  </span>
)}
```
