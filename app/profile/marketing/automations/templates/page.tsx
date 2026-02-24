/**
 * Automation Templates Gallery Page
 *
 * Browse and select from automation templates
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { TemplateGallery } from '@/lib/pages/profile/components/marketing/automations';
export const dynamic = "force-dynamic";
export default async function AutomationTemplatesPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/marketing/automations/templates');
  }

  return <TemplateGallery />;
}
