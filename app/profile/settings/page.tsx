"use client";

/**
 * Profile Settings Page
 *
 * Allows users to:
 * - View their account information
 * - Change their password
 * - Sign out
 */

import { ProfileSettingsPage } from "@/lib/features/profile-settings";

export default function ProfileSettingsRoute() {
  return <ProfileSettingsPage variant="profile" />;
}
