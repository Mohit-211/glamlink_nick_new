'use client';

import React, { useMemo } from 'react';
import type { Professional } from '@/lib/pages/for-professionals/types/professional';
import GlamlinkIdLogo from './components/GlamlinkIdLogo';
import { PreviewRowBasedLayout } from './components/columns';
import PreviewBookingButton from './components/PreviewBookingButton';
import FooterSection from '@/lib/features/digital-cards/components/condensed/sections/FooterSection';
import { useAppSelector } from '@/store/hooks';
import { selectSections } from '@/lib/features/digital-cards/store';

export interface StyledDigitalCardPreviewProps {
  professional: Partial<Professional>;
  showPromoSection?: boolean;
  promotionDetails?: string;
  // bookingMethod?: 'text-to-book' | 'booking-link' | 'send-text' | 'instagram';
  bookingMethod?: 'text-to-book' | 'booking-link' | 'send-text' | 'instagram';
  importantInfo?: string[];
}

export default function StyledDigitalCardPreview({
  professional,
  showPromoSection: showPromoSectionProp,
  promotionDetails: promotionDetailsProp,
  bookingMethod,
  importantInfo: importantInfoProp,
}: StyledDigitalCardPreviewProps) {
  const reduxSections = useAppSelector(selectSections);

  const transformedProfessional = useMemo<Partial<Professional>>(() => {
    const base: Partial<Professional> = {
      id: professional.id ?? 'preview',
      name: professional.name ?? '',
      title: professional.title ?? '',
      specialty: professional.specialty ?? '',
      location: professional.location ?? professional.locationData?.address ?? '',
      certificationLevel: professional.certificationLevel,
      yearsExperience: professional.yearsExperience,

      profileImage: professional.profileImage,
      portraitImage: professional.portraitImage,
      image: professional.image,

      bio: professional.bio ?? '',
      description: professional.description,

      services: professional.services ?? [],
      specialties: professional.specialties ?? [],

      email: professional.email,
      phone: professional.phone,
      website: professional.website,
      instagram: professional.instagram,
      tiktok: professional.tiktok,
      bookingUrl: professional.bookingUrl,

      rating: professional.rating,
      reviewCount: professional.reviewCount,

      business_name: professional.business_name,
      gallery: professional.gallery,
      locationData: professional.locationData,
      locations: professional.locations,
      promotions: professional.promotions,
      businessHours: professional.businessHours,
      tags: professional.tags,

      sectionsConfig: professional.sectionsConfig,
      importantInfo: professional.importantInfo,
      condensedCardConfig: professional.condensedCardConfig,
    };

    // Override sections with Redux if available
    if (reduxSections.length > 0 && base.condensedCardConfig) {
      base.condensedCardConfig = {
        ...base.condensedCardConfig,
        sections: reduxSections,
      };
    }

    return base;
  }, [professional, reduxSections]);

  // Promotions
  const hasActivePromotions = !!(
    transformedProfessional.promotions?.length &&
    transformedProfessional.promotions.some((p) => p?.isActive)
  );
  const showPromoSection = showPromoSectionProp ?? hasActivePromotions;

  // Important info
  const importantInfo = importantInfoProp ?? transformedProfessional.importantInfo;
  const promotionDetails = promotionDetailsProp;

  // Social links
  const hasSocialLinks = !!(
    transformedProfessional.instagram ||
    transformedProfessional.tiktok ||
    transformedProfessional.website
  );

  // Booking info
  const hasBookingInfo = !!(
    (bookingMethod === 'text-to-book' && transformedProfessional.phone) ||
    (bookingMethod === 'send-text' && transformedProfessional.phone) ||
    (bookingMethod === 'booking-link' && transformedProfessional.bookingUrl) ||
    (bookingMethod === 'instagram' && transformedProfessional.instagram)
  );

  return (
    <div className="styled-digital-business-card bg-gray-50 p-3">
      <div className="bg-white overflow-hidden">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '4px solid #14b8a6',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e5e7eb 100%)',
          }}
        >
          <div className="p-4">
            <GlamlinkIdLogo height={60} />

            <div
              className="mt-4 bg-white rounded-xl p-4"
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
            >
              <PreviewRowBasedLayout
                professional={transformedProfessional}
                condensedCardConfig={transformedProfessional.condensedCardConfig}
                showPromo={showPromoSection}
                promotionDetails={promotionDetails}
                importantInfo={importantInfo}
              />

              {hasBookingInfo && (
                <div className="mt-4">
                  <PreviewBookingButton
                    professional={transformedProfessional}
                    bookingMethod={bookingMethod}
                  />
                </div>
              )}
            </div>

            {hasSocialLinks && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <FooterSection professional={transformedProfessional as Professional} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}