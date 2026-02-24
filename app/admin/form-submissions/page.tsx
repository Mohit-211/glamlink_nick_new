"use client";

import AuthWrapper from "@/lib/features/auth/AuthWrapper";
import FormSubmissionsTab from "@/lib/pages/admin/components/form-submissions/FormSubmissionsTab";

export default function AdminFormSubmissionsPage() {
  return (
    <AuthWrapper
      requireAuth={true}
      requireAdmin={true}
      featureName="Admin Form Submissions Management"
    >
      <div className="p-8">
        <FormSubmissionsTab />
      </div>
    </AuthWrapper>
  );
}
