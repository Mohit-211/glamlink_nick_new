import { DigitalCardFormData } from '../types';
import type { Professional, LocationData } from '@/lib/pages/for-professionals/types/professional';
import type { CondensedCardConfig } from '@/lib/features/digital-cards/types';
import { createFeatureDebug } from '@/lib/shared/utils/debug';

const debug = createFeatureDebug('Digital Card Preview');

const SAMPLE_PREVIEW_DATA = {
  name: 'Sophia Martinez',
  title: 'Master Hair Stylist & Colorist',
  specialty: 'Balayage & Color Specialist',
  businessName: 'Luxe Beauty Studio',
  bio: '<p>Award-winning stylist with 8+ years of experience specializing in balayage, lived-in color, and transformative hair makeovers. Known for creating personalized looks that enhance your natural beauty.</p>',
  phone: '(555) 123-4567',
  email: 'sophia@luxebeautystudio.com',
  instagram: '@sophiabeauty',
  website: 'luxebeautystudio.com',
  specialties: ['Balayage', 'Color Correction', 'Bridal Styling', 'Extensions'],
  businessHours: [
    'Monday: 10:00 AM - 7:00 PM',
    'Tuesday: 10:00 AM - 7:00 PM',
    'Wednesday: 10:00 AM - 7:00 PM',
    'Thursday: 10:00 AM - 8:00 PM',
    'Friday: 10:00 AM - 8:00 PM',
    'Saturday: 9:00 AM - 5:00 PM',
    'Sunday: Closed'
  ],
  importantInfo: ['Deposit required to secure booking'],
  gallery: [
    {
      id: 'sample-gallery-1',
      url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop',
      title: 'Stunning Balayage Transformation',
      caption: 'Natural sun-kissed highlights',
      type: 'image' as const,
    },
    {
      id: 'sample-gallery-2',
      url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
      title: 'Bridal Updo Masterpiece',
      caption: 'Elegant wedding day styling',
      type: 'image' as const,
    },
    {
      id: 'sample-gallery-3',
      url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=400&fit=crop',
      title: 'Color Correction Success',
      caption: 'From brassy to beautiful',
      type: 'image' as const,
    },
  ],
  location: {
    address: '123 Beauty Blvd, Suite 100, Los Angeles, CA 90001',
    businessName: 'Luxe Beauty Studio',
    isPrimary: true,
    id: 'sample-location',
    lat: 34.0522,
    lng: -118.2437
  },
  profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
};

const DEFAULT_CONDENSED_CARD_CONFIG: CondensedCardConfig = {
  dimensions: {
    preset: 'instagram-portrait',
    width: 1080,
    height: 1350,
  },
  sections: [
    {
      id: 'bio-content',
      sectionType: 'contentContainer',
      label: 'Header & Bio',
      visible: true,
      column: 'left',
      rowOrder: 0,
      position: { x: { value: 2, unit: '%' }, y: { value: 5, unit: '%' }, width: { value: 47, unit: '%' }, height: { value: 35, unit: '%' }, visible: true },
      props: { innerSectionType: 'headerAndBio' },
    },
    {
      id: 'map-hours',
      sectionType: 'mapAndContentContainer',
      label: 'Map & Hours',
      visible: true,
      column: 'right',
      rowOrder: 0,
      position: { x: { value: 51, unit: '%' }, y: { value: 5, unit: '%' }, width: { value: 47, unit: '%' }, height: { value: 35, unit: '%' }, visible: true },
      props: { mapHeight: 200 },
    },
    {
      id: 'specialties-content',
      sectionType: 'contentContainer',
      label: 'Specialties',
      visible: true,
      column: 'right',
      rowOrder: 1,
      position: { x: { value: 51, unit: '%' }, y: { value: 42, unit: '%' }, width: { value: 47, unit: '%' }, height: { value: 30, unit: '%' }, visible: true },
      props: { innerSectionType: 'specialties' },
    },
    {
      id: 'signature-work-content',
      sectionType: 'contentContainer',
      label: 'Signature Work',
      visible: true,
      column: 'left',
      rowOrder: 1,
      position: { x: { value: 2, unit: '%' }, y: { value: 42, unit: '%' }, width: { value: 47, unit: '%' }, height: { value: 30, unit: '%' }, visible: true },
      props: { innerSectionType: 'signature-work' },
    },
    {
      id: 'important-info-content',
      sectionType: 'contentContainer',
      label: 'Important Info',
      visible: true,
      column: 'left',
      rowOrder: 2,
      position: { x: { value: 2, unit: '%' }, y: { value: 74, unit: '%' }, width: { value: 96, unit: '%' }, height: { value: 20, unit: '%' }, visible: true },
      props: { innerSectionType: 'importantInfo' },
    },
  ],
  styles: {
    backgroundColor: '#ffffff',
    headerGradient: { from: '#14b8a6', to: '#0d9488', angle: 135 },
    padding: 16,
    borderRadius: 12,
  },
};

const DEFAULT_LOCATION: Partial<LocationData> = {
  address: 'Your Business Address',
  businessName: 'Your Business Location',
  isPrimary: true,
  id: 'default-location'
  // lat/lng intentionally omitted to prevent map display
};

function normalizeLocation(location: LocationData | Partial<LocationData>): LocationData {
  const normalized: any = { ...location };

  if (location.lat !== undefined && location.lat !== null) {
    const lat = typeof location.lat === 'number' ? location.lat : parseFloat(String(location.lat));
    if (!isNaN(lat) && lat !== 0) normalized.lat = lat;
  }

  if (location.lng !== undefined && location.lng !== null) {
    const lng = typeof location.lng === 'number' ? location.lng : parseFloat(String(location.lng));
    if (!isNaN(lng) && lng !== 0) normalized.lng = lng;
  }

  return normalized as LocationData;
}

/**
 * Convert BusinessHour[] to string[] for preview display
 */
function businessHoursToStrings(hours: DigitalCardFormData['business_hour']): string[] {
  return hours.map(h =>
    h.closed ? `${h.day}: Closed` : `${h.day}: ${h.open_time} - ${h.close_time}`
  );
}

/**
 * Check if the form has any meaningful user input
 */
function hasUserInput(formData: DigitalCardFormData): boolean {
  return !!(
    formData.name?.trim() ||
    formData.professional_title?.trim() ||    // ✅ was: title
    formData.email?.trim() ||
    formData.phone?.trim() ||
    formData.bio?.trim() ||
    formData.primary_specialty?.trim() ||     // ✅ was: specialty
    formData.profileImage ||
    (formData.locations && formData.locations.length > 0) ||
    (formData.specialties && formData.specialties.length > 0)
  );
}

/**
 * Transform DigitalCardFormData to Professional format for preview
 */
export function transformFormDataToProfessional(
  formData: DigitalCardFormData
): Partial<Professional> {
  const userHasInput = hasUserInput(formData);

  debug.group('transformFormDataToProfessional');
  debug.log('Form data received:', {
    name: formData.name,
    professional_title: formData.professional_title,
    email: formData.email,
    phone: formData.phone,
    hasProfileImage: !!formData.profileImage,
    locationsCount: formData.locations?.length || 0,
    specialtiesCount: formData.specialties?.length || 0,
  });
  debug.log('User has input:', userHasInput);

  // If form is empty, show sample data for an exciting preview
  if (!userHasInput) {
    debug.log('Using SAMPLE preview data (form is empty)');
    debug.groupEnd();
    return {
      id: 'preview',
      name: SAMPLE_PREVIEW_DATA.name,
      title: SAMPLE_PREVIEW_DATA.title,
      specialty: SAMPLE_PREVIEW_DATA.specialty,
      location: SAMPLE_PREVIEW_DATA.location.address,
      locationData: SAMPLE_PREVIEW_DATA.location as LocationData,
      locations: [SAMPLE_PREVIEW_DATA.location as LocationData],
      business_name: SAMPLE_PREVIEW_DATA.businessName,
      email: SAMPLE_PREVIEW_DATA.email,
      phone: SAMPLE_PREVIEW_DATA.phone,
      website: SAMPLE_PREVIEW_DATA.website,
      instagram: SAMPLE_PREVIEW_DATA.instagram,
      bio: SAMPLE_PREVIEW_DATA.bio,
      description: SAMPLE_PREVIEW_DATA.bio,
      specialties: SAMPLE_PREVIEW_DATA.specialties,
      certificationLevel: 'Silver' as const,
      yearsExperience: 8,
      hasDigitalCard: true,
      profileImage: SAMPLE_PREVIEW_DATA.profileImage,
      gallery: SAMPLE_PREVIEW_DATA.gallery,
      businessHours: SAMPLE_PREVIEW_DATA.businessHours,
      importantInfo: SAMPLE_PREVIEW_DATA.importantInfo,
      featured: false,
      isFounder: false,
      rating: 4.9,
      reviewCount: 127,
      services: SAMPLE_PREVIEW_DATA.specialties.map((specialty, index) => ({
        id: `service-${index}`,
        name: specialty,
        category: 'specialty',
        description: `Professional ${specialty} services`,
        price: 0,
        duration: '60',
        priceUnit: 'consultation' as const
      })),
      promotions: [],
      condensedCardConfig: DEFAULT_CONDENSED_CARD_CONFIG,
    };
  }

  // User has entered data — use their input with sensible defaults
  debug.log('Using USER data with defaults');

  const normalizedLocations = formData.locations && formData.locations.length > 0
    ? formData.locations.map(normalizeLocation)
    : [normalizeLocation(DEFAULT_LOCATION as LocationData)];

  const primaryLocation = normalizedLocations[0];

  // ✅ business_hour (BusinessHour[]) → string[] for preview
  const businessHoursStrings = formData.business_hour && formData.business_hour.length > 0
    ? businessHoursToStrings(formData.business_hour)
    : [
        'Monday: 9:00 AM - 6:00 PM',
        'Tuesday: 9:00 AM - 6:00 PM',
        'Wednesday: 9:00 AM - 6:00 PM',
        'Thursday: 9:00 AM - 6:00 PM',
        'Friday: 9:00 AM - 6:00 PM',
        'Saturday: 10:00 AM - 4:00 PM',
        'Sunday: Closed'
      ];

  const result: Partial<Professional> = {
    id: 'preview',
    name: formData.name || 'Your Name',
    title: formData.professional_title || 'Beauty Professional',        // ✅ was: title
    specialty: formData.primary_specialty || 'Your Specialty',          // ✅ was: specialty

    location: primaryLocation.address || 'Your Location',
    locationData: primaryLocation,
    locations: normalizedLocations,

    business_name: formData.business_name || undefined,                 // ✅ was: businessName

    email: formData.email || undefined,
    phone: formData.phone || undefined,
    website: formData.website || undefined,
    instagram: formData.social_media?.instagram || undefined,           // ✅ was: instagram (top-level)
    tiktok: formData.social_media?.tiktok || undefined,                 // ✅ was: tiktok (top-level)
    bookingUrl: formData.booking_link || undefined,                     // ✅ was: bookingUrl

    bio: formData.bio || 'Your professional bio will appear here...',
    description: formData.bio || undefined,

    specialties: formData.specialties && formData.specialties.length > 0
      ? formData.specialties
      : ['Your specialties will appear here'],

    certificationLevel: 'Silver' as const,
    yearsExperience: 5,
    hasDigitalCard: true,

    // ✅ profileImage: string | Blob | undefined → resolve to string for preview
    profileImage: formData.profileImage
      ? (formData.profileImage instanceof File || formData.profileImage instanceof Blob
          ? URL.createObjectURL(formData.profileImage)
          : formData.profileImage as string)
      : (formData.profile_image
          ? URL.createObjectURL(formData.profile_image)
          : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop'),

    // ✅ gallery → images (File[]) converted for preview; gallery_meta provides captions
    gallery: formData.images && formData.images.length > 0
      ? formData.images.map((file, index) => ({
          id: formData.gallery_meta[index]?.id || `gallery-${index}`,
          url: URL.createObjectURL(file),
          caption: formData.gallery_meta[index]?.caption || '',
          type: 'image' as const,
        }))
      : [],

    businessHours: businessHoursStrings,                                // ✅ was: businessHours (string[])
    importantInfo: formData.important_info && formData.important_info.length > 0
      ? formData.important_info                                         // ✅ was: importantInfo
      : undefined,

    featured: false,
    isFounder: false,
    rating: 4.8,
    reviewCount: 0,

    services: formData.specialties && formData.specialties.length > 0
      ? formData.specialties.map((specialty, index) => ({
          id: `service-${index}`,
          name: specialty.charAt(0).toUpperCase() + specialty.slice(1).replace(/-/g, ' '),
          category: 'specialty',
          description: `Professional ${specialty.replace(/-/g, ' ')} services`,
          price: 0,
          duration: '60',
          priceUnit: 'consultation' as const
        }))
      : [],

    promotions: [],
    condensedCardConfig: DEFAULT_CONDENSED_CARD_CONFIG,
  };

  debug.log('Transformed professional data:', {
    name: result.name,
    title: result.title,
    hasCondensedCardConfig: !!result.condensedCardConfig,
    sectionsCount: result.condensedCardConfig?.sections?.length || 0,
  });
  debug.groupEnd();

  return result;
}

/**
 * Clean up object URLs when component unmounts to prevent memory leaks
 */
export function cleanupObjectURLs(professional: Partial<Professional>) {
  if (professional.profileImage?.startsWith('blob:')) {
    URL.revokeObjectURL(professional.profileImage);
  }
  if (professional.gallery) {
    professional.gallery.forEach(item => {
      if (item.url?.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });
  }
}