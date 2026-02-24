/* ================= SHARED TYPES ================= */

export interface BusinessHour {
  day: string;
  open_time: string;
  close_time: string;
  closed?: boolean;
}

export interface Location {
  id: string;
  isOpen: boolean;
  label: string;
  location_type: "exact_address" | "city_only";
  address: string;
  city: string;
  area?: string;
  state: string;
  business_name: string;
  phone: string;
  description: string;
  isPrimary: boolean;
}

export interface GalleryMetaItem {
  id: string;
  caption: string;
  is_thumbnail: boolean;
  sort_order: number;
}

/* ================= MAIN FORM TYPE ================= */

export interface DigitalCardFormData {

  /* BASIC INFO */
  name: string;
  professional_title: string;
  business_name: string;
  profession?: string;
  email: string;
  phone: string;
  bio: string;

  profile_image?: File;       // single profile image
  images: File[];             // gallery images
  gallery_meta: GalleryMetaItem[];

  /* LOCATIONS */
  locations: Location[];
  business_hour: BusinessHour[];

  /* SERVICES */
  primary_specialty: string;
  specialties: string[];

  /* LINKS */
  custom_handle: string;
  website: string;
  social_media: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
  };

  /* BOOKING */
  preferred_booking_method: string;
  booking_link: string;
  important_info: string[];

  /* PROMOTION */
  offer_promotion: boolean;
  promotion_details: string;

  /* MARKETING */
  excites_about_glamlink: string[];
  biggest_pain_points: string[];

  elite_setup: boolean;
}

/* ================= SUBMISSION TYPE ================= */

export interface DigitalCardSubmission extends DigitalCardFormData {
  id: string;
  submittedAt: string;
  status: 'pending_review' | 'approved' | 'rejected';
  reviewed: boolean;
  metadata?: {
    userAgent: string;
    ip: string;
    source: string;
  };
}