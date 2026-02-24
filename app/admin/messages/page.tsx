'use client';

import { MessagesPage } from '@/lib/features/crm/profile/support-messaging';

export default function AdminMessagesPage() {
  return (
    <div className="p-6">
      <MessagesPage isAdmin={true} />
    </div>
  );
}
