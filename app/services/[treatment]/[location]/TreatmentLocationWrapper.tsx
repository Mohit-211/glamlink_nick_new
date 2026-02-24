'use client';

import { ClientWrapper } from '@/lib/features/display-cms/ClientWrapper';
import { TreatmentLocationPage } from '@/lib/pages/services';
import type { PageConfig } from '@/lib/features/display-cms/types';

interface TreatmentLocationWrapperProps {
  pageType: string;
  treatmentSlug: string;
  locationSlug: string;
  initialData?: PageConfig | null;
}

/**
 * TreatmentLocationWrapper - Client Component
 *
 * Wraps the treatment location page with CMS content display support.
 * If CMS data exists, renders CMS sections above/below the treatment content.
 * If no CMS data, renders the treatment location page directly.
 */
export function TreatmentLocationWrapper({
  pageType,
  treatmentSlug,
  locationSlug,
  initialData,
}: TreatmentLocationWrapperProps) {
  // If we have CMS data with sections, use ClientWrapper
  if (initialData && initialData.sections && initialData.sections.length > 0) {
    return (
      <ClientWrapper
        pageType={pageType}
        initialData={initialData}
        className="min-h-screen bg-white"
      >
        {/* TreatmentLocationPage renders as children after CMS sections */}
        <TreatmentLocationPage treatmentSlug={treatmentSlug} locationSlug={locationSlug} />
      </ClientWrapper>
    );
  }

  // No CMS data or empty sections - render TreatmentLocationPage directly
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

      {/* Main treatment location content */}
      <TreatmentLocationPage treatmentSlug={treatmentSlug} locationSlug={locationSlug} />
    </div>
  );
}

export default TreatmentLocationWrapper;
