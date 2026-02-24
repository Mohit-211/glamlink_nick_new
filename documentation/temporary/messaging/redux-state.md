# Redux State Management - Support Messaging System

This document details the Redux slice implementation for the messaging system.

---

## Location

`/lib/features/crm/profile/support-messaging/store/supportMessagingSlice.ts`

---

## State Shape

```typescript
interface SupportMessagingState {
  // Data
  conversations: SerializableConversation[];           // List of all conversations
  currentConversation: SerializableConversationWithMessages | null;  // Active conversation
  messages: SerializableMessage[];                     // Messages for current conversation
  adminUnreadCount: number;                            // Total unread for admin badge

  // Loading states
  isLoading: boolean;                // General loading
  conversationsLoading: boolean;     // Conversations list loading
  messagesLoading: boolean;          // Messages loading

  // Error state
  error: string | null;
}
```

---

## Initial State

```typescript
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
```

---

## Actions (Reducers)

### setConversations

Updates the conversations list from Firestore listener.

```typescript
setConversations: (state, action: PayloadAction<SerializableConversation[]>) => {
  state.conversations = action.payload;
  state.conversationsLoading = false;
}
```

**Usage:**
```typescript
dispatch(setConversations(convos.map(toSerializableConversation)));
```

---

### setCurrentConversation

Sets the active conversation. **Critically important behavior:**

```typescript
setCurrentConversation: (state, action: PayloadAction<SerializableConversationWithMessages | null>) => {
  // ONLY set messages if they're provided AND non-empty
  // This prevents the conversation listener from clearing messages
  if (action.payload?.messages && action.payload.messages.length > 0) {
    state.messages = action.payload.messages;
  }

  // Set conversation, syncing messages array with state.messages
  if (action.payload) {
    state.currentConversation = {
      ...action.payload,
      messages: state.messages,  // Always use state.messages as source of truth
    };
  } else {
    state.currentConversation = null;
  }
}
```

**Why this design?**

The conversation listener and messages listener are separate. When the conversation document updates (e.g., `lastMessage` changes), the conversation listener fires. If it had old/empty messages, it would overwrite the current messages. By checking if `messages.length > 0` before updating, we prevent the conversation listener from clearing message state.

---

### clearCurrentConversation

Clears the current conversation and messages when navigating away.

```typescript
clearCurrentConversation: (state) => {
  state.currentConversation = null;
  state.messages = [];
}
```

---

### setMessages

Updates messages from the messages subcollection listener.

```typescript
setMessages: (state, action: PayloadAction<SerializableMessage[]>) => {
  state.messages = action.payload;
  if (state.currentConversation) {
    state.currentConversation.messages = action.payload;
  }
  state.messagesLoading = false;
}
```

**Note:** This keeps `messages` and `currentConversation.messages` in sync.

---

### addMessage

Adds a single message (for optimistic updates).

```typescript
addMessage: (state, action: PayloadAction<SerializableMessage>) => {
  state.messages.push(action.payload);
  if (state.currentConversation) {
    state.currentConversation.messages.push(action.payload);
  }
}
```

---

### setAdminUnreadCount

Updates the badge count for admin sidebar.

```typescript
setAdminUnreadCount: (state, action: PayloadAction<number>) => {
  state.adminUnreadCount = action.payload;
}
```

---

### updateConversationStatus

Updates conversation status in both the list and current conversation.

```typescript
updateConversationStatus: (
  state,
  action: PayloadAction<{ id: string; status: ConversationStatus }>
) => {
  // Update in conversations list
  const conv = state.conversations.find(c => c.id === action.payload.id);
  if (conv) {
    conv.status = action.payload.status;
    conv.updatedAt = new Date().toISOString();
  }

  // Update current conversation if it's the same one
  if (state.currentConversation?.id === action.payload.id) {
    state.currentConversation.status = action.payload.status;
    state.currentConversation.updatedAt = new Date().toISOString();
  }
}
```

---

### updateConversationUnread

Updates unread counts for a specific conversation.

```typescript
updateConversationUnread: (
  state,
  action: PayloadAction<{ id: string; unreadByUser?: number; unreadByAdmin?: number }>
) => {
  const conv = state.conversations.find(c => c.id === action.payload.id);
  if (conv) {
    if (action.payload.unreadByUser !== undefined) {
      conv.unreadByUser = action.payload.unreadByUser;
    }
    if (action.payload.unreadByAdmin !== undefined) {
      conv.unreadByAdmin = action.payload.unreadByAdmin;
    }
  }

  // Also update currentConversation if applicable
  if (state.currentConversation?.id === action.payload.id) {
    if (action.payload.unreadByUser !== undefined) {
      state.currentConversation.unreadByUser = action.payload.unreadByUser;
    }
    if (action.payload.unreadByAdmin !== undefined) {
      state.currentConversation.unreadByAdmin = action.payload.unreadByAdmin;
    }
  }
}
```

---

### Loading State Actions

```typescript
setConversationsLoading: (state, action: PayloadAction<boolean>) => {
  state.conversationsLoading = action.payload;
}

setMessagesLoading: (state, action: PayloadAction<boolean>) => {
  state.messagesLoading = action.payload;
}

setLoading: (state, action: PayloadAction<boolean>) => {
  state.isLoading = action.payload;
}
```

---

### setError

Sets error state for display.

```typescript
setError: (state, action: PayloadAction<string | null>) => {
  state.error = action.payload;
}
```

---

### resetSupportMessaging

Resets entire state to initial values.

```typescript
resetSupportMessaging: () => initialState
```

---

## Serialization Helpers

Redux requires all state to be serializable (no `Date` objects, functions, etc.). These helpers convert between the app's `Date` types and serializable ISO strings:

### toSerializableConversation

```typescript
export const toSerializableConversation = (conv: Conversation): SerializableConversation => ({
  id: conv.id,
  userId: conv.userId,
  userEmail: conv.userEmail,
  userName: conv.userName,
  adminId: conv.adminId,
  status: conv.status,
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
});
```

### fromSerializableConversation

```typescript
export const fromSerializableConversation = (conv: SerializableConversation): Conversation => ({
  id: conv.id,
  userId: conv.userId,
  userEmail: conv.userEmail,
  userName: conv.userName,
  adminId: conv.adminId,
  status: conv.status,
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
});
```

### toSerializableMessage / fromSerializableMessage

Similar pattern for messages, converting `timestamp` and `readAt` between `Date` and ISO string.

---

## Selectors

Located in `/lib/features/store/hooks.ts`:

```typescript
// Select entire messaging state
export const selectSupportMessaging = (state: RootState) =>
  state.features.supportMessaging;

// Select conversations list
export const selectConversations = (state: RootState) =>
  state.features.supportMessaging.conversations;

// Select current conversation
export const selectCurrentConversation = (state: RootState) =>
  state.features.supportMessaging.currentConversation;

// Select messages array
export const selectMessages = (state: RootState) =>
  state.features.supportMessaging.messages;

// Select admin unread count
export const selectAdminUnreadCount = (state: RootState) =>
  state.features.supportMessaging.adminUnreadCount;
```

---

## Store Integration

The support messaging reducer is combined in `/lib/features/store/featuresReducer.ts`:

```typescript
import { combineReducers } from '@reduxjs/toolkit';
import supportMessagingReducer from '../crm/profile/support-messaging/store/supportMessagingSlice';

const featuresReducer = combineReducers({
  supportMessaging: supportMessagingReducer,
  // Other feature slices...
});

export default featuresReducer;
```

And added to the root store in `/store/store.ts`:

```typescript
import featuresReducer from '@/lib/features/store/featuresReducer';

export const store = configureStore({
  reducer: {
    home: homeReducer,
    auth: authReducer,
    admin: adminReducer,
    features: featuresReducer,  // Contains supportMessaging
  },
});
```

---

## State in Redux DevTools

```
state
└── features
    └── supportMessaging
        ├── conversations: []
        ├── currentConversation: null
        ├── messages: []
        ├── adminUnreadCount: 0
        ├── isLoading: false
        ├── conversationsLoading: false
        ├── messagesLoading: false
        └── error: null
```
