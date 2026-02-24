"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/features/auth/useAuth";
import AuthWrapper from "@/lib/features/auth/AuthWrapper";
import { useAdminUnreadCount } from "@/lib/features/crm/profile/support-messaging";
import { useFormSubmissionsBadgeCount } from "@/lib/pages/admin/hooks/useFormSubmissionsBadgeCount";
import { NavItem } from "@/lib/pages/admin/components/navigation";
import {
  STANDALONE_NAVIGATION,
  NAV_GROUPS,
  DEFAULT_EXPANDED_GROUPS,
  type BadgeKey,
} from "@/lib/pages/admin/config/navigation";
import { Bars3Icon, XMarkIcon } from '@/lib/pages/admin/components/shared/common';
export const dynamic = 'force-dynamic';
// Folder icon for groups
const FolderIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

// Chevron icons for collapsible groups
const ChevronDownIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronLeftIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function AdminSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const { count: unreadCount } = useAdminUnreadCount();
  const { count: formSubmissionsCount } = useFormSubmissionsBadgeCount();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(DEFAULT_EXPANDED_GROUPS);

  // Badge map for dynamic badge assignment
  const badges: Record<BadgeKey, number> = {
    messages: unreadCount,
    formSubmissions: formSubmissionsCount,
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Determine if a route is currently active
  const isCurrentRoute = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Add 'current' state to navigation items
  const standaloneItems = STANDALONE_NAVIGATION.map(item => ({
    ...item,
    current: isCurrentRoute(item.href),
  }));

  const navGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.map(item => ({
      ...item,
      current: isCurrentRoute(item.href),
    })),
  }));

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
        ${isCollapsed ? "lg:w-16" : "lg:w-64"} w-64
      `}>
        {/* Header */}
        <div className={`flex items-center h-16 bg-glamlink-teal text-white ${isCollapsed ? "justify-center px-2" : "justify-between px-6"}`}>
          {!isCollapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-glamlink-teal-dark"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-md hover:bg-glamlink-teal-dark transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="mt-6 px-3">
          {/* Standalone navigation items */}
          <div className="space-y-1">
            {standaloneItems.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                isCollapsed={isCollapsed}
                onClick={onClose}
              />
            ))}
          </div>

          {/* Grouped navigation items */}
          {navGroups.map((group) => (
            <div key={group.name} className="mt-4">
              {/* Group header */}
              {!isCollapsed ? (
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded-md transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4" />
                    {group.name}
                  </span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 ${
                      expandedGroups[group.name] ? '' : '-rotate-90'
                    }`}
                  />
                </button>
              ) : (
                <div className="flex justify-center py-2">
                  <div className="w-6 h-px bg-gray-300" />
                </div>
              )}

              {/* Group items */}
              {(isCollapsed || expandedGroups[group.name]) && (
                <div className={`space-y-1 ${!isCollapsed ? 'mt-1 ml-2' : ''}`}>
                  {group.items.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                      isCollapsed={isCollapsed}
                      onClick={onClose}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 ${isCollapsed ? "flex justify-center" : ""}`}>
          {isCollapsed ? (
            <div className="h-8 w-8 rounded-full bg-glamlink-purple flex items-center justify-center" title="Admin User">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-glamlink-purple flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <Link
                  href="/"
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Back to Site →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <AuthWrapper requireAuth requireAdmin featureName="Admin Panel">
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 lg:ml-8">
          <main className="flex-1 lg:pt-0 pt-16 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}
