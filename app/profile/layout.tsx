"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AuthWrapper from "@/lib/features/auth/AuthWrapper";
import { Bars3Icon } from '@/lib/pages/admin/components/shared/common';
import { ProfileSidebar, AUTH_PAGES } from './navigation';
export const dynamic = 'force-dynamic';
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // If this is an auth page, render without the profile layout wrapper
  if (AUTH_PAGES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <AuthWrapper requireAuth featureName="Profile">
      <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Sidebar */}
        <ProfileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 lg:pt-0 pt-16 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}
