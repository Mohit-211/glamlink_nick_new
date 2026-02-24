"use client";

/**
 * Profile Settings Section Page
 *
 * Displays a specific settings section based on the [id] parameter
 */

import { use } from "react";
import ProfileSettingsSectionPage from "@/lib/features/profile-settings/components/ProfileSettingsSectionPage";
import type { SettingsSectionId } from "@/lib/features/profile-settings/types";

interface ProfileSettingsSectionProps {
  params: Promise<{ id: string }>;
}

export default function ProfileSettingsSection({ params }: ProfileSettingsSectionProps) {
  const { id } = use(params);

  return <ProfileSettingsSectionPage sectionId={id as SettingsSectionId} variant="profile" />;
}
