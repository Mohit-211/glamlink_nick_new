import { getServerPageContent } from '@/lib/features/display-cms/utils/dataFetching.server';
import { getEnvironment, getRenderingStrategy } from '@/lib/features/display-cms/utils/environment';
import { ForClientsPageWrapper } from './ForClientsPageWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Clients | Glamlink',
  description: 'Your link to everything beauty'
};

// ISR with 60-second revalidation for all environments
export const dynamic = "force-dynamic";


/**
 * For Clients Page - Server Component
 *
 * Implements environment-aware rendering:
 * - Production with SSG: Static generation (requires rebuild)
 * - Preview: Always dynamic (real-time updates)
 * - Development with SSG: ISR with 5-minute revalidation
 * - Dynamic mode: Client-side fetching
 */
export default async function ForClientsPage() {
  const env = getEnvironment();

  // Attempt to fetch page content server-side
  const pageConfig = await getServerPageContent('for-clients');

  // Determine rendering strategy
  const strategy = getRenderingStrategy(
    pageConfig?.ssgEnabled || false,
    env
  );

  // For SSG/ISR, pre-render with data
  if (strategy !== 'dynamic' && pageConfig) {
    return <ForClientsPageWrapper pageType="for-clients" initialData={pageConfig} />;
  }

  // For dynamic rendering, let ClientDisplay fetch client-side
  return <ForClientsPageWrapper pageType="for-clients" />;
}
