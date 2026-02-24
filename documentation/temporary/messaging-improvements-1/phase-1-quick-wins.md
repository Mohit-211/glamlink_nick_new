# Phase 1: Quick Wins

**Parent:** `MASTER-PLAN.md`
**Improvements in this phase:** 6
**Estimated effort:** Small (< 2 hours each)
**Categories covered:** Accessibility (3), UX (2), Security (1)

---

## Summary

| # | Name | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 1 | Add skip link for message input | P1 | Small | [ ] |
| 2 | Rate limit feedback UI | P1 | Small | [ ] |
| 3 | CSRF token validation | P1 | Small | [ ] |
| 4 | Focus trap in modals | P1 | Small | [ ] |
| 5 | Message send retry with exponential backoff | P1 | Small | [ ] |
| 6 | Add role="status" for connection indicator | P1 | Small | [ ] |

---

## Improvement 1: Add Skip Link for Message Input

**Priority:** P1
**Effort:** Small
**Category:** Accessibility
**Impact:** High

### Problem

When navigating with a keyboard, users must tab through potentially hundreds of messages before reaching the input field. This creates a poor experience for screen reader users and keyboard-only users.

### Solution

Add a visually hidden skip link at the top of the ConversationView that jumps directly to the message input when focused.

### Implementation

#### Files to Modify

| File | Changes |
|------|---------|
| `components/ConversationView/ConversationView.tsx` | Add skip link element |
| `styles/accessibility.css` | Add skip link styles (if not present) |

#### Code Changes

**In `components/ConversationView/ConversationView.tsx`:**

Add after line 90 (inside the main container, before AriaAnnouncer):
```typescript
{/* Skip link for keyboard users */}
<a
  href="#message-input"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-glamlink-purple focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
>
  Skip to message input
</a>
```

**In `components/ConversationView/ConversationView.tsx`:**

Add `id="message-input"` to the textarea around line 249:
```typescript
<textarea
  id="message-input"
  ref={inputRef}
  value={newMessage}
  // ... rest of props
/>
```

### Dependencies

- None

### Verification

- [ ] Tab into the conversation view - skip link should appear
- [ ] Pressing Enter on skip link focuses the message input
- [ ] Skip link is visually hidden until focused
- [ ] Screen reader announces "Skip to message input" link
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove the skip link `<a>` element
2. Remove the `id="message-input"` attribute

---

## Improvement 2: Rate Limit Feedback UI

**Priority:** P1
**Effort:** Small
**Category:** User Experience
**Impact:** High

### Problem

When users hit the rate limit (10 messages/minute), they receive no visual feedback. The send button is disabled without explanation, leaving users confused about why they can't send.

### Solution

Show a warning message when approaching or exceeding the rate limit, including time remaining until they can send again.

### Implementation

#### Files to Modify

| File | Changes |
|------|---------|
| `components/ConversationView/useConversationView.ts` | Add rate limit hook |
| `components/ConversationView/ConversationView.tsx` | Display rate limit warning |

#### Code Changes

**In `components/ConversationView/useConversationView.ts`:**

Add import at top:
```typescript
import { useRateLimit } from '../../hooks/useRateLimit';
```

Add inside the `useConversationView` function (around line 63):
```typescript
// Rate limiting
const { isLimited, remainingActions, recordAction } = useRateLimit();
```

Update the `handleSend` function to record actions (around line 213):
```typescript
const handleSend = useCallback(async () => {
  if (!newMessage.trim() || isSending || isLimited) return;
  if (newMessage.length > MESSAGE_CONFIG.maxLength) return;

  recordAction(); // Add this line
  // ... rest of function
}, [newMessage, isSending, isLimited, recordAction, /* other deps */]);
```

Update the return statement to include rate limit info:
```typescript
return {
  // ... existing returns
  isLimited,
  remainingActions,
};
```

**In `components/ConversationView/ConversationView.tsx`:**

Add to destructuring (around line 26):
```typescript
const {
  // ... existing
  isLimited,
  remainingActions,
} = useConversationView({ conversationId, isAdmin });
```

Add warning UI before the input area (around line 236):
```typescript
{/* Rate limit warning */}
{isLimited && (
  <div className="mx-4 mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg" role="alert">
    <p className="text-sm text-yellow-800">
      <span className="font-medium">Slow down!</span> You've sent too many messages.
      Please wait a moment before sending more.
    </p>
  </div>
)}
{!isLimited && remainingActions <= 3 && remainingActions > 0 && (
  <div className="mx-4 mb-2 text-xs text-gray-500" role="status" aria-live="polite">
    {remainingActions} message{remainingActions !== 1 ? 's' : ''} remaining in this minute
  </div>
)}
```

Update the send button disabled condition:
```typescript
disabled={!newMessage.trim() || isSending || isOverLimit || isUploading || isLimited}
```

### Dependencies

- None (useRateLimit hook already exists)

### Verification

- [ ] Send 7+ messages rapidly - warning appears at 3 remaining
- [ ] Send 10 messages - rate limit warning shows
- [ ] Button is disabled when rate limited
- [ ] Warning disappears after ~60 seconds
- [ ] Screen reader announces rate limit status
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove rate limit imports and usage from useConversationView
2. Remove rate limit UI from ConversationView.tsx
3. Revert disabled condition on send button

---

## Improvement 3: CSRF Token Validation

**Priority:** P1
**Effort:** Small
**Category:** Security
**Impact:** High

### Problem

The messaging API endpoints don't validate CSRF tokens. While Firebase Auth session cookies provide some protection, explicit CSRF tokens add defense-in-depth against cross-site request forgery attacks.

### Solution

Generate a CSRF token on page load and include it in all POST/PATCH/DELETE requests. Validate the token server-side.

### Implementation

#### Files to Create

| File | Purpose |
|------|---------|
| `utils/csrf.ts` | CSRF token generation and validation |

#### Files to Modify

| File | Changes |
|------|---------|
| `hooks/useConversation/useConversationMessages.ts` | Include CSRF token in requests |
| `hooks/useConversation/useConversationActions.ts` | Include CSRF token in requests |

#### Code Changes

**Create `utils/csrf.ts`:**
```typescript
/**
 * CSRF Token utilities for Support Messaging
 */

const CSRF_TOKEN_KEY = 'support-messaging-csrf';

/**
 * Generate a cryptographically random token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create CSRF token for the current session
 */
export function getCsrfToken(): string {
  if (typeof window === 'undefined') return '';

  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (!token) {
    token = generateToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  return token;
}

/**
 * Clear CSRF token (on logout)
 */
export function clearCsrfToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
}

/**
 * Get CSRF headers for fetch requests
 */
export function getCsrfHeaders(): Record<string, string> {
  return {
    'X-CSRF-Token': getCsrfToken(),
  };
}
```

**In API routes (example pattern for existing routes):**

Add to API route handlers that modify data:
```typescript
// Validate CSRF token
const csrfToken = request.headers.get('X-CSRF-Token');
const sessionCsrf = // get from session or cookie
if (!csrfToken || csrfToken !== sessionCsrf) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
}
```

**In `hooks/useConversation/useConversationMessages.ts`:**

Add import:
```typescript
import { getCsrfHeaders } from '../../utils/csrf';
```

Update fetch calls to include headers:
```typescript
const response = await fetch(`/api/support/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...getCsrfHeaders(),
  },
  body: JSON.stringify({ content }),
});
```

### Dependencies

- None

### Verification

- [ ] CSRF token is generated on first load
- [ ] Token persists across page navigation (sessionStorage)
- [ ] Token is included in POST headers
- [ ] Requests without token are rejected (when server validation added)
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove getCsrfHeaders() from fetch calls
2. Remove utils/csrf.ts
3. Remove server-side validation

---

## Improvement 4: Focus Trap in Modals

**Priority:** P1
**Effort:** Small
**Category:** Accessibility
**Impact:** High

### Problem

The `NewConversationModal` doesn't trap focus. Keyboard users can tab outside the modal while it's open, causing confusion and accessibility violations.

### Solution

Implement focus trapping so Tab cycles through only the modal's focusable elements. Return focus to the trigger element when the modal closes.

### Implementation

#### Files to Create

| File | Purpose |
|------|---------|
| `hooks/useFocusTrap.ts` | Reusable focus trap hook |

#### Files to Modify

| File | Changes |
|------|---------|
| `components/NewConversationModal.tsx` | Apply focus trap |

#### Code Changes

**Create `hooks/useFocusTrap.ts`:**
```typescript
'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
}

export function useFocusTrap({ isActive, onEscape }: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element when trap activates
  useEffect(() => {
    if (isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isActive]);

  // Return focus when trap deactivates
  useEffect(() => {
    if (!isActive && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isActive]);

  // Focus first focusable element when trap activates
  useEffect(() => {
    if (isActive && containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isActive]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: go to last if on first
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: go to first if on last
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [isActive, onEscape]);

  return { containerRef, handleKeyDown };
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}
```

**In `components/NewConversationModal.tsx`:**

Add import:
```typescript
import { useFocusTrap } from '../hooks/useFocusTrap';
```

Add hook usage inside the component:
```typescript
const { containerRef, handleKeyDown } = useFocusTrap({
  isActive: isOpen,
  onEscape: onClose,
});
```

Apply to the modal container div:
```typescript
<div
  ref={containerRef}
  onKeyDown={handleKeyDown}
  className="relative bg-white rounded-lg..."
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
```

Add id to the title:
```typescript
<h2 id="modal-title" className="text-xl font-semibold">
```

### Dependencies

- None

### Verification

- [ ] Tab cycles through modal elements only
- [ ] Shift+Tab cycles backward
- [ ] Escape key closes modal
- [ ] Focus returns to trigger button on close
- [ ] First focusable element is focused on open
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove useFocusTrap import and usage from modal
2. Delete hooks/useFocusTrap.ts

---

## Improvement 5: Message Send Retry with Exponential Backoff

**Priority:** P1
**Effort:** Small
**Category:** User Experience
**Impact:** Medium

### Problem

When message sending fails (network error, server error), the retry mechanism attempts immediately without backoff. This can overwhelm the server and waste battery on mobile devices.

### Solution

Implement exponential backoff (1s, 2s, 4s, 8s, max 30s) for automatic retries, with a manual retry button for immediate retry.

### Implementation

#### Files to Modify

| File | Changes |
|------|---------|
| `hooks/useConversation/useConversationMessages.ts` | Add exponential backoff |

#### Code Changes

**In `hooks/useConversation/useConversationMessages.ts`:**

Add helper function at the top of the file:
```typescript
/**
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getBackoffDelay = (attempt: number, baseDelay = 1000, maxDelay = 30000): number => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  return delay + jitter;
};
```

Update the `sendMessage` function to include retry logic:
```typescript
const sendMessage = useCallback(async (content: string, maxRetries = 3) => {
  const sanitized = sanitizeMessageContent(content);
  if (!sanitized || !conversationId) return;

  // Create optimistic message
  const tempId = `temp_${Date.now()}`;
  const tempMessage: Message = {
    id: tempId,
    senderId: user?.uid || '',
    senderEmail: user?.email || '',
    senderName: user?.displayName || 'User',
    content: sanitized,
    timestamp: new Date(),
    status: 'sending',
  };

  dispatch(addMessage(toSerializableMessage(tempMessage)));

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        `/api/support/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: sanitized }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Success - the real message will come through realtime listener
      return;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = getBackoffDelay(attempt);
        console.log(`Message send failed, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
      }
    }
  }

  // All retries failed - mark message as failed
  console.error('Message send failed after retries:', lastError);
  dispatch(setMessages(
    messages.map(m =>
      m.id === tempId
        ? { ...m, status: 'failed' as const }
        : m
    )
  ));
}, [conversationId, user, dispatch, messages]);
```

### Dependencies

- None

### Verification

- [ ] Message retries automatically on network failure
- [ ] Retry delays increase exponentially (check console logs)
- [ ] Manual retry button still works immediately
- [ ] Message shows "failed" status after max retries
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove sleep and getBackoffDelay functions
2. Revert sendMessage to simple single-attempt logic

---

## Improvement 6: Add role="status" for Connection Indicator

**Priority:** P1
**Effort:** Small
**Category:** Accessibility
**Impact:** Medium

### Problem

The ConnectionIndicator shows online/offline status but doesn't announce changes to screen reader users. They won't know when they go offline or come back online.

### Solution

Add `role="status"` and `aria-live="polite"` to the connection indicator so changes are announced automatically.

### Implementation

#### Files to Modify

| File | Changes |
|------|---------|
| `components/ConnectionIndicator.tsx` | Add ARIA attributes |

#### Code Changes

**In `components/ConnectionIndicator.tsx`:**

Update the main container element to include ARIA attributes:
```typescript
<div
  role="status"
  aria-live="polite"
  aria-label={isOnline
    ? 'Connected'
    : `Offline. ${pendingCount} message${pendingCount !== 1 ? 's' : ''} queued.`
  }
  className={`...existing classes...`}
>
```

If the component conditionally renders (returns null when online), wrap with a container that always renders:
```typescript
return (
  <div role="status" aria-live="polite">
    {!isOnline && (
      <div className="..." aria-label={`Offline. ${pendingCount} queued messages.`}>
        {/* Visual content */}
      </div>
    )}
  </div>
);
```

### Dependencies

- None

### Verification

- [ ] Screen reader announces "Offline" when connection lost
- [ ] Screen reader announces "Connected" when connection restored
- [ ] Pending message count is announced
- [ ] Announcements don't interrupt other content (polite)
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove role, aria-live, and aria-label attributes

---

## Phase Completion Checklist

- [ ] All 6 improvements implemented
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Manual testing passed for each improvement:
  - [ ] Skip link works with keyboard
  - [ ] Rate limit shows warning
  - [ ] CSRF token included in requests
  - [ ] Modal traps focus
  - [ ] Retry uses backoff
  - [ ] Connection status announced
- [ ] Update MASTER-PLAN.md progress: Phase 1: 6/6 complete
