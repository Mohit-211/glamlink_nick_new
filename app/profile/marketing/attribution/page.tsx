import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { AttributionReport } from '@/lib/pages/profile/components/marketing/attribution';
export const dynamic = "force-dynamic";
export default async function AttributionPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/marketing/attribution');
  }

  return <AttributionReport />;
}
