# Data Models - Support Messaging System

This document details the Firestore collections structure and TypeScript type definitions.

---

## Firestore Collections

### Collection: `support_conversations`

Each document represents a single support conversation between a user and the admin team.

**Document Structure:**
```typescript
{
  id: string;                    // Auto-generated document ID
  userId: string;                // Firebase Auth UID of the user who created the conversation
  userEmail: string;             // Email address of the user
  userName: string;              // Display name of the user
  adminId: string;               // Email of assigned admin (default: "melanie@glamlink.net")
  status: "open" | "pending" | "resolved";
  subject: string;               // Conversation subject line
  unreadByUser: number;          // Count of unread messages for the user
  unreadByAdmin: number;         // Count of unread messages for admin
  lastMessage: {                 // Denormalized for list display
    content: string;
    senderId: string;
    timestamp: Firestore.Timestamp;
  } | null;
  createdAt: Firestore.Timestamp;
  updatedAt: Firestore.Timestamp;
}
```

**Collection Path:** `support_conversations`

**Indexes Required:**
- `userId` + `updatedAt DESC` (for user's conversation list)
- `updatedAt DESC` (for admin's conversation list)
- `unreadByAdmin` > 0 (for unread count query)

---

### Subcollection: `support_conversations/{conversationId}/messages`

Each document represents a single message within a conversation.

**Document Structure:**
```typescript
{
  id: string;                    // Auto-generated document ID
  senderId: string;              // Firebase Auth UID of sender
  senderEmail: string;           // Email of sender
  senderName: string;            // Display name of sender
  content: string;               // Message text content
  timestamp: Firestore.Timestamp;// When the message was sent
  readAt?: Firestore.Timestamp;  // When the recipient read the message (optional)
}
```

**Collection Path:** `support_conversations/{conversationId}/messages`

**Indexes Required:**
- `timestamp ASC` (for chronological message ordering)

---

### Subcollection: `support_conversations/{conversationId}/typing`

Used for real-time typing indicators. Only stores the most recent typing state.

**Document Structure:**
```typescript
{
  userId: string;                // Who is typing
  userName: string;              // Display name
  isTyping: boolean;             // Current typing state
  updatedAt: Firestore.Timestamp;// Last update time
}
```

**Collection Path:** `support_conversations/{conversationId}/typing/current`

**Note:** Only a single document `current` is used. It gets overwritten by whoever is currently typing.

---

## TypeScript Types

### Location: `/lib/features/crm/profile/support-messaging/types.ts`

### ConversationStatus

```typescript
export type ConversationStatus = 'open' | 'resolved' | 'pending';
```

Status definitions:
- **open**: New conversation, awaiting admin response
- **pending**: Admin has responded, awaiting user reply
- **resolved**: Conversation is closed

---

### Conversation

```typescript
export interface Conversation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  adminId: string;
  status: ConversationStatus;
  subject: string;
  unreadByUser: number;
  unreadByAdmin: number;
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Message

```typescript
export interface Message {
  id: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  content: string;
  timestamp: Date;
  readAt?: Date;
}
```

---

### ConversationWithMessages

```typescript
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}
```

This is the combined type used when viewing a single conversation with all its messages loaded.

---

### TypingIndicator

```typescript
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  updatedAt: Date;
}
```

---

## API Request/Response Types

### Create Conversation

```typescript
export interface CreateConversationRequest {
  subject: string;
  initialMessage: string;
}

export interface CreateConversationResponse {
  success: boolean;
  conversation?: Conversation;
  error?: string;
}
```

### Send Message

```typescript
export interface SendMessageRequest {
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: Message;
  error?: string;
}
```

---

## Serializable Types (Redux)

Redux requires serializable state (no `Date` objects). The slice uses converted types:

### SerializableMessage

```typescript
export interface SerializableMessage {
  id: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  content: string;
  timestamp: string;    // ISO string instead of Date
  readAt?: string;      // ISO string instead of Date
}
```

### SerializableConversation

```typescript
export interface SerializableConversation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  adminId: string;
  status: ConversationStatus;
  subject: string;
  unreadByUser: number;
  unreadByAdmin: number;
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: string;  // ISO string
  } | null;
  createdAt: string;    // ISO string
  updatedAt: string;    // ISO string
}
```

### Conversion Helpers

```typescript
// Convert to serializable (for Redux storage)
toSerializableConversation(conv: Conversation): SerializableConversation
toSerializableMessage(msg: Message): SerializableMessage

// Convert back to Date objects (for UI consumption)
fromSerializableConversation(conv: SerializableConversation): Conversation
fromSerializableMessage(msg: SerializableMessage): Message
```

---

## Configuration

### Location: `/lib/features/crm/profile/support-messaging/config.ts`

```typescript
// Default admin for new conversations
export const DEFAULT_ADMIN_EMAIL = 'melanie@glamlink.net';

// Status options with display colors
export const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-gray-100 text-gray-800' },
];

// Firestore collection paths
export const COLLECTION_PATHS = {
  conversations: 'support_conversations',
  messages: (conversationId: string) => `support_conversations/${conversationId}/messages`,
  adminNotifications: 'app_settings/admin-notifications',
};

// Check if email belongs to an admin
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
```
