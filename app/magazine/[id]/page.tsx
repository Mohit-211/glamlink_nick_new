import { notFound, redirect } from 'next/navigation';
import magazineServerService from '@/lib/services/firebase/magazineServerService';
import { IssueViewer } from '@/lib/pages/magazine';
import { getAuthenticatedAppForUser, getPublicFirebaseApp } from '@/lib/firebase/serverApp';
import { FEATURE_FLAGS } from '@/lib/config/features';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Email addresses with magazine preview permissions.
 * These users can access issues marked as "visible for preview" even when not publicly visible.
 */
const MAGAZINE_ALLOWED_EMAILS = [
  'mohit@blockcod.com',
  'melanie@glamlink.net',
  'admin@glamlink.com'
];

interface MagazineIssuePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MagazineIssue({ params, searchParams }: MagazineIssuePageProps) {
  const { id } = await params;
  const searchParamsValue = await searchParams;
  
  // Check if authentication is required based on feature flag
  const requireAuth = FEATURE_FLAGS.REQUIRE_MAGAZINE_AUTH;
  
  // ALWAYS try to get authenticated user first (for preview access checking)
  // But only enforce authentication if requireAuth is true
  const authResult = await getAuthenticatedAppForUser();
  const publicResult = await getPublicFirebaseApp();
  
  // Use authenticated db if available, otherwise use public
  const db = authResult.db || publicResult.db;
  const currentUser = authResult.currentUser; // This will have the user email if logged in
  
  // Only redirect if auth is REQUIRED and user is not logged in
  if (requireAuth && (!currentUser || !db)) {
    // Redirect to login with message and the specific magazine issue URL
    redirect(`/profile/login?redirect=/magazine/${id}&message=magazine`);
  }
  
  // Check if we have a db instance (either authenticated or public)
  if (!db) {
    notFound();
  }
  
  // First try to find by urlId, then fall back to regular id
  // Don't check visibility yet - we'll do it manually
  console.log('[Magazine Page] Looking for issue with ID:', id);
  let issue = await magazineServerService.getIssueByUrlId(db, id, false);
  
  if (!issue) {
    console.log('[Magazine Page] Not found by urlId, trying regular ID...');
    // Try regular id as fallback
    issue = await magazineServerService.getIssueById(db, id, false);
  }

  if (!issue) {
    console.log('[Magazine Page] Issue not found in database - showing 404');
    notFound();
  }
  
  console.log('[Magazine Page] Found issue:', {
    id: issue.id,
    title: issue.title,
    visible: issue.visible,
    visibleForPreview: issue.visibleForPreview
  });

  // Now check visibility and preview permissions
  const isPubliclyVisible = issue.visible !== false;
  const isPreviewMode = issue.visibleForPreview === true && issue.visible === false;
  
  console.log('[Magazine Page] Issue ID:', issue.id);
  console.log('[Magazine Page] Issue visible:', issue.visible);
  console.log('[Magazine Page] Issue visibleForPreview:', issue.visibleForPreview);
  console.log('[Magazine Page] Is publicly visible:', isPubliclyVisible);
  console.log('[Magazine Page] Is preview mode:', isPreviewMode);
  console.log('[Magazine Page] Current user email:', currentUser?.email);
  
  // If the issue is not publicly visible
  if (!isPubliclyVisible) {
    console.log('[Magazine Page] Issue is NOT publicly visible, checking preview permissions...');
    
    // Check if it's in preview mode
    if (isPreviewMode) {
      console.log('[Magazine Page] Issue is in preview mode, checking user access...');
      
      // Check if user is authenticated and has preview access
      if (!currentUser || !MAGAZINE_ALLOWED_EMAILS.includes(currentUser.email || '')) {
        console.log('[Magazine Page] User does NOT have preview access - showing 404');
        console.log('[Magazine Page] User email:', currentUser?.email);
        console.log('[Magazine Page] Is email in allowed list:', currentUser?.email ? MAGAZINE_ALLOWED_EMAILS.includes(currentUser.email) : false);
        // User doesn't have preview access
        notFound();
      }
      console.log('[Magazine Page] User HAS preview access - showing page');
      // User has preview access, continue to show the page
    } else {
      console.log('[Magazine Page] Issue is hidden and NOT in preview mode - showing 404');
      // Issue is hidden and not in preview mode
      notFound();
    }
  } else {
    console.log('[Magazine Page] Issue is publicly visible - showing page');
  }

  // No more page parameter redirect logic - handled by ?pid param in MagazineNewViewer

  return (
    <div className="overflow-x-hidden">
      <IssueViewer issue={issue} />
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: MagazineIssuePageProps) {
  const { id } = await params;
  
  // Get authenticated db instance for metadata generation
  const { db } = await getAuthenticatedAppForUser();
  
  // If no db, we can't fetch the issue
  if (!db) {
    return {
      title: 'Magazine Issue - Glamlink',
      description: 'Please log in to view this magazine issue',
    };
  }
  
  // Try to find by urlId first
  // Note: For metadata generation, we don't check visibility to avoid 404 on hidden pages
  // This allows proper metadata even if the page itself will 404
  let issue = await magazineServerService.getIssueByUrlId(db, id, false);
  
  if (!issue) {
    // Try regular id as fallback
    issue = await magazineServerService.getIssueById(db, id, false);
  }

  if (!issue) {
    return {
      title: 'Issue Not Found - The Glamlink Edit',
    };
  }

  console.log('issue description image:', issue.descriptionImage);

  // Helper function to extract URL from image object or string
  const getImageUrl = (image: any): string => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.originalUrl || '';
  };
    
  // Determine which cover image to use - prioritize descriptionImage, then based on useCoverBackground setting
  const coverImageUrl = getImageUrl(issue.descriptionImage)
    ? getImageUrl(issue.descriptionImage)
    : issue.useCoverBackground && getImageUrl(issue.coverBackgroundImage)
      ? getImageUrl(issue.coverBackgroundImage)
      : getImageUrl(issue.coverImage);

  // Get base URL for absolute URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://glamlink.net');
  const pageUrl = `${baseUrl}/magazine/${issue.urlId || id}`;
  
  // Ensure image URL is absolute
  const absoluteImageUrl = coverImageUrl.startsWith('http') 
    ? coverImageUrl 
    : `${baseUrl}${coverImageUrl}`;

  return {
    title: `${issue.title} - Issue #${issue.issueNumber} | The Glamlink Edit`,
    description: issue.description,
    openGraph: {
      title: `${issue.title} - The Glamlink Edit`,
      description: issue.description,
      type: 'article',
      url: pageUrl,
      publishedTime: issue.issueDate,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 1600,
          alt: issue.coverImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${issue.title} - The Glamlink Edit`,
      description: issue.description,
      images: [absoluteImageUrl],
    },
    other: {
      'pinterest:description': issue.description,
    },
  };
}

// Note: We don't use generateStaticParams here since this is a dynamic, authenticated page
// The 'force-dynamic' export ensures the page is always rendered server-side with fresh data