/**
 * Profile Create Order Page Route
 *
 * Route for creating new orders in the profile section
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { CreateOrderPage } from '@/lib/features/crm/orders/components/create/CreateOrderPage';
export const dynamic = "force-dynamic";
export default async function ProfileCreateOrderPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/orders/new');
  }

  return <CreateOrderPage />;
}
