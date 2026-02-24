'use client';

import React from 'react';
import { User, MapPin, Image, Clock, Star, Tag, Info, List, Video } from 'lucide-react';

interface EmptySectionStateProps {
  message: string;
  icon?: 'profile' | 'map' | 'gallery' | 'hours' | 'specialties' | 'promotions' | 'info' | 'list' | 'video';
}

const iconMap = {
  profile: User,
  map: MapPin,
  gallery: Image,
  hours: Clock,
  specialties: Star,
  promotions: Tag,
  info: Info,
  list: List,
  video: Video,
};

export default function EmptySectionState({
  message,
  icon = 'info',
}: EmptySectionStateProps) {
  const IconComponent = iconMap[icon] || Info;

  return (
    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
      <IconComponent className="w-8 h-8 mb-2 opacity-50" />
      <p className="text-sm text-center">{message}</p>
    </div>
  );
}
