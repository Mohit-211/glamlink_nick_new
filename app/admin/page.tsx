import AuthWrapper from '@/lib/features/auth/AuthWrapper';
import { AdminHomeTab } from "@/lib/pages/admin/components/home";

export default function AdminPage() {
  return (
    <AuthWrapper requireAuth requireAdmin featureName="Admin Dashboard">
      <div className="p-8">
        <AdminHomeTab />
      </div>
    </AuthWrapper>
  );
}
