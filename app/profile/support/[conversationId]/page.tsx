'use client';

import { use } from 'react';
import { ConversationView } from '@/lib/features/crm/profile/support-messaging';

interface ProfileConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ProfileConversationPage({ params }: ProfileConversationPageProps) {
  const { conversationId } = use(params);

  return (
    <div className="container-custom py-8">
      <ConversationView conversationId={conversationId} isAdmin={false} />
    </div>
  );
}
