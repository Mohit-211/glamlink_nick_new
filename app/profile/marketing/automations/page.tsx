/**
 * Automations Dashboard Page
 *
 * Main dashboard for marketing automations
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { AutomationsDashboard } from '@/lib/pages/profile/components/marketing/automations';
export const dynamic = "force-dynamic";
export default async function AutomationsPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/marketing/automations');
  }

  return <AutomationsDashboard />;
}
