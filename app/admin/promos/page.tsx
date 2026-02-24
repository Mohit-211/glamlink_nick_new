"use client";

import AuthWrapper from "@/lib/features/auth/AuthWrapper";
import PromosTab from "@/lib/pages/admin/components/promos/PromosTab";

export default function AdminPromosPage() {
  return (
    <AuthWrapper
      requireAuth={true}
      requireAdmin={true}
      featureName="Admin Promos Management"
    >
      <div className="p-8">
        <PromosTab />
      </div>
    </AuthWrapper>
  );
}
