/**
 * Admin Order Detail Page Route
 *
 * Displays full details for a single order
 */

import React from 'react';
import { redirect, notFound } from 'next/navigation';
import AuthWrapper from '@/lib/features/auth/AuthWrapper';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { OrdersService } from '@/lib/features/crm/orders/services/ordersService';
import { OrderDetailPage } from '@/lib/features/crm/orders/components/detail/OrderDetailPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Fetch order data server-side
 */
async function getOrderData(orderId: string) {
  try {
    const { db, currentUser } = await getAuthenticatedAppForUser();

    if (!currentUser || !db) {
      redirect('/login?redirect=/admin/crm/orders');
    }

    const brandId = (currentUser as any).brandId || currentUser.uid;

    // Fetch order
    const order = await OrdersService.getOrderById(db, brandId, orderId);

    if (!order) {
      return null;
    }

    return { order, brandId };
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Order Detail Page Component
 */
export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const data = await getOrderData(id);

  if (!data) {
    notFound();
  }

  return (
    <AuthWrapper requireAuth={true} requireAdmin={true} featureName="Order Details">
      <OrderDetailPage order={data.order} brandId={data.brandId} />
    </AuthWrapper>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const data = await getOrderData(id);

  if (!data) {
    return {
      title: 'Order Not Found',
    };
  }

  return {
    title: `Order #${data.order.orderNumber} | Glamlink Admin`,
    description: `Order details for ${data.order.customer.name}`,
  };
}
