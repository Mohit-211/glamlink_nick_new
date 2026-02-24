"use client";

import AuthWrapper from "@/lib/features/auth/AuthWrapper";
import { AnalyticsTab } from "@/lib/pages/admin/components/analytics";

export default function AdminAnalyticsPage() {
  return (
    <AuthWrapper
      requireAuth={true}
      requireAdmin={true}
      featureName="Analytics Dashboard"
    >
      <div className="p-8">
        <AnalyticsTab />
      </div>
    </AuthWrapper>
  );
}
