# Phase 3: Advanced Features

**Parent:** `MASTER-PLAN.md`
**Improvements in this phase:** 3
**Estimated effort:** Medium
**Categories covered:** Admin (3)

> **Note:** Storybook and Unit Tests have been moved to `documentation/temporary/general-improvements/1.md` as they are cross-cutting concerns that apply to the entire codebase.

---

## Summary

| # | Name | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 13 | Conversation search by content | P2 | Medium | [ ] |
| 14 | Bulk status change | P2 | Medium | [ ] |
| 15 | Message templates for admins | P2 | Medium | [ ] |

---

## Improvement 13: Conversation Search by Content

**Priority:** P2
**Effort:** Medium
**Category:** Admin Features
**Impact:** High

### Problem

Admins can only search conversations by subject and user name. They cannot search for conversations containing specific message content, making it difficult to find relevant conversations quickly.

### Solution

Add full-text search capability that searches message content within conversations. Use Firestore's array-contains or a third-party search service for better performance.

### Implementation

#### Files to Create

| File | Purpose |
|------|---------|
| `hooks/useContentSearch.ts` | Full-text search hook |
| `components/ContentSearchInput.tsx` | Search UI with mode toggle |

#### Files to Modify

| File | Changes |
|------|---------|
| `components/MessagesPage/useMessagesPage.ts` | Integrate content search |
| `components/MessagesPage/MessagesPage.tsx` | Add search mode toggle |

#### Code Changes

**Create `hooks/useContentSearch.ts`:**
```typescript
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db as clientDb } from '@/lib/config/firebase';
import { COLLECTION_PATHS, PAGINATION_CONFIG } from '../config';
import { toSerializableConversation } from '../utils/serialization';
import type { Conversation } from '../types';

export type SearchMode = 'subject' | 'content' | 'all';

interface UseContentSearchReturn {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Conversation[];
  isSearching: boolean;
  searchError: string | null;
  clearSearch: () => void;
}

/**
 * Hook for searching conversations by subject or message content
 */
export function useContentSearch(): UseContentSearchReturn {
  const [searchMode, setSearchMode] = useState<SearchMode>('subject');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await performSearch(searchQuery, searchMode);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, searchMode]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    searchMode,
    setSearchMode,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,
    clearSearch,
  };
}

/**
 * Perform the actual search
 */
async function performSearch(
  queryText: string,
  mode: SearchMode
): Promise<Conversation[]> {
  if (!clientDb) return [];

  const normalizedQuery = queryText.toLowerCase().trim();
  const results: Conversation[] = [];

  if (mode === 'subject' || mode === 'all') {
    // Search by subject (client-side filtering for now)
    // In production, use Algolia or Typesense for better search
    const conversationsRef = collection(clientDb, COLLECTION_PATHS.conversations);
    const conversationsQuery = query(
      conversationsRef,
      orderBy('updatedAt', 'desc'),
      limit(100) // Limit for performance
    );

    const snapshot = await getDocs(conversationsQuery);
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.subject?.toLowerCase().includes(normalizedQuery)) {
        results.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate?.() || new Date(data.lastMessage.timestamp),
          } : null,
        } as Conversation);
      }
    });
  }

  if (mode === 'content' || mode === 'all') {
    // Search message content
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - for production, use:
    // - Algolia
    // - Typesense
    // - Firestore full-text search extension

    const conversationsRef = collection(clientDb, COLLECTION_PATHS.conversations);
    const conversationsQuery = query(
      conversationsRef,
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const conversationSnapshot = await getDocs(conversationsQuery);

    for (const convDoc of conversationSnapshot.docs) {
      // Check if we already have this conversation from subject search
      if (results.some((r) => r.id === convDoc.id)) continue;

      // Search messages in this conversation
      const messagesRef = collection(
        clientDb,
        COLLECTION_PATHS.messages(convDoc.id)
      );
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(100));
      const messagesSnapshot = await getDocs(messagesQuery);

      const hasMatchingMessage = messagesSnapshot.docs.some((msgDoc) => {
        const content = msgDoc.data().content?.toLowerCase() || '';
        return content.includes(normalizedQuery);
      });

      if (hasMatchingMessage) {
        const data = convDoc.data();
        results.push({
          id: convDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate?.() || new Date(data.lastMessage.timestamp),
          } : null,
        } as Conversation);
      }
    }
  }

  // Remove duplicates and sort by updatedAt
  const uniqueResults = Array.from(
    new Map(results.map((r) => [r.id, r])).values()
  );
  uniqueResults.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return uniqueResults;
}
```

**Create `components/ContentSearchInput.tsx`:**
```typescript
'use client';

import { SearchMode } from '../hooks/useContentSearch';

interface ContentSearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  isSearching: boolean;
  resultCount?: number;
}

export function ContentSearchInput({
  query,
  onQueryChange,
  mode,
  onModeChange,
  isSearching,
  resultCount,
}: ContentSearchInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              mode === 'subject'
                ? 'Search by subject...'
                : mode === 'content'
                ? 'Search message content...'
                : 'Search all...'
            }
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glamlink-purple focus:border-transparent"
            aria-label="Search conversations"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-4 h-4 text-gray-400 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Search mode tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {(['subject', 'content', 'all'] as SearchMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === m
                ? 'bg-white text-glamlink-purple shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {m === 'subject' && 'Subject'}
            {m === 'content' && 'Content'}
            {m === 'all' && 'All'}
          </button>
        ))}
      </div>

      {/* Result count */}
      {query && resultCount !== undefined && (
        <p className="text-sm text-gray-500">
          {resultCount} conversation{resultCount !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  );
}
```

### Dependencies

- None (basic implementation)
- For production: Algolia, Typesense, or Firebase Extensions

### Verification

- [ ] Search by subject finds matching conversations
- [ ] Search by content finds conversations with matching messages
- [ ] Search mode toggle works
- [ ] Results update as you type (debounced)
- [ ] Loading indicator shows during search
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove useContentSearch hook
2. Remove ContentSearchInput component
3. Revert to simple subject search

---

## Improvement 14: Bulk Status Change

**Priority:** P2
**Effort:** Medium
**Category:** Admin Features
**Impact:** Medium

### Problem

Admins can only change the status of one conversation at a time. When dealing with multiple resolved or spam conversations, this becomes time-consuming.

### Solution

Add multi-select capability and bulk status change operations for admin users.

### Implementation

#### Files to Modify

| File | Changes |
|------|---------|
| `components/MessagesPage/useMessagesPage.ts` | Add bulk selection state |
| `components/MessagesPage/MessagesPage.tsx` | Add bulk action UI |
| `components/MessagesPage/ConversationItem.tsx` | Add checkbox |

#### Code Changes

**In `components/MessagesPage/useMessagesPage.ts`:**

Add bulk selection state and handlers:
```typescript
interface UseMessagesPageReturn {
  // ... existing returns
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  bulkUpdateStatus: (status: ConversationStatus) => Promise<void>;
  isBulkUpdating: boolean;
}

export function useMessagesPage(): UseMessagesPageReturn {
  // ... existing state

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = new Set(filteredConversations.map((c) => c.id));
    setSelectedIds(allIds);
  }, [filteredConversations]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const bulkUpdateStatus = useCallback(async (status: ConversationStatus) => {
    if (selectedIds.size === 0) return;

    setIsBulkUpdating(true);
    try {
      const updates = Array.from(selectedIds).map(async (id) => {
        const response = await fetch(`/api/support/conversations/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          throw new Error(`Failed to update ${id}`);
        }
      });

      await Promise.all(updates);
      clearSelection();
      // Refetch conversations
      await fetchConversations();
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setIsBulkUpdating(false);
    }
  }, [selectedIds, clearSelection, fetchConversations]);

  return {
    // ... existing returns
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkUpdateStatus,
    isBulkUpdating,
  };
}
```

**In `components/MessagesPage/MessagesPage.tsx`:**

Add bulk action bar:
```typescript
{/* Bulk action bar */}
{userIsAdmin && selectedIds.size > 0 && (
  <div className="sticky top-0 z-10 bg-glamlink-purple/10 border-b border-glamlink-purple/20 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-glamlink-purple">
        {selectedIds.size} selected
      </span>
      <button
        onClick={clearSelection}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Clear
      </button>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Change status to:</span>
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => bulkUpdateStatus(option.value)}
          disabled={isBulkUpdating}
          className={`px-3 py-1 rounded-full text-xs font-medium ${option.color} hover:opacity-80 disabled:opacity-50`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
)}

{/* Select all checkbox in header */}
{userIsAdmin && (
  <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
    <input
      type="checkbox"
      checked={selectedIds.size === filteredConversations.length && filteredConversations.length > 0}
      onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
      className="rounded border-gray-300 text-glamlink-purple focus:ring-glamlink-purple"
      aria-label="Select all conversations"
    />
    <span className="text-sm text-gray-500">Select all</span>
  </div>
)}
```

**In `components/MessagesPage/ConversationItem.tsx`:**

Add checkbox:
```typescript
interface ConversationItemProps {
  // ... existing props
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function ConversationItem({
  // ... existing props
  isSelectable,
  isSelected,
  onToggleSelect,
}: ConversationItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
      {isSelectable && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-glamlink-purple focus:ring-glamlink-purple"
          aria-label={`Select conversation: ${conversation.subject}`}
        />
      )}
      {/* ... rest of the component */}
    </div>
  );
}
```

### Dependencies

- None

### Verification

- [ ] Checkboxes appear for admin users
- [ ] Select all checkbox works
- [ ] Individual selection works
- [ ] Bulk action bar shows with count
- [ ] Status change applies to all selected
- [ ] Selection clears after bulk action
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove bulk selection state from useMessagesPage
2. Remove bulk action UI from MessagesPage
3. Remove checkbox from ConversationItem

---

## Improvement 15: Message Templates for Admins

**Priority:** P2
**Effort:** Medium
**Category:** Admin Features
**Impact:** High

### Problem

Admins frequently send similar messages (greetings, common solutions, follow-ups). Typing these repeatedly is inefficient and leads to inconsistent messaging.

### Solution

Create a template system where admins can save, edit, and quickly insert pre-written message templates.

### Implementation

#### Files to Create

| File | Purpose |
|------|---------|
| `hooks/useMessageTemplates.ts` | Template CRUD operations |
| `components/TemplateSelector.tsx` | Template picker UI |
| `types/template.ts` | Template type definitions |

#### Code Changes

**Create `types/template.ts`:**
```typescript
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'greeting' | 'solution' | 'followup' | 'closure' | 'custom';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface CreateTemplateInput {
  name: string;
  content: string;
  category: MessageTemplate['category'];
}
```

**Create `hooks/useMessageTemplates.ts`:**
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db as clientDb } from '@/lib/config/firebase';
import { useAuth } from '@/lib/features/auth/useAuth';
import type { MessageTemplate, CreateTemplateInput } from '../types/template';

const TEMPLATES_COLLECTION = 'support_message_templates';

interface UseMessageTemplatesReturn {
  templates: MessageTemplate[];
  isLoading: boolean;
  error: string | null;
  createTemplate: (input: CreateTemplateInput) => Promise<string | null>;
  updateTemplate: (id: string, updates: Partial<CreateTemplateInput>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  useTemplate: (id: string) => MessageTemplate | undefined;
}

export function useMessageTemplates(): UseMessageTemplatesReturn {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to templates
  useEffect(() => {
    if (!clientDb) return;

    const templatesRef = collection(clientDb, TEMPLATES_COLLECTION);
    const templatesQuery = query(templatesRef, orderBy('usageCount', 'desc'));

    const unsubscribe = onSnapshot(
      templatesQuery,
      (snapshot) => {
        const templatesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as MessageTemplate[];
        setTemplates(templatesData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createTemplate = useCallback(async (input: CreateTemplateInput): Promise<string | null> => {
    if (!clientDb || !user) return null;

    try {
      const templatesRef = collection(clientDb, TEMPLATES_COLLECTION);
      const docRef = await addDoc(templatesRef, {
        ...input,
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
      });
      return docRef.id;
    } catch (err) {
      console.error('Error creating template:', err);
      return null;
    }
  }, [user]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<CreateTemplateInput>) => {
    if (!clientDb) return;

    try {
      const templateRef = doc(clientDb, TEMPLATES_COLLECTION, id);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error('Error updating template:', err);
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    if (!clientDb) return;

    try {
      const templateRef = doc(clientDb, TEMPLATES_COLLECTION, id);
      await deleteDoc(templateRef);
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  }, []);

  const useTemplate = useCallback((id: string): MessageTemplate | undefined => {
    if (!clientDb) return undefined;

    const template = templates.find((t) => t.id === id);
    if (template) {
      // Increment usage count in background
      const templateRef = doc(clientDb, TEMPLATES_COLLECTION, id);
      updateDoc(templateRef, { usageCount: increment(1) }).catch(console.error);
    }
    return template;
  }, [templates]);

  return {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
  };
}
```

**Create `components/TemplateSelector.tsx`:**
```typescript
'use client';

import { useState } from 'react';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import type { MessageTemplate } from '../types/template';

interface TemplateSelectorProps {
  onSelect: (content: string) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<MessageTemplate['category'], string> = {
  greeting: '👋 Greetings',
  solution: '💡 Solutions',
  followup: '📝 Follow-ups',
  closure: '✅ Closures',
  custom: '📌 Custom',
};

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const { templates, isLoading, useTemplate } = useMessageTemplates();
  const [selectedCategory, setSelectedCategory] = useState<MessageTemplate['category'] | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                         t.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (template: MessageTemplate) => {
    useTemplate(template.id);
    onSelect(template.content);
    onClose();
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Message Templates</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close templates"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-glamlink-purple"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-100">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-glamlink-purple text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {(Object.keys(CATEGORY_LABELS) as MessageTemplate['category'][]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-glamlink-purple text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Template list */}
      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No templates found</div>
        ) : (
          filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-900">{template.name}</span>
                <span className="text-xs text-gray-400">{template.usageCount} uses</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
```

**In `components/ConversationView/ConversationView.tsx`:**

Add template button next to input:
```typescript
{userIsAdmin && (
  <div className="relative">
    <button
      onClick={() => setShowTemplates(!showTemplates)}
      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
      aria-label="Insert template"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </button>
    {showTemplates && (
      <TemplateSelector
        onSelect={(content) => {
          setNewMessage((prev) => prev + content);
          inputRef.current?.focus();
        }}
        onClose={() => setShowTemplates(false)}
      />
    )}
  </div>
)}
```

### Dependencies

- None

### Verification

- [ ] Template button appears for admins
- [ ] Templates load and display correctly
- [ ] Category filtering works
- [ ] Search filtering works
- [ ] Selecting template inserts content
- [ ] Usage count increments
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Rollback

If issues arise:
1. Remove TemplateSelector component
2. Remove useMessageTemplates hook
3. Remove template button from ConversationView

---

## Phase Completion Checklist

- [ ] All 3 improvements implemented
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Manual testing passed for each improvement:
  - [ ] Content search finds messages
  - [ ] Bulk status change works
  - [ ] Templates insert correctly
- [ ] Update MASTER-PLAN.md progress: Phase 3: 3/3 complete
