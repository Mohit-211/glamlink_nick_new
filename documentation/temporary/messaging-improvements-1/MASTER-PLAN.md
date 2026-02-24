# Improvement Plan: Support Messaging

**Generated:** 2026-01-16
**Path:** `lib/features/crm/profile/support-messaging/`
**Structure:** B (Medium Feature)
**Total Files:** 57
**Total Improvements:** 18

> **Note:** Cross-cutting improvements (Storybook, Unit Tests, E2E Tests, Bundle Splitting) have been moved to `documentation/temporary/general-improvements/1.md` as they apply to the entire codebase.

## Scope Analysis

- **Total Files:** 57
- **Structure Type:** B (Medium Feature)
- **Reason:** Single feature directory with 6 subdirectories, feature is cohesive despite higher file count

| Subdirectory | Files | Primary Purpose |
|--------------|-------|-----------------|
| components/ | 26 | UI components (bubbles, modals, badges, panels) |
| hooks/ | 18 | React hooks (conversation, upload, typing, etc.) |
| store/ | 2 | Redux state management |
| types/ | 2 | TypeScript type definitions |
| utils/ | 6 | Utilities (audit, sanitize, rate limit, etc.) |
| root | 3 | Config, types, exports |

## Current State Summary

The support messaging system is a well-structured real-time chat feature with admin and user views. It includes keyboard navigation, ARIA announcements, typing indicators, file attachments, reactions, audit logging, and offline support. The recent refactoring split large files into focused hooks with good composition patterns.

## Key Gaps by Category

| Category | Gaps Found | Critical |
|----------|------------|----------|
| User Experience | 5 | 1 |
| Accessibility | 4 | 2 |
| Performance | 2 | 0 |
| Security | 3 | 1 |
| Developer Experience | 1 | 0 |
| Admin Features | 4 | 0 |

## All Improvements

| # | Name | Priority | Effort | Category | Phase |
|---|------|----------|--------|----------|-------|
| 1 | Add skip link for message input | P1 | Small | A11y | 1 |
| 2 | Rate limit feedback UI | P1 | Small | UX | 1 |
| 3 | CSRF token validation | P1 | Small | Security | 1 |
| 4 | Focus trap in modals | P1 | Small | A11y | 1 |
| 5 | Message send retry with exponential backoff | P1 | Small | UX | 1 |
| 6 | Add role="status" for connection indicator | P1 | Small | A11y | 1 |
| 7 | Reduced motion support | P2 | Small | A11y | 2 |
| 8 | Virtualized message list | P2 | Medium | Perf | 2 |
| 9 | Server-side rate limiting | P2 | Medium | Security | 2 |
| 10 | Memoize message rendering | P2 | Small | Perf | 2 |
| 11 | Add debug logging toggle | P2 | Small | DX | 2 |
| 12 | URL/link sanitization | P2 | Medium | Security | 2 |
| 13 | Conversation search by content | P2 | Medium | Admin | 3 |
| 14 | Bulk status change | P2 | Medium | Admin | 3 |
| 15 | Message templates for admins | P2 | Medium | Admin | 3 |
| 16 | Message edit history | P3 | Medium | UX | 4 |
| 17 | Message pinning | P3 | Medium | UX | 4 |
| 18 | Export conversation transcript | P3 | Medium | Admin | 4 |

## Plan Files

| Phase | File | Improvements | Status |
|-------|------|--------------|--------|
| - | `architecture.md` | Current state | [ ] |
| 1 | `phase-1-quick-wins.md` | #1-6 | [x] ✅ |
| 2 | `phase-2-core-improvements.md` | #7-12 | [x] ✅ |
| 3 | `phase-3-advanced-features.md` | #13-15 | [x] ✅ |
| 4 | `phase-4-future-backlog.md` | #16-18 | [x] ✅ |

## Implementation Order

1. [x] **Phase 1: Quick wins** (P1, Small effort) - Critical a11y & security fixes ✅
2. [x] **Phase 2: Core improvements** (P2, Small-Medium effort) - Performance & security hardening ✅
3. [x] **Phase 3: Advanced features** (P2, Medium effort) - Admin tools ✅
4. [x] **Phase 4: Future backlog** (P3, Medium effort) - Nice-to-haves ✅

## Progress Tracking

- **Phase 1:** 6/6 complete ✅
- **Phase 2:** 6/6 complete ✅
- **Phase 3:** 3/3 complete ✅
- **Phase 4:** 3/3 complete ✅

## Quick Start

1. Review `architecture.md` for system context
2. Open `phase-1-quick-wins.md`
3. Implement improvements in order (1-6)
4. Run `npx tsc --noEmit` after each change
5. Check off completed items in this file
