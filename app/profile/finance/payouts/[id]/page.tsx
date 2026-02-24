/**
 * Payout Detail Page
 *
 * /profile/finance/payouts/[id]
 */

'use client';

import { use, useEffect, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { usePayouts } from '@/lib/features/finance/hooks/usePayouts';
import { useTransactions } from '@/lib/features/finance/hooks/useTransactions';
import { formatCurrency } from '@/lib/features/finance/config';
import PayoutStatusBadge from '@/lib/features/finance/components/PayoutStatusBadge';
import type { Payout } from '@/lib/features/finance/types';

interface PayoutDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PayoutDetailPage({ params }: PayoutDetailPageProps) {
  const { id } = use(params);
  const { getPayoutById } = usePayouts();
  const { getTransactionsByPayout } = useTransactions();
  const [payout, setPayout] = useState<Payout | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const payoutData = await getPayoutById(id);
      const txnData = await getTransactionsByPayout(id);
      setPayout(payoutData);
      setTransactions(txnData);
      setIsLoading(false);
    };

    fetchData();
  }, [id, getPayoutById, getTransactionsByPayout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glamlink-teal" />
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Payout not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/profile/finance/payouts"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-glamlink-teal mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payouts
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payout Details</h1>
            <p className="text-gray-500 mt-2">
              {new Date(payout.payoutDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <PayoutStatusBadge status={payout.status} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Gross Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(payout.grossAmount)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Fees</p>
          <p className="text-2xl font-bold text-red-600">
            -{formatCurrency(payout.fees)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Refunds</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(payout.refunds)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Net Amount</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(payout.netAmount)}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Transactions ({payout.transactionCount})
          </h2>
        </div>
        <div className="p-6">
          {transactions.length > 0 ? (
            <div className="text-center py-8 text-gray-500">
              Transaction list will appear here
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
