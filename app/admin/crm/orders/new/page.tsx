/**
 * Admin Create Order Page Route
 *
 * Page for manually creating new orders
 */

import React from 'react';
import AuthWrapper from '@/lib/features/auth/AuthWrapper';
import { CreateOrderPage } from '@/lib/features/crm/orders/components/create/CreateOrderPage';

/**
 * Create Order Page Component
 */
export default function AdminCreateOrderPage() {
  return (
    <AuthWrapper requireAuth={true} requireAdmin={true} featureName="Create Order">
      <CreateOrderPage />
    </AuthWrapper>
  );
}

/**
 * Generate metadata for the page
 */
export const metadata = {
  title: 'Create Order | Glamlink Admin',
  description: 'Create a new order manually',
};
