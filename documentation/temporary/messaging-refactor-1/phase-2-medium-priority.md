# Phase 2: Medium Priority Refactoring

**Parent:** `MASTER-PLAN.md`
**Files in this phase:** 2
**Estimated effort:** Medium (2-3 hours total)

---

## File 1: supportMessagingSlice.ts

**Location:** `lib/features/crm/profile/support-messaging/store/supportMessagingSlice.ts`
**Current:** 344 lines (344 Hook/JS, 0 TSX)
**Target:** Slice ~180 lines, serialization utils in separate file

### Problems Identified

1. Total lines (344) falls in MEDIUM priority range (250-400)
2. Serialization helpers (lines 75-190) are utility functions, not Redux logic
3. File mixes two concerns:
   - Redux slice definition (reducers, actions)
   - Data serialization/deserialization utilities

### Refactoring Plan

#### Step 1: Extract serialization utilities to `utils/serialization.ts`

Create new file with lines 75-190 (serialization helpers):

```typescript
// utils/serialization.ts
import type {
  Conversation,
  ConversationWithMessages,
  Message,
  MessageReaction,
  ConversationStatus,
  ConversationPriority,
  ConversationTag,
  ConversationMetrics,
} from '../types';
import { toSerializableAttachment, fromSerializableAttachment } from '../types/attachment';

// Serializable versions for Redux (timestamps as strings)
export interface SerializableMessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  createdAt: string; // ISO string
}

export interface SerializableMessage {
  id: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  content: string;
  timestamp: string; // ISO string
  readAt?: string; // ISO string
  readBy?: string[];
  reactions?: SerializableMessageReaction[];
  attachments?: import('../types/attachment').SerializableAttachment[];
}

export interface SerializableConversation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  adminId: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  subject: string;
  unreadByUser: number;
  unreadByAdmin: number;
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  lastReadAt?: string;
  tags?: ConversationTag[];
  metrics?: ConversationMetrics;
}

export interface SerializableConversationWithMessages extends SerializableConversation {
  messages: SerializableMessage[];
}

// Conversation serialization
export const toSerializableConversation = (conv: Conversation): SerializableConversation => ({
  id: conv.id,
  userId: conv.userId,
  userEmail: conv.userEmail,
  userName: conv.userName,
  adminId: conv.adminId,
  status: conv.status,
  priority: conv.priority || 'normal',
  subject: conv.subject,
  unreadByUser: conv.unreadByUser,
  unreadByAdmin: conv.unreadByAdmin,
  lastMessage: conv.lastMessage
    ? {
        content: conv.lastMessage.content,
        senderId: conv.lastMessage.senderId,
        timestamp: conv.lastMessage.timestamp instanceof Date
          ? conv.lastMessage.timestamp.toISOString()
          : conv.lastMessage.timestamp,
      }
    : null,
  createdAt: conv.createdAt instanceof Date ? conv.createdAt.toISOString() : conv.createdAt,
  updatedAt: conv.updatedAt instanceof Date ? conv.updatedAt.toISOString() : conv.updatedAt,
  lastReadAt: conv.lastReadAt
    ? (conv.lastReadAt instanceof Date ? conv.lastReadAt.toISOString() : conv.lastReadAt)
    : undefined,
  tags: conv.tags,
  metrics: conv.metrics,
});

export const fromSerializableConversation = (conv: SerializableConversation): Conversation => ({
  id: conv.id,
  userId: conv.userId,
  userEmail: conv.userEmail,
  userName: conv.userName,
  adminId: conv.adminId,
  status: conv.status,
  priority: conv.priority || 'normal',
  subject: conv.subject,
  unreadByUser: conv.unreadByUser,
  unreadByAdmin: conv.unreadByAdmin,
  lastMessage: conv.lastMessage
    ? {
        content: conv.lastMessage.content,
        senderId: conv.lastMessage.senderId,
        timestamp: new Date(conv.lastMessage.timestamp),
      }
    : null,
  createdAt: new Date(conv.createdAt),
  updatedAt: new Date(conv.updatedAt),
  lastReadAt: conv.lastReadAt ? new Date(conv.lastReadAt) : undefined,
  tags: conv.tags,
  metrics: conv.metrics,
});

// Reaction serialization
export const toSerializableReaction = (reaction: MessageReaction): SerializableMessageReaction => ({
  emoji: reaction.emoji,
  userId: reaction.userId,
  userName: reaction.userName,
  createdAt: reaction.createdAt instanceof Date ? reaction.createdAt.toISOString() : reaction.createdAt,
});

export const fromSerializableReaction = (reaction: SerializableMessageReaction): MessageReaction => ({
  emoji: reaction.emoji,
  userId: reaction.userId,
  userName: reaction.userName,
  createdAt: new Date(reaction.createdAt),
});

// Message serialization
export const toSerializableMessage = (msg: Message): SerializableMessage => ({
  id: msg.id,
  senderId: msg.senderId,
  senderEmail: msg.senderEmail,
  senderName: msg.senderName,
  content: msg.content,
  timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
  readAt: msg.readAt
    ? (msg.readAt instanceof Date ? msg.readAt.toISOString() : msg.readAt)
    : undefined,
  readBy: msg.readBy,
  reactions: msg.reactions?.map(toSerializableReaction),
  attachments: msg.attachments?.map(toSerializableAttachment),
});

export const fromSerializableMessage = (msg: SerializableMessage): Message => ({
  id: msg.id,
  senderId: msg.senderId,
  senderEmail: msg.senderEmail,
  senderName: msg.senderName,
  content: msg.content,
  timestamp: new Date(msg.timestamp),
  readAt: msg.readAt ? new Date(msg.readAt) : undefined,
  readBy: msg.readBy,
  reactions: msg.reactions?.map(fromSerializableReaction),
  attachments: msg.attachments?.map(fromSerializableAttachment),
});

// ConversationWithMessages serialization
export const toSerializableConversationWithMessages = (
  conv: ConversationWithMessages
): SerializableConversationWithMessages => ({
  ...toSerializableConversation(conv),
  messages: conv.messages.map(toSerializableMessage),
});

export const fromSerializableConversationWithMessages = (
  conv: SerializableConversationWithMessages
): ConversationWithMessages => ({
  ...fromSerializableConversation(conv),
  messages: conv.messages.map(fromSerializableMessage),
});
```

#### Step 2: Update supportMessagingSlice.ts to import from utils

```typescript
// store/supportMessagingSlice.ts (after refactor)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ConversationStatus, ConversationPriority, ConversationTag } from '../types';
import {
  SerializableConversation,
  SerializableConversationWithMessages,
  SerializableMessage,
} from '../utils/serialization';

// Re-export for consumers who import from slice
export {
  toSerializableConversation,
  fromSerializableConversation,
  toSerializableMessage,
  fromSerializableMessage,
  toSerializableConversationWithMessages,
  fromSerializableConversationWithMessages,
  toSerializableReaction,
  fromSerializableReaction,
  type SerializableConversation,
  type SerializableConversationWithMessages,
  type SerializableMessage,
  type SerializableMessageReaction,
} from '../utils/serialization';

interface SupportMessagingState {
  conversations: SerializableConversation[];
  currentConversation: SerializableConversationWithMessages | null;
  messages: SerializableMessage[];
  adminUnreadCount: number;
  isLoading: boolean;
  conversationsLoading: boolean;
  messagesLoading: boolean;
  error: string | null;
}

const initialState: SupportMessagingState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  adminUnreadCount: 0,
  isLoading: false,
  conversationsLoading: false,
  messagesLoading: false,
  error: null,
};

const supportMessagingSlice = createSlice({
  name: 'supportMessaging',
  initialState,
  reducers: {
    // ... all reducers stay the same (lines 192-323)
  },
});

export const {
  setConversations,
  setConversationsLoading,
  setCurrentConversation,
  clearCurrentConversation,
  setMessages,
  setMessagesLoading,
  addMessage,
  setAdminUnreadCount,
  updateConversationStatus,
  updateConversationPriority,
  updateConversationTags,
  updateConversationUnread,
  setLoading,
  setError,
  resetSupportMessaging,
} = supportMessagingSlice.actions;

export default supportMessagingSlice.reducer;
```

### Verification

- [ ] `utils/serialization.ts` created (~150 lines)
- [ ] `supportMessagingSlice.ts` updated (~180 lines)
- [ ] Re-exports maintained for backward compatibility
- [ ] `npx tsc --noEmit` passes
- [ ] Redux state still works correctly

---

## File 2: ConversationView.tsx

**Location:** `lib/features/crm/profile/support-messaging/components/ConversationView/ConversationView.tsx`
**Current:** 292 lines (65 Hook/JS, 227 TSX)
**Target:** ~250 lines (minor cleanup only)

### Problems Identified

1. Already in subdirectory structure (good!)
2. Lines are in MEDIUM range but close to OK threshold
3. JSX is fairly complex but well-organized
4. Some inline SVG icons could be extracted to shared components

### Refactoring Plan

This file is already reasonably well-structured. The recommended changes are minor:

#### Step 1: Extract inline SVG icons to shared components (optional)

Consider creating `components/icons/` directory for reusable icons:
- BackArrow icon (lines 105-107)
- SendIcon (lines 273-275)
- SpinnerIcon (lines 268-271)

This is a **low priority** optimization and can be skipped if time-constrained.

#### Step 2: Consider extracting MessagesList component

Lines 184-234 (messages rendering with typing indicator) could be extracted:

```typescript
// components/ConversationView/MessagesList.tsx (optional)
interface MessagesListProps {
  messages: Message[];
  currentUserId: string | undefined;
  lastReadAt?: Date;
  typingIndicatorText: string | null;
  messageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  focusedIndex: number;
  onRetry: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  onKeyboardNav: (e: React.KeyboardEvent) => void;
}
```

However, given this file is at 292 lines (just above OK threshold), this extraction is **optional**.

### Recommendation

**No immediate refactoring required** for this file. It's well-structured and close to the OK threshold.

If refactoring is desired later:
1. Extract icons to shared components
2. Extract MessagesList component

### Verification

- [ ] File reviewed - no critical issues found
- [ ] Optional: Icons extracted to shared components
- [ ] Optional: MessagesList extracted
- [ ] `npx tsc --noEmit` passes
- [ ] Feature still works in browser

---

## Phase 2 Completion Checklist

- [ ] `supportMessagingSlice.ts` refactored
- [ ] `utils/serialization.ts` created
- [ ] `ConversationView.tsx` reviewed (no changes needed)
- [ ] No TypeScript errors
- [ ] All imports updated
- [ ] Redux state management still works
- [ ] Update MASTER-PLAN.md status
