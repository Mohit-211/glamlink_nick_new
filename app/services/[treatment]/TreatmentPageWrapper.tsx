'use client';

import { ClientWrapper } from '@/lib/features/display-cms/ClientWrapper';
import { TreatmentPage } from '@/lib/pages/services';
import type { PageConfig } from '@/lib/features/display-cms/types';

interface TreatmentPageWrapperProps {
  pageType: string;
  treatmentSlug: string;
  initialData?: PageConfig | null;
}

/**
 * TreatmentPageWrapper - Client Component
 *
 * Wraps the treatment page with CMS content display support.
 * If CMS data exists, renders CMS sections above/below the treatment content.
 * If no CMS data, renders the treatment page directly.
 */
export function TreatmentPageWrapper({
  pageType,
  treatmentSlug,
  initialData,
}: TreatmentPageWrapperProps) {
  // If we have CMS data with sections, use ClientWrapper
  if (initialData && initialData.sections && initialData.sections.length > 0) {
    return (
      <ClientWrapper
        pageType={pageType}
        initialData={initialData}
        className="min-h-screen bg-white"
      >
        {/* TreatmentPage renders as children after CMS sections */}
        <TreatmentPage treatmentSlug={treatmentSlug} />
      </ClientWrapper>
    );
  }

  // No CMS data or empty sections - render TreatmentPage directly
  // This allows the page to work without requiring CMS configuration
  return (
    <div className="min-h-screen bg-white">
      {/* Optional: Render banner if CMS data has it */}
      {initialData?.banner?.enabled && (
        <div
          className="py-3 px-4 text-center text-sm font-medium"
          style={{
            backgroundColor: initialData.banner.backgroundColor || '#24bbcb',
            color: initialData.banner.textColor || '#ffffff'
          }}
        >
          {initialData.banner.link ? (
            <a
              href={initialData.banner.link}
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {initialData.banner.message}
            </a>
          ) : (
            <span>{initialData.banner.message}</span>
          )}
        </div>
      )}

      {/* Main treatment content */}
      <TreatmentPage treatmentSlug={treatmentSlug} />
    </div>
  );
}

export default TreatmentPageWrapper;
