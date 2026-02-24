"use client";

/**
 * Admin Settings Page
 *
 * Allows admin users to:
 * - View their account information
 * - Change their password
 * - Sign out
 */

import { ProfileSettingsPage } from "@/lib/features/profile-settings";

export default function AdminSettingsRoute() {
  return <ProfileSettingsPage variant="admin" />;
}
