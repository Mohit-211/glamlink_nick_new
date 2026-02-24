'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon, ChevronRightIcon } from '@/lib/pages/admin/components/shared/common';
import type { SettingsSection } from '@/lib/features/profile-settings/types';

interface SettingsNavSectionProps {
  sections: SettingsSection[];
  isCollapsed: boolean;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon: React.ComponentType<{ className?: string }>;
  isSubsectionVisible: (subsectionId: string) => boolean;
}

export default function SettingsNavSection({
  sections,
  isCollapsed,
  isExpanded,
  isActive,
  onToggle,
  onClose,
  icon: SettingsIcon,
  isSubsectionVisible,
}: SettingsNavSectionProps) {
  const pathname = usePathname();

  // Filter visible sections
  const visibleSections = sections.filter(section => isSubsectionVisible(section.id));

  return (
    <div>
      {/* Settings header - Link for navigation, separate button for expand/collapse */}
      <div
        className={`
          w-full group flex items-center py-2 text-sm font-medium rounded-md transition-colors duration-200
          ${isCollapsed ? "justify-center px-2" : "px-3 justify-between"}
          ${isActive
            ? "bg-glamlink-teal text-white"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }
        `}
      >
        {/* Main clickable area - navigates to All Settings */}
        <Link
          href="/profile/settings"
          className="flex items-center flex-1"
          onClick={onClose}
          title={isCollapsed ? "Settings" : undefined}
        >
          <SettingsIcon
            className={`
              h-5 w-5 flex-shrink-0
              ${!isCollapsed && "mr-3"}
              ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500"}
            `}
          />
          {!isCollapsed && "Settings"}
        </Link>
        {/* Chevron button - only expands/collapses */}
        {!isCollapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`p-1 rounded hover:bg-black/10 transition-colors ${isActive ? "hover:bg-white/20" : ""}`}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDownIcon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-400"}`} />
            ) : (
              <ChevronRightIcon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-400"}`} />
            )}
          </button>
        )}
      </div>

      {/* Settings sub-navigation - individual sections only (no "All Settings" since main link goes there) */}
      {!isCollapsed && isExpanded && visibleSections.length > 0 && (
        <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
          {/* Individual settings sections */}
          {visibleSections.map((section) => {
            const sectionPath = `/profile/settings/${section.id}`;
            const isSectionActive = pathname === sectionPath;
            const SectionIcon = section.icon;

            return (
              <Link
                key={section.id}
                href={sectionPath}
                className={`
                  group flex items-center py-1.5 text-sm rounded-md transition-colors duration-200 px-2
                  ${isSectionActive
                    ? "bg-glamlink-teal/10 text-glamlink-teal font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
                onClick={onClose}
              >
                <SectionIcon
                  className={`
                    h-4 w-4 mr-2 flex-shrink-0
                    ${isSectionActive ? "text-glamlink-teal" : "text-gray-400 group-hover:text-gray-500"}
                  `}
                />
                <span className="truncate">{section.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
