'use client';

import { useState, useCallback } from 'react';
import { ClientWrapper } from '@/lib/features/display-cms/ClientWrapper';
import type { PageConfig } from '@/lib/features/display-cms/types';
import type { PromoItem } from "@/lib/features/promos/config";

interface PromosPageWrapperProps {
  pageType: string;
  initialData?: PageConfig | null;
  promos: PromoItem[];
  featuredPromos: PromoItem[];
}

/**
 * PromosPageWrapper - Client Component
 *
 * Wraps the promos page with CMS content display while passing
 * server-fetched promos to the listing section.
 */
export function PromosPageWrapper({
  pageType,
  initialData,
  promos,
  featuredPromos
}: PromosPageWrapperProps) {
  // Modal state for promo details
  const [selectedPromo, setSelectedPromo] = useState<PromoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle promo card click
  const handlePromoClick = useCallback((promo: PromoItem) => {
    console.log('Promo clicked:', promo.title);
    setSelectedPromo(promo);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPromo(null);
  }, []);

  // Handle CTA click
  const handleCtaClick = useCallback((promo: PromoItem) => {
    console.log('CTA clicked for promo:', promo.title);
    if (promo.link) {
      window.open(promo.link, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return (
    <ClientWrapper
      pageType={pageType}
      initialData={initialData}
      promos={promos}
      featuredPromos={featuredPromos}
      selectedPromo={selectedPromo}
      isPromoModalOpen={isModalOpen}
      onPromoClick={handlePromoClick}
      onPromoModalClose={handleModalClose}
      onPromoCta={handleCtaClick}
      className="min-h-screen bg-gray-50"
    />
  );
}
