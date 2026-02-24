'use client';

import { use } from 'react';
import { ConversationView } from '@/lib/features/crm/profile/support-messaging';

interface AdminConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default function AdminConversationPage({ params }: AdminConversationPageProps) {
  const { conversationId } = use(params);

  return (
    <div className="p-6">
      <ConversationView conversationId={conversationId} isAdmin={true} />
    </div>
  );
}
