import magazineListingService from "@/lib/pages/magazine/server/magazineListingService";
import { redirect } from "next/navigation";
import { getAuthenticatedAppForUser, getPublicFirebaseApp } from "@/lib/firebase/serverApp";
import { FEATURE_FLAGS } from "@/lib/config/features";
import { getServerPageContent } from '@/lib/features/display-cms/utils/dataFetching.server';
import { MagazinePageWrapper } from './MagazinePageWrapper';

// ISR with 60-second revalidation for all environments
export const dynamic = "force-dynamic";


/**
 * Magazine Listing Page - Server Component
 *
 * Implements environment-aware rendering with ISR for magazine issues.
 * Uses CMS for hero and static content, server-fetched data for magazine issues.
 */
export default async function MagazineListingPage() {
  // Check if authentication is required based on feature flag
  const requireAuth = FEATURE_FLAGS.REQUIRE_MAGAZINE_AUTH;

  // Get Firebase instance based on auth requirement
  const { currentUser } = requireAuth ? await getAuthenticatedAppForUser() : await getPublicFirebaseApp();

  // Only redirect if auth is required and user is not logged in
  if (requireAuth && !currentUser) {
    // Redirect to login with message
    redirect("/profile/login?redirect=/magazine&message=magazine");
  }

  // Fetch magazine issues directly from Firebase on the server
  const issues = await magazineListingService.getPublicIssues();

  // Sort issues by date (newest first)
  const sortedIssues = [...issues].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

  // Group issues by year
  const issuesByYear = sortedIssues.reduce((acc, issue) => {
    const year = new Date(issue.issueDate).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(issue);
    return acc;
  }, {} as Record<number, typeof issues>);

  // Fetch CMS page content server-side
  const pageConfig = await getServerPageContent('magazine');

  return (
    <MagazinePageWrapper
      pageType="magazine"
      initialData={pageConfig}
      issues={sortedIssues}
      issuesByYear={issuesByYear}
    />
  );
}

// Generate metadata for the page
export async function generateMetadata() {
  // Get base URL for absolute URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://glamlink.net");
  const pageUrl = `${baseUrl}/magazine`;
  const defaultImage = `${baseUrl}/images/glamlink-magazine-cover.jpg`;

  return {
    title: "The Glamlink Edit - Magazine",
    description: "Explore The Glamlink Edit for the latest beauty trends, expert insights, and industry innovations delivered weekly.",
    openGraph: {
      title: "The Glamlink Edit",
      description: "Your weekly source for beauty trends, expert insights, and industry innovations",
      type: "website",
      url: pageUrl,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: "The Glamlink Edit Magazine",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "The Glamlink Edit",
      description: "Your weekly source for beauty trends, expert insights, and industry innovations",
      images: [defaultImage],
    },
    other: {
      "pinterest:description": "Explore The Glamlink Edit for the latest beauty trends and expert insights",
    },
  };
}
