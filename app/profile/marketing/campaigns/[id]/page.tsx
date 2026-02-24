import { redirect, notFound } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { CampaignEditor } from '@/lib/pages/profile/components/marketing/campaigns';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignEditorPage({ params }: Props) {
  const { id } = await params;
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/marketing/campaigns/' + id);
  }

  return <CampaignEditor campaignId={id} />;
}
