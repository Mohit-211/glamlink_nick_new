import { getServerPageContent } from '@/lib/features/display-cms/utils/dataFetching.server';
import { getEnvironment, getRenderingStrategy } from '@/lib/features/display-cms/utils/environment';
import { getPageMetadata } from "@/lib/data/metadata";
import { HomePageWrapper } from './HomePageWrapper';

export const metadata = getPageMetadata("home");

// ISR with 60-second revalidation for all environments
export const dynamic = "force-dynamic";


/**
 * Home Page - Server Component
 *
 * Implements environment-aware rendering:
 * - Production with SSG: Static generation (requires rebuild)
 * - Preview: Always dynamic (real-time updates)
 * - Development with SSG: ISR with 5-minute revalidation
 * - Dynamic mode: Client-side fetching
 */
export default async function Home() {
  const env = getEnvironment();

  // Attempt to fetch CMS page content server-side
  const pageConfig = await getServerPageContent('home');

  // Determine rendering strategy
  const strategy = getRenderingStrategy(
    pageConfig?.ssgEnabled || false,
    env
  );

  // For SSG/ISR with data, pre-render with initialData
  if (strategy !== 'dynamic' && pageConfig) {
    return <HomePageWrapper pageType="home" initialData={pageConfig} />;
  }

  // For dynamic rendering, let ClientDisplay fetch client-side
  return <HomePageWrapper pageType="home" />;
}
