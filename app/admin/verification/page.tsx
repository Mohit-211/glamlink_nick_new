"use client";

import AuthWrapper from "@/lib/features/auth/AuthWrapper";
import { VerificationTab } from "@/lib/pages/admin/components/verification";

export default function AdminVerificationPage() {
  return (
    <AuthWrapper
      requireAuth={true}
      requireAdmin={true}
      featureName="Business Verification Management"
    >
      <div className="p-8">
        <VerificationTab />
      </div>
    </AuthWrapper>
  );
}
