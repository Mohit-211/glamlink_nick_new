'use client';

import { ClientWrapper } from '@/lib/features/display-cms/ClientWrapper';
import MagazineListingShare from "@/lib/pages/magazine/components/MagazineListingShare";
import type { PageConfig } from '@/lib/features/display-cms/types';
import type { MagazineIssueCard } from "@/lib/pages/magazine/types";

interface MagazinePageWrapperProps {
  pageType: string;
  initialData?: PageConfig | null;
  issues: MagazineIssueCard[];
  issuesByYear: Record<number, MagazineIssueCard[]>;
}

/**
 * MagazinePageWrapper - Client Component
 *
 * Wraps the magazine page with CMS content display while passing
 * server-fetched magazine issues to the listing section.
 */
export function MagazinePageWrapper({
  pageType,
  initialData,
  issues,
  issuesByYear
}: MagazinePageWrapperProps) {
  return (
    <ClientWrapper
      pageType={pageType}
      initialData={initialData}
      issues={issues}
      issuesByYear={issuesByYear}
      className="bg-gray-50"
    >
      {/* Share Button */}
      <MagazineListingShare />
    </ClientWrapper>
  );
}
