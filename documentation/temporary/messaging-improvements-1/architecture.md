# Architecture: Support Messaging

**Feature Path:** `lib/features/crm/profile/support-messaging/`
**Last Updated:** 2026-01-16

## Purpose

The Support Messaging system provides real-time chat functionality between users and administrators. Users can create support conversations with subjects and tags, send messages with attachments, and receive real-time responses. Admins can manage multiple conversations with priority levels, status tracking, bulk operations, and audit logging.

## File Structure

```
support-messaging/
├── components/
│   ├── ConversationView/
│   │   ├── ConversationView.tsx    # Main conversation UI (~292 lines)
│   │   ├── useConversationView.ts  # Hook composing all view logic (~353 lines)
│   │   ├── useDraftPersistence.ts  # localStorage draft saving (~55 lines)
│   │   ├── useMessageInput.ts      # Textarea handling (~61 lines)
│   │   └── index.ts                # Exports
│   ├── MessagesPage/
│   │   ├── MessagesPage.tsx        # Conversation list page (~235 lines)
│   │   ├── ConversationItem.tsx    # Single conversation row (~146 lines)
│   │   ├── useMessagesPage.ts      # Page state/handlers (~131 lines)
│   │   └── index.ts                # Exports
│   ├── AriaAnnouncer.tsx           # Screen reader announcements
│   ├── AttachmentPreview.tsx       # File attachment display
│   ├── AttachmentUploader.tsx      # File upload UI
│   ├── AuditLogPanel.tsx           # Admin audit trail
│   ├── ConnectionIndicator.tsx     # Online/offline status
│   ├── LoadingSpinner.tsx          # Loading states
│   ├── MessageBubble.tsx           # Individual message display
│   ├── MessageReactions.tsx        # Emoji reactions UI
│   ├── MessagingErrorBoundary.tsx  # Error boundary
│   ├── NewConversationModal.tsx    # Create conversation dialog
│   ├── PriorityBadge.tsx           # Priority level indicator
│   ├── ResponseTimeDisplay.tsx     # Response metrics
│   ├── SearchInput.tsx             # Search with debounce
│   ├── SupportLink.tsx             # Navigation link
│   ├── TagBadge.tsx                # Tag display
│   └── TagSelector.tsx             # Tag multi-select
│
├── hooks/
│   ├── useConversation/
│   │   ├── index.ts                    # Main composed hook (~195 lines)
│   │   ├── useConversationRealtime.ts  # Firestore listeners (~153 lines)
│   │   ├── useConversationMessages.ts  # Send/retry messages (~118 lines)
│   │   ├── useConversationActions.ts   # Status/priority/tags (~182 lines)
│   │   └── useConversationPagination.ts # Load more (~80 lines)
│   ├── useConversation.ts          # Re-export for backward compat
│   ├── useConversations.ts         # Conversation list (~192 lines)
│   ├── useConversationSearch.ts    # Search/filter
│   ├── useSendMessage.ts           # Standalone send
│   ├── useAdminUnreadCount.ts      # Unread badge count
│   ├── useAriaAnnouncer.ts         # A11y announcements (~50 lines)
│   ├── useAuditLog.ts              # Audit log fetching
│   ├── useConnectionState.ts       # Online/offline + queue
│   ├── useFileUpload.ts            # File upload state (~216 lines)
│   ├── useKeyboardNavigation.ts    # Arrow key navigation (~127 lines)
│   ├── useNotificationSound.ts     # Audio notifications
│   ├── useRateLimit.ts             # Client-side rate limit (~85 lines)
│   └── useTypingIndicator.ts       # Typing status
│
├── store/
│   ├── supportMessagingSlice.ts    # Redux slice (~213 lines)
│   └── index.ts                    # Store exports
│
├── types/
│   ├── attachment.ts               # Attachment types
│   └── auditLog.ts                 # Audit log types
│
├── utils/
│   ├── auditLog.ts                 # Audit CRUD operations (~161 lines)
│   ├── messageBatch.ts             # Batch message helpers
│   ├── rateLimit.ts                # Rate limit utilities
│   ├── sanitize.ts                 # XSS prevention (~44 lines)
│   ├── serialization.ts            # Date serialization (~177 lines)
│   └── timeFormatting.ts           # Relative time display
│
├── styles/
│   └── accessibility.css           # A11y focus styles
│
├── config.ts                       # Feature configuration (~101 lines)
├── types.ts                        # Main type definitions (~175 lines)
└── index.ts                        # Public exports
```

## Component Hierarchy

```
MessagesPage (conversation list)
├── SearchInput (filter conversations)
├── ConversationItem[] (conversation rows)
│   ├── PriorityBadge
│   └── TagBadge[]
└── NewConversationModal

ConversationView (single conversation)
├── AriaAnnouncer (screen reader)
├── ConnectionIndicator (online/offline)
├── AuditLogPanel (admin only)
│   └── AuditLogEntry[]
├── TagSelector (admin only)
├── MessageBubble[] (message list)
│   ├── AttachmentPreview[]
│   └── MessageReactions
├── AttachmentUploader
│   └── UploadProgress[]
└── MessageInput (textarea + send button)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER ACTIONS                            │
├─────────────────────────────────────────────────────────────────┤
│  Type Message  │  Send Message  │  Upload File  │  Change Status │
└───────┬────────┴───────┬────────┴───────┬───────┴───────┬───────┘
        │                │                │               │
        ▼                ▼                ▼               ▼
┌───────────────┐ ┌─────────────┐ ┌────────────┐ ┌────────────────┐
│useMessageInput│ │useConversation│ │useFileUpload│ │useConversation │
│   (debounce)  │ │  Messages   │ │ (progress) │ │    Actions     │
└───────┬───────┘ └──────┬──────┘ └─────┬──────┘ └───────┬────────┘
        │                │              │                │
        ▼                │              │                │
┌───────────────┐        │              │                │
│useTypingIndicator│     │              │                │
│ (Firestore)   │        │              │                │
└───────────────┘        │              │                │
                         ▼              ▼                ▼
                ┌────────────────────────────────────────────────┐
                │              FIRESTORE DATABASE                 │
                ├────────────────────────────────────────────────┤
                │  support_conversations/{id}                     │
                │  ├── messages (subcollection)                   │
                │  ├── audit_logs (subcollection)                 │
                │  └── typing_indicators (subcollection)          │
                └────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           ┌──────────────┐ ┌─────────────┐ ┌─────────────────┐
           │useConversation│ │useAuditLog  │ │useTypingIndicator│
           │   Realtime   │ │  (fetch)    │ │    (listen)     │
           └──────┬───────┘ └──────┬──────┘ └────────┬────────┘
                  │                │                  │
                  ▼                ▼                  ▼
           ┌─────────────────────────────────────────────────────┐
           │           REDUX STORE (supportMessagingSlice)       │
           ├─────────────────────────────────────────────────────┤
           │  conversations[]  │  currentConversation  │ messages│
           │  adminUnreadCount │  isLoading           │ error   │
           └─────────────────────────────────────────────────────┘
                                    │
                                    ▼
           ┌─────────────────────────────────────────────────────┐
           │                 REACT COMPONENTS                     │
           ├─────────────────────────────────────────────────────┤
           │  MessagesPage  │  ConversationView  │  MessageBubble │
           └─────────────────────────────────────────────────────┘
```

## Current Capabilities

| Capability | Status | Notes |
|------------|--------|-------|
| Real-time messages | ✅ Complete | Firestore onSnapshot listeners |
| Typing indicators | ✅ Complete | Shows who is typing |
| Message reactions | ✅ Complete | Emoji reactions with user tracking |
| File attachments | ✅ Complete | Image, PDF, document support |
| Offline support | ✅ Complete | Queue messages when offline |
| Keyboard navigation | ✅ Complete | Arrow keys, Home/End, Escape |
| Screen reader support | ✅ Complete | ARIA announcements, live regions |
| Priority management | ✅ Complete | Low/Normal/High/Urgent |
| Status management | ✅ Complete | Open/Pending/Resolved |
| Tag categorization | ✅ Complete | Billing/Bug/Feature/Question/Feedback |
| Audit logging | ✅ Complete | Track all admin actions |
| Response metrics | ✅ Complete | First response time, average time |
| Message pagination | ✅ Complete | Load more older messages |
| Client rate limiting | ✅ Complete | Prevents spam |
| Draft persistence | ✅ Complete | localStorage auto-save |
| Error boundary | ✅ Complete | Graceful error handling |
| Notification sounds | ✅ Complete | Audio on new messages |
| Search conversations | ✅ Complete | By subject, user |
| Unread indicators | ✅ Complete | Badge counts, dividers |
| Bulk operations | ⚠️ Partial | Bulk status only, no delete |
| Server rate limiting | ❌ Missing | Only client-side |
| Message editing | ❌ Missing | No edit after send |
| Export transcripts | ❌ Missing | No conversation export |
| Message templates | ❌ Missing | No canned responses |

## Key Technologies

- **Framework:** Next.js 15 (App Router)
- **State Management:** Redux Toolkit
- **Database:** Firestore (realtime listeners)
- **Storage:** Firebase Storage (attachments)
- **Auth:** Firebase Auth (session cookies)
- **Styling:** Tailwind CSS

## External Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| @reduxjs/toolkit | State management | 2.x |
| firebase | Database & auth | 10.x |
| react-redux | Redux bindings | 9.x |
| dompurify | XSS prevention | 3.x (peer) |

## Key Patterns

### 1. Hook Composition
Large hooks are split into focused sub-hooks and composed:
```typescript
// useConversation/index.ts composes:
// - useConversationRealtime (listeners)
// - useConversationMessages (send/retry)
// - useConversationActions (status/tags)
// - useConversationPagination (load more)
```

### 2. Serialization for Redux
Firestore Timestamps are converted to ISO strings for Redux:
```typescript
// utils/serialization.ts
toSerializableMessage(msg)   // Date → string
fromSerializableMessage(msg) // string → Date
```

### 3. Optimistic Updates
Messages appear immediately with "sending" status:
```typescript
const tempMessage = {
  id: `temp_${Date.now()}`,
  status: 'sending',
  ...messageData
};
dispatch(addMessage(tempMessage));
// Then update with real ID on success
```

### 4. Backward Compatibility
Re-exports maintain existing import paths:
```typescript
// hooks/useConversation.ts
export { useConversation } from './useConversation/index';
```

## Security Measures

| Measure | Implementation | File |
|---------|----------------|------|
| Input sanitization | HTML tag stripping | utils/sanitize.ts |
| Content length limits | Max 2000 chars | config.ts |
| Client rate limiting | 10 msg/min | hooks/useRateLimit.ts |
| Auth checks | Session cookies | API routes |
| React escaping | Built-in XSS protection | Components |

## Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| Message pagination | Load 30 initially, 50 more on scroll |
| Debounced typing | 1000ms debounce before Firestore write |
| Debounced search | 300ms debounce on keystroke |
| Draft debounce | 500ms before localStorage save |
| Cleanup intervals | Rate limit timestamps cleaned every 1s |
