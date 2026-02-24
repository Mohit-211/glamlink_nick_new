'use client';

import { ClientWrapper } from '@/lib/features/display-cms/ClientWrapper';
import { ServicesPage } from '@/lib/pages/services';
import type { PageConfig } from '@/lib/features/display-cms/types';

interface ServicesPageWrapperProps {
  pageType: string;
  initialData?: PageConfig | null;
}

/**
 * ServicesPageWrapper - Client Component
 *
 * Wraps the services page with CMS content display support.
 * If CMS data exists, renders CMS sections above/below the services content.
 * If no CMS data, renders the services page directly.
 */
export function ServicesPageWrapper({
  pageType,
  initialData,
}: ServicesPageWrapperProps) {
  // If we have CMS data with sections, use ClientWrapper
  if (initialData && initialData.sections && initialData.sections.length > 0) {
    return (
      <ClientWrapper
        pageType={pageType}
        initialData={initialData}
        className="min-h-screen bg-white"
      >
        {/* ServicesPage renders as children after CMS sections */}
        <ServicesPage />
      </ClientWrapper>
    );
  }

  // No CMS data or empty sections - render ServicesPage directly
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

      {/* Main services content */}
      <ServicesPage />
    </div>
  );
}

export default ServicesPageWrapper;
