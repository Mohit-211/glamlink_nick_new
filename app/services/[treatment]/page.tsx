/**
 * Treatment Page Route - /services/[treatment]
 *
 * Treatment-specific page showing professionals, FAQs, and educational content.
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
} from '@/lib/pages/services';
import { TreatmentPageWrapper } from './TreatmentPageWrapper';

// =============================================================================
// ISR CONFIGURATION
// =============================================================================

// ISR with 60-second revalidation
export const dynamic = "force-dynamic";


// =============================================================================
// STATIC PARAMS - Pre-generate pages for all valid treatments
// =============================================================================

export async function generateStaticParams() {
  return VALID_TREATMENT_SLUGS.map((slug) => ({
    treatment: slug,
  }));
}

// =============================================================================
// METADATA
// =============================================================================

interface Props {
  params: Promise<{ treatment: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treatment } = await params;

  // Validate the slug
  if (!isValidTreatmentSlug(treatment)) {
    return {
      title: 'Treatment Not Found | Glamlink',
    };
  }

  const treatmentContent = getTreatmentContent(treatment);
  const treatmentName = treatmentContent?.name || getTreatmentName(treatment);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://glamlink.net');
  const pageUrl = `${baseUrl}/services/${treatment}`;
  const defaultImage = `${baseUrl}/images/treatments/${treatment}.jpg`;

  const description = treatmentContent?.shortDescription ||
    `Find verified ${treatmentName} professionals. See before & after photos, read reviews, and book with confidence.`;

  return {
    title: `${treatmentName} Artists | Find & Book Verified Pros | Glamlink`,
    description,
    keywords: [
      treatmentName.toLowerCase(),
      `${treatmentName.toLowerCase()} near me`,
      `${treatmentName.toLowerCase()} artists`,
      `${treatmentName.toLowerCase()} professionals`,
      `${treatmentName.toLowerCase()} cost`,
      `best ${treatmentName.toLowerCase()}`,
      'beauty professionals',
      'book beauty appointments',
    ],
    openGraph: {
      title: `${treatmentName} Artists | Glamlink`,
      description,
      type: 'website',
      url: pageUrl,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: `${treatmentName} - Glamlink`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${treatmentName} Artists | Glamlink`,
      description,
      images: [defaultImage],
    },
  };
}

// =============================================================================
// PAGE COMPONENT (Server Component)
// =============================================================================

export default async function TreatmentPageRoute({ params }: Props) {
  const { treatment } = await params;

  // Validate the treatment slug
  if (!isValidTreatmentSlug(treatment)) {
    notFound();
  }

  // Fetch CMS page content server-side (returns null if not configured)
  // Use treatment-specific page type or fall back to generic services config
  const pageConfig = await getServerPageContent(`services-${treatment}`) ||
    await getServerPageContent('services');

  return (
    <TreatmentPageWrapper
      pageType={`services-${treatment}`}
      treatmentSlug={treatment}
      initialData={pageConfig}
    />
  );
}
