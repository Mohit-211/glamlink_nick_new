import promosListingService from "@/lib/features/promos/server/promosListingService";
import promosServerService from "@/lib/features/promos/server/promosServerService";
import { mockPromos } from "@/lib/features/promos/mockData";
import { redirect } from "next/navigation";
import { getAuthenticatedAppForUser, getPublicFirebaseApp } from "@/lib/firebase/serverApp";
import { FEATURE_FLAGS } from "@/lib/config/features";
import { getServerPageContent } from '@/lib/features/display-cms/utils/dataFetching.server';
import { PromosPageWrapper } from './PromosPageWrapper';

// ISR with 60-second revalidation for all environments
export const dynamic = "force-dynamic";


/**
 * Promos Page - Server Component
 *
 * Implements environment-aware rendering with ISR for promos.
 * Uses CMS for hero and static content, server-fetched data for promos.
 */
export default async function PromosPage() {
  const requireAuth = FEATURE_FLAGS.REQUIRE_PROMOS_AUTH;
  const { currentUser } = requireAuth ? await getAuthenticatedAppForUser() : await getPublicFirebaseApp();
  const { db: authedDb } = await getAuthenticatedAppForUser();
  if (requireAuth && !currentUser) {
    redirect("/profile/login?redirect=/promos&message=promos");
  }

  let promos: any[] = [];
  let featuredPromos: any[] = [];
  let error: string | null = null;

  try {
    console.log("Server: Fetching promos data...");
    const DISABLE_AUTO_SEEDING = true;
    if (!DISABLE_AUTO_SEEDING && authedDb) {
      console.log("Server: Auto-seeding enabled, checking database...");

      try {
        // Check if promos already exist
        const hasExistingPromos = await promosServerService.hasPromos(authedDb);
        if (!hasExistingPromos) {
          console.log("Server: Database empty, seeding promos...");

          // Seed mock promos using bulk upload
          const result = await promosServerService.bulkUploadPromos(authedDb, mockPromos);
          console.log(`Server: Seeded ${result.success} promos, ${result.failed} failed`);
        } else {
          console.log("Server: Database already has promos, skipping seeding");
        }
      } catch (seedError) {
        console.error("Server: Error seeding promos:", seedError);
      }
    }

    promos = await promosListingService.getPublicPromos();
    featuredPromos = await promosListingService.getFeaturedPromos();
    console.log(`Server: Loaded ${promos.length} promos, ${featuredPromos.length} featured`);

  } catch (err) {
    console.error("Server: Error fetching promos:", err);
    error = "Failed to load promotions. Please try again later.";
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch CMS page content server-side
  const pageConfig = await getServerPageContent('promos');

  return (
    <PromosPageWrapper
      pageType="promos"
      initialData={pageConfig}
      promos={promos}
      featuredPromos={featuredPromos}
    />
  );
}

// Generate metadata for the page
export async function generateMetadata() {
  // Get base URL for absolute URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://glamlink.net');
  const pageUrl = `${baseUrl}/promos`;
  const defaultImage = `${baseUrl}/images/glamlink-promos-cover.jpg`;

  return {
    title: "Featured Beauty Promotions - Glamlink",
    description: "Discover amazing deals and exclusive featured offers from top beauty brands. Limited time promotions on skincare, makeup, hair care, and more!",
    openGraph: {
      title: "Featured Beauty Promotions - Glamlink",
      description: "Discover amazing deals and exclusive featured offers from top beauty brands",
      type: "website",
      url: pageUrl,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: "Featured Beauty Promotions - Glamlink",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Featured Beauty Promotions - Glamlink",
      description: "Discover amazing deals and exclusive featured offers from top beauty brands",
      images: [defaultImage],
    },
    other: {
      'pinterest:description': "Discover amazing deals and exclusive featured offers from top beauty brands on Glamlink",
    },
  };
}