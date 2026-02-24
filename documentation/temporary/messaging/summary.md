# Support Messaging System - Overview

This document provides a high-level overview of the Glamlink Support Messaging system architecture.

## System Purpose

The Support Messaging system enables real-time, bidirectional communication between Glamlink users and the admin support team. It provides:

- **User-to-Admin messaging**: Users can create support conversations and send messages
- **Admin-to-User messaging**: Admins can respond to and manage all support conversations
- **Real-time updates**: Messages appear instantly without page refresh using Firestore listeners
- **Typing indicators**: Shows when the other party is typing
- **Unread tracking**: Badge counts for unread messages in the admin sidebar

---

## Architecture Summary

```
+-------------------------------------------------------------------------+
|                           UI LAYER                                       |
|  +------------------+  +------------------+  +------------------+        |
|  |  MessagesPage    |  | ConversationView |  |  MessageBubble   |        |
|  |  (list view)     |  |  (chat view)     |  |  (single msg)    |        |
|  +--------+---------+  +--------+---------+  +------------------+        |
|           |                     |                                        |
+-----------+---------------------+----------------------------------------+
            |                     |
+-----------+---------------------+----------------------------------------+
|                         HOOKS LAYER                                      |
|  +------------------+  +------------------+  +-------------------+       |
|  | useConversations |  | useConversation  |  |useTypingIndicator |       |
|  | (list + listen)  |  | (detail + send)  |  | (real-time)       |       |
|  +--------+---------+  +--------+---------+  +---------+---------+       |
|           |                     |                      |                 |
|           +---------------------+----------------------+                 |
|                                 |                                        |
+---------------------------------+----------------------------------------+
                                  |
+---------------------------------+----------------------------------------+
|                         STATE LAYER                                      |
|  +-------------------------------------------------------------------+   |
|  |                    Redux (supportMessagingSlice)                   |   |
|  |  +--------------+ +---------------+ +-----------+ +---------------+|   |
|  |  |conversations | |currentConv    | | messages  | |adminUnreadCnt ||   |
|  |  +--------------+ +---------------+ +-----------+ +---------------+|   |
|  +-------------------------------------------------------------------+   |
|                                 |                                        |
+---------------------------------+----------------------------------------+
                                  |
+---------------------------------+----------------------------------------+
|                      DATA/PERSISTENCE LAYER                              |
|  +-----------------------------+  +---------------------------------+    |
|  |    Firestore (Real-time)    |  |       API Routes (REST)          |    |
|  |  - support_conversations    |  |  - POST /api/support/conversations|    |
|  |  - .../messages subcollection|  |  - POST .../[id]/messages        |    |
|  |  - .../typing subcollection |  |  - PATCH .../[id]                |    |
|  +-----------------------------+  +---------------------------------+    |
|                                                                          |
+--------------------------------------------------------------------------+
```

---

## Data Flow for Sending a Message

```
User types message -> clicks Send
         |
         v
+-----------------------------+
|  1. Optimistic Update       |  <- Message appears INSTANTLY in UI
|     (local state)           |
+-------------+---------------+
              |
              v
+-----------------------------+
|  2. API Call                |  <- POST /api/support/conversations/[id]/messages
|     (async, non-blocking)   |
+-------------+---------------+
              |
              v
+-----------------------------+
|  3. Firestore Write         |  <- Server adds message to subcollection
|     - Add to messages       |
|     - Update lastMessage    |
|     - Increment unread      |
+-------------+---------------+
              |
              v
+-----------------------------+
|  4. onSnapshot Listener     |  <- Real-time listener receives update
|     fires                   |
+-------------+---------------+
              |
              v
+-----------------------------+
|  5. Redux State Updated     |  <- Optimistic message replaced with real one
|     (setMessages action)    |
+-----------------------------+
```

---

## Key Technologies

| Technology | Usage |
|------------|-------|
| **Next.js 15** | App Router for pages and API routes |
| **Firebase Firestore** | Real-time database with `onSnapshot` listeners |
| **Redux Toolkit** | Global state management for conversations/messages |
| **TypeScript** | Full type safety throughout the system |

---

## File Structure

```
lib/features/crm/profile/support-messaging/
├── types.ts                    # TypeScript interfaces
├── config.ts                   # Constants and configuration
├── index.ts                    # Public exports
├── components/
│   ├── MessagesPage.tsx        # Conversations list view
│   ├── ConversationView.tsx    # Single conversation chat view
│   ├── MessageBubble.tsx       # Individual message display
│   ├── NewConversationModal.tsx# Create new conversation modal
│   └── SupportLink.tsx         # Link component for support
├── hooks/
│   ├── useConversations.ts     # List all conversations + real-time
│   ├── useConversation.ts      # Single conversation + messaging
│   ├── useTypingIndicator.ts   # Real-time typing status
│   └── useAdminUnreadCount.ts  # Badge count for admin sidebar
└── store/
    ├── supportMessagingSlice.ts# Redux slice with all actions
    └── index.ts                # Store exports

app/api/support/
├── conversations/
│   ├── route.ts                # GET/POST conversations
│   └── [id]/
│       ├── route.ts            # GET/PATCH single conversation
│       └── messages/
│           └── route.ts        # GET/POST messages
└── admin/
    ├── conversations/route.ts  # Admin-only list
    └── unread/route.ts         # Admin unread count
```

---

## Detailed Documentation

For comprehensive technical details, see the following files in this directory:

1. **[data-models.md](./data-models.md)** - Firestore collections and TypeScript types
2. **[hooks-detail.md](./hooks-detail.md)** - React hooks implementation
3. **[redux-state.md](./redux-state.md)** - Redux slice and state management
4. **[api-routes.md](./api-routes.md)** - REST API endpoints
5. **[real-time-updates.md](./real-time-updates.md)** - Firestore listeners and optimistic updates
6. **[components.md](./components.md)** - UI component breakdown
