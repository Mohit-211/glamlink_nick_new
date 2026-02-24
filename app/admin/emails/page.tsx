/**
 * Admin Email Templates Page
 *
 * Manages:
 * - Email template preview
 * - Download HTML emails
 * - Send via Mailchimp
 */

import AuthWrapper from '@/lib/features/auth/AuthWrapper';
import EmailsTab from '@/lib/pages/admin/components/emails/EmailsTab';

export default function AdminEmailsPage() {
  return (
    <AuthWrapper requireAuth requireAdmin featureName="Email Templates">
      <div className="p-8">
        <EmailsTab />
      </div>
    </AuthWrapper>
  );
}
