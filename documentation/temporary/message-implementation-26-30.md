# Support Messaging - Next 5 Improvements (26-30)

**Feature Path:** `lib/features/crm/profile/support-messaging`

---

## Improvements to Implement

26. Message Batching
27. Lazy Load Old Messages
28. Audit Logging
29. File Attachments
30. Search Messages

---

## 26. Message Batching

**Problem:** Each message sends a separate Firestore write, which can be slow for bulk operations

**Solution:** Batch multiple messages into a single write operation for better performance

### Files to Create

**`utils/messageBatch.ts`**:
```typescript
import { writeBatch, doc, collection, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db as clientDb } from '@/lib/config/firebase';
import { COLLECTION_PATHS } from '../config';

export interface BatchMessageInput {
  content: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
}

export interface BatchResult {
  success: boolean;
  messageIds: string[];
  error?: string;
}

/**
 * Send multiple messages in a single Firestore batch operation.
 * Maximum 500 operations per batch (Firestore limit).
 */
export async function sendMessageBatch(
  conversationId: string,
  messages: BatchMessageInput[]
): Promise<BatchResult> {
  if (!clientDb) {
    return { success: false, messageIds: [], error: 'Database not initialized' };
  }

  if (messages.length === 0) {
    return { success: true, messageIds: [] };
  }

  if (messages.length > 500) {
    return { success: false, messageIds: [], error: 'Batch size exceeds Firestore limit of 500' };
  }

  try {
    const batch = writeBatch(clientDb);
    const messagesRef = collection(clientDb, COLLECTION_PATHS.messages(conversationId));
    const messageIds: string[] = [];
    const now = Date.now();

    messages.forEach((msg, index) => {
      const messageRef = doc(messagesRef);
      messageIds.push(messageRef.id);

      batch.set(messageRef, {
        senderId: msg.senderId,
        senderEmail: msg.senderEmail,
        senderName: msg.senderName,
        content: msg.content.trim(),
        timestamp: Timestamp.fromDate(new Date(now + index)), // Ensure order
        readAt: null,
        readBy: [],
        reactions: [],
      });
    });

    // Update conversation metadata
    const conversationRef = doc(clientDb, COLLECTION_PATHS.conversations, conversationId);
    const lastMessage = messages[messages.length - 1];
    batch.update(conversationRef, {
      lastMessage: {
        content: lastMessage.content.slice(0, 100),
        senderId: lastMessage.senderId,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return { success: true, messageIds };
  } catch (error) {
    console.error('Batch message error:', error);
    return {
      success: false,
      messageIds: [],
      error: error instanceof Error ? error.message : 'Failed to send messages',
    };
  }
}
```

### Files to Modify

**`hooks/useConversation.ts`** - Add batch send method:
```typescript
const sendMessageBatch = useCallback(async (contents: string[]) => {
  if (!user || contents.length === 0) return;

  const messages: BatchMessageInput[] = contents.map((content) => ({
    content,
    senderId: user.uid,
    senderEmail: user.email || '',
    senderName: user.displayName || user.email || 'User',
  }));

  const result = await sendMessageBatchUtil(conversationId, messages);

  if (!result.success) {
    throw new Error(result.error);
  }
}, [conversationId, user]);

// Add to return object
return {
  // ... existing
  sendMessageBatch,
};
```

**`types.ts`** - Add UseConversationReturn update:
```typescript
export interface UseConversationReturn {
  // ... existing
  sendMessageBatch: (contents: string[]) => Promise<void>;
}
```

---

## 27. Lazy Load Old Messages

**Problem:** Loading all messages at once can be slow for long conversations

**Solution:** Load only recent messages initially, with "Load earlier" pagination

### Files to Modify

**`config.ts`** - Add message pagination config:
```typescript
export const PAGINATION_CONFIG = {
  conversationsPerPage: 20,
  messagesPerPage: 50,      // Add this
  messagesInitialLoad: 30,  // Add this
};
```

**`hooks/useConversation.ts`** - Add message pagination:
```typescript
import {
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { PAGINATION_CONFIG } from '../config';

// Add state
const [hasMoreMessages, setHasMoreMessages] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const oldestMessageRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

// Update initial query to use limit
const initialQuery = query(
  messagesRef,
  orderBy('timestamp', 'desc'),
  limit(PAGINATION_CONFIG.messagesInitialLoad)
);

// Add loadMoreMessages function
const loadMoreMessages = useCallback(async () => {
  if (!oldestMessageRef.current || !hasMoreMessages || isLoadingMore) return;

  setIsLoadingMore(true);

  try {
    const moreQuery = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      startAfter(oldestMessageRef.current),
      limit(PAGINATION_CONFIG.messagesPerPage)
    );

    const snapshot = await getDocs(moreQuery);
    const olderMessages = snapshot.docs.map(mapDocToMessage).reverse();

    if (snapshot.docs.length > 0) {
      oldestMessageRef.current = snapshot.docs[snapshot.docs.length - 1];
    }

    setHasMoreMessages(snapshot.docs.length === PAGINATION_CONFIG.messagesPerPage);

    // Prepend older messages to existing
    dispatch(setMessages([...olderMessages, ...conversation.messages]));
  } catch (err) {
    console.error('Error loading more messages:', err);
  } finally {
    setIsLoadingMore(false);
  }
}, [hasMoreMessages, isLoadingMore, conversation?.messages]);

// Return new values
return {
  // ... existing
  hasMoreMessages,
  loadMoreMessages,
  isLoadingMore,
};
```

**`types.ts`** - Update UseConversationReturn:
```typescript
export interface UseConversationReturn {
  // ... existing
  hasMoreMessages: boolean;
  loadMoreMessages: () => Promise<void>;
  isLoadingMore: boolean;
}
```

**`components/ConversationView/ConversationView.tsx`** - Add load more button:
```typescript
{/* Messages */}
<div ref={messagesContainerRef} ...>
  {/* Load More Button at top */}
  {hasMoreMessages && (
    <div className="text-center py-3">
      <button
        onClick={loadMoreMessages}
        disabled={isLoadingMoreMessages}
        className="text-sm text-glamlink-purple hover:underline disabled:opacity-50"
      >
        {isLoadingMoreMessages ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            Loading...
          </span>
        ) : (
          'Load earlier messages'
        )}
      </button>
    </div>
  )}

  {conversation.messages.map((message, index) => (
    // ... existing message rendering
  ))}
</div>
```

**`components/ConversationView/useConversationView.ts`** - Add new values:
```typescript
const {
  // ... existing
  hasMoreMessages,
  loadMoreMessages,
  isLoadingMore: isLoadingMoreMessages,
} = useConversation(conversationId);

// Add to return
return {
  // ... existing
  hasMoreMessages,
  loadMoreMessages,
  isLoadingMoreMessages,
};
```

---

## 28. Audit Logging

**Problem:** No record of who changed conversation status, priority, or tags

**Solution:** Track all administrative changes in a subcollection for accountability

### Files to Create

**`types/auditLog.ts`**:
```typescript
export type AuditAction =
  | 'status_changed'
  | 'priority_changed'
  | 'tags_updated'
  | 'conversation_created'
  | 'conversation_resolved'
  | 'message_deleted';

export interface AuditLogEntry {
  id: string;
  conversationId: string;
  action: AuditAction;
  oldValue: unknown;
  newValue: unknown;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface CreateAuditLogInput {
  conversationId: string;
  action: AuditAction;
  oldValue: unknown;
  newValue: unknown;
  userId: string;
  userName: string;
  userEmail: string;
  metadata?: Record<string, unknown>;
}
```

**`utils/auditLog.ts`**:
```typescript
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db as clientDb } from '@/lib/config/firebase';
import type { AuditLogEntry, CreateAuditLogInput } from '../types/auditLog';

const AUDIT_COLLECTION = (conversationId: string) =>
  `support_conversations/${conversationId}/audit_log`;

/**
 * Create an audit log entry for a conversation change.
 */
export async function createAuditLog(input: CreateAuditLogInput): Promise<string | null> {
  if (!clientDb) return null;

  try {
    const auditRef = collection(clientDb, AUDIT_COLLECTION(input.conversationId));

    const docRef = await addDoc(auditRef, {
      ...input,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
}

/**
 * Fetch audit log entries for a conversation.
 */
export async function getAuditLog(
  conversationId: string,
  maxEntries: number = 50
): Promise<AuditLogEntry[]> {
  if (!clientDb) return [];

  try {
    const auditRef = collection(clientDb, AUDIT_COLLECTION(conversationId));
    const q = query(auditRef, orderBy('timestamp', 'desc'), limit(maxEntries));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as AuditLogEntry[];
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return [];
  }
}
```

**`hooks/useAuditLog.ts`**:
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuditLog, createAuditLog } from '../utils/auditLog';
import type { AuditLogEntry, CreateAuditLogInput } from '../types/auditLog';

export function useAuditLog(conversationId: string) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const log = await getAuditLog(conversationId);
      setEntries(log);
    } catch (err) {
      setError('Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchLog();
    }
  }, [conversationId, fetchLog]);

  const addEntry = useCallback(async (input: Omit<CreateAuditLogInput, 'conversationId'>) => {
    const id = await createAuditLog({ ...input, conversationId });
    if (id) {
      fetchLog(); // Refresh the log
    }
    return id;
  }, [conversationId, fetchLog]);

  return { entries, isLoading, error, refetch: fetchLog, addEntry };
}
```

**`components/AuditLogPanel.tsx`**:
```typescript
'use client';

import { useAuditLog } from '../hooks/useAuditLog';
import { formatRelativeTime, formatFullDateTime } from '../utils/timeFormatting';
import type { AuditAction } from '../types/auditLog';

interface AuditLogPanelProps {
  conversationId: string;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  status_changed: 'changed status',
  priority_changed: 'changed priority',
  tags_updated: 'updated tags',
  conversation_created: 'created conversation',
  conversation_resolved: 'resolved conversation',
  message_deleted: 'deleted a message',
};

export function AuditLogPanel({ conversationId }: AuditLogPanelProps) {
  const { entries, isLoading, error } = useAuditLog(conversationId);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading activity...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (entries.length === 0) {
    return <div className="text-sm text-gray-400">No activity recorded</div>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Activity Log</h4>
      <ul className="space-y-2 max-h-64 overflow-y-auto">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="text-xs text-gray-600 flex items-start gap-2"
            title={formatFullDateTime(entry.timestamp)}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
            <span>
              <strong>{entry.userName}</strong> {ACTION_LABELS[entry.action]}
              {entry.oldValue !== undefined && entry.newValue !== undefined && (
                <span className="text-gray-400">
                  {' '}from "{String(entry.oldValue)}" to "{String(entry.newValue)}"
                </span>
              )}
              <span className="text-gray-400 ml-1">
                {formatRelativeTime(entry.timestamp)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Files to Modify

**`hooks/useConversation.ts`** - Add audit logging to status/priority/tags updates:
```typescript
import { createAuditLog } from '../utils/auditLog';

const updateStatus = useCallback(async (status: ConversationStatus) => {
  const oldStatus = conversation?.status;

  // ... existing update logic

  // Log the change
  if (user) {
    await createAuditLog({
      conversationId,
      action: 'status_changed',
      oldValue: oldStatus,
      newValue: status,
      userId: user.uid,
      userName: user.displayName || user.email || 'Admin',
      userEmail: user.email || '',
    });
  }
}, [conversationId, conversation?.status, user]);

// Similar for updatePriority and updateTags
```

**`components/ConversationView/ConversationView.tsx`** - Add audit log panel for admin:
```typescript
import { AuditLogPanel } from '../AuditLogPanel';

// In the header or collapsible section for admin users
{userIsAdmin && (
  <details className="mt-4 border-t border-gray-100 pt-4">
    <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900">
      View Activity Log
    </summary>
    <div className="mt-2">
      <AuditLogPanel conversationId={conversationId} />
    </div>
  </details>
)}
```

**`index.ts`** - Export new components/hooks:
```typescript
export { useAuditLog } from './hooks/useAuditLog';
export { AuditLogPanel } from './components/AuditLogPanel';
export type { AuditLogEntry, AuditAction, CreateAuditLogInput } from './types/auditLog';
```

---

## 29. File Attachments

**Problem:** Users cannot share screenshots or documents in support conversations

**Solution:** Allow image and file uploads with Firebase Storage integration

### Files to Create

**`types/attachment.ts`**:
```typescript
export type AttachmentType = 'image' | 'document' | 'other';

export interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number; // bytes
  mimeType: string;
  uploadedAt: Date;
}

export interface UploadProgress {
  percentage: number;
  bytesTransferred: number;
  totalBytes: number;
}

export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ATTACHMENTS_PER_MESSAGE = 5;
```

**`hooks/useFileUpload.ts`**:
```typescript
'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/config/firebase';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, type Attachment, type UploadProgress, type AttachmentType } from '../types/attachment';

interface UseFileUploadReturn {
  uploadFile: (file: File, conversationId: string, messageId: string) => Promise<Attachment | null>;
  uploadProgress: UploadProgress | null;
  isUploading: boolean;
  error: string | null;
  cancelUpload: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadTask, setUploadTask] = useState<ReturnType<typeof uploadBytesResumable> | null>(null);

  const getFileType = (mimeType: string): AttachmentType => {
    if (ALLOWED_FILE_TYPES.image.includes(mimeType)) return 'image';
    if (ALLOWED_FILE_TYPES.document.includes(mimeType)) return 'document';
    return 'other';
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
    }

    const allAllowed = [...ALLOWED_FILE_TYPES.image, ...ALLOWED_FILE_TYPES.document];
    if (!allAllowed.includes(file.type)) {
      return 'File type not supported. Allowed: images, PDFs, Word documents, text files';
    }

    return null;
  };

  const uploadFile = useCallback(async (
    file: File,
    conversationId: string,
    messageId: string
  ): Promise<Attachment | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress({ percentage: 0, bytesTransferred: 0, totalBytes: file.size });

    try {
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `support-attachments/${conversationId}/${messageId}/${timestamp}_${safeFileName}`;
      const storageRef = ref(storage, storagePath);

      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          conversationId,
          messageId,
        },
      });

      setUploadTask(task);

      return new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          (snapshot) => {
            setUploadProgress({
              percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
            });
          },
          (err) => {
            setError(err.message);
            setIsUploading(false);
            setUploadProgress(null);
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);

            const attachment: Attachment = {
              id: `${timestamp}_${messageId}`,
              type: getFileType(file.type),
              url,
              name: file.name,
              size: file.size,
              mimeType: file.type,
              uploadedAt: new Date(),
            };

            setIsUploading(false);
            setUploadProgress(null);
            setUploadTask(null);
            resolve(attachment);
          }
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(null);
      return null;
    }
  }, []);

  const cancelUpload = useCallback(() => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploadTask(null);
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [uploadTask]);

  return { uploadFile, uploadProgress, isUploading, error, cancelUpload };
}
```

**`components/AttachmentUploader.tsx`**:
```typescript
'use client';

import { useRef, useState, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { MAX_FILE_SIZE, MAX_ATTACHMENTS_PER_MESSAGE, type Attachment } from '../types/attachment';

interface AttachmentUploaderProps {
  conversationId: string;
  onAttachmentReady: (attachment: Attachment) => void;
  disabled?: boolean;
}

export function AttachmentUploader({
  conversationId,
  onAttachmentReady,
  disabled = false,
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFile, uploadProgress, isUploading, error, cancelUpload } = useFileUpload();

  const handleFile = useCallback(async (file: File) => {
    const tempMessageId = `temp_${Date.now()}`;
    const attachment = await uploadFile(file, conversationId, tempMessageId);
    if (attachment) {
      onAttachmentReady(attachment);
    }
  }, [conversationId, uploadFile, onAttachmentReady]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label="Upload attachment"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className={`p-2 rounded-lg transition-colors ${
          isDragging
            ? 'bg-glamlink-purple/10 text-glamlink-purple'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="Attach file"
      >
        {isUploading ? (
          <div className="w-5 h-5 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        )}
      </button>

      {/* Upload progress */}
      {uploadProgress && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-48">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress.percentage}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-glamlink-purple transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
          <button
            onClick={cancelUpload}
            className="text-xs text-red-500 hover:underline mt-1"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <div className="absolute bottom-full left-0 mb-2 bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2 max-w-48">
          {error}
        </div>
      )}
    </div>
  );
}
```

**`components/AttachmentPreview.tsx`**:
```typescript
'use client';

import Image from 'next/image';
import type { Attachment } from '../types/attachment';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  editable?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentPreview({ attachments, onRemove, editable = false }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative group rounded-lg border border-gray-200 overflow-hidden"
        >
          {attachment.type === 'image' ? (
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
              <Image
                src={attachment.url}
                alt={attachment.name}
                width={120}
                height={80}
                className="object-cover"
              />
            </a>
          ) : (
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-700 max-w-24 truncate">
                  {attachment.name}
                </span>
                <span className="text-xs text-gray-400">
                  {formatFileSize(attachment.size)}
                </span>
              </div>
            </a>
          )}

          {editable && onRemove && (
            <button
              onClick={() => onRemove(attachment.id)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              aria-label={`Remove ${attachment.name}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Files to Modify

**`types.ts`** - Add attachments to Message:
```typescript
import type { Attachment } from './types/attachment';

export interface Message {
  // ... existing fields
  attachments?: Attachment[];
}
```

**`components/MessageBubble.tsx`** - Display attachments:
```typescript
import { AttachmentPreview } from './AttachmentPreview';

// In the message content section
{message.attachments && message.attachments.length > 0 && (
  <AttachmentPreview attachments={message.attachments} />
)}
```

**`components/ConversationView/ConversationView.tsx`** - Add uploader to input area:
```typescript
import { AttachmentUploader } from '../AttachmentUploader';
import { AttachmentPreview } from '../AttachmentPreview';

// In useConversationView, add pending attachments state
const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

// In the input area
<div className="flex items-end gap-2">
  <AttachmentUploader
    conversationId={conversationId}
    onAttachmentReady={(att) => setPendingAttachments(prev => [...prev, att])}
    disabled={isSending}
  />
  <textarea ... />
  <button onClick={handleSend} ... />
</div>

{pendingAttachments.length > 0 && (
  <AttachmentPreview
    attachments={pendingAttachments}
    onRemove={(id) => setPendingAttachments(prev => prev.filter(a => a.id !== id))}
    editable
  />
)}
```

---

## 30. Search Messages

**Problem:** Hard to find old conversations when list grows

**Solution:** Client-side search filtering with debounced input

### Files to Create

**`hooks/useConversationSearch.ts`**:
```typescript
'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Conversation } from '../types';

interface UseConversationSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredConversations: Conversation[];
  isSearching: boolean;
  clearSearch: () => void;
  hasResults: boolean;
}

const DEBOUNCE_MS = 300;

export function useConversationSearch(
  conversations: Conversation[]
): UseConversationSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounce the search query
  useEffect(() => {
    setIsSearching(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const filteredConversations = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return conversations;
    }

    const query = debouncedQuery.toLowerCase().trim();

    return conversations.filter((conversation) => {
      // Search in subject
      if (conversation.subject.toLowerCase().includes(query)) {
        return true;
      }

      // Search in last message content
      if (conversation.lastMessage?.content.toLowerCase().includes(query)) {
        return true;
      }

      // Search in user name (for admin)
      if (conversation.userName.toLowerCase().includes(query)) {
        return true;
      }

      // Search in user email (for admin)
      if (conversation.userEmail.toLowerCase().includes(query)) {
        return true;
      }

      // Search in tags
      if (conversation.tags?.some(tag => tag.toLowerCase().includes(query))) {
        return true;
      }

      return false;
    });
  }, [conversations, debouncedQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const hasResults = filteredConversations.length > 0 || !debouncedQuery.trim();

  return {
    searchQuery,
    setSearchQuery,
    filteredConversations,
    isSearching,
    clearSearch,
    hasResults,
  };
}
```

**`components/SearchInput.tsx`**:
```typescript
'use client';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  isSearching?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search conversations...',
  isSearching = false,
}: SearchInputProps) {
  return (
    <div className="relative">
      {/* Search icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {isSearching ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glamlink-purple focus:border-transparent"
        aria-label="Search conversations"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
```

### Files to Modify

**`components/MessagesPage.tsx`** - Add search functionality:
```typescript
import { useConversationSearch } from '../hooks/useConversationSearch';
import { SearchInput } from './SearchInput';

export function MessagesPage({ isAdmin = false }: MessagesPageProps) {
  const { conversations, isLoading, error, refetch, hasMore, loadMore, isLoadingMore } = useConversations();

  // Add search
  const {
    searchQuery,
    setSearchQuery,
    filteredConversations,
    isSearching,
    clearSearch,
    hasResults,
  } = useConversationSearch(conversations);

  // ... existing state

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* ... existing header */}
      </div>

      {/* Search Bar */}
      {conversations.length > 0 && (
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={clearSearch}
          isSearching={isSearching}
          placeholder={isAdmin ? 'Search by subject, user, or tags...' : 'Search conversations...'}
        />
      )}

      {/* No results message */}
      {!hasResults && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-4"
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
          <p className="text-gray-500">
            No conversations match "{searchQuery}"
          </p>
          <button
            onClick={clearSearch}
            className="mt-2 text-glamlink-purple hover:underline text-sm"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Conversations List - use filteredConversations instead of conversations */}
      {filteredConversations.length === 0 && hasResults ? (
        {/* ... existing empty state */}
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isAdmin={isAdmin}
                bulkMode={bulkMode}
                isSelected={selectedIds.has(conversation.id)}
                onToggleSelect={() => handleToggleSelect(conversation.id)}
                searchQuery={searchQuery} // Pass for highlighting
              />
            ))}
          </div>

          {/* Only show load more if not searching */}
          {!searchQuery && hasMore && (
            {/* ... existing load more button */}
          )}
        </div>
      )}

      {/* ... rest of component */}
    </div>
  );
}
```

**`components/MessagesPage.tsx`** - Update ConversationItem to highlight matches:
```typescript
interface ConversationItemProps {
  // ... existing
  searchQuery?: string;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function ConversationItem({ conversation, isAdmin, searchQuery = '', ... }: ConversationItemProps) {
  return (
    <Link ...>
      <div className="flex items-start gap-3">
        {/* ... existing content with highlighting */}
        <h3 className="font-medium text-gray-900 truncate">
          {highlightMatch(conversation.subject, searchQuery)}
        </h3>

        {conversation.lastMessage && (
          <p className="text-sm text-gray-600 mt-1 truncate">
            {highlightMatch(conversation.lastMessage.content, searchQuery)}
          </p>
        )}
      </div>
    </Link>
  );
}
```

**`index.ts`** - Export new components/hooks:
```typescript
export { useConversationSearch } from './hooks/useConversationSearch';
export { SearchInput } from './components/SearchInput';
export { AttachmentUploader } from './components/AttachmentUploader';
export { AttachmentPreview } from './components/AttachmentPreview';
export { useFileUpload } from './hooks/useFileUpload';
export type { Attachment, AttachmentType, UploadProgress } from './types/attachment';
```

---

## Files Summary

| Action | Path |
|--------|------|
| CREATE | `utils/messageBatch.ts` |
| CREATE | `types/auditLog.ts` |
| CREATE | `utils/auditLog.ts` |
| CREATE | `hooks/useAuditLog.ts` |
| CREATE | `components/AuditLogPanel.tsx` |
| CREATE | `types/attachment.ts` |
| CREATE | `hooks/useFileUpload.ts` |
| CREATE | `components/AttachmentUploader.tsx` |
| CREATE | `components/AttachmentPreview.tsx` |
| CREATE | `hooks/useConversationSearch.ts` |
| CREATE | `components/SearchInput.tsx` |
| MODIFY | `config.ts` - Add messagesPerPage, messagesInitialLoad |
| MODIFY | `types.ts` - Add attachments to Message, update UseConversationReturn |
| MODIFY | `hooks/useConversation.ts` - Add batch send, message pagination, audit logging |
| MODIFY | `components/ConversationView/ConversationView.tsx` - Load more, audit panel, attachments |
| MODIFY | `components/ConversationView/useConversationView.ts` - Expose new values |
| MODIFY | `components/MessageBubble.tsx` - Display attachments |
| MODIFY | `components/MessagesPage.tsx` - Search, highlight matches |
| MODIFY | `index.ts` - Export new components/hooks/types |

---

## Implementation Order

1. **Message Batching** (utility-only, no UI changes)
2. **Lazy Load Old Messages** (pagination for messages)
3. **Search Messages** (client-side filtering)
4. **Audit Logging** (tracking admin actions)
5. **File Attachments** (most complex, requires Storage)

---

## Verification

1. **Message Batching**:
   - Test sending 3+ messages via batch
   - Verify order is preserved
   - Check all messages appear in conversation

2. **Lazy Load Old Messages**:
   - Create conversation with 60+ messages
   - Verify only 30 load initially
   - Click "Load earlier messages" and verify 50 more appear
   - Verify scroll position maintained

3. **Search Messages**:
   - Search by subject, user name, email, tag
   - Verify matches are highlighted
   - Verify debounce works (no flicker)
   - Clear search returns all results

4. **Audit Logging**:
   - Change status, priority, tags as admin
   - Verify audit log entries appear
   - Check old/new values are recorded
   - Verify timestamps are correct

5. **File Attachments**:
   - Upload image, PDF, text file
   - Verify preview displays correctly
   - Test drag & drop
   - Test file size limit (reject >10MB)
   - Test cancel upload
   - Verify attachments appear in sent message

6. **TypeScript**: `npx tsc --noEmit` - no new errors

---

## Security Considerations

### File Attachments
- Validate file types server-side in Storage rules
- Set max file size in Storage rules
- Scan for malware (consider Cloud Functions integration)
- Use signed URLs with expiration for sensitive documents
- Never trust client-side file type detection alone

### Audit Logging
- Write-only for non-admin users (no delete/update)
- Validate audit entries server-side
- Consider rate limiting audit writes
