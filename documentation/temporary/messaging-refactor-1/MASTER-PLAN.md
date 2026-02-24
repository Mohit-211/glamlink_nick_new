# Refactoring Plan: Support Messaging

**Generated:** 2026-01-16
**Completed:** 2026-01-16
**Path:** `lib/features/crm/profile/support-messaging/`
**Structure:** B (Medium Feature)
**Files:** 45 total | 5 need refactoring

## Scope Analysis

- **Total Files:** 45
- **Structure Type:** B (Medium Feature)
- **Reason:** Single feature directory with 6 subdirectories, 15-40 files threshold exceeded but single cohesive feature

| Subdirectory | Files | Description |
|--------------|-------|-------------|
| components/ | 20 | UI components |
| hooks/ | 13 | React hooks |
| store/ | 2 | Redux state |
| utils/ | 5 | Utility functions |
| types/ | 2 | Type definitions |
| (root) | 3 | index.ts, types.ts, config.ts |

## File Summary

| File | Total | Hook/JS | TSX | Priority | Phase |
|------|-------|---------|-----|----------|-------|
| hooks/useConversation.ts | 550 | 550 | 0 | 🔴 HIGH | 1 |
| components/MessagesPage.tsx | 435 | 105 | 330 | 🔴 HIGH | 1 |
| components/ConversationView/useConversationView.ts | 414 | 414 | 0 | 🔴 HIGH | 1 |
| store/supportMessagingSlice.ts | 344 | 344 | 0 | 🟡 MEDIUM | 2 |
| components/ConversationView/ConversationView.tsx | 292 | 65 | 227 | 🟡 MEDIUM | 2 |
| components/AttachmentUploader.tsx | 233 | ~80 | ~153 | 🟢 OK | - |
| hooks/useFileUpload.ts | 216 | 216 | 0 | 🟢 OK | - |
| components/AttachmentPreview.tsx | 200 | ~60 | ~140 | 🟢 OK | - |
| hooks/useConversations.ts | 192 | 192 | 0 | 🟢 OK | - |
| components/SearchInput.tsx | 192 | ~40 | ~152 | 🟢 OK | - |
| components/AuditLogPanel.tsx | 192 | ~80 | ~112 | 🟢 OK | - |
| (40 other files) | <190 | - | - | 🟢 OK | - |

## Plan Files

| Phase | File | Contents | Status |
|-------|------|----------|--------|
| 1 | `phase-1-high-priority.md` | 3 files > 400 lines | [x] |
| 2 | `phase-2-medium-priority.md` | 2 files 250-400 lines | [x] |
| 3 | `phase-3-shared-utilities.md` | Extract duplicates | [x] |
| 4 | `phase-4-cleanup.md` | Verification | [x] |

## Implementation Order

1. [x] **Phase 1: High priority refactors** (3 files)
   - `useConversation.ts` → Split into focused hooks (useConversationRealtime, useConversationMessages, useConversationActions, useConversationPagination)
   - `MessagesPage.tsx` → Extract ConversationItem, create useMessagesPage hook
   - `useConversationView.ts` → Split into composable hooks (useDraftPersistence, useMessageInput)

2. [x] **Phase 2: Medium priority refactors** (2 files)
   - `supportMessagingSlice.ts` → Extract serialization to utils/serialization.ts
   - `ConversationView.tsx` → Reviewed, already well-structured at 292 lines

3. [x] **Phase 3: Extract shared utilities**
   - Created utils/serialization.ts with all serialization functions
   - Verified time formatting utilities already centralized

4. [x] **Phase 4: Update imports, run tests**
   - All imports verified with backward compatibility re-exports
   - TypeScript checks passed (`npx tsc --noEmit`)
   - Ready for manual testing

## Quick Start

1. Open `phase-1-high-priority.md`
2. Start with `useConversation.ts` (largest file)
3. Run `npx tsc --noEmit` after each file
4. Check off completed items in this file

## Progress Tracking

- **Phase 1:** 3/3 complete ✅
- **Phase 2:** 2/2 complete ✅
- **Phase 3:** 1/1 complete ✅
- **Phase 4:** 1/1 complete ✅

## New File Structure After Refactoring

```
hooks/
├── useConversation/
│   ├── index.ts                    # Main hook that composes all sub-hooks
│   ├── useConversationRealtime.ts  # Firestore realtime listeners
│   ├── useConversationMessages.ts  # Send, retry, batch messages
│   ├── useConversationActions.ts   # Status, priority, tags, reactions
│   └── useConversationPagination.ts# Load more messages
├── useConversation.ts              # Re-exports for backward compatibility
└── ...

components/
├── MessagesPage/
│   ├── index.ts                    # Exports
│   ├── MessagesPage.tsx            # Main component (simplified)
│   ├── ConversationItem.tsx        # Extracted conversation list item
│   └── useMessagesPage.ts          # Hook for page state/handlers
├── MessagesPage.tsx                # Re-exports for backward compatibility
├── ConversationView/
│   ├── ConversationView.tsx        # Main component (unchanged)
│   ├── useConversationView.ts      # Simplified, uses extracted hooks
│   ├── useDraftPersistence.ts      # Draft message persistence
│   └── useMessageInput.ts          # Message input handling
└── ...

utils/
├── serialization.ts                # Extracted serialization utilities
└── ...
```

## Summary

All refactoring phases completed successfully:
- Large files split into focused, composable hooks
- Backward compatibility maintained via re-exports
- TypeScript compilation verified
- No breaking changes to existing imports
