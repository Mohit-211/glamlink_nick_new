# Real-Time Updates & Optimistic UI - Support Messaging System

This document explains how the messaging system achieves instant updates through Firestore real-time listeners and optimistic UI patterns.

---

## Overview

The system uses a hybrid approach:
1. **Firestore `onSnapshot` listeners** for real-time data sync
2. **Optimistic updates** for instant UI feedback
3. **Redux** as the central state store

```
User Action → Optimistic Update → API Call → Firestore Write → onSnapshot → Redux Update
                  ↓                                                            ↓
            Instant UI                                              Confirm/Replace
```

---

## Firestore Real-Time Listeners

### How onSnapshot Works

```typescript
// Subscribe to real-time updates
const unsubscribe = onSnapshot(
  queryOrDocRef,
  (snapshot) => {
    // Called immediately with cached data
    // Called again whenever data changes
  },
  (error) => {
    // Handle errors
  }
);

// Unsubscribe when component unmounts
return () => unsubscribe();
```

### Key Characteristics

1. **Immediate**: First callback fires immediately with cached/local data
2. **Real-time**: Subsequent callbacks fire whenever Firestore data changes
3. **Cross-client**: Updates from any client trigger callbacks on all clients
4. **Optimistic by default**: Local writes appear immediately before server confirmation

---

## Listeners in the System

### 1. Conversations List Listener

**Hook:** `useConversations`

```typescript
useEffect(() => {
  const conversationsCollection = collection(clientDb, COLLECTION_PATHS.conversations);

  const q = isAdmin
    ? query(conversationsCollection, orderBy('updatedAt', 'desc'))
    : query(
        conversationsCollection,
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const convos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    }));

    dispatch(setConversations(convos.map(toSerializableConversation)));
  });

  return () => unsubscribe();
}, [user, dispatch]);
```

**What triggers updates:**
- New conversation created
- Conversation status changed
- `lastMessage` updated (when new message sent)
- `updatedAt` changed

---

### 2. Single Conversation Listener

**Hook:** `useConversation`

```typescript
const unsubConversation = onSnapshot(conversationRef, (docSnapshot) => {
  if (!docSnapshot.exists()) {
    dispatch(setError('Conversation not found'));
    return;
  }

  const data = docSnapshot.data();
  const convData = {
    id: docSnapshot.id,
    userId: data.userId,
    // ... other fields
    messages: [],  // IMPORTANT: Don't include messages here
  };

  dispatch(setCurrentConversation({
    ...toSerializableConversation(convData),
    messages: [],  // Let messages listener handle this
  }));
});
```

**Why `messages: []`?**

The conversation listener fires when `lastMessage` updates (after every new message). If we included messages here, we'd need to fetch them again, creating race conditions with the messages listener. Instead, we let the messages listener exclusively manage message state.

---

### 3. Messages Listener

**Hook:** `useConversation`

```typescript
const messagesRef = collection(clientDb, COLLECTION_PATHS.messages(conversationId));
const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
  const msgs = snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      senderId: data.senderId,
      senderEmail: data.senderEmail,
      senderName: data.senderName,
      content: data.content,
      timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
      readAt: data.readAt?.toDate?.() || undefined,
    };
  });

  dispatch(setMessages(msgs.map(toSerializableMessage)));
});
```

**What triggers updates:**
- New message added to subcollection
- Message marked as read

---

### 4. Typing Indicator Listener

**Hook:** `useTypingIndicator`

```typescript
const typingRef = doc(clientDb, `support_conversations/${conversationId}/typing`, 'current');

const unsubscribe = onSnapshot(typingRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.data();
    // Only show for other users, not yourself
    if (data.userId !== user.uid && data.isTyping) {
      const ageMs = Date.now() - data.updatedAt.toDate().getTime();
      // Only show if fresh (within 6 seconds)
      if (ageMs < 6000) {
        setTypingUsers([{
          conversationId,
          userId: data.userId,
          userName: data.userName,
          isTyping: true,
          updatedAt: data.updatedAt.toDate(),
        }]);
      }
    }
  }
});
```

---

### 5. Admin Unread Count Listener

**Hook:** `useAdminUnreadCount`

```typescript
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
```

---

## Optimistic Updates

### Problem

API calls take time (100ms-1000ms+). Without optimistic updates, the UI would:
1. User sends message
2. UI shows loading/frozen state
3. Wait for API response
4. Update UI

### Solution: Optimistic Updates

1. User sends message
2. **UI updates immediately** with temporary data
3. API call happens in background
4. Real data replaces temporary data (via `onSnapshot`)

### Implementation in useConversation

```typescript
const sendMessage = useCallback(async (content: string): Promise<void> => {
  // 1. Create optimistic message with TEMPORARY ID
  const optimisticMessage: Message = {
    id: `temp_${Date.now()}`,  // Temporary ID
    senderId: user.uid,
    senderEmail: user.email || '',
    senderName: user.displayName || 'User',
    content: content.trim(),
    timestamp: new Date(),
  };

  // 2. Add to LOCAL state immediately (not Redux)
  setOptimisticMessages(prev => [...prev, optimisticMessage]);

  try {
    // 3. Send to API (non-blocking for UI)
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
    // It will have a REAL ID from Firestore

  } catch (err) {
    // 4. REMOVE optimistic message on error
    setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    throw err;
  }
}, [conversationId, user]);
```

### Merging Optimistic + Real Messages

The conversation object merges both:

```typescript
const baseConversation = serializedConversation
  ? fromSerializableConversationWithMessages(serializedConversation)
  : null;

// Merge real messages (from Redux) with optimistic messages (local state)
const conversation = baseConversation
  ? {
      ...baseConversation,
      messages: [...baseConversation.messages, ...optimisticMessages],
    }
  : null;
```

### Cleaning Up Optimistic Messages

When the real message arrives from Firestore, we remove the matching optimistic one:

```typescript
useEffect(() => {
  if (optimisticMessages.length > 0 && baseConversation?.messages) {
    // Find messages that have been confirmed by Firestore
    const confirmedContents = new Set(
      baseConversation.messages
        .filter(m => !m.id.startsWith('temp_'))  // Real messages don't have temp_ prefix
        .map(m => m.content)
    );

    // Remove optimistic messages whose content matches a real message
    setOptimisticMessages(prev =>
      prev.filter(msg => !confirmedContents.has(msg.content))
    );
  }
}, [baseConversation?.messages?.length, optimisticMessages.length]);
```

---

## The Stale Closure Problem (And How We Solved It)

### The Problem

When a user sends a message, two Firestore updates happen:
1. New message added to subcollection
2. Conversation document updated (lastMessage, updatedAt)

Both listeners fire. The conversation listener was causing this issue:

```typescript
// PROBLEMATIC CODE
const unsubConversation = onSnapshot(conversationRef, (docSnapshot) => {
  const data = docSnapshot.data();

  // This captured `serializedConversation` from a STALE CLOSURE
  const existingMessages = serializedConversation?.messages || [];

  dispatch(setCurrentConversation({
    ...convData,
    messages: existingMessages,  // STALE - doesn't include new message!
  }));
});
```

When the conversation listener fired, `serializedConversation` still had the OLD messages (before the messages listener updated Redux). This caused messages to disappear.

### The Solution

1. **Separate message management**: Conversation listener doesn't touch messages
2. **Smart reducer**: `setCurrentConversation` only updates messages if non-empty array provided

```typescript
// Conversation listener passes empty messages
dispatch(setCurrentConversation({
  ...toSerializableConversation(convData),
  messages: [],  // Empty - let Redux keep existing messages
}));

// Redux reducer preserves existing messages
setCurrentConversation: (state, action) => {
  // Only update messages if array is non-empty
  if (action.payload?.messages && action.payload.messages.length > 0) {
    state.messages = action.payload.messages;
  }
  // Otherwise keep state.messages as-is
}
```

---

## Timing Diagram

```
Time →

User clicks Send
    |
    +-- [0ms] Optimistic message added to local state
    |           UI shows message immediately
    |
    +-- [0ms] API call starts (async)
    |
    +-- [100-500ms] API writes to Firestore
    |           - Adds message to subcollection
    |           - Updates conversation document
    |
    +-- [100-550ms] Messages onSnapshot fires
    |           - Redux receives new message
    |           - Optimistic message cleaned up
    |
    +-- [100-550ms] Conversation onSnapshot fires
    |           - Updates lastMessage, updatedAt
    |           - Messages NOT affected (empty array)
    |
    +-- [100-550ms] Conversations list onSnapshot fires
                - List updates with new lastMessage preview
```

---

## Benefits of This Architecture

1. **Instant feedback**: Messages appear immediately (<1ms)
2. **Resilience**: If API fails, optimistic message is removed
3. **Consistency**: Real-time listeners ensure all clients stay in sync
4. **No duplicates**: Optimistic cleanup prevents showing message twice
5. **Separation of concerns**: Each listener manages its own data
