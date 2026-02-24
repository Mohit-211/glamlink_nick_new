"use client";

import { SecuritySection, useSecuritySettings } from "@/lib/features/profile-settings/security";

export default function SecurityPage() {
  const securitySettings = useSecuritySettings();

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
        <p className="text-gray-600 mt-1">
          Manage your account security, two-factor authentication, and active sessions
        </p>
      </div>

      {/* Security Section */}
      <SecuritySection {...securitySettings} />
    </div>
  );
}
