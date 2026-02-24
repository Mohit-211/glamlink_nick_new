/**
 * Treatment Location Page Route - /services/[treatment]/[location]
 *
 * Main SEO landing page for treatment + city combinations.
 * Example: /services/lip-blush/las-vegas -> "Lip Blush in Las Vegas"
 *
 * Server Component that fetches CMS config and passes to client wrapper.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerPageContent } from '@/lib/features/display-cms/utils/dataFetching.server';
import {
  isValidTreatmentSlug,
  getTreatmentName,
  getTreatmentContent,
  VALID_TREATMENT_SLUGS,
  POPULAR_CITIES,
} from '@/lib/pages/services';
import { TreatmentLocationWrapper } from './TreatmentLocationWrapper';

// =============================================================================
// ISR CONFIGURATION
// =============================================================================

// ISR with 60-second revalidation
export const dynamic = "force-dynamic";


// =============================================================================
// STATIC PARAMS - Pre-generate pages for treatment + popular city combinations
// =============================================================================

export async function generateStaticParams() {
  const params: { treatment: string; location: string }[] = [];

  // Generate for each treatment + each popular city
  for (const treatment of VALID_TREATMENT_SLUGS) {
    for (const city of POPULAR_CITIES) {
      params.push({
        treatment,
        location: city.slug,
      });
    }
  }

  return params;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse location slug to display name
 */
function parseLocationDisplay(locationSlug: string): { city: string; state: string } {
  // Try to find in popular cities first
  const popularCity = POPULAR_CITIES.find((c) => c.slug === locationSlug);
  if (popularCity) {
    return { city: popularCity.city, state: popularCity.state };
  }

  // Convert slug to title case
  const city = locationSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return { city, state: '' };
}

// =============================================================================
// METADATA
// =============================================================================

interface Props {
  params: Promise<{ treatment: string; location: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treatment, location } = await params;

  // Validate the treatment slug
  if (!isValidTreatmentSlug(treatment)) {
    return {
      title: 'Treatment Not Found | Glamlink',
    };
  }

  const treatmentContent = getTreatmentContent(treatment);
  const treatmentName = treatmentContent?.name || getTreatmentName(treatment);
  const { city, state } = parseLocationDisplay(location);
  const locationDisplay = state ? `${city}, ${state}` : city;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://glamlink.net');
  const pageUrl = `${baseUrl}/services/${treatment}/${location}`;
  const defaultImage = `${baseUrl}/images/treatments/${treatment}.jpg`;

  const description = `Find the best ${treatmentName.toLowerCase()} artists in ${locationDisplay}. Compare verified pros, see before & after photos, read reviews. Prices from $${treatmentContent?.priceRange.min || 0}.`;

  return {
    title: `${treatmentName} in ${city} | Find & Book Verified Pros | Glamlink`,
    description,
    keywords: [
      `${treatmentName.toLowerCase()} ${city.toLowerCase()}`,
      `${treatmentName.toLowerCase()} near ${city.toLowerCase()}`,
      `best ${treatmentName.toLowerCase()} in ${city.toLowerCase()}`,
      `${treatmentName.toLowerCase()} ${state.toLowerCase() || ''}`.trim(),
      `${treatmentName.toLowerCase()} artists ${city.toLowerCase()}`,
      `${treatmentName.toLowerCase()} professionals ${city.toLowerCase()}`,
      `${treatmentName.toLowerCase()} cost ${city.toLowerCase()}`,
    ].filter(Boolean),
    openGraph: {
      title: `${treatmentName} in ${city} | Glamlink`,
      description,
      type: 'website',
      url: pageUrl,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: `${treatmentName} in ${city} - Glamlink`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${treatmentName} in ${city} | Glamlink`,
      description,
      images: [defaultImage],
    },
  };
}

// =============================================================================
// PAGE COMPONENT (Server Component)
// =============================================================================

export default async function TreatmentLocationPageRoute({ params }: Props) {
  const { treatment, location } = await params;

  // Validate the treatment slug
  if (!isValidTreatmentSlug(treatment)) {
    notFound();
  }

  // Validate location slug (must be at least 2 characters)
  if (!location || location.length < 2) {
    notFound();
  }

  // Fetch CMS page content server-side (returns null if not configured)
  // Try treatment+location specific, then treatment specific, then generic services config
  const pageConfig = await getServerPageContent(`services-${treatment}-${location}`) ||
    await getServerPageContent(`services-${treatment}`) ||
    await getServerPageContent('services');

  return (
    <TreatmentLocationWrapper
      pageType={`services-${treatment}-${location}`}
      treatmentSlug={treatment}
      locationSlug={location}
      initialData={pageConfig}
    />
  );
}
