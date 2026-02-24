/**
 * Transactions List Page
 *
 * /profile/finance/transactions
 */

import { TransactionsPage } from '@/lib/features/finance/components';

export default function TransactionsListPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <TransactionsPage />
    </div>
  );
}
