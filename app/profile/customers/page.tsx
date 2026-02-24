/**
 * Profile Customers Page Route
 *
 * Route for viewing and managing customers in the profile section
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { CustomersDashboard } from '@/lib/features/crm/components/CustomersDashboard';

/**
 * Profile Customers Page Component
 */
export const dynamic = "force-dynamic";
export default async function ProfileCustomersPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/customers');
  }

  return <CustomersDashboard />;
}

/**
 * Generate metadata for the page
 */
export function generateMetadata() {
  return {
    title: 'Customers | My Profile',
    description: 'Manage your customers and their information',
  };
}
