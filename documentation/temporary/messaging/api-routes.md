# API Routes - Support Messaging System

This document details all REST API endpoints for the messaging system.

---

## Authentication

All endpoints require authentication via Firebase session cookies. The server extracts the current user using:

```typescript
const { db, currentUser } = await getAuthenticatedAppForUser();

if (!currentUser || !db) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
```

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/support/conversations` | List conversations |
| POST | `/api/support/conversations` | Create new conversation |
| GET | `/api/support/conversations/[id]` | Get conversation with messages |
| PATCH | `/api/support/conversations/[id]` | Update conversation (status, read) |
| GET | `/api/support/conversations/[id]/messages` | Get messages only |
| POST | `/api/support/conversations/[id]/messages` | Send new message |
| GET | `/api/support/admin/unread` | Get admin unread count |

---

## GET /api/support/conversations

**Location:** `/app/api/support/conversations/route.ts`

**Purpose:** List all conversations for the current user.

### Request

No body required. Authentication via cookies.

### Response

```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_123",
      "userId": "user_456",
      "userEmail": "user@example.com",
      "userName": "John Doe",
      "adminId": "melanie@glamlink.net",
      "status": "open",
      "subject": "Question about my order",
      "unreadByUser": 0,
      "unreadByAdmin": 1,
      "lastMessage": {
        "content": "Hello, I need help...",
        "senderId": "user_456",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Authorization Logic

```typescript
const isAdmin = isAdminEmail(currentUser.email || '');

// Admins see ALL conversations
// Users see only THEIR conversations
const q = isAdmin
  ? query(conversationsCollection, orderBy('updatedAt', 'desc'))
  : query(
      conversationsCollection,
      where('userId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
```

---

## POST /api/support/conversations

**Location:** `/app/api/support/conversations/route.ts`

**Purpose:** Create a new support conversation.

### Request Body

```json
{
  "subject": "Question about my digital card",
  "initialMessage": "Hello, I'm having trouble with..."
}
```

### Response

```json
{
  "success": true,
  "conversation": {
    "id": "conv_new",
    "userId": "user_456",
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "adminId": "melanie@glamlink.net",
    "status": "open",
    "subject": "Question about my digital card",
    "unreadByUser": 0,
    "unreadByAdmin": 1,
    "lastMessage": {
      "content": "Hello, I'm having trouble with...",
      "senderId": "user_456",
      "timestamp": "2024-01-15T10:00:00.000Z"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Server Logic

```typescript
const now = new Date();
const userName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';

// 1. Create conversation document
const conversationData = {
  userId: currentUser.uid,
  userEmail: currentUser.email,
  userName,
  adminId: DEFAULT_ADMIN_EMAIL,
  status: 'open',
  subject,
  unreadByUser: 0,
  unreadByAdmin: 1,  // New conversation = unread by admin
  lastMessage: {
    content: initialMessage,
    senderId: currentUser.uid,
    timestamp: now,
  },
  createdAt: now,
  updatedAt: now,
};

const conversationRef = await addDoc(conversationsCollection, conversationData);

// 2. Create initial message in subcollection
const messageData = {
  senderId: currentUser.uid,
  senderEmail: currentUser.email,
  senderName: userName,
  content: initialMessage,
  timestamp: now,
};

await addDoc(messagesCollection, messageData);
```

---

## GET /api/support/conversations/[id]

**Location:** `/app/api/support/conversations/[id]/route.ts`

**Purpose:** Get a single conversation with all its messages.

### URL Parameters

- `id` - Conversation ID

### Response

```json
{
  "success": true,
  "conversation": {
    "id": "conv_123",
    "userId": "user_456",
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "adminId": "melanie@glamlink.net",
    "status": "open",
    "subject": "Question about my order",
    "unreadByUser": 0,
    "unreadByAdmin": 0,
    "lastMessage": { ... },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "messages": [
      {
        "id": "msg_1",
        "senderId": "user_456",
        "senderEmail": "user@example.com",
        "senderName": "John Doe",
        "content": "Hello, I need help...",
        "timestamp": "2024-01-15T10:00:00.000Z"
      },
      {
        "id": "msg_2",
        "senderId": "admin_uid",
        "senderEmail": "melanie@glamlink.net",
        "senderName": "Melanie",
        "content": "Hi John, how can I help?",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Authorization Check

```typescript
const isAdmin = isAdminEmail(currentUser.email || '');

// Users can only access their own conversations
if (!isAdmin && conversationData.userId !== currentUser.uid) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 403 }
  );
}
```

---

## PATCH /api/support/conversations/[id]

**Location:** `/app/api/support/conversations/[id]/route.ts`

**Purpose:** Update conversation status or mark as read.

### Request Body

```json
{
  "status": "resolved",     // Optional: "open" | "pending" | "resolved"
  "markAsRead": true        // Optional: Mark messages as read
}
```

### Response

```json
{
  "success": true,
  "message": "Conversation updated"
}
```

### Server Logic

```typescript
const updates: any = {
  updatedAt: new Date(),
};

if (status) {
  updates.status = status;
}

if (markAsRead) {
  // Clear appropriate unread counter based on user type
  updates[isAdmin ? 'unreadByAdmin' : 'unreadByUser'] = 0;
}

await updateDoc(conversationRef, updates);
```

---

## GET /api/support/conversations/[id]/messages

**Location:** `/app/api/support/conversations/[id]/messages/route.ts`

**Purpose:** Get messages for a conversation (without conversation metadata).

### Response

```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_1",
      "senderId": "user_456",
      "senderEmail": "user@example.com",
      "senderName": "John Doe",
      "content": "Hello, I need help...",
      "timestamp": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## POST /api/support/conversations/[id]/messages

**Location:** `/app/api/support/conversations/[id]/messages/route.ts`

**Purpose:** Send a new message in a conversation.

### Request Body

```json
{
  "content": "Here is my response..."
}
```

### Response

```json
{
  "success": true,
  "message": {
    "id": "msg_new",
    "senderId": "user_456",
    "senderEmail": "user@example.com",
    "senderName": "John Doe",
    "content": "Here is my response...",
    "timestamp": "2024-01-15T11:00:00.000Z"
  }
}
```

### Server Logic (Most Complex Endpoint)

```typescript
const now = new Date();
const senderName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
const isAdmin = isAdminEmail(currentUser.email || '');

// 1. Create message document
const messageData = {
  senderId: currentUser.uid,
  senderEmail: currentUser.email,
  senderName,
  content: content.trim(),
  timestamp: now,
};

const messageRef = await addDoc(messagesCollection, messageData);

// 2. Update conversation document
const unreadField = isAdmin ? 'unreadByUser' : 'unreadByAdmin';
const currentUnread = conversationData[unreadField] || 0;

await updateDoc(conversationRef, {
  // Update lastMessage for list display
  lastMessage: {
    content: content.trim(),
    senderId: currentUser.uid,
    timestamp: now,
  },
  // Increment unread count for recipient
  [unreadField]: currentUnread + 1,
  updatedAt: now,
  // Auto-reopen if admin replies to resolved conversation
  ...(isAdmin && conversationData.status === 'resolved' ? { status: 'pending' } : {}),
});
```

### Key Behaviors

1. **Unread Increment**: When user sends → `unreadByAdmin++`, when admin sends → `unreadByUser++`
2. **Auto-Reopen**: If admin replies to a "resolved" conversation, it becomes "pending"
3. **lastMessage Denormalization**: The last message is copied to the conversation for list display

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Missing required fields |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Not allowed to access resource |
| 404 | Not Found - Conversation doesn't exist |
| 500 | Server Error - Something went wrong |

---

## Next.js 15 Params Pattern

**Important:** In Next.js 15, dynamic route params must be awaited:

```typescript
// CORRECT - Next.js 15
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;  // MUST await
  // ...
}

// WRONG - Will cause errors
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;  // ERROR: params not awaited
}
```
