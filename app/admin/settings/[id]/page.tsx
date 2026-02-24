"use client";

/**
 * Admin Settings Section Page
 *
 * Displays a specific settings section based on the [id] parameter
 */

import { use } from "react";
import ProfileSettingsSectionPage from "@/lib/features/profile-settings/components/ProfileSettingsSectionPage";
import type { SettingsSectionId } from "@/lib/features/profile-settings/types";

interface AdminSettingsSectionProps {
  params: Promise<{ id: string }>;
}

export default function AdminSettingsSection({ params }: AdminSettingsSectionProps) {
  const { id } = use(params);

  return <ProfileSettingsSectionPage sectionId={id as SettingsSectionId} variant="admin" />;
}
