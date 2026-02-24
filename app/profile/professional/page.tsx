"use client";

/**
 * Professional Display Settings Page
 *
 * Allows users to control how their professional information appears on their public profile
 */

import {
  CertificationDisplay,
  PortfolioPrivacy,
  PricingVisibility,
  ReviewsDisplay,
} from "@/lib/features/profile-settings/professional";

export default function ProfessionalSettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Professional Display Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Control how your professional information appears on your public profile
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CertificationDisplay />
        <PortfolioPrivacy />
        <PricingVisibility />
        <ReviewsDisplay />
      </div>
    </div>
  );
}
