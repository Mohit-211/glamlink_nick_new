/**
 * Admin Content Settings Page
 *
 * Manages:
 * - Page visibility settings
 * - Page content editing
 */

import AuthWrapper from '@/lib/features/auth/AuthWrapper';
import ContentSettingsTab from '@/lib/pages/admin/components/content-settings/ContentSettingsTab';

export default function AdminContentSettingsPage() {
  return (
    <AuthWrapper requireAuth requireAdmin featureName="Content Settings">
      <div className="p-8">
        <ContentSettingsTab />
      </div>
    </AuthWrapper>
  );
}
