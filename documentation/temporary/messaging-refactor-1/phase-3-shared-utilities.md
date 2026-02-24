# Phase 3: Shared Utilities Extraction

**Parent:** `MASTER-PLAN.md`
**Files in this phase:** Analysis + potential extractions
**Estimated effort:** Small (30-60 minutes)

---

## Analysis Summary

After analyzing the codebase, the support-messaging feature already has good utility organization:

### Already Centralized Utilities

| Utility | Location | Used In |
|---------|----------|---------|
| `formatRelativeTime` | `utils/timeFormatting.ts` | MessagesPage, AuditLogPanel |
| `formatMessageTime` | `utils/timeFormatting.ts` | MessageBubble |
| `formatFullDateTime` | `utils/timeFormatting.ts` | MessageBubble, AuditLogPanel |
| `isAdminEmail` | `config.ts` | useConversation, useConversations, useConversationView |
| `sanitizeMessageContent` | `utils/sanitize.ts` | useConversation |
| `createAuditLog` | `utils/auditLog.ts` | useConversation |
| `sendMessageBatch` | `utils/messageBatch.ts` | useConversation |

### Current Utils Directory Structure

```
utils/
├── auditLog.ts       # 160 lines - Audit log CRUD operations
├── messageBatch.ts   # ~80 lines - Batch message sending
├── rateLimit.ts      # 111 lines - Rate limiting utilities
├── sanitize.ts       # ~30 lines - Content sanitization
└── timeFormatting.ts # ~50 lines - Date/time formatting
```

---

## Recommended Extractions (If Not Done in Phase 2)

### 1. Serialization Utilities (from supportMessagingSlice.ts)

If Phase 2 extraction hasn't been done yet:

**Create:** `utils/serialization.ts`

Move from `store/supportMessagingSlice.ts`:
- `SerializableMessageReaction` interface
- `SerializableMessage` interface
- `SerializableConversation` interface
- `SerializableConversationWithMessages` interface
- `toSerializableConversation` function
- `fromSerializableConversation` function
- `toSerializableReaction` function
- `fromSerializableReaction` function
- `toSerializableMessage` function
- `fromSerializableMessage` function
- `toSerializableConversationWithMessages` function
- `fromSerializableConversationWithMessages` function

**Rationale:** These are pure utility functions, not Redux logic.

---

## New Utilities to Consider

### 1. Type Guards Utility (Optional)

**Create:** `utils/typeGuards.ts`

Centralize type checking functions:

```typescript
// utils/typeGuards.ts
import type { Message, Conversation, ConversationWithMessages } from '../types';

export function isMessage(obj: unknown): obj is Message {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'senderId' in obj &&
    'content' in obj &&
    'timestamp' in obj
  );
}

export function isConversation(obj: unknown): obj is Conversation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'userId' in obj &&
    'status' in obj &&
    'subject' in obj
  );
}

export function hasMessages(conv: Conversation): conv is ConversationWithMessages {
  return 'messages' in conv && Array.isArray((conv as ConversationWithMessages).messages);
}

export function isFailedMessage(message: Message): boolean {
  return message.status === 'failed';
}

export function isPendingMessage(message: Message): boolean {
  return message.id.startsWith('temp_');
}

export function isUnreadMessage(message: Message, currentUserId: string): boolean {
  return message.senderId !== currentUserId && !message.readAt;
}
```

**Usage:** Would simplify null checks and status checks across hooks.

### 2. Error Handler Utility (Optional)

**Create:** `utils/errorHandler.ts`

Centralize error handling patterns:

```typescript
// utils/errorHandler.ts

export interface MessagingError {
  code: string;
  message: string;
  details?: unknown;
}

export function createMessagingError(
  code: string,
  message: string,
  details?: unknown
): MessagingError {
  return { code, message, details };
}

export function handleFirestoreError(err: unknown): MessagingError {
  if (err instanceof Error) {
    // Map common Firestore errors to user-friendly messages
    if (err.message.includes('permission-denied')) {
      return createMessagingError('PERMISSION_DENIED', 'You do not have permission to perform this action');
    }
    if (err.message.includes('not-found')) {
      return createMessagingError('NOT_FOUND', 'The requested resource was not found');
    }
    return createMessagingError('UNKNOWN', err.message);
  }
  return createMessagingError('UNKNOWN', 'An unknown error occurred');
}

export function isNetworkError(err: unknown): boolean {
  return err instanceof Error && (
    err.message.includes('network') ||
    err.message.includes('offline') ||
    err.message.includes('failed to fetch')
  );
}
```

---

## Update utils/index.ts

If creating new utilities, update the index file:

```typescript
// utils/index.ts
export * from './auditLog';
export * from './messageBatch';
export * from './rateLimit';
export * from './sanitize';
export * from './timeFormatting';
export * from './serialization';  // Add after Phase 2
// export * from './typeGuards';    // Optional
// export * from './errorHandler';  // Optional
```

---

## Decision Matrix

| Utility | Priority | Effort | Impact | Recommendation |
|---------|----------|--------|--------|----------------|
| serialization.ts | HIGH | Small | High | **Do in Phase 2** |
| typeGuards.ts | LOW | Small | Medium | Skip for now |
| errorHandler.ts | LOW | Medium | Medium | Skip for now |

---

## Phase 3 Completion Checklist

- [ ] Verified existing utilities are properly centralized
- [ ] serialization.ts created (if not done in Phase 2)
- [ ] `npx tsc --noEmit` passes
- [ ] No duplicate utility code across files
- [ ] Update MASTER-PLAN.md status

---

## Notes

The support-messaging feature already has good utility organization. The main action item is extracting serialization from the Redux slice (covered in Phase 2).

Optional utilities (typeGuards, errorHandler) can be added later as the codebase grows or if patterns emerge that would benefit from centralization.
