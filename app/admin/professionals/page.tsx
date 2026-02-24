"use client";

import AuthWrapper from "@/lib/features/auth/AuthWrapper";
import ProfessionalsTab from "@/lib/pages/admin/components/professionals/ProfessionalsTab";

export default function AdminProfessionalsPage() {
  return (
    <AuthWrapper
      requireAuth={true}
      requireAdmin={true}
      featureName="Admin Professionals Management"
    >
      <div className="p-8">
        <ProfessionalsTab />
      </div>
    </AuthWrapper>
  );
}