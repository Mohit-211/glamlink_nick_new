/**
 * Admin Orders Page Route
 *
 * Main route for the orders management dashboard
 */

import React from 'react';
import AuthWrapper from '@/lib/features/auth/AuthWrapper';
import { OrdersPage } from '@/lib/features/crm/orders/components/dashboard/OrdersPage';

export default function AdminOrdersPage() {
  return (
    <AuthWrapper requireAuth={true} requireAdmin={true} featureName="Orders Management">
      <OrdersPage />
    </AuthWrapper>
  );
}
