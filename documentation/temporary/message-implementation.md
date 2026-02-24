# Support Messaging System - Implementation Plan

**Created:** 2025-01-16
**Feature Path:** `lib/features/crm/profile/support-messaging`
**Total Improvements:** 31

---

## Overview

This document outlines all planned improvements for the support messaging system, organized by priority and effort level.

---

## Phase 1: Refactoring (Priority)

### 1. ConversationView.tsx Refactor

**Current State:**
- 288 lines total (138 Hook/JS, 107 TSX)
- 5 useEffect hooks, 3 useCallback hooks, multiple useState
- Exceeds 100-line hook logic threshold

**Implementation:**

Create subdirectory structure:
```
components/
├── ConversationView/
│   ├── index.ts                    # Re-exports
│   ├── ConversationView.tsx        # TSX only (~130 lines)
│   └── useConversationView.ts      # All hooks/handlers (~100 lines)
```

**Extract to `useConversationView.ts`:**
- Lines 17-30: useState/useRef declarations
- Lines 37-50: useEffect - auto-scroll on new messages
- Lines 52-61: useEffect - scroll on initial load
- Lines 63-68: useEffect - mark as read
- Lines 70-88: useCallback - handleTypingChange
- Lines 90-109: useCallback - handleInputChange
- Lines 111-130: handleSend function
- Lines 132-139: useEffect - cleanup typing debounce
- Lines 141-146: handleKeyDown function
- Lines 148-154: handleStatusChange function

**Return from hook:**
```typescript
interface UseConversationViewReturn {
  // State
  newMessage: string;
  setNewMessage: (msg: string) => void;
  isSending: boolean;

  // Refs
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;

  // Handlers
  handleSend: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleStatusChange: (status: ConversationStatus) => void;

  // Derived
  typingIndicatorText: string | null;
}
```

**Files to create:**
- `components/ConversationView/index.ts`
- `components/ConversationView/ConversationView.tsx`
- `components/ConversationView/useConversationView.ts`

**Files to delete:**
- `components/ConversationView.tsx` (after migration)

---

## Phase 2: Quick Wins (Low Effort)

### 2. Add Error Boundary

**Purpose:** Prevent Firestore listener errors from crashing the entire page.

**Implementation:**
```typescript
// components/MessagingErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MessagingErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Messaging error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center">
          <p className="text-red-600 mb-4">Something went wrong loading messages.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-glamlink-purple underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Usage:**
```typescript
<MessagingErrorBoundary>
  <ConversationView conversationId={id} />
</MessagingErrorBoundary>
```

---

### 3. Message Retry Button

**Purpose:** Allow users to retry sending a failed message without retyping.

**Implementation:**

Update optimistic message type:
```typescript
interface OptimisticMessage extends Message {
  status: 'sending' | 'failed';
  retryCount?: number;
}
```

Update `useConversation.ts`:
```typescript
const [failedMessages, setFailedMessages] = useState<OptimisticMessage[]>([]);

const retryMessage = useCallback(async (messageId: string) => {
  const message = failedMessages.find(m => m.id === messageId);
  if (!message) return;

  setFailedMessages(prev => prev.filter(m => m.id !== messageId));
  await sendMessage(message.content);
}, [failedMessages, sendMessage]);
```

UI in ConversationView:
```typescript
{message.status === 'failed' && (
  <button
    onClick={() => retryMessage(message.id)}
    className="text-xs text-red-500 flex items-center gap-1"
  >
    <RefreshIcon className="w-3 h-3" />
    Retry
  </button>
)}
```

---

### 4. Shared Time Formatting

**Purpose:** Consolidate duplicate time formatting functions.

**Current duplication:**
- `formatRelativeTime` in `MessagesPage.tsx` (lines 178-192)
- `formatTime` in `MessageBubble.tsx`

**Implementation:**

Create shared utility:
```typescript
// lib/features/crm/profile/support-messaging/utils/timeFormatting.ts

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMessageTime(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatFullDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
```

---

### 5. Shared Loading Spinner

**Purpose:** Reuse consistent loading UI across messaging components.

**Implementation:**
```typescript
// lib/features/crm/profile/support-messaging/components/LoadingSpinner.tsx

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-glamlink-purple`} />
      {message && <p className="mt-4 text-gray-500">{message}</p>}
    </div>
  );
}
```

---

### 6. Draft Persistence

**Purpose:** Save unsent message to localStorage so users don't lose work on refresh.

**Implementation:**
```typescript
// In useConversationView.ts

const DRAFT_KEY = `messaging_draft_${conversationId}`;

// Load draft on mount
useEffect(() => {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (saved) {
    setNewMessage(saved);
  }
}, [conversationId]);

// Save draft on change (debounced)
useEffect(() => {
  const timeout = setTimeout(() => {
    if (newMessage.trim()) {
      localStorage.setItem(DRAFT_KEY, newMessage);
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, 500);

  return () => clearTimeout(timeout);
}, [newMessage, conversationId]);

// Clear draft on send
const handleSend = async () => {
  // ... existing logic
  localStorage.removeItem(DRAFT_KEY);
};
```

---

### 7. Unread Message Divider

**Purpose:** Show visual separator for new unread messages.

**Implementation:**
```typescript
// In ConversationView.tsx

const lastReadTimestamp = conversation.lastReadAt;

{conversation.messages.map((message, index) => {
  const prevMessage = conversation.messages[index - 1];
  const showUnreadDivider =
    lastReadTimestamp &&
    message.timestamp > lastReadTimestamp &&
    (!prevMessage || prevMessage.timestamp <= lastReadTimestamp);

  return (
    <React.Fragment key={message.id}>
      {showUnreadDivider && (
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-glamlink-purple/30" />
          <span className="text-xs text-glamlink-purple font-medium">
            New messages
          </span>
          <div className="flex-1 h-px bg-glamlink-purple/30" />
        </div>
      )}
      <MessageBubble message={message} isCurrentUser={...} />
    </React.Fragment>
  );
})}
```

---

### 8. Message Timestamps on Hover

**Purpose:** Show full datetime on hover instead of cluttering UI.

**Implementation:**
```typescript
// In MessageBubble.tsx

<div className="relative group">
  <p className={`text-xs mt-1 ${isCurrentUser ? 'text-white/70' : 'text-gray-400'}`}>
    {formatMessageTime(message.timestamp)}
  </p>

  {/* Tooltip on hover */}
  <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block">
    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
      {formatFullDateTime(message.timestamp)}
    </div>
  </div>
</div>
```

---

### 9. Focus Management

**Purpose:** Automatically focus input after sending message for better UX.

**Implementation:**
```typescript
// In useConversationView.ts

const inputRef = useRef<HTMLTextAreaElement>(null);

const handleSend = async () => {
  // ... existing send logic

  // Focus input after send
  setTimeout(() => {
    inputRef.current?.focus();
  }, 100);
};

// Also focus on mount
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

---

### 10. Content Sanitization

**Purpose:** Strip HTML/XSS from message content before display.

**Implementation:**
```typescript
// lib/features/crm/profile/support-messaging/utils/sanitize.ts

export function sanitizeMessageContent(content: string): string {
  // Remove HTML tags
  const withoutHtml = content.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = withoutHtml;
  const decoded = textarea.value;

  // Trim whitespace
  return decoded.trim();
}
```

**Apply in API route before saving and in MessageBubble before display.**

---

### 11. Message Length Limits

**Purpose:** Prevent extremely long messages that could cause performance issues.

**Implementation:**

Add to config:
```typescript
// config.ts
export const MESSAGE_CONFIG = {
  maxLength: 2000,
  minLength: 1,
};
```

Validate in UI:
```typescript
const isOverLimit = newMessage.length > MESSAGE_CONFIG.maxLength;
const charsRemaining = MESSAGE_CONFIG.maxLength - newMessage.length;

<textarea maxLength={MESSAGE_CONFIG.maxLength} />
{newMessage.length > MESSAGE_CONFIG.maxLength * 0.8 && (
  <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
    {charsRemaining} characters remaining
  </span>
)}
```

---

## Phase 3: Medium Effort

### 12. Read Receipts

**Purpose:** Show when messages have been read by the recipient.

**Database changes:**
```typescript
interface Message {
  readAt?: Date;
  readBy?: string[];
}
```

**UI display:**
```typescript
{isCurrentUser && message.readAt && (
  <span className="text-xs text-white/50 flex items-center gap-1">
    <CheckCheckIcon className="w-3 h-3" />
    Read
  </span>
)}
```

---

### 13. Message Reactions

**Purpose:** Allow quick emoji reactions without typing a full response.

**Database changes:**
```typescript
interface Message {
  reactions?: {
    emoji: string;      // thumbsup, check, question, heart
    userId: string;
    userName: string;
    createdAt: Date;
  }[];
}
```

**API endpoints:**
- `POST /api/support/conversations/[id]/messages/[messageId]/reactions`
- `DELETE /api/support/conversations/[id]/messages/[messageId]/reactions/[emoji]`

---

### 14. Sound Notifications

**Purpose:** Audio alert for new messages when tab is not focused.

**Implementation:**
```typescript
export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/message-notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const playSound = useCallback(() => {
    if (document.hidden && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  return { playSound };
}
```

---

### 15. Priority/Urgency Flags

**Purpose:** Mark conversations as urgent for admin attention.

**Database changes:**
```typescript
interface Conversation {
  priority: 'low' | 'normal' | 'high' | 'urgent';
}
```

**UI:**
- Priority badge in conversation list
- Priority selector in conversation view (admin only)
- Sort/filter by priority

---

### 16. Conversation Tags

**Purpose:** Categorize conversations by topic for organization.

**Database changes:**
```typescript
interface Conversation {
  tags: string[];
}
```

**Predefined tags:**
```typescript
export const CONVERSATION_TAGS = [
  { value: 'billing', label: 'Billing', color: 'bg-green-100 text-green-800' },
  { value: 'bug', label: 'Bug Report', color: 'bg-red-100 text-red-800' },
  { value: 'feature', label: 'Feature Request', color: 'bg-blue-100 text-blue-800' },
  { value: 'question', label: 'Question', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'feedback', label: 'Feedback', color: 'bg-purple-100 text-purple-800' },
];
```

---

### 17. Response Time Metrics

**Purpose:** Track admin response times for performance monitoring.

**Database changes:**
```typescript
interface Conversation {
  metrics?: {
    firstResponseTime?: number;
    averageResponseTime?: number;
    totalAdminReplies: number;
  };
}
```

---

### 18. Bulk Status Updates

**Purpose:** Select multiple conversations and update status at once.

**UI:**
- Checkbox on each conversation item
- Bulk action bar appears when items selected
- Actions: Mark as Resolved, Mark as Open

**API:**
```typescript
// POST /api/support/conversations/bulk-update
{
  conversationIds: string[];
  updates: { status?: ConversationStatus };
}
```

---

### 19. Rate Limiting

**Purpose:** Prevent message spam (max 10 messages/minute per user).

**Implementation:**
```typescript
export const RATE_LIMITS = {
  messagesPerMinute: 10,
  messagesPerHour: 100,
};
```

Server-side check in API route, return 429 if exceeded.

---

### 20. Debounce Firestore Writes

**Purpose:** Reduce Firestore writes for rapid typing indicator updates.

**Implementation:**
```typescript
const DEBOUNCE_MS = 1000;
const writeTimeoutRef = useRef<NodeJS.Timeout>();

const setTyping = useCallback((isTyping: boolean) => {
  if (writeTimeoutRef.current) {
    clearTimeout(writeTimeoutRef.current);
  }

  writeTimeoutRef.current = setTimeout(async () => {
    await setDoc(typingRef, {
      userId: user.uid,
      userName: user.displayName,
      isTyping,
      updatedAt: serverTimestamp(),
    });
  }, isTyping ? 0 : DEBOUNCE_MS);
}, [user, typingRef]);
```

---

### 21. Connection State Handling

**Purpose:** Show offline indicator and queue messages when disconnected.

**Implementation:**
```typescript
export function useConnectionState() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, []);

  return { isOnline, pendingMessages, queueMessage };
}
```

**UI:**
```typescript
{!isOnline && (
  <div className="bg-yellow-100 text-yellow-800 text-sm px-4 py-2 text-center">
    You're offline. Messages will be sent when you reconnect.
  </div>
)}
```

---

### 22. Screen Reader Announcements

**Purpose:** Announce new messages for accessibility.

**Implementation:**
```typescript
<div role="log" aria-live="polite" aria-label="Message history">
  {conversation.messages.map(...)}
</div>

<div className="sr-only" aria-live="assertive" aria-atomic="true">
  {latestMessage && !isCurrentUserMessage && (
    `New message from ${latestMessage.senderName}`
  )}
</div>
```

---

### 23. Keyboard Navigation

**Purpose:** Navigate messages with arrow keys for accessibility.

**Implementation:**
```typescript
const [focusedMessageIndex, setFocusedMessageIndex] = useState<number | null>(null);

const handleKeyNavigation = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowUp') {
    setFocusedMessageIndex(prev => Math.max(0, (prev ?? messages.length) - 1));
  } else if (e.key === 'ArrowDown') {
    setFocusedMessageIndex(prev => Math.min(messages.length - 1, (prev ?? -1) + 1));
  } else if (e.key === 'Escape') {
    setFocusedMessageIndex(null);
    inputRef.current?.focus();
  }
};
```

---

### 24. High Contrast Mode

**Purpose:** Better colors for users with visual impairments.

**Implementation:**
```css
@media (prefers-contrast: high) {
  :root {
    --message-bg-sent: #1a1a1a;
    --message-text-sent: #ffffff;
    --message-bg-received: #ffffff;
    --message-text-received: #000000;
  }
}
```

---

### 25. Indexed Queries

**Purpose:** Add Firestore composite index for better query performance.

**firestore.indexes.json:**
```json
{
  "indexes": [
    {
      "collectionGroup": "support_conversations",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

### 26. Message Batching

**Purpose:** Send multiple messages in one write operation.

**Implementation:**
```typescript
const sendBatchedMessages = useCallback(async (contents: string[]) => {
  const batch = writeBatch(clientDb);

  contents.forEach((content, index) => {
    const messageRef = doc(messagesRef);
    batch.set(messageRef, {
      senderId: user.uid,
      content: content.trim(),
      timestamp: Timestamp.fromDate(new Date(Date.now() + index)),
    });
  });

  await batch.commit();
}, [conversationId, user]);
```

---

### 27. Lazy Load Old Messages

**Purpose:** Only fetch recent 50 messages, load more on scroll up.

**Implementation:**
```typescript
const MESSAGES_PER_PAGE = 50;

const loadMoreMessages = async () => {
  const olderQuery = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    startAfter(oldestMessageTimestamp),
    limit(MESSAGES_PER_PAGE)
  );
  // ...
};
```

**UI:**
```typescript
{hasMore && (
  <button onClick={loadMoreMessages}>
    Load earlier messages
  </button>
)}
```

---

### 28. Audit Logging

**Purpose:** Track who changed conversation status and when.

**Database structure:**
```typescript
interface ConversationAuditLog {
  id: string;
  conversationId: string;
  action: 'status_changed' | 'priority_changed' | 'tags_updated';
  oldValue: any;
  newValue: any;
  userId: string;
  userName: string;
  timestamp: Date;
}
```

**Store in subcollection:** `support_conversations/{id}/audit_log/{logId}`

---

## Phase 4: High Effort

### 29. File Attachments

**Purpose:** Allow image/file uploads in messages.

**Database changes:**
```typescript
interface Message {
  attachments?: {
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
    size: number;
    mimeType: string;
  }[];
}
```

**Storage:** `gs://bucket/support-attachments/{conversationId}/{messageId}/{filename}`

**Components:**
- `AttachmentUploader.tsx` - Drag & drop / file picker
- `AttachmentPreview.tsx` - Show thumbnails, file icons
- `AttachmentViewer.tsx` - Full-size image lightbox

**Security:**
- Validate file types (images, PDFs, documents only)
- Max file size: 10MB

---

### 30. Search Messages

**Purpose:** Find old conversations by keyword.

**Implementation (client-side for now):**
```typescript
<input
  type="search"
  placeholder="Search conversations..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

const filteredConversations = conversations.filter(c =>
  c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
  c.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
);
```

---

### 31. Canned Responses (Admin)

**Purpose:** Pre-written responses for common questions.

**Database structure:**
```typescript
interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  shortcuts: string[];  // ["/shipping", "/delay"]
  usageCount: number;
}
```

**Usage:**
```typescript
// Detect shortcut in input
if (value.startsWith('/')) {
  const shortcut = value.split(' ')[0];
  const response = cannedResponses.find(r => r.shortcuts.includes(shortcut));
  if (response) {
    setNewMessage(value.replace(shortcut, response.content));
  }
}
```

---

## Implementation Order

| Week | Tasks |
|------|-------|
| **Week 1** | 1-6: ConversationView refactor, Error boundary, Shared utils |
| **Week 2** | 7-11: Message retry, Draft persistence, Focus, Unread divider |
| **Week 3** | 12-15: Priority flags, Tags, Bulk updates, Rate limiting |
| **Week 4** | 16-21: Read receipts, Debounce, Indexes, Connection state |
| **Week 5** | 22-24: Accessibility (screen reader, keyboard nav, high contrast) |
| **Week 6+** | 25-31: Sound, Reactions, Lazy load, Attachments, Search, Canned responses |

---

## Files to Create

| File | Purpose |
|------|---------|
| `components/ConversationView/index.ts` | Re-exports |
| `components/ConversationView/ConversationView.tsx` | Main component (TSX only) |
| `components/ConversationView/useConversationView.ts` | Extracted hooks |
| `components/MessagingErrorBoundary.tsx` | Error boundary |
| `components/LoadingSpinner.tsx` | Shared spinner |
| `utils/timeFormatting.ts` | Time format utilities |
| `utils/sanitize.ts` | Content sanitization |
| `hooks/useNotificationSound.ts` | Audio notifications |
| `hooks/useConnectionState.ts` | Offline handling |

## Files to Modify

| File | Changes |
|------|---------|
| `config.ts` | Add MESSAGE_CONFIG, RATE_LIMITS, CONVERSATION_TAGS |
| `types.ts` | Add reactions, attachments, priority, tags |
| `useConversation.ts` | Add retry, read receipts, connection handling |
| `useTypingIndicator.ts` | Add debouncing |
| `MessagesPage.tsx` | Add search, bulk actions, import shared utils |
| `MessageBubble.tsx` | Add reactions, timestamps, read receipts |

---

## Success Metrics

- [ ] No files over 400 lines
- [ ] No hook files over 100 lines of logic
- [ ] All 31 improvements implemented
- [ ] No TypeScript errors
- [ ] All existing functionality preserved
