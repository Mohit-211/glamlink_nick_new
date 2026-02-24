'use client';

import { MessagesPage } from '@/lib/features/crm/profile/support-messaging';

export default function ProfileSupportPage() {
  return (
    <div className="container-custom py-8">
      <MessagesPage isAdmin={false} />
    </div>
  );
}
