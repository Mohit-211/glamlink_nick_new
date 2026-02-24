import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { MarketingDashboard } from '@/lib/pages/profile/components/marketing/dashboard';
export const dynamic = "force-dynamic";
export default async function MarketingPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/marketing');
  }

  return <MarketingDashboard />;
}
