'use client';

import { useState } from 'react';
import { ClientWrapper } from '@/lib/features/display-cms/ClientWrapper';
import UserDownloadDialog from '@/lib/components/modals/UserDownloadDialog';
import type { PageConfig } from '@/lib/features/display-cms/types';

interface HomePageWrapperProps {
  pageType: string;
  initialData?: PageConfig | null;
}

/**
 * HomePageWrapper - Client Component
 *
 * Wraps ClientWrapper with download dialog functionality for the homepage.
 * This is a client component to manage the download dialog state.
 */
export function HomePageWrapper({ pageType, initialData }: HomePageWrapperProps) {
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  return (
    <ClientWrapper
      pageType={pageType}
      initialData={initialData}
      onCtaClick={() => setShowDownloadDialog(true)}
    >
      <UserDownloadDialog
        isOpen={showDownloadDialog}
        onClose={() => setShowDownloadDialog(true)}
      />
    </ClientWrapper>
  );
}
