import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import magazineServerService from '@/lib/services/firebase/magazineServerService';
import { getAuthenticatedAppForUser, getPublicFirebaseApp } from '@/lib/firebase/serverApp';
import { FEATURE_FLAGS } from '@/lib/config/features';

export default async function DigitalMagazinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check if authentication is required
  const requireAuth = FEATURE_FLAGS.REQUIRE_MAGAZINE_AUTH;

  // Get database instance
  const authResult = await getAuthenticatedAppForUser();
  const publicResult = await getPublicFirebaseApp();

  const db = authResult.db || publicResult.db;
  const currentUser = authResult.currentUser;

  // Redirect if auth required and not logged in
  if (requireAuth && (!currentUser || !db)) {
    redirect(`/profile/login?redirect=/magazine/${id}/digital&message=magazine`);
  }

  if (!db) {
    notFound();
  }

  // Fetch issue directly from Firebase (same as main magazine page)
  console.log('[DIGITAL PAGE] Looking for issue with ID:', id);
  let issue = await magazineServerService.getIssueByUrlId(db, id, false);

  if (!issue) {
    // Try with regular ID
    issue = await magazineServerService.getIssueById(db, id, false);
  }

  console.log('[DIGITAL PAGE] Issue found:', issue ? 'YES' : 'NO');
  console.log('[DIGITAL PAGE] publuuLink:', issue?.publuuLink);

  if (!issue) {
    notFound();
  }

  // Check if there's a Publuu link
  if (!issue.publuuLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Digital Version Available
          </h1>
          <p className="text-gray-600 mb-6">
            There is no digital magazine available for this issue yet. Please check back later or view the standard web version.
          </p>
          <div className="space-y-3">
            <Link
              href={`/magazine/${id}`}
              className="inline-flex items-center px-6 py-3 bg-glamlink-teal text-white rounded-full font-medium hover:bg-glamlink-teal-dark transition-colors"
            >
              ← View Standard Version
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render the Publuu iframe
  return (
    <div className="min-h-screen bg-black relative">
      {/* Header with back button */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="max-w-7xl mx-auto">
          {/* Desktop layout */}
          <div className="hidden sm:flex items-center justify-between">
            <Link
              href={`/magazine/${id}`}
              className="inline-flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <span className="font-medium">← Back to Magazine</span>
            </Link>
            <h1 className="text-white font-bold text-lg">
              {issue.title} - Digital Edition
            </h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>

          {/* Mobile layout - centered title only */}
          <div className="sm:hidden">
            <h1 className="text-white font-bold text-lg text-center">
              {issue.title} - Digital Edition
            </h1>
            <Link
              href={`/magazine/${id}`}
              className="absolute left-4 top-4 text-white hover:text-gray-200 transition-colors"
            >
              <span className="text-2xl">←</span>
              <span className="sr-only">Back to Magazine</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Publuu iframe container */}
      <div className="w-full h-screen pt-16">
        <iframe
          src={issue.publuuLink}
          width="100%"
          height="100%"
          scrolling="no"
          frameBorder="0"
          allow="clipboard-write; autoplay; fullscreen"
          allowFullScreen
          className="publuu-flip-book"
          title={`${issue.title} - Digital Magazine`}
        />
      </div>

      {/* Optional footer with issue info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            {issue.subtitle && <span>{issue.subtitle}</span>}
            {issue.issueDate && (
              <span className="ml-2">
                " {new Date(issue.issueDate).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}