/**
 * Profile Customer Detail Page Route
 *
 * Route for viewing individual customer details in the profile section
 */

import React from 'react';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { getCustomerById } from '@/lib/features/crm/services/customerDbService';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Fetch customer data server-side
 */
async function getCustomerData(customerId: string) {
  try {
    const { db, currentUser } = await getAuthenticatedAppForUser();

    if (!currentUser || !db) {
      redirect('/login?redirect=/profile/customers');
    }

    const brandId = (currentUser as any).brandId || currentUser.uid;

    // Fetch customer
    const customer = await getCustomerById(db, brandId, customerId);

    if (!customer) {
      return null;
    }

    return { customer, brandId };
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Profile Customer Detail Page Component
 */
export default async function ProfileCustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  const data = await getCustomerData(id);

  if (!data) {
    notFound();
  }

  const { customer } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile/customers"
            className="inline-flex items-center whitespace-nowrap px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-4"
          >
            <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Customers
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Customer since {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{customer.email}</p>
              </div>
              {customer.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900">{customer.phone}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500">Language</label>
                <p className="text-sm text-gray-900 capitalize">{customer.language || 'English'}</p>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Total Orders</label>
                <p className="text-2xl font-bold text-gray-900">{customer.analytics?.totalOrders || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Total Spent</label>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.analytics?.totalSpent || 0)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Average Order</label>
                <p className="text-lg font-medium text-gray-900">{formatCurrency(customer.analytics?.averageOrderValue || 0)}</p>
              </div>
              {customer.analytics?.lastOrderAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Order</label>
                  <p className="text-sm text-gray-900">{formatDate(customer.analytics.lastOrderAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Marketing Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Marketing Preferences</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Marketing</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  customer.marketing?.emailSubscribed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {customer.marketing?.emailSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SMS Marketing</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  customer.marketing?.smsSubscribed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {customer.marketing?.smsSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            {customer.tags && customer.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tags assigned</p>
            )}
          </div>
        </div>

        {/* Addresses */}
        {customer.addresses && customer.addresses.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Addresses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customer.addresses.map((address, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  {address.isDefault && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded mb-2">
                      Default
                    </span>
                  )}
                  <p className="text-sm text-gray-900">{address.firstName} {address.lastName}</p>
                  <p className="text-sm text-gray-600">{address.address1}</p>
                  {address.address2 && <p className="text-sm text-gray-600">{address.address2}</p>}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.stateCode || address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {customer.notes && customer.notes.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <div className="space-y-3">
              {customer.notes.map((note) => (
                <div key={note.id} className="text-sm text-gray-600 whitespace-pre-wrap">
                  {note.content}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const data = await getCustomerData(id);

  if (!data) {
    return {
      title: 'Customer Not Found',
    };
  }

  return {
    title: `${data.customer.firstName} ${data.customer.lastName} | Customers`,
    description: `Customer details for ${data.customer.firstName} ${data.customer.lastName}`,
  };
}
