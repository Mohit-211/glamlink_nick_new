/**
 * Services Page Route - /services
 *
 * Browse All Services - The main entry point for discovering treatments and professionals.
 * Server Component that fetches CMS config and passes to client wrapper.
 */

import type { Metadata } from 'next';
import { getServerPageContent } from '@/lib/features/display-cms/utils/dataFetching.server';
import { ServicesPageWrapper } from './ServicesPageWrapper';

// =============================================================================
// ISR CONFIGURATION
// =============================================================================

// ISR with 60-second revalidation
export const dynamic = "force-dynamic";


// =============================================================================
// METADATA
// =============================================================================

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://glamlink.net');
  const pageUrl = `${baseUrl}/services`;
  const defaultImage = `${baseUrl}/images/glamlink-services.jpg`;

  return {
    title: 'Beauty & Wellness Services | Find Verified Pros | Glamlink',
    description:
      'Find your perfect beauty professional. Browse treatments by category, discover local pros, and book your next appointment with confidence.',
    keywords: [
      'beauty services',
      'beauty professionals',
      'beauty appointments',
      'wellness services',
      'find beauty pros',
      'book beauty appointments',
      'lip blush',
      'botox',
      'lash extensions',
      'microblading',
    ],
    openGraph: {
      title: 'Beauty & Wellness Services | Glamlink',
      description: 'Find your perfect beauty professional. Browse treatments and book with confidence.',
      type: 'website',
      url: pageUrl,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: 'Glamlink Beauty Services',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Beauty & Wellness Services | Glamlink',
      description: 'Find your perfect beauty professional. Browse treatments and book with confidence.',
      images: [defaultImage],
    },
  };
}

// =============================================================================
// PAGE COMPONENT (Server Component)
// =============================================================================

export default async function ServicesPageRoute() {
  // Fetch CMS page content server-side (returns null if not configured)
  const pageConfig = await getServerPageContent('services');

  return (
    <ServicesPageWrapper
      pageType="services"
      initialData={pageConfig}
    />
  );
}
