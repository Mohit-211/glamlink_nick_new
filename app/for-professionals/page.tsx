import { getServerPageContent } from '@/lib/features/display-cms/utils/dataFetching.server';
import { getPageMetadata } from "@/lib/data/metadata";
import { ForProfessionalsPageWrapper } from './ForProfessionalsPageWrapper';

export const metadata = getPageMetadata("for-professionals");

// ISR with 60-second revalidation for all environments
export const dynamic = "force-dynamic";


/**
 * For Professionals Page - Server Component
 *
 * Showcases beauty professionals and encourages new pros to join.
 * Uses CMS for all section content.
 */
export default async function ForProfessionalsPage() {
  // Fetch CMS page content server-side
  const pageConfig = await getServerPageContent('for-professionals');

  return (
    <ForProfessionalsPageWrapper
      pageType="for-professionals"
      initialData={pageConfig}
    />
  );
}