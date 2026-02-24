/**
 * Profile Orders Page Route
 *
 * Main route for the orders management dashboard in the profile section
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { OrdersPage } from '@/lib/features/crm/orders/components/dashboard/OrdersPage';
export const dynamic = "force-dynamic";
export default async function ProfileOrdersPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/orders');
  }

  return <OrdersPage />;
}
