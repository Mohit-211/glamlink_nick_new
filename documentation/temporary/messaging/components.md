# UI Components - Support Messaging System

This document details each React component in the messaging system.

---

## Component Hierarchy

```
MessagesPage (list view)
├── ConversationItem (list item)
└── NewConversationModal (create new)

ConversationView (chat view)
├── Header
│   ├── Back button
│   ├── Subject + user info
│   └── Status selector/badge
├── Messages container
│   ├── MessageBubble (repeated)
│   └── Typing indicator
└── Input area
    ├── Textarea
    └── Send button
```

---

## MessagesPage

**Location:** `/lib/features/crm/profile/support-messaging/components/MessagesPage.tsx`

**Purpose:** Displays the list of all conversations.

### Props

```typescript
interface MessagesPageProps {
  isAdmin?: boolean;  // Changes behavior for admin view
}
```

### Key Features

1. **User vs Admin view:**
   - Users see "My Support Conversations" title
   - Users have "New Conversation" button
   - Admins see "Support Messages" title
   - Admins see user info for each conversation

2. **Real-time updates via `useConversations` hook**

3. **Empty state with call-to-action**

### Structure

```typescript
export function MessagesPage({ isAdmin = false }: MessagesPageProps) {
  const { conversations, isLoading, error } = useConversations();
  const [showNewModal, setShowNewModal] = useState(false);

  // Create conversation handler
  const handleCreateConversation = async (subject: string, message: string) => {
    await fetch('/api/support/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subject, initialMessage: message }),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with title and New Conversation button */}
      {/* Conversations list or empty state */}
      {/* NewConversationModal */}
    </div>
  );
}
```

---

## ConversationItem

**Location:** Inside `MessagesPage.tsx`

**Purpose:** Single conversation list item.

### Props

```typescript
interface ConversationItemProps {
  conversation: Conversation;
  isAdmin: boolean;
}
```

### Features

1. **Unread badge** - Shows count if unread > 0
2. **Status badge** - Color-coded (open=green, pending=yellow, resolved=gray)
3. **Last message preview** - Truncated
4. **Relative time** - "Just now", "5m ago", "2d ago", etc.
5. **User info** (admin only) - Shows userName and userEmail

### Rendering

```typescript
function ConversationItem({ conversation, isAdmin }: ConversationItemProps) {
  const basePath = isAdmin ? '/admin/messages' : '/profile/support';
  const unreadCount = isAdmin ? conversation.unreadByAdmin : conversation.unreadByUser;
  const statusConfig = STATUS_OPTIONS.find((s) => s.value === conversation.status);

  return (
    <Link href={`${basePath}/${conversation.id}`} className="block p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Subject + unread badge */}
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">
              {conversation.subject}
            </h3>
            {unreadCount > 0 && (
              <span className="bg-glamlink-purple text-white rounded-full px-2 text-xs">
                {unreadCount}
              </span>
            )}
          </div>

          {/* User info (admin only) */}
          {isAdmin && (
            <p className="text-sm text-gray-500">
              {conversation.userName} ({conversation.userEmail})
            </p>
          )}

          {/* Last message preview */}
          {conversation.lastMessage && (
            <p className="text-sm text-gray-600 truncate">
              {conversation.lastMessage.content}
            </p>
          )}
        </div>

        {/* Status badge + time */}
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-1 text-xs ${statusConfig?.color}`}>
            {statusConfig?.label}
          </span>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(conversation.updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

---

## ConversationView

**Location:** `/lib/features/crm/profile/support-messaging/components/ConversationView.tsx`

**Purpose:** Full chat interface for a single conversation.

### Props

```typescript
interface ConversationViewProps {
  conversationId: string;
  isAdmin?: boolean;
}
```

### Hooks Used

```typescript
const { user } = useAuth();
const { conversation, isLoading, error, sendMessage, markAsRead, updateStatus } =
  useConversation(conversationId);
const { typingUsers, setTyping } = useTypingIndicator(conversationId);
```

### Key Features

1. **Header with back navigation**
2. **Subject and user info display**
3. **Status dropdown (admin) or badge (user)**
4. **Scrollable messages container**
5. **Typing indicator**
6. **Auto-resize textarea input**
7. **Send button with loading state**

### Auto-Scroll Behavior

```typescript
// Scroll to bottom only when NEW messages arrive
const prevMessageCountRef = useRef<number>(0);

useEffect(() => {
  const currentMessageCount = conversation?.messages?.length || 0;
  const container = messagesContainerRef.current;

  if (currentMessageCount > prevMessageCountRef.current && container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }
  prevMessageCountRef.current = currentMessageCount;
}, [conversation?.messages?.length]);
```

### Typing Indicator Handling

```typescript
const handleTypingChange = useCallback((text: string) => {
  if (typingDebounceRef.current) {
    clearTimeout(typingDebounceRef.current);
  }

  if (text.trim()) {
    setTyping(true);
    // Stop typing after 2 seconds of no input
    typingDebounceRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  } else {
    setTyping(false);
  }
}, [setTyping]);

const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setNewMessage(e.target.value);
  handleTypingChange(e.target.value);

  // Auto-resize textarea without scrolling page
  const textarea = e.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
}, [handleTypingChange]);
```

### Send Message Flow

```typescript
const handleSend = async () => {
  if (!newMessage.trim() || isSending) return;

  // Clear typing status
  setTyping(false);
  if (typingDebounceRef.current) {
    clearTimeout(typingDebounceRef.current);
  }

  setIsSending(true);
  try {
    await sendMessage(newMessage.trim());
    setNewMessage('');
  } catch (err) {
    console.error('Error sending message:', err);
  } finally {
    setIsSending(false);
  }
};
```

### Layout

```typescript
return (
  <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm border">
    {/* Header - fixed */}
    <div className="px-6 py-4 border-b">
      <div className="flex items-center justify-between">
        {/* Back button + Subject + User info */}
        {/* Status selector/badge */}
      </div>
    </div>

    {/* Messages - scrollable */}
    <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
      {conversation.messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === currentUserId}
        />
      ))}
      {/* Typing indicator */}
      {typingIndicatorText && (
        <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>{typingIndicatorText}</span>
        </div>
      )}
    </div>

    {/* Input - fixed */}
    <div className="p-4 border-t">
      <div className="flex items-end gap-2">
        <textarea
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none border rounded-lg px-4 py-2"
        />
        <button onClick={handleSend} disabled={!newMessage.trim() || isSending}>
          {isSending ? <Spinner /> : <SendIcon />}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  </div>
);
```

---

## MessageBubble

**Location:** `/lib/features/crm/profile/support-messaging/components/MessageBubble.tsx`

**Purpose:** Renders a single message with appropriate styling.

### Props

```typescript
interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;  // Determines bubble alignment and color
}
```

### Rendering

```typescript
export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isCurrentUser
            ? 'bg-glamlink-purple text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Timestamp */}
        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-white/70' : 'text-gray-400'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
```

### Time Formatting

```typescript
function formatTime(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    // Output: "2:30 PM"
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  // Output: "Jan 15, 2:30 PM"
}
```

### Visual Design

**Current user messages (right side):**
- Purple background (`bg-glamlink-purple`)
- White text
- Right-aligned
- Bottom-right corner squared (`rounded-br-md`)

**Other user messages (left side):**
- Gray background (`bg-gray-100`)
- Dark text
- Left-aligned
- Bottom-left corner squared (`rounded-bl-md`)

---

## NewConversationModal

**Location:** `/lib/features/crm/profile/support-messaging/components/NewConversationModal.tsx`

**Purpose:** Modal for creating a new support conversation.

### Props

```typescript
interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: string, message: string) => Promise<void>;
}
```

### Fields

1. **Subject** - Text input for conversation topic
2. **Initial Message** - Textarea for first message

### Validation

- Both fields required
- Submit button disabled until both filled

---

## Styling Notes

### Consistent Colors

- **Primary Purple**: `bg-glamlink-purple`, `text-glamlink-purple`
- **Status Colors**:
  - Open: `bg-green-100 text-green-800`
  - Pending: `bg-yellow-100 text-yellow-800`
  - Resolved: `bg-gray-100 text-gray-800`

### Responsive Behavior

- Message bubbles: `max-w-[80%] md:max-w-[70%]`
- Conversation view adapts to viewport height

### Animation Classes

- Typing indicator dots: `animate-bounce` with staggered delays
- Typing text: `animate-pulse`
- Loading spinner: `animate-spin`
