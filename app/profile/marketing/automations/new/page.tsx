/**
 * New Automation Page
 *
 * Create a new custom automation from scratch
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { AutomationEditor } from '@/lib/pages/profile/components/marketing/automations';
export const dynamic = "force-dynamic";
export default async function NewAutomationPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/marketing/automations/new');
  }

  // Pass 'new' as the automation ID to signal creating a new automation
  return <AutomationEditor automationId="new" />;
}
