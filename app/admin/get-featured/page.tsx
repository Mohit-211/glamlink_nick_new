"use client";

import AuthWrapper from "@/lib/features/auth/AuthWrapper";
import GetFeaturedTab from "@/lib/pages/admin/components/form-submissions/get-featured/GetFeaturedTab";

export default function AdminGetFeaturedPage() {
  return (
    <AuthWrapper
      requireAuth={true}
      requireAdmin={true}
      featureName="Admin Get Featured Management"
    >
      <div className="p-8">
        <GetFeaturedTab />
      </div>
    </AuthWrapper>
  );
}
