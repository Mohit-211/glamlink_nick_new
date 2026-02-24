import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { CustomersDashboard } from '@/lib/features/crm/components/CustomersDashboard';
import { getCustomers } from '@/lib/features/crm/services/customerDbService';
import type { Customer } from '@/lib/features/crm/types';

export const metadata: Metadata = {
  title: 'Customers | CRM | Admin',
  description: 'Manage your customer relationships',
};
export const dynamic = 'force-dynamic';
export default async function CustomersPage() {
  const { db, currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser || !db) {
    redirect('/login?redirect=/admin/crm/customers');
  }

  // Fetch initial customers server-side
  let initialCustomers: Customer[] = [];
  try {
    initialCustomers = await getCustomers(db, currentUser.uid);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
  }

  return (
    <div className="p-6">
      <CustomersDashboard initialCustomers={initialCustomers} />
    </div>
  );
}
