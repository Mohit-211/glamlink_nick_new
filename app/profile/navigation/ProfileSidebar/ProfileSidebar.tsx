'use client';

import Link from 'next/link';
import { Bars3Icon, XMarkIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from '@/lib/pages/admin/components/shared/common';
import { useProfileSidebar } from './useProfileSidebar';
import ExpandableNavSection from './ExpandableNavSection';
import SettingsNavSection from './SettingsNavSection';
import type { ProfileSidebarProps } from './useProfileSidebar';

export default function ProfileSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: ProfileSidebarProps) {
  const {
    pathname,
    user,
    navigation,
    settingsSections,
    tabsVisibility,
    expandableSections,
    // Expansion management
    isSectionExpanded,
    toggleSection,
    isSectionActive,
    // Utilities
    getUserInitials,
    isSubsectionVisible,
  } = useProfileSidebar();

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
        <div className={`flex items-center h-16 bg-glamlink-teal text-white ${isCollapsed ? "justify-center px-2" : "justify-between px-6"}`}>
          {!isCollapsed && <h1 className="text-xl font-bold">My Profile</h1>}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-glamlink-teal/80"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-md hover:bg-glamlink-teal/80 transition-colors"
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
          <div className="space-y-1">
            {/* Main navigation items */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${isCollapsed ? "justify-center px-2" : "px-3"}
                  ${item.current
                    ? "bg-glamlink-teal text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`
                    h-5 w-5 flex-shrink-0
                    ${!isCollapsed && "mr-3"}
                    ${item.current ? "text-white" : "text-gray-400 group-hover:text-gray-500"}
                  `}
                />
                {!isCollapsed && item.name}
              </Link>
            ))}

            {/* Expandable sections (Marketing, Orders, Customers, Finance, Content) */}
            {expandableSections
              .filter(section => section.id !== 'settings') // Handle settings separately
              .map((section) => {
                const isVisible = tabsVisibility.get(section.id);
                if (isVisible === false) return null;

                return (
                  <ExpandableNavSection
                    key={section.id}
                    section={section}
                    isCollapsed={isCollapsed}
                    isExpanded={isSectionExpanded(section.id)}
                    isActive={isSectionActive(section.basePath)}
                    onToggle={() => toggleSection(section.id)}
                    onClose={onClose}
                    isSubsectionVisible={(subsectionId) => isSubsectionVisible(section.id, subsectionId)}
                  />
                );
              })}

            {/* Settings section (special case with "All Settings" link) */}
            {tabsVisibility.get('settings') !== false && (
              <SettingsNavSection
                sections={settingsSections}
                isCollapsed={isCollapsed}
                isExpanded={isSectionExpanded('settings')}
                isActive={isSectionActive('/profile/settings')}
                onToggle={() => toggleSection('settings')}
                onClose={onClose}
                icon={SettingsIcon}
                isSubsectionVisible={(subsectionId) => isSubsectionVisible('settings', subsectionId)}
              />
            )}
          </div>
        </nav>

        {/* User section */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 ${isCollapsed ? "flex justify-center" : ""}`}>
          {isCollapsed ? (
            <div className="h-8 w-8 rounded-full bg-glamlink-teal flex items-center justify-center" title={user?.displayName || user?.email || 'User'}>
              <span className="text-white text-sm font-medium">{getUserInitials()}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-glamlink-teal flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{getUserInitials()}</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                  {user?.displayName || user?.email || 'User'}
                </p>
                <Link
                  href="/"
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Back to Site
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
