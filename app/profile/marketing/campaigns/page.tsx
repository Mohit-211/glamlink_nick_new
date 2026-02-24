import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { CampaignList } from '@/lib/pages/profile/components/marketing/campaigns';
export const dynamic = "force-dynamic";
export default async function CampaignsPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/marketing/campaigns');
  }

  return <CampaignList />;
}
