# Phase 2: Core Improvements

**Parent:** `MASTER-PLAN.md`
**Improvements in this phase:** 6
**Estimated effort:** Small to Medium
**Categories covered:** Accessibility (1), Performance (2), Security (2), DX (1)

---

## Summary

| # | Name | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 7 | Reduced motion support | P2 | Small | [ ] |
| 8 | Virtualized message list | P2 | Medium | [ ] |
| 9 | Server-side rate limiting | P2 | Medium | [ ] |
| 10 | Memoize message rendering | P2 | Small | [ ] |
| 11 | Add debug logging toggle | P2 | Small | [ ] |
| 12 | URL/link sanitization | P2 | Medium | [ ] |

---

## Improvement 7: Reduced Motion Support

**Priority:** P2
**Effort:** Small
**Category:** Accessibility
**Impact:** Medium

### Problem

The messaging system includes animations for typing indicators, message transitions, and loading spinners. Users with vestibular disorders or motion sensitivity may experience discomfort from these animations.

### Solution

Respect the `prefers-reduced-motion` media query to disable or reduce animations for users who have this preference enabled in their system settings.

### Implementation

#### Files to Modify

| File | Changes |
|------|---------|
| `styles/accessibility.css` | Add reduced motion styles |
| `components/ConversationView/ConversationView.tsx` | Apply motion-safe classes |
| `components/LoadingSpinner.tsx` | Add motion preference check |

#### Code Changes

**In `styles/accessibility.css`:**

Add at the end of the file:
```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .support-messaging-container * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .typing-dot {
    animation: none !important;
  }

  /* Replace bouncing dots with static ellipsis */
  .typing-indicator .typing-dot:nth-child(2),
  .typing-indicator .typing-dot:nth-child(3) {
    display: none;
  }

  .typing-indicator::after {
    content: '...';
    display: inline;
  }
}

/* Motion-safe utilities */
.motion-safe\:animate-bounce {
  animation: bounce 1s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .motion-safe\:animate-bounce {
    animation: none;
  }
}

.motion-safe\:animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .motion-safe\:animate-pulse {
    animation: none;
  }
}

.motion-safe\:animate-spin {
  animation: spin 1s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .motion-safe\:animate-spin {
    animation: none;
  }
}
```

**In `components/ConversationView/ConversationView.tsx`:**

Update typing indicator classes (around line 221):
```typescript
<div
  className="typing-indicator flex items-center gap-2 text-sm text-gray-500"
  role="status"
  aria-live="polite"
  aria-label={typingIndicatorText}
>
  <div className="flex gap-1" aria-hidden="true">
    <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full motion-safe:animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full motion-safe:animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full motion-safe:animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
  <span>{typingIndicatorText}</span>
</div>
```

**In `components/LoadingSpinner.tsx`:**

Add a hook to detect motion preference:
```typescript
import { useEffect, useState } from 'react';

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
```

Use it in the spinner component to show static indicator:
```typescript
export function LoadingSpinner({ message }: { message?: string }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-glamlink-purple text-2xl">⏳</div>
        {message && <p className="mt-2 text-sm text-gray-500">{message}</p>}
      </div>
    );
  }

  // Return existing animated spinner
  return (/* existing implementation */);
}
```

### Dependencies

- None

### Verification

- [ ] Enable "Reduce motion" in system preferences
- [ ] Typing dots don't animate
- [ ] Loading spinner shows static indicator
- [ ] Smooth scroll becomes instant scroll
- [ ] No jarring animations remain
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove CSS rules from accessibility.css
2. Revert component class changes
3. Remove usePrefersReducedMotion hook

---

## Improvement 8: Virtualized Message List

**Priority:** P2
**Effort:** Medium
**Category:** Performance
**Impact:** High

### Problem

Conversations with hundreds of messages render all message bubbles in the DOM, causing slow initial render and high memory usage. This affects scroll performance on mobile devices.

### Solution

Implement windowed/virtualized rendering using `@tanstack/react-virtual` to only render messages visible in the viewport plus a small buffer.

### Implementation

#### Files to Create

| File | Purpose |
|------|---------|
| `components/VirtualizedMessageList.tsx` | Virtualized message container |

#### Files to Modify

| File | Changes |
|------|---------|
| `components/ConversationView/ConversationView.tsx` | Use virtualized list |

#### Code Changes

**Install dependency:**
```bash
npm install @tanstack/react-virtual
```

**Create `components/VirtualizedMessageList.tsx`:**
```typescript
'use client';

import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../types';

interface VirtualizedMessageListProps {
  messages: Message[];
  currentUserId?: string;
  lastReadAt?: Date;
  onRetry: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  focusedIndex: number | null;
  messageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  typingIndicator?: React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function VirtualizedMessageList({
  messages,
  currentUserId,
  lastReadAt,
  onRetry,
  onAddReaction,
  onRemoveReaction,
  focusedIndex,
  messageRefs,
  onKeyDown,
  typingIndicator,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5, // Render 5 items above/below viewport
  });

  const items = virtualizer.getVirtualItems();

  // Check for unread divider position
  const getUnreadDividerIndex = useCallback(() => {
    if (!lastReadAt) return -1;
    return messages.findIndex((msg, i) => {
      const prevMsg = messages[i - 1];
      return msg.timestamp > lastReadAt && (!prevMsg || prevMsg.timestamp <= lastReadAt);
    });
  }, [messages, lastReadAt]);

  const unreadDividerIndex = getUnreadDividerIndex();

  // Scroll to bottom on new message
  React.useEffect(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end', behavior: 'smooth' });
    }
  }, [messages.length, virtualizer]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!parentRef.current || !hasMore || isLoadingMore) return;

    const { scrollTop } = parentRef.current;
    if (scrollTop < 100) {
      onLoadMore?.();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div
      ref={parentRef}
      className="flex-1 min-h-0 overflow-y-auto p-4"
      role="log"
      aria-label="Message history"
      aria-live="polite"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualRow) => {
          const message = messages[virtualRow.index];
          const showUnreadDivider = virtualRow.index === unreadDividerIndex;

          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {showUnreadDivider && (
                <div className="flex items-center gap-4 my-4" aria-hidden="true">
                  <div className="flex-1 h-px bg-glamlink-purple/30" />
                  <span className="text-xs text-glamlink-purple font-medium">New messages</span>
                  <div className="flex-1 h-px bg-glamlink-purple/30" />
                </div>
              )}
              <MessageBubble
                ref={(el) => {
                  if (messageRefs.current) {
                    messageRefs.current[virtualRow.index] = el;
                  }
                }}
                message={message}
                isCurrentUser={message.senderId === currentUserId}
                currentUserId={currentUserId}
                onRetry={onRetry}
                onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
                onRemoveReaction={(emoji) => onRemoveReaction(message.id, emoji)}
                isFocused={focusedIndex === virtualRow.index}
              />
            </div>
          );
        })}
      </div>
      {typingIndicator}
    </div>
  );
}
```

**In `components/ConversationView/ConversationView.tsx`:**

Replace the message mapping section with the virtualized component:
```typescript
import { VirtualizedMessageList } from '../VirtualizedMessageList';

// In the render, replace the messages div with:
<VirtualizedMessageList
  messages={conversation.messages}
  currentUserId={currentUserId}
  lastReadAt={conversation.lastReadAt}
  onRetry={retryMessage}
  onAddReaction={handleAddReaction}
  onRemoveReaction={handleRemoveReaction}
  focusedIndex={focusedIndex}
  messageRefs={messageRefs}
  onKeyDown={handleKeyboardNav}
  typingIndicator={typingIndicatorText ? (/* typing indicator JSX */) : null}
  onLoadMore={loadMoreMessages}
  hasMore={hasMoreMessages}
  isLoadingMore={isLoadingMoreMessages}
/>
```

### Dependencies

- `@tanstack/react-virtual` - Add to package.json

### Verification

- [ ] Install package: `npm install @tanstack/react-virtual`
- [ ] Conversation with 100+ messages renders smoothly
- [ ] Scroll performance is smooth (60fps)
- [ ] Memory usage stays constant as messages increase
- [ ] Keyboard navigation still works
- [ ] Load more triggers when scrolling to top
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove VirtualizedMessageList component
2. Revert ConversationView to use direct message mapping
3. Remove @tanstack/react-virtual package

---

## Improvement 9: Server-Side Rate Limiting

**Priority:** P2
**Effort:** Medium
**Category:** Security
**Impact:** High

### Problem

Rate limiting is only client-side, which can be bypassed. Malicious users could spam the support system by directly calling the API.

### Solution

Implement server-side rate limiting using a sliding window algorithm with Redis (or in-memory fallback) to enforce limits regardless of client behavior.

### Implementation

#### Files to Create

| File | Purpose |
|------|---------|
| `utils/serverRateLimit.ts` | Server-side rate limit logic |

#### Files to Modify

| File | Changes |
|------|---------|
| API routes | Apply rate limit middleware |

#### Code Changes

**Create `utils/serverRateLimit.ts`:**
```typescript
/**
 * Server-side rate limiting for Support Messaging API
 * Uses in-memory store (replace with Redis for production scale)
 */

interface RateLimitEntry {
  timestamps: number[];
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_CONFIG = {
  messagesPerMinute: 10,
  messagesPerHour: 100,
  windowMs: 60 * 1000, // 1 minute
  hourWindowMs: 60 * 60 * 1000, // 1 hour
};

/**
 * Check if a user is rate limited
 * @param userId - The user's unique identifier
 * @returns Object with limited status and retry-after time
 */
export function checkRateLimit(userId: string): {
  limited: boolean;
  retryAfter?: number;
  remaining: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(userId) || { timestamps: [] };

  // Clean old timestamps
  const minuteAgo = now - RATE_LIMIT_CONFIG.windowMs;
  const hourAgo = now - RATE_LIMIT_CONFIG.hourWindowMs;

  const recentMinute = entry.timestamps.filter(ts => ts > minuteAgo);
  const recentHour = entry.timestamps.filter(ts => ts > hourAgo);

  // Check minute limit
  if (recentMinute.length >= RATE_LIMIT_CONFIG.messagesPerMinute) {
    const oldestInWindow = Math.min(...recentMinute);
    const retryAfter = Math.ceil((oldestInWindow + RATE_LIMIT_CONFIG.windowMs - now) / 1000);
    return {
      limited: true,
      retryAfter,
      remaining: 0,
    };
  }

  // Check hour limit
  if (recentHour.length >= RATE_LIMIT_CONFIG.messagesPerHour) {
    const oldestInWindow = Math.min(...recentHour);
    const retryAfter = Math.ceil((oldestInWindow + RATE_LIMIT_CONFIG.hourWindowMs - now) / 1000);
    return {
      limited: true,
      retryAfter,
      remaining: 0,
    };
  }

  return {
    limited: false,
    remaining: RATE_LIMIT_CONFIG.messagesPerMinute - recentMinute.length,
  };
}

/**
 * Record a rate limit action
 * @param userId - The user's unique identifier
 */
export function recordRateLimitAction(userId: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(userId) || { timestamps: [] };

  // Add new timestamp
  entry.timestamps.push(now);

  // Clean timestamps older than 1 hour
  const hourAgo = now - RATE_LIMIT_CONFIG.hourWindowMs;
  entry.timestamps = entry.timestamps.filter(ts => ts > hourAgo);

  rateLimitStore.set(userId, entry);
}

/**
 * Reset rate limit for a user (for testing)
 */
export function resetRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(userId: string): Record<string, string> {
  const { remaining, retryAfter } = checkRateLimit(userId);
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.messagesPerMinute),
    'X-RateLimit-Remaining': String(remaining),
  };

  if (retryAfter) {
    headers['Retry-After'] = String(retryAfter);
  }

  return headers;
}
```

**In API routes (e.g., POST messages):**

Add rate limit check at the start of the handler:
```typescript
import { checkRateLimit, recordRateLimitAction, getRateLimitHeaders } from '@/lib/features/crm/profile/support-messaging/utils/serverRateLimit';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check rate limit
  const rateLimitResult = checkRateLimit(currentUser.uid);
  const rateLimitHeaders = getRateLimitHeaders(currentUser.uid);

  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
      {
        status: 429,
        headers: rateLimitHeaders,
      }
    );
  }

  // Process the request...

  // Record successful action
  recordRateLimitAction(currentUser.uid);

  return NextResponse.json(
    { success: true, ... },
    { headers: rateLimitHeaders }
  );
}
```

### Dependencies

- None (in-memory implementation)
- For production: consider Redis (`ioredis` package)

### Verification

- [ ] Send 10 messages rapidly - 11th returns 429
- [ ] Response includes `Retry-After` header
- [ ] Response includes `X-RateLimit-Remaining` header
- [ ] Rate limit resets after 60 seconds
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove rate limit checks from API routes
2. Delete utils/serverRateLimit.ts

---

## Improvement 10: Memoize Message Rendering

**Priority:** P2
**Effort:** Small
**Category:** Performance
**Impact:** Medium

### Problem

Every time the message list re-renders (typing indicator change, new message), all MessageBubble components re-render even if their props haven't changed.

### Solution

Wrap MessageBubble in `React.memo` with a custom comparison function to prevent unnecessary re-renders.

### Implementation

#### Files to Modify

| File | Changes |
|------|---------|
| `components/MessageBubble.tsx` | Add React.memo |

#### Code Changes

**In `components/MessageBubble.tsx`:**

Wrap the component with React.memo:
```typescript
import React, { forwardRef, memo } from 'react';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  currentUserId?: string;
  onRetry?: (messageId: string) => void;
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  isFocused?: boolean;
}

const MessageBubbleComponent = forwardRef<HTMLDivElement, MessageBubbleProps>(
  function MessageBubble(props, ref) {
    // ... existing implementation
  }
);

// Custom comparison function
function arePropsEqual(
  prevProps: MessageBubbleProps,
  nextProps: MessageBubbleProps
): boolean {
  // Compare essential props
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (prevProps.message.content !== nextProps.message.content) return false;
  if (prevProps.message.status !== nextProps.message.status) return false;
  if (prevProps.isCurrentUser !== nextProps.isCurrentUser) return false;
  if (prevProps.isFocused !== nextProps.isFocused) return false;

  // Compare reactions array
  const prevReactions = prevProps.message.reactions || [];
  const nextReactions = nextProps.message.reactions || [];
  if (prevReactions.length !== nextReactions.length) return false;

  // Deep compare reactions
  for (let i = 0; i < prevReactions.length; i++) {
    if (prevReactions[i].emoji !== nextReactions[i].emoji) return false;
    if (prevReactions[i].userId !== nextReactions[i].userId) return false;
  }

  // Compare attachments array length
  const prevAttachments = prevProps.message.attachments || [];
  const nextAttachments = nextProps.message.attachments || [];
  if (prevAttachments.length !== nextAttachments.length) return false;

  return true;
}

export const MessageBubble = memo(MessageBubbleComponent, arePropsEqual);
```

Also memoize the callback props in the parent component:
```typescript
// In ConversationView or parent component
const handleRetry = useCallback((messageId: string) => {
  retryMessage(messageId);
}, [retryMessage]);

const handleAddReaction = useCallback((messageId: string, emoji: string) => {
  addReaction(messageId, emoji);
}, [addReaction]);

const handleRemoveReaction = useCallback((messageId: string, emoji: string) => {
  removeReaction(messageId, emoji);
}, [removeReaction]);
```

### Dependencies

- None

### Verification

- [ ] Add console.log to MessageBubble render function
- [ ] Type in input - existing messages shouldn't log
- [ ] Receive new message - only new message logs
- [ ] Add reaction - only that message logs
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove memo wrapper
2. Remove arePropsEqual function
3. Export component directly

---

## Improvement 11: Add Debug Logging Toggle

**Priority:** P2
**Effort:** Small
**Category:** Developer Experience
**Impact:** Medium

### Problem

Debug logging is scattered across the codebase with inconsistent formats. Production builds may include excessive console.log statements, making debugging harder and potentially leaking information.

### Solution

Create a centralized debug logger that can be toggled on/off via config or localStorage, with structured output and log levels.

### Implementation

#### Files to Create

| File | Purpose |
|------|---------|
| `utils/debugLogger.ts` | Centralized debug logging |

#### Files to Modify

| File | Changes |
|------|---------|
| Various hooks and components | Replace console.log with logger |

#### Code Changes

**Create `utils/debugLogger.ts`:**
```typescript
/**
 * Debug logger for Support Messaging
 * Toggle via localStorage: localStorage.setItem('support-messaging-debug', 'true')
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  timestamp: Date;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class DebugLogger {
  private enabled: boolean = false;
  private minLevel: LogLevel = 'debug';
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('support-messaging-debug') === 'true';
      const level = localStorage.getItem('support-messaging-debug-level') as LogLevel;
      if (level && LOG_LEVELS[level] !== undefined) {
        this.minLevel = level;
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabled && LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private log(level: LogLevel, module: string, message: string, data?: unknown) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      module,
      message,
      data,
      timestamp: new Date(),
    };

    // Store for debugging
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with styling
    const styles = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red; font-weight: bold',
    };

    const prefix = `[SM:${module}]`;
    const style = styles[level];

    if (data !== undefined) {
      console.log(`%c${prefix} ${message}`, style, data);
    } else {
      console.log(`%c${prefix} ${message}`, style);
    }
  }

  debug(module: string, message: string, data?: unknown) {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: unknown) {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: unknown) {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: unknown) {
    this.log('error', module, message, data);
  }

  // Get recent logs for debugging
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Enable/disable at runtime
  enable() {
    this.enabled = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('support-messaging-debug', 'true');
    }
  }

  disable() {
    this.enabled = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('support-messaging-debug');
    }
  }

  setLevel(level: LogLevel) {
    this.minLevel = level;
    if (typeof window !== 'undefined') {
      localStorage.setItem('support-messaging-debug-level', level);
    }
  }
}

export const logger = new DebugLogger();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).__supportMessagingLogger = logger;
}
```

**Usage in hooks (example):**
```typescript
import { logger } from '../../utils/debugLogger';

// In useConversationRealtime
logger.debug('Realtime', 'Setting up conversation listener', { conversationId });
logger.info('Realtime', 'Received conversation update', { messageCount: messages.length });
logger.error('Realtime', 'Failed to load messages', error);

// In useConversationMessages
logger.debug('Messages', 'Sending message', { contentLength: content.length });
logger.info('Messages', 'Message sent successfully', { messageId });
logger.warn('Messages', 'Retry attempt', { attempt, messageId });
```

### Dependencies

- None

### Verification

- [ ] Set localStorage: `localStorage.setItem('support-messaging-debug', 'true')`
- [ ] Logs appear in console with styled prefix
- [ ] Remove localStorage item - logs stop
- [ ] `window.__supportMessagingLogger.getLogs()` returns recent logs
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Delete utils/debugLogger.ts
2. Revert to console.log statements

---

## Improvement 12: URL/Link Sanitization

**Priority:** P2
**Effort:** Medium
**Category:** Security
**Impact:** High

### Problem

While message content is sanitized, URLs in messages could potentially be used for phishing attacks. The system doesn't validate or warn about suspicious links.

### Solution

Add URL validation and visual indicators for external/suspicious links. Optionally show a confirmation before following external links.

### Implementation

#### Files to Create

| File | Purpose |
|------|---------|
| `utils/urlSanitizer.ts` | URL validation and sanitization |
| `components/SafeLink.tsx` | Secure link component |

#### Files to Modify

| File | Changes |
|------|---------|
| `components/MessageBubble.tsx` | Use SafeLink for URLs |

#### Code Changes

**Create `utils/urlSanitizer.ts`:**
```typescript
/**
 * URL sanitization and validation utilities
 */

// List of suspicious TLDs often used in phishing
const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work'];

// Trusted domains (add your own)
const TRUSTED_DOMAINS = [
  'glamlink.net',
  'glamlink.com',
  'google.com',
  'github.com',
  // Add more as needed
];

export interface UrlAnalysis {
  isValid: boolean;
  isSuspicious: boolean;
  isExternal: boolean;
  displayUrl: string;
  originalUrl: string;
  warnings: string[];
}

/**
 * Analyze a URL for safety
 */
export function analyzeUrl(url: string): UrlAnalysis {
  const warnings: string[] = [];
  let isValid = true;
  let isSuspicious = false;
  let isExternal = true;

  try {
    const parsed = new URL(url);

    // Check protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      isValid = false;
      warnings.push('Invalid protocol');
    }

    // Check for suspicious TLD
    const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld =>
      parsed.hostname.endsWith(tld)
    );
    if (hasSuspiciousTld) {
      isSuspicious = true;
      warnings.push('Suspicious domain extension');
    }

    // Check for IP address instead of domain
    const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname);
    if (isIpAddress) {
      isSuspicious = true;
      warnings.push('IP address instead of domain name');
    }

    // Check for homograph attacks (mixed scripts)
    const hasNonAscii = /[^\x00-\x7F]/.test(parsed.hostname);
    if (hasNonAscii) {
      isSuspicious = true;
      warnings.push('Contains non-ASCII characters');
    }

    // Check if trusted domain
    const isTrusted = TRUSTED_DOMAINS.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
    if (isTrusted) {
      isExternal = false;
      isSuspicious = false;
    }

    // Check for URL with embedded credentials
    if (parsed.username || parsed.password) {
      isSuspicious = true;
      warnings.push('Contains embedded credentials');
    }

    return {
      isValid,
      isSuspicious,
      isExternal,
      displayUrl: truncateUrl(url, 50),
      originalUrl: url,
      warnings,
    };
  } catch {
    return {
      isValid: false,
      isSuspicious: true,
      isExternal: true,
      displayUrl: url,
      originalUrl: url,
      warnings: ['Invalid URL format'],
    };
  }
}

/**
 * Extract URLs from text
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  return text.match(urlRegex) || [];
}

/**
 * Truncate URL for display
 */
function truncateUrl(url: string, maxLength: number): string {
  if (url.length <= maxLength) return url;
  const start = url.substring(0, maxLength / 2);
  const end = url.substring(url.length - maxLength / 2 + 3);
  return `${start}...${end}`;
}
```

**Create `components/SafeLink.tsx`:**
```typescript
'use client';

import { useState } from 'react';
import { analyzeUrl, UrlAnalysis } from '../utils/urlSanitizer';

interface SafeLinkProps {
  url: string;
  children?: React.ReactNode;
}

export function SafeLink({ url, children }: SafeLinkProps) {
  const [showWarning, setShowWarning] = useState(false);
  const analysis = analyzeUrl(url);

  const handleClick = (e: React.MouseEvent) => {
    if (analysis.isSuspicious) {
      e.preventDefault();
      setShowWarning(true);
    }
  };

  const handleProceed = () => {
    window.open(analysis.originalUrl, '_blank', 'noopener,noreferrer');
    setShowWarning(false);
  };

  if (!analysis.isValid) {
    return <span className="text-gray-400">{children || analysis.displayUrl}</span>;
  }

  return (
    <>
      <a
        href={analysis.originalUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline ${
          analysis.isSuspicious
            ? 'text-yellow-600 hover:text-yellow-800'
            : analysis.isExternal
            ? 'text-blue-600 hover:text-blue-800'
            : 'text-glamlink-purple hover:text-glamlink-purple-dark'
        }`}
        title={analysis.isSuspicious ? '⚠️ This link may be suspicious' : undefined}
      >
        {children || analysis.displayUrl}
        {analysis.isExternal && (
          <svg
            className="inline-block w-3 h-3 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
        {analysis.isSuspicious && (
          <span className="ml-1 text-yellow-600" aria-label="Warning: suspicious link">
            ⚠️
          </span>
        )}
      </a>

      {/* Warning modal for suspicious links */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⚠️ Suspicious Link Warning
            </h3>
            <p className="text-gray-600 mb-4">
              This link may be unsafe. Proceed with caution.
            </p>
            <div className="bg-yellow-50 p-3 rounded-lg mb-4">
              <p className="text-sm font-mono break-all text-gray-700">
                {analysis.originalUrl}
              </p>
              {analysis.warnings.length > 0 && (
                <ul className="mt-2 text-sm text-yellow-800">
                  {analysis.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                className="px-4 py-2 bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

**In `components/MessageBubble.tsx`:**

Add URL parsing and SafeLink usage:
```typescript
import { SafeLink } from './SafeLink';
import { extractUrls } from '../utils/urlSanitizer';

// In the message content rendering:
function renderMessageContent(content: string) {
  const urls = extractUrls(content);
  if (urls.length === 0) {
    return content;
  }

  // Split content and replace URLs with SafeLink
  let result: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  for (const url of urls) {
    const index = remaining.indexOf(url);
    if (index > 0) {
      result.push(remaining.substring(0, index));
    }
    result.push(<SafeLink key={key++} url={url} />);
    remaining = remaining.substring(index + url.length);
  }

  if (remaining) {
    result.push(remaining);
  }

  return result;
}
```

### Dependencies

- None

### Verification

- [ ] Links are clickable and open in new tab
- [ ] External links show external icon
- [ ] Suspicious links show warning icon
- [ ] Clicking suspicious link shows warning modal
- [ ] Trusted domain links don't show warnings
- [ ] Invalid URLs are not clickable
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove SafeLink component
2. Remove urlSanitizer.ts
3. Revert MessageBubble to plain text

---

## Phase Completion Checklist

- [ ] All 6 improvements implemented
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Manual testing passed for each improvement:
  - [ ] Reduced motion respected
  - [ ] Message list virtualizes properly
  - [ ] Server rate limit returns 429
  - [ ] MessageBubble memoization works
  - [ ] Debug logger toggles correctly
  - [ ] Suspicious URLs show warnings
- [ ] Update MASTER-PLAN.md progress: Phase 2: 6/6 complete
