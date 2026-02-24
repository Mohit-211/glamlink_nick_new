'use client';

/**
 * PreviewCardContent - Unified content layout for digital card preview
 *
 * Uses react-masonry-css for true masonry layout that fills gaps between sections.
 * Sections are placed to minimize whitespace.
 *
 * Section Order:
 * 1. HeaderAndBio
 * 2. InteractiveGallery (Signature Work)
 * 3. Map + Hours
 * 4. Specialties
 * 5. Important Info
 * 6. Promotions (if enabled)
 */

import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import type { Professional, Promotion, GalleryItem } from '@/lib/pages/for-professionals/types/professional';
import StyledSectionWrapper from './StyledSectionWrapper';
import EmptySectionState from './EmptySectionState';
import HeaderAndBio from '@/lib/features/digital-cards/components/condensed/sections/HeaderAndBio';
import { Specialties } from '@/lib/features/digital-cards/components/sections/content';
import { CurrentPromotions } from '@/lib/features/digital-cards/components/sections/promotions';
import { BusinessHours, MemoizedMapSection } from '@/lib/features/digital-cards/components/sections/contact';
import { VideoDisplay, GalleryThumbnail, ThumbnailWithPlayButton } from '@/lib/features/digital-cards/components/items/media';
import { normalizeLocations } from '@/lib/utils/migrations/locationMigration';

// =============================================================================
// TYPES
// =============================================================================

export interface SignatureWorkSettings {
  capturedVideoFrame?: number;
  showPlayButton?: boolean;
  displayFullWidth?: boolean;
  hideCaption?: boolean;
}

export interface PreviewCardContentProps {
  professional: Partial<Professional>;
  /** Settings for video thumbnail display in Signature Work section */
  signatureWorkSettings?: SignatureWorkSettings;
  /** Whether to show promotions section */
  showPromo?: boolean;
  /** Promotion details text (for form preview) */
  promotionDetails?: string;
  /** Important info items */
  importantInfo?: string[];
}

// =============================================================================
// INTERACTIVE GALLERY COMPONENT
// =============================================================================

interface InteractiveGalleryProps {
  gallery: GalleryItem[];
  onTitleChange: (title: string) => void;
  settings?: SignatureWorkSettings;
}

function InteractiveGallery({ gallery, onTitleChange, settings }: InteractiveGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const selectedItem = gallery[selectedIndex];
  const hasMultipleItems = gallery.length > 1;

  const capturedVideoFrame = settings?.capturedVideoFrame ?? 4;
  const showPlayButton = settings?.showPlayButton ?? true;
  const displayFullWidth = settings?.displayFullWidth ?? false;
  const hideCaption = settings?.hideCaption ?? true;

  useEffect(() => {
    setIsVideoPlaying(false);
  }, [selectedItem?.thumbnail, (selectedItem as any)?.thumbnailFrameTime]);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setIsVideoPlaying(false);
    const item = gallery[index];
    const newTitle = item.title || item.caption || 'Signature Work';
    onTitleChange(newTitle);
  };

  const handlePlayClick = () => {
    setIsVideoPlaying(true);
  };

  const isVideo = selectedItem?.type === 'video' ||
    (selectedItem?.url && (
      selectedItem.url.includes('youtube') ||
      selectedItem.url.includes('vimeo') ||
      selectedItem.url.endsWith('.mp4') ||
      selectedItem.url.endsWith('.webm')
    ));

  const imageUrl = selectedItem?.url || selectedItem?.src;

  return (
    <div className="interactive-gallery">
      <div className="main-display mb-3">
        {isVideo ? (
          isVideoPlaying ? (
            <VideoDisplay
              video={selectedItem}
              autoplay={true}
              controls={true}
              muted={false}
              loop={false}
              hideCaption={hideCaption}
            />
          ) : (
            <ThumbnailWithPlayButton
              item={selectedItem}
              hideCaption={hideCaption}
              capturedVideoFrame={capturedVideoFrame}
              displayFullWidth={displayFullWidth}
              onPlay={handlePlayClick}
            />
          )
        ) : (
          <div className={displayFullWidth ? "w-full" : "w-full flex justify-center"}>
            <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${displayFullWidth ? 'w-full' : 'max-h-[500px]'}`}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={selectedItem?.title || selectedItem?.caption || 'Gallery image'}
                  className={displayFullWidth ? "w-full h-auto object-cover" : "max-h-[500px] w-auto h-auto object-contain"}
                />
              ) : (
                <div className="flex items-center justify-center p-8 bg-gray-100">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {hasMultipleItems && (
        <div className="thumbnail-strip flex gap-2 overflow-x-auto pb-2 justify-center">
          {gallery.map((item, index) => (
            <GalleryThumbnail
              key={item.id || index}
              item={item}
              size={60}
              isActive={index === selectedIndex}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PreviewCardContent({
  professional,
  signatureWorkSettings,
  showPromo = false,
  promotionDetails,
  importantInfo,
}: PreviewCardContentProps) {
  // Dynamic title state for Signature Work section
  const [signatureWorkTitle, setSignatureWorkTitle] = useState('Signature Work');

  // Default App Store URL for QR code
  const DEFAULT_QR_URL = 'https://apps.apple.com/us/app/glamlink/id6502334118';

  // Get QR code settings from professional's condensedCardConfig sections
  const getQrCodeSettings = (): { url: string; enabled: boolean } => {
    const config = (professional as any)?.condensedCardConfig;

    if (config?.sections) {
      for (let i = 0; i < config.sections.length; i++) {
        const section = config.sections[i];
        if (section.sectionType === 'specialties' && section.props?.qrCodeUrl) {
          return {
            url: section.props.qrCodeUrl,
            enabled: section.props.displayQrCode !== false
          };
        }
        if (section.props?.innerSectionType === 'specialties' && section.props?.innerSectionProps?.qrCodeUrl) {
          return {
            url: section.props.innerSectionProps.qrCodeUrl,
            enabled: section.props.innerSectionProps.displayQrCode !== false
          };
        }
      }
    }
    return { url: DEFAULT_QR_URL, enabled: true };
  };

  const qrSettings = getQrCodeSettings();
  const qrCodeUrl = qrSettings.url;
  const qrCodeEnabled = qrSettings.enabled;

  // Get location data
  const locations = normalizeLocations(professional as Professional);

  // Check data availability
  const hasHeaderData = !!(professional.name || professional.bio || professional.profileImage);
  const hasLocationData = locations.some(loc =>
    loc.lat !== undefined &&
    loc.lng !== undefined &&
    loc.lat !== 0 &&
    loc.lng !== 0
  );
  const hasBusinessHours = !!(professional.businessHours && professional.businessHours.length > 0);
  const hasGalleryData = !!(professional.gallery && professional.gallery.length > 0);
  const hasSpecialties = !!(professional.specialties && professional.specialties.length > 0);
  const hasImportantInfo = !!(importantInfo && importantInfo.length > 0);

  // Build promotions array
  const promotions: Promotion[] = React.useMemo(() => {
    if (professional.promotions && professional.promotions.length > 0) {
      return professional.promotions;
    }
    if (showPromo && promotionDetails) {
      return [{
        id: 'form-promotion',
        title: promotionDetails,
        isActive: true,
        isFeatured: false,
      }];
    }
    return [];
  }, [professional.promotions, showPromo, promotionDetails]);

  const professionalWithPromos = React.useMemo(() => ({
    ...professional,
    promotions,
  }), [professional, promotions]);

  // Initialize title from first gallery item
  React.useEffect(() => {
    if (hasGalleryData && professional.gallery && professional.gallery.length > 0) {
      const firstItem = professional.gallery[0];
      const initialTitle = firstItem.title || firstItem.caption || 'Signature Work';
      setSignatureWorkTitle(initialTitle);
    }
  }, [hasGalleryData, professional.gallery]);

  // Masonry breakpoints: 2 columns on large screens, 1 on mobile
  const breakpointColumns = {
    default: 2,
    768: 1,  // 1 column on mobile/tablet
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="preview-card-masonry flex w-auto -ml-4"
      columnClassName="pl-4 bg-clip-padding"
    >
      {/* 1. Header & Bio Section */}
      <div className="mb-4">
        <StyledSectionWrapper
          title={professional.name ? `About ${professional.name}` : 'About'}
          titleAlignment="left"
        >
          {hasHeaderData ? (
            <HeaderAndBio
              professional={professional as Professional}
              section={{
                id: 'header-bio',
                sectionType: 'headerAndBio',
                label: 'Header & Bio',
                visible: true,
                position: { x: { value: 0, unit: '%' }, y: { value: 0, unit: '%' }, width: { value: 100, unit: '%' }, height: { value: 100, unit: '%' }, visible: true },
                props: {
                  bioItalic: true,
                  showVerifiedBadge: true,
                  imageSize: 70,
                  nameFontSize: '1.1rem',
                  titleFontSize: '0.9rem',
                  bioFontSize: '0.8rem',
                },
              }}
            />
          ) : (
            <EmptySectionState
              message="Your name and bio will appear here"
              icon="profile"
            />
          )}
        </StyledSectionWrapper>
      </div>

      {/* 2. Map & Hours Section */}
      <div className="mb-4">
        <div
          className="rounded-xl p-4"
          style={{ background: 'linear-gradient(135deg, #ffffff, #c3cfe2)' }}
        >
          {hasLocationData ? (
            <MemoizedMapSection
              professional={professional as Professional}
              height="220px"
              showAddressOverlay={true}
            />
          ) : (
            <EmptySectionState
              message="Add your business location"
              icon="map"
            />
          )}

          <div className="flex items-center gap-3 mb-3 mt-3">
            <div className="flex-1 min-w-[20px] h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }} className="whitespace-nowrap px-2">
              Hours
            </h3>
            <div className="flex-1 min-w-[20px] h-px bg-gradient-to-l from-transparent via-gray-300 to-gray-300" />
          </div>

          <div className="bg-white rounded-lg p-3">
            {hasBusinessHours ? (
              <BusinessHours
                professional={professional as Professional}
                section={{
                  id: 'business-hours',
                  sectionType: 'business-hours',
                  label: 'Business Hours',
                  visible: true,
                  position: { x: { value: 0, unit: '%' }, y: { value: 0, unit: '%' }, width: { value: 100, unit: '%' }, height: { value: 100, unit: '%' }, visible: true },
                  props: {
                    hideTitle: true,
                    listFormat: true,
                  },
                }}
              />
            ) : (
              <EmptySectionState
                message="Add your business hours"
                icon="list"
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Signature Work Section (Gallery) */}
      <div className="mb-4">
        <StyledSectionWrapper
          title={signatureWorkTitle}
          titleAlignment="center-with-lines"
        >
          {hasGalleryData && professional.gallery ? (
            <InteractiveGallery
              gallery={professional.gallery}
              onTitleChange={setSignatureWorkTitle}
              settings={signatureWorkSettings}
            />
          ) : (
            <EmptySectionState
              message="Add photos or videos to showcase your work"
              icon="video"
            />
          )}
        </StyledSectionWrapper>
      </div>

      {/* 4. Specialties Section */}
      <div className="mb-4">
        <StyledSectionWrapper
          title="Specialties"
          titleAlignment="center-with-lines"
        >
          {hasSpecialties ? (
            <Specialties
              professional={professional as Professional}
              section={{
                id: 'specialties',
                sectionType: 'specialties',
                label: 'Specialties',
                visible: true,
                position: { x: { value: 0, unit: '%' }, y: { value: 0, unit: '%' }, width: { value: 100, unit: '%' }, height: { value: 100, unit: '%' }, visible: true },
                props: {
                  hideTitle: true,
                  listFormat: true,
                  maxItems: 5,
                  displayQrCode: qrCodeEnabled,
                  qrCodeUrl: qrCodeUrl,
                },
              }}
            />
          ) : (
            <EmptySectionState
              message="Add your specialties"
              icon="list"
            />
          )}
        </StyledSectionWrapper>
      </div>

      {/* 5. Important Info Section */}
      {hasImportantInfo && (
        <div className="mb-4">
          <StyledSectionWrapper
            title="Important Info"
            titleAlignment="center-with-lines"
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: '1 1 0%' }}>
                {importantInfo!.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-700"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: index > 0 ? '8px' : 0, lineHeight: 1.5 }}
                  >
                    <span
                      className="bg-glamlink-teal flex-shrink-0"
                      style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgb(34, 184, 200)', flexShrink: 0, marginTop: '6px' }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </StyledSectionWrapper>
        </div>
      )}

      {/* 6. Promotions Section (only if showPromo is true) */}
      {showPromo && (
        <div className="mb-4">
          <StyledSectionWrapper
            title="Promos"
            titleAlignment="center-with-lines"
          >
            <CurrentPromotions
              professional={professionalWithPromos as Professional}
              section={{
                id: 'promotions',
                sectionType: 'current-promotions',
                label: 'Promotions',
                visible: true,
                position: { x: { value: 0, unit: '%' }, y: { value: 0, unit: '%' }, width: { value: 100, unit: '%' }, height: { value: 100, unit: '%' }, visible: true },
                props: {
                  hideTitle: true,
                  listFormat: true,
                  onlyDisplayTitle: true,
                },
              }}
            />
          </StyledSectionWrapper>
        </div>
      )}
    </Masonry>
  );
}
