# Phase 4: Future Backlog

**Parent:** `MASTER-PLAN.md`
**Improvements in this phase:** 3
**Estimated effort:** Medium
**Categories covered:** UX (2), Admin (1)

> **Note:** E2E Tests and Bundle Splitting have been moved to `documentation/temporary/general-improvements/1.md` as they are cross-cutting concerns that apply to the entire codebase.

---

## Summary

| # | Name | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 16 | Message edit history | P3 | Medium | [ ] |
| 17 | Message pinning | P3 | Medium | [ ] |
| 18 | Export conversation transcript | P3 | Medium | [ ] |

---

## Improvement 16: Message Edit History

**Priority:** P3
**Effort:** Medium
**Category:** User Experience
**Impact:** Medium

### Problem

Once a message is sent, it cannot be changed. Typos require awkward follow-up corrections ("*meant to say..."), and mistakes in important information can't be fixed. This clutters conversation history and can cause confusion when the incorrect version remains visible.

### Solution

Allow message editing within a time window (e.g., 15 minutes) and maintain an edit history for transparency.

### Implementation

#### Overview

1. Add `editedAt` and `editHistory` fields to Message type
2. Create edit UI in MessageBubble
3. Add API endpoint for message updates
4. Show edit indicator and history viewer

#### Key Components

**Updated Message type in `types.ts`:**
```typescript
export interface MessageEdit {
  content: string;
  editedAt: Date;
}

export interface Message {
  // ... existing fields
  editedAt?: Date;
  editHistory?: MessageEdit[];
}
```

**Edit window configuration in `config.ts`:**
```typescript
export const EDIT_CONFIG = {
  allowedWindowMs: 15 * 60 * 1000, // 15 minutes
  maxEdits: 5,
};
```

**Edit hook `hooks/useMessageEdit.ts`:**
```typescript
'use client';

import { useState, useCallback } from 'react';
import { EDIT_CONFIG } from '../config';

interface UseMessageEditReturn {
  isEditing: boolean;
  editContent: string;
  startEdit: (content: string) => void;
  cancelEdit: () => void;
  saveEdit: () => Promise<void>;
  setEditContent: (content: string) => void;
  canEdit: (message: Message) => boolean;
}

export function useMessageEdit(
  messageId: string,
  conversationId: string,
  onEditComplete: () => void
): UseMessageEditReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const canEdit = useCallback((message: Message): boolean => {
    // Can only edit own messages within time window
    const timeSinceSent = Date.now() - message.timestamp.getTime();
    const withinWindow = timeSinceSent < EDIT_CONFIG.allowedWindowMs;
    const underEditLimit = (message.editHistory?.length || 0) < EDIT_CONFIG.maxEdits;
    return withinWindow && underEditLimit;
  }, []);

  const startEdit = useCallback((content: string) => {
    setEditContent(content);
    setIsEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent('');
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(
        `/api/support/conversations/${conversationId}/messages/${messageId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: editContent.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      setIsEditing(false);
      setEditContent('');
      onEditComplete();
    } catch (error) {
      console.error('Edit failed:', error);
    }
  }, [editContent, conversationId, messageId, onEditComplete]);

  return {
    isEditing,
    editContent,
    startEdit,
    cancelEdit,
    saveEdit,
    setEditContent,
    canEdit,
  };
}
```

**MessageBubble edit functionality:**
- Show "Edit" button on hover for own messages within window
- Inline edit mode with save/cancel
- "Edited" indicator with timestamp
- Click indicator to show edit history modal

```typescript
// In MessageBubble.tsx
{canEdit(message) && isCurrentUser && (
  <button
    onClick={() => startEdit(message.content)}
    className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-gray-600"
  >
    Edit
  </button>
)}

{message.editedAt && (
  <button
    onClick={() => setShowEditHistory(true)}
    className="text-xs text-gray-400 hover:text-gray-600"
    title={`Edited ${formatRelativeTime(message.editedAt)}`}
  >
    (edited)
  </button>
)}
```

### Dependencies

- None

### Verification

- [ ] Edit button appears on own recent messages
- [ ] Edit button hidden after time window (15 min)
- [ ] Edit button hidden after max edits (5)
- [ ] Edits save correctly
- [ ] Edit history preserved
- [ ] Other users see "Edited" indicator
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove editedAt and editHistory from Message type
2. Remove useMessageEdit hook
3. Remove edit UI from MessageBubble

---

## Improvement 17: Message Pinning

**Priority:** P3
**Effort:** Medium
**Category:** User Experience
**Impact:** Medium

### Problem

In long support conversations, important information—order numbers, agreed solutions, key dates—gets buried in the message history. Users and admins must scroll through dozens of messages to find the specific detail they need, often missing it entirely.

### Solution

Allow pinning important messages to a collapsible section at the top of the conversation for quick reference.

### Implementation

#### Overview

1. Add `isPinned` and `pinnedBy` fields to Message
2. Create pinned messages section at top of conversation
3. Add pin/unpin actions
4. Limit pins per conversation (e.g., 5)

#### Key Components

**Updated Message type:**
```typescript
export interface Message {
  // ... existing fields
  isPinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: Date;
}
```

**Pin configuration in `config.ts`:**
```typescript
export const PIN_CONFIG = {
  maxPinsPerConversation: 5,
};
```

**Pinned messages section in ConversationView:**
```typescript
// State for pinned messages
const pinnedMessages = conversation.messages.filter(m => m.isPinned);
const [showPinnedExpanded, setShowPinnedExpanded] = useState(true);

// Scroll to message function
const scrollToMessage = (messageId: string) => {
  const index = conversation.messages.findIndex(m => m.id === messageId);
  if (index !== -1 && messageRefs.current[index]) {
    messageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFocusedIndex(index);
  }
};

// In JSX, before messages list
{pinnedMessages.length > 0 && (
  <div className="border-b border-amber-200 bg-amber-50 px-4 py-2">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-amber-600">📌</span>
      <span className="text-sm font-medium text-amber-800">
        Pinned Messages ({pinnedMessages.length})
      </span>
      <button
        onClick={() => setShowPinnedExpanded(!showPinnedExpanded)}
        className="text-sm text-amber-600 hover:underline"
        aria-expanded={showPinnedExpanded}
      >
        {showPinnedExpanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
    {showPinnedExpanded && (
      <div className="space-y-2">
        {pinnedMessages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start gap-2 p-2 bg-white rounded-lg border border-amber-200"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 truncate">{msg.content}</p>
              <p className="text-xs text-gray-400">
                {msg.senderName} · {formatRelativeTime(msg.timestamp)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollToMessage(msg.id)}
                className="text-xs text-amber-600 hover:underline"
              >
                Jump to
              </button>
              <button
                onClick={() => handleUnpin(msg.id)}
                className="text-xs text-gray-400 hover:text-gray-600"
                aria-label="Unpin message"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

**Pin action in MessageBubble:**
```typescript
const canPin = pinnedMessages.length < PIN_CONFIG.maxPinsPerConversation || message.isPinned;

<button
  onClick={() => message.isPinned ? onUnpin(message.id) : onPin(message.id)}
  disabled={!canPin && !message.isPinned}
  className={`text-gray-400 hover:text-amber-500 ${!canPin && !message.isPinned ? 'opacity-50 cursor-not-allowed' : ''}`}
  aria-label={message.isPinned ? 'Unpin message' : 'Pin message'}
  title={!canPin && !message.isPinned ? 'Maximum pins reached' : undefined}
>
  {message.isPinned ? '📌' : '📍'}
</button>
```

### Dependencies

- None

### Verification

- [ ] Pin button appears on messages
- [ ] Pinned messages appear at top in collapsible section
- [ ] Unpin removes from section
- [ ] Maximum pins (5) enforced
- [ ] "Jump to" scrolls to message in list
- [ ] Pin state persists on reload
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove isPinned/pinnedBy/pinnedAt from Message type
2. Remove pinned messages section from ConversationView
3. Remove pin button from MessageBubble

---

## Improvement 18: Export Conversation Transcript

**Priority:** P3
**Effort:** Medium
**Category:** Admin Features
**Impact:** Medium

### Problem

There's no way to export conversation history for record-keeping, compliance, or sharing with external stakeholders. Users who need records for their own reference, admins who need to share conversations with external teams, or companies with compliance requirements have no options.

### Solution

Add export functionality that generates downloadable transcripts in PDF, TXT, or JSON formats.

### Implementation

#### Overview

1. Create export service with format handlers
2. Add export button in conversation view
3. Generate downloadable file
4. Include metadata (participants, dates, status)

#### Key Components

**Create `utils/exportConversation.ts`:**
```typescript
import type { ConversationWithMessages } from '../types';

export interface ExportOptions {
  format: 'pdf' | 'txt' | 'json';
  includeAttachments: boolean;
  includeMetadata: boolean;
}

export async function exportConversation(
  conversation: ConversationWithMessages,
  options: ExportOptions
): Promise<Blob> {
  switch (options.format) {
    case 'pdf':
      return generatePdfTranscript(conversation, options);
    case 'txt':
      return generateTextTranscript(conversation, options);
    case 'json':
      return generateJsonExport(conversation, options);
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

function generateTextTranscript(
  conversation: ConversationWithMessages,
  options: ExportOptions
): Blob {
  let content = `SUPPORT CONVERSATION TRANSCRIPT\n`;
  content += `${'='.repeat(50)}\n\n`;

  if (options.includeMetadata) {
    content += `Subject: ${conversation.subject}\n`;
    content += `Status: ${conversation.status}\n`;
    content += `Priority: ${conversation.priority || 'normal'}\n`;
    content += `User: ${conversation.userName} (${conversation.userEmail})\n`;
    content += `Created: ${conversation.createdAt.toISOString()}\n`;
    content += `Last Updated: ${conversation.updatedAt.toISOString()}\n`;
    if (conversation.tags?.length) {
      content += `Tags: ${conversation.tags.join(', ')}\n`;
    }
    content += `\n${'='.repeat(50)}\n\n`;
  }

  content += `MESSAGES (${conversation.messages.length})\n`;
  content += `${'-'.repeat(50)}\n\n`;

  for (const message of conversation.messages) {
    const timestamp = message.timestamp.toISOString();
    content += `[${timestamp}] ${message.senderName}:\n`;
    content += `${message.content}\n`;

    if (options.includeAttachments && message.attachments?.length) {
      content += `  Attachments: ${message.attachments.map(a => a.name).join(', ')}\n`;
    }

    if (message.editedAt) {
      content += `  (edited ${message.editedAt.toISOString()})\n`;
    }

    content += `\n`;
  }

  content += `${'='.repeat(50)}\n`;
  content += `Exported: ${new Date().toISOString()}\n`;

  return new Blob([content], { type: 'text/plain' });
}

function generateJsonExport(
  conversation: ConversationWithMessages,
  options: ExportOptions
): Blob {
  const exportData = {
    exportedAt: new Date().toISOString(),
    conversation: {
      id: conversation.id,
      subject: conversation.subject,
      status: conversation.status,
      priority: conversation.priority,
      tags: conversation.tags,
      user: {
        id: conversation.userId,
        name: conversation.userName,
        email: conversation.userEmail,
      },
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messageCount: conversation.messages.length,
    },
    messages: conversation.messages.map(m => ({
      id: m.id,
      sender: {
        id: m.senderId,
        name: m.senderName,
        email: m.senderEmail,
      },
      content: m.content,
      timestamp: m.timestamp.toISOString(),
      editedAt: m.editedAt?.toISOString(),
      attachments: options.includeAttachments ? m.attachments : undefined,
      reactions: m.reactions?.map(r => ({
        emoji: r.emoji,
        userName: r.userName,
      })),
    })),
  };

  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
}

async function generatePdfTranscript(
  conversation: ConversationWithMessages,
  options: ExportOptions
): Promise<Blob> {
  // For PDF, we'd use a library like jspdf or html2pdf
  // This is a simplified implementation that creates HTML for download
  // In production, use jspdf or a server-side PDF generator

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Conversation: ${conversation.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .metadata p { margin: 5px 0; }
        .message { margin: 15px 0; padding: 15px; border-left: 3px solid #8b5cf6; background: #fafafa; }
        .message-header { font-weight: bold; color: #333; margin-bottom: 5px; }
        .message-time { color: #666; font-size: 0.85em; }
        .message-content { margin-top: 10px; white-space: pre-wrap; }
        .edited { color: #999; font-size: 0.85em; font-style: italic; }
      </style>
    </head>
    <body>
      <h1>${conversation.subject}</h1>
  `;

  if (options.includeMetadata) {
    html += `
      <div class="metadata">
        <p><strong>Status:</strong> ${conversation.status}</p>
        <p><strong>Priority:</strong> ${conversation.priority || 'normal'}</p>
        <p><strong>User:</strong> ${conversation.userName} (${conversation.userEmail})</p>
        <p><strong>Created:</strong> ${conversation.createdAt.toLocaleString()}</p>
        ${conversation.tags?.length ? `<p><strong>Tags:</strong> ${conversation.tags.join(', ')}</p>` : ''}
      </div>
    `;
  }

  for (const message of conversation.messages) {
    html += `
      <div class="message">
        <div class="message-header">
          ${message.senderName}
          <span class="message-time">${message.timestamp.toLocaleString()}</span>
        </div>
        <div class="message-content">${escapeHtml(message.content)}</div>
        ${message.editedAt ? `<div class="edited">(edited ${message.editedAt.toLocaleString()})</div>` : ''}
      </div>
    `;
  }

  html += `
      <p style="margin-top: 30px; color: #999; font-size: 0.85em;">
        Exported: ${new Date().toLocaleString()}
      </p>
    </body>
    </html>
  `;

  return new Blob([html], { type: 'text/html' });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

**Export UI in ConversationView:**
```typescript
import { Menu } from '@headlessui/react';
import { exportConversation, downloadBlob } from '../utils/exportConversation';

// In the header section
{userIsAdmin && (
  <Menu as="div" className="relative">
    <Menu.Button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export
    </Menu.Button>
    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
      <Menu.Item>
        {({ active }) => (
          <button
            onClick={() => handleExport('txt')}
            className={`w-full px-4 py-2 text-left text-sm ${active ? 'bg-gray-100' : ''}`}
          >
            Export as Text (.txt)
          </button>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <button
            onClick={() => handleExport('json')}
            className={`w-full px-4 py-2 text-left text-sm ${active ? 'bg-gray-100' : ''}`}
          >
            Export as JSON (.json)
          </button>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <button
            onClick={() => handleExport('pdf')}
            className={`w-full px-4 py-2 text-left text-sm ${active ? 'bg-gray-100' : ''}`}
          >
            Export as HTML (.html)
          </button>
        )}
      </Menu.Item>
    </Menu.Items>
  </Menu>
)}

// Handler
const handleExport = async (format: 'pdf' | 'txt' | 'json') => {
  if (!conversation) return;

  const blob = await exportConversation(conversation, {
    format,
    includeAttachments: true,
    includeMetadata: true,
  });

  const extension = format === 'pdf' ? 'html' : format;
  const filename = `conversation-${conversation.id}-${Date.now()}.${extension}`;
  downloadBlob(blob, filename);
};
```

### Dependencies

- `@headlessui/react` for dropdown menu (already in project)
- Optional: `jspdf` for true PDF generation

### Verification

- [ ] Export button appears for admins
- [ ] Text export contains all messages
- [ ] JSON export is valid JSON with all data
- [ ] HTML export renders correctly in browser
- [ ] Metadata included when option enabled
- [ ] File downloads with correct name and extension
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove exportConversation utility
2. Remove export menu from ConversationView

---

## Phase Completion Checklist

- [ ] All 3 improvements implemented
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Manual testing passed for each improvement:
  - [ ] Message editing works within time window
  - [ ] Pinning works with proper limits
  - [ ] Export generates correct files
- [ ] Update MASTER-PLAN.md progress: Phase 4: 3/3 complete

---

## Notes

These improvements are lower priority and can be implemented as time permits. Consider the following when planning:

1. **Message editing** - Good UX improvement but requires careful handling of edit conflicts in real-time scenarios
2. **Message pinning** - Useful for long conversations, relatively straightforward to implement
3. **Export** - Often requested by enterprise customers for compliance, good value for admin users

Implement based on user feedback and business priorities.
