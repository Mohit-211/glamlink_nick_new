'use client';

import { useState } from 'react';
import type { DigitalCardFormData, Location, BusinessHour } from '../types';

interface DigitalCardFormProps {
  isLoading?: boolean;
}

export default function DigitalCardForm({ isLoading = false }: DigitalCardFormProps) {
 const [formData, setFormData] = useState<DigitalCardFormData>({
  name: '',
  professional_title: '',
  business_name: '',
  profession: '',
  email: '',
  phone: '',
  bio: '',
  profileImage: undefined, // ✅ add this
  profile_image: undefined, // keep if you use for file input
  images: [],
  gallery_meta: [],
  locations: [],
  business_hour: [],
  primary_specialty: '',
  specialties: [],
  custom_handle: '',
  website: '',
  social_media: {
    instagram: '',
    tiktok: '',
    facebook: '',
    youtube: '',
  },
  preferred_booking_method: '',
  booking_link: '',
  important_info: [],
  offer_promotion: false,
  promotion_details: '',
  excites_about_glamlink: [],
  biggest_pain_points: [],
  elite_setup: false,
});

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= FIELD HANDLERS ================= */

  const handleChange = <K extends keyof DigitalCardFormData>(
    key: K,
    value: DigitalCardFormData[K]
  ) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSocialChange = <K extends keyof DigitalCardFormData['social_media']>(
    key: K,
    value: string
  ) => setFormData(prev => ({
    ...prev,
    social_media: { ...prev.social_media, [key]: value },
  }));

  const handleAddLocation = (location: Location) =>
    setFormData(prev => ({ ...prev, locations: [...prev.locations, location] }));

  const handleAddBusinessHour = (hour: BusinessHour) =>
    setFormData(prev => ({ ...prev, business_hour: [...prev.business_hour, hour] }));

  const handleAddImage = (file: File) =>
    setFormData(prev => ({ ...prev, images: [...prev.images, file] }));

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    setIsSubmitting(true);
    try {
      const apiFormData = new FormData();

      // Basic fields
      ['name', 'professional_title', 'business_name', 'profession', 'email', 'phone', 'bio', 'primary_specialty', 'custom_handle', 'website', 'preferred_booking_method', 'booking_link', 'promotion_details'].forEach(field => {
        apiFormData.append(field, (formData as any)[field] || '');
      });

      // Boolean fields
      apiFormData.append('offer_promotion', String(formData.offer_promotion));
      apiFormData.append('elite_setup', String(formData.elite_setup));

      // JSON fields
      apiFormData.append('social_media', JSON.stringify(formData.social_media));
      apiFormData.append('specialties', JSON.stringify(formData.specialties));
      apiFormData.append('important_info', JSON.stringify(formData.important_info));
      apiFormData.append('locations', JSON.stringify(formData.locations));
      apiFormData.append('business_hour', JSON.stringify(formData.business_hour));
      apiFormData.append('gallery_meta', JSON.stringify(formData.gallery_meta));
      apiFormData.append('excites_about_glamlink', JSON.stringify(formData.excites_about_glamlink));
      apiFormData.append('biggest_pain_points', JSON.stringify(formData.biggest_pain_points));

      // Files
      if (formData.profile_image) apiFormData.append('profile_image', formData.profile_image);
      formData.images.forEach(file => apiFormData.append('images', file));

      const response = await fetch('https://node.glamlink.net:5000/api/v1/businessCard', {
        method: 'POST',
        body: apiFormData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Submission failed');
      }

      const result = await response.json();
      console.log('SUCCESS:', result);
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* BASIC INFO */}
      <input type="text" placeholder="Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
      <input type="text" placeholder="Professional Title" value={formData.professional_title} onChange={e => handleChange('professional_title', e.target.value)} />
      <input type="text" placeholder="Business Name" value={formData.business_name} onChange={e => handleChange('business_name', e.target.value)} />
      <input type="text" placeholder="Profession" value={formData.profession} onChange={e => handleChange('profession', e.target.value)} />
      <input type="email" placeholder="Email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
      <input type="tel" placeholder="Phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
      <textarea placeholder="Bio" value={formData.bio} onChange={e => handleChange('bio', e.target.value)} />

      {/* SOCIAL MEDIA */}
      {(['instagram', 'tiktok', 'facebook', 'youtube'] as const).map((key) => (
        <input
          key={key}
          type="text"
          placeholder={key}
          value={formData.social_media[key]}
          onChange={e => handleSocialChange(key, e.target.value)}
        />
      ))}

      {/* FILES */}
      <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleChange('profile_image', e.target.files[0])} />
      <input type="file" accept="image/*" multiple onChange={e => e.target.files && Array.from(e.target.files).forEach(f => handleAddImage(f))} />

      <button type="submit" disabled={isSubmitting || isLoading} className="px-6 py-3 bg-teal-600 text-white rounded">
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}