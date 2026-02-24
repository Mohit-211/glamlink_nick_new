# Phase 4: Cleanup and Verification

**Parent:** `MASTER-PLAN.md`
**Estimated effort:** Small (30 minutes)

---

## Overview

This phase covers final cleanup tasks after completing Phases 1-3:
1. Update all import paths
2. Remove old files
3. Update index.ts exports
4. Run TypeScript checks
5. Manual testing verification

---

## Step 1: Update Import Paths

After refactoring, ensure all imports are updated:

### Files Importing useConversation

Check and update if needed:
- `components/ConversationView/useConversationView.ts` - Line 4
- Any other files importing from `hooks/useConversation`

**Before:**
```typescript
import { useConversation } from '../../hooks/useConversation';
```

**After (if moved to subdirectory):**
```typescript
import { useConversation } from '../../hooks/useConversation';
// OR if you want sub-hooks directly:
import { useConversationMessages } from '../../hooks/useConversation';
```

### Files Importing MessagesPage

Check and update if needed:
- Any page components importing MessagesPage

**Before:**
```typescript
import { MessagesPage } from '@/lib/features/crm/profile/support-messaging/components/MessagesPage';
```

**After:**
```typescript
// Same path works if index.ts re-exports
import { MessagesPage } from '@/lib/features/crm/profile/support-messaging/components/MessagesPage';
```

### Files Importing Serialization Utilities

After Phase 2, update files that import from slice:
- `hooks/useConversation.ts`
- `hooks/useConversations.ts`
- Any other consumers

**Before:**
```typescript
import {
  toSerializableMessage,
  fromSerializableConversationWithMessages,
} from '../store/supportMessagingSlice';
```

**After (re-exports should still work):**
```typescript
// Option 1: Still works via re-export
import {
  toSerializableMessage,
  fromSerializableConversationWithMessages,
} from '../store/supportMessagingSlice';

// Option 2: Import directly from utils
import {
  toSerializableMessage,
  fromSerializableConversationWithMessages,
} from '../utils/serialization';
```

---

## Step 2: Remove Old Files

After creating new subdirectory structures, remove original files:

### If useConversation was moved to subdirectory:
```bash
# After verifying new hooks work:
rm lib/features/crm/profile/support-messaging/hooks/useConversation.ts
# The new index.ts in hooks/useConversation/ takes over
```

### If MessagesPage was moved to subdirectory:
```bash
# After verifying new component works:
rm lib/features/crm/profile/support-messaging/components/MessagesPage.tsx
# The new index.ts in components/MessagesPage/ takes over
```

**IMPORTANT:** Only remove after verifying TypeScript compiles and feature works!

---

## Step 3: Update index.ts Exports

Ensure the main feature index.ts exports all public APIs:

```typescript
// lib/features/crm/profile/support-messaging/index.ts

// Components
export { MessagesPage } from './components/MessagesPage';
export { ConversationView } from './components/ConversationView';
export { MessageBubble } from './components/MessageBubble';
// ... other components

// Hooks
export { useConversation } from './hooks/useConversation';
export { useConversations } from './hooks/useConversations';
// ... other hooks

// If exposing sub-hooks:
export {
  useConversationMessages,
  useConversationActions,
  useConversationRealtime,
  useConversationPagination,
} from './hooks/useConversation';

// Store
export { default as supportMessagingReducer } from './store/supportMessagingSlice';
export * from './store/supportMessagingSlice';

// Utils (via re-export from slice for backward compat)
export { formatRelativeTime, formatMessageTime, formatFullDateTime } from './utils/timeFormatting';

// Types
export type {
  Conversation,
  ConversationWithMessages,
  Message,
  // ... other types
} from './types';
```

---

## Step 4: Run TypeScript Checks

```bash
# From web_app directory
npx tsc --noEmit
```

**Expected:** No errors

If errors occur:
1. Check import paths are correct
2. Verify all re-exports are in place
3. Check for missing type imports

---

## Step 5: Manual Testing Verification

### Core Functionality Tests

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| **Conversations List** | Navigate to /profile/support | List loads with all conversations | [ ] |
| **Search** | Type in search box | Results filter correctly | [ ] |
| **Bulk Actions** | (Admin) Enable bulk mode, select items | Can change status in bulk | [ ] |
| **New Conversation** | Click "New Conversation", fill form | Conversation created | [ ] |
| **View Conversation** | Click on a conversation | Conversation view loads | [ ] |
| **Send Message** | Type message, click send | Message appears in chat | [ ] |
| **Retry Failed** | (If offline) Retry a failed message | Message sends successfully | [ ] |
| **Status Change** | (Admin) Change status dropdown | Status updates | [ ] |
| **Priority Change** | (Admin) Change priority dropdown | Priority updates | [ ] |
| **Tags** | (Admin) Add/remove tags | Tags update | [ ] |
| **Reactions** | Click reaction button | Reaction appears | [ ] |
| **Typing Indicator** | Start typing in input | Typing indicator shows for others | [ ] |
| **Draft Persistence** | Type message, navigate away, return | Draft restored | [ ] |
| **Character Limit** | Type beyond limit | Warning shows, send disabled | [ ] |
| **Load More** | Scroll up in long conversation | Older messages load | [ ] |

### Admin-Specific Tests

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| **Audit Log** | View conversation with changes | Audit log panel shows entries | [ ] |
| **Response Metrics** | View conversation | Response time metrics display | [ ] |
| **Bulk Status Update** | Select multiple, change status | All selected update | [ ] |

### Error Handling Tests

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| **Network Error** | Disable network, send message | Error message, retry option | [ ] |
| **Invalid Conversation** | Navigate to non-existent ID | Error displayed gracefully | [ ] |

---

## Step 6: Final Cleanup

After all tests pass:

1. **Remove any commented-out old code**
2. **Remove any TODO comments** that were addressed
3. **Update CLAUDE.md** if needed with new file structure
4. **Update MASTER-PLAN.md** to mark all phases complete

---

## Phase 4 Completion Checklist

- [ ] All import paths updated
- [ ] Old files removed (after verification)
- [ ] index.ts exports updated
- [ ] `npx tsc --noEmit` passes
- [ ] All manual tests pass
- [ ] No console errors in browser
- [ ] MASTER-PLAN.md updated with completion status

---

## Final File Structure

After all refactoring is complete:

```
lib/features/crm/profile/support-messaging/
├── components/
│   ├── ConversationView/
│   │   ├── index.ts
│   │   ├── ConversationView.tsx (~292 lines)
│   │   ├── useConversationView.ts (~250 lines)
│   │   ├── useDraftPersistence.ts (~50 lines) [NEW]
│   │   └── useMessageInput.ts (~50 lines) [NEW]
│   ├── MessagesPage/
│   │   ├── index.ts [NEW]
│   │   ├── MessagesPage.tsx (~200 lines)
│   │   ├── ConversationItem.tsx (~130 lines) [NEW]
│   │   └── useMessagesPage.ts (~100 lines) [NEW]
│   └── ... (other components unchanged)
├── hooks/
│   ├── useConversation/
│   │   ├── index.ts [NEW]
│   │   ├── useConversationRealtime.ts (~120 lines) [NEW]
│   │   ├── useConversationMessages.ts (~100 lines) [NEW]
│   │   ├── useConversationActions.ts (~150 lines) [NEW]
│   │   └── useConversationPagination.ts (~80 lines) [NEW]
│   └── ... (other hooks unchanged)
├── store/
│   └── supportMessagingSlice.ts (~180 lines, reduced)
├── utils/
│   ├── serialization.ts (~150 lines) [NEW]
│   └── ... (other utils unchanged)
├── types/
│   └── ... (unchanged)
├── config.ts
├── types.ts
└── index.ts
```

---

## Summary

Total estimated time for all phases: **4-8 hours**

| Phase | Files | Effort | Key Changes |
|-------|-------|--------|-------------|
| Phase 1 | 3 | Large | Split large hooks, extract components |
| Phase 2 | 2 | Medium | Extract serialization utilities |
| Phase 3 | 0 | Small | Verify utilities, skip optional ones |
| Phase 4 | - | Small | Cleanup, testing, verification |

After completion:
- No file > 300 lines
- Clear separation of concerns
- Easier to maintain and test
- Better code organization
