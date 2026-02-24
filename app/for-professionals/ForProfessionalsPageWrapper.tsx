'use client';

import { ClientWrapper } from '@/lib/features/display-cms/ClientWrapper';
import type { PageConfig } from '@/lib/features/display-cms/types';

interface ForProfessionalsPageWrapperProps {
  pageType: string;
  initialData?: PageConfig | null;
}

/**
 * ForProfessionalsPageWrapper - Client Component
 *
 * Wraps the for-professionals page with CMS content display.
 * All sections are CMS-controlled.
 */
export function ForProfessionalsPageWrapper({
  pageType,
  initialData
}: ForProfessionalsPageWrapperProps) {
  return (
    <ClientWrapper
      pageType={pageType}
      initialData={initialData}
      className="min-h-screen bg-white overflow-x-hidden"
    />
  );
}
