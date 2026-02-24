/**
 * Finance Overview Page
 *
 * /profile/finance
 */

import { FinanceOverview } from '@/lib/features/finance/components';

export default function FinancePage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
        <p className="text-gray-500 mt-2">
          Track your payouts, transactions, and financial performance
        </p>
      </div>

      <FinanceOverview />
    </div>
  );
}
