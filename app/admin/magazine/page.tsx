"use client";

import AuthWrapper from "@/lib/features/auth/AuthWrapper";
import MagazineTab from "@/lib/pages/admin/components/magazine/MagazineTab";

export default function AdminMagazinePage() {
  return (
    <AuthWrapper
      requireAuth={true}
      requireAdmin={true}
      featureName="Magazine Management"
    >
      <div className="p-8">
        <MagazineTab />
      </div>
    </AuthWrapper>
  );
}