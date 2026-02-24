/**
 * Automation Editor Page
 *
 * Edit individual automation workflows
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { AutomationEditor } from '@/lib/pages/profile/components/marketing/automations';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AutomationEditorPage({ params }: Props) {
  const { id } = await params;
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/marketing/automations/' + id);
  }

  return <AutomationEditor automationId={id} />;
}
