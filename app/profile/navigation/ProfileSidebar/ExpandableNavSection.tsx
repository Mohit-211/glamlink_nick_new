'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon, ChevronRightIcon } from '@/lib/pages/admin/components/shared/common';
import type { ExpandableSection } from './useProfileSidebar';

interface ExpandableNavSectionProps {
  section: ExpandableSection;
  isCollapsed: boolean;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  onClose: () => void;
  isSubsectionVisible: (subsectionId: string) => boolean;
}

export default function ExpandableNavSection({
  section,
  isCollapsed,
  isExpanded,
  isActive,
  onToggle,
  onClose,
  isSubsectionVisible,
}: ExpandableNavSectionProps) {
  const pathname = usePathname();
  const SectionIcon = section.icon;

  // Filter visible subsections and exclude ones that match the basePath
  // (since clicking the main section header now navigates there)
  const visibleSubsections = section.sections.filter(subsection =>
    isSubsectionVisible(subsection.id) && subsection.href !== section.basePath
  );

  return (
    <div>
      {/* Section header - Link for navigation, separate button for expand/collapse */}
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
        {/* Main clickable area - navigates to section */}
        <Link
          href={section.basePath}
          className="flex items-center flex-1"
          onClick={onClose}
          title={isCollapsed ? section.name : undefined}
        >
          <SectionIcon
            className={`
              h-5 w-5 flex-shrink-0
              ${!isCollapsed && "mr-3"}
              ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500"}
            `}
          />
          {!isCollapsed && section.name}
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

      {/* Sub-navigation */}
      {!isCollapsed && isExpanded && visibleSubsections.length > 0 && (
        <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
          {visibleSubsections.map((subsection) => {
            const isSectionActive = pathname === subsection.href ||
              (subsection.id !== 'dashboard' && subsection.id !== 'overview' && pathname.startsWith(subsection.href));
            const SubsectionIcon = subsection.icon;

            return (
              <Link
                key={subsection.id}
                href={subsection.href}
                className={`
                  group flex items-center py-1.5 text-sm rounded-md transition-colors duration-200 px-2
                  ${isSectionActive
                    ? "bg-glamlink-teal/10 text-glamlink-teal font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
                onClick={onClose}
              >
                <SubsectionIcon
                  className={`
                    h-4 w-4 mr-2 flex-shrink-0
                    ${isSectionActive ? "text-glamlink-teal" : "text-gray-400 group-hover:text-gray-500"}
                  `}
                />
                <span className="truncate">{subsection.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
