import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/features/auth/useAuth';
import { getSectionsForVariant } from '@/lib/features/profile-settings/sectionsConfig';
import {
  HomeIcon,
  ChartBarIcon,
  CardIcon,
  ProfessionalIcon,
  DashboardIcon,
  CampaignIcon,
  AttributionIcon,
  AutomationIcon,
  OrderDetailIcon,
  CreateOrderIcon,
  CustomerListIcon,
  AddCustomerIcon,
  PayoutsIcon,
  TransactionsIcon,
  TaxIcon,
  FilesIcon,
  BlogIcon,
  MarketingIcon,
  OrdersIcon,
  CustomersIcon,
  FinanceIcon,
  ContentIcon,
  SettingsIcon,
} from '@/lib/pages/admin/components/shared/common';

// Support Icon
const SupportIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

// ============================================================================
// TypeScript Types
// ============================================================================

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

export interface SubSection {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface ExpandableSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: SubSection[];
  basePath: string;
}

// ============================================================================
// Navigation Configuration
// ============================================================================

// Marketing sub-sections
export const marketingSections: SubSection[] = [
  { id: 'dashboard', title: 'Dashboard', href: '/profile/marketing', icon: DashboardIcon },
  { id: 'campaigns', title: 'Campaigns', href: '/profile/marketing/campaigns', icon: CampaignIcon },
  { id: 'attribution', title: 'Attribution', href: '/profile/marketing/attribution', icon: AttributionIcon },
  { id: 'automations', title: 'Automations', href: '/profile/marketing/automations', icon: AutomationIcon },
];

// Orders sub-sections
export const ordersSections: SubSection[] = [
  { id: 'dashboard', title: 'All Orders', href: '/profile/orders', icon: OrderDetailIcon },
  { id: 'create', title: 'Create Order', href: '/profile/orders/new', icon: CreateOrderIcon },
];

// Customers sub-sections
export const customersSections: SubSection[] = [
  { id: 'dashboard', title: 'All Customers', href: '/profile/customers', icon: CustomerListIcon },
  { id: 'add', title: 'Add Customer', href: '/profile/customers/new', icon: AddCustomerIcon },
];

// Finance sub-sections
export const financeSections: SubSection[] = [
  { id: 'overview', title: 'Overview', href: '/profile/finance', icon: DashboardIcon },
  { id: 'payouts', title: 'Payouts', href: '/profile/finance/payouts', icon: PayoutsIcon },
  { id: 'transactions', title: 'Transactions', href: '/profile/finance/transactions', icon: TransactionsIcon },
  { id: 'tax', title: 'Tax Filing', href: '/profile/finance/tax', icon: TaxIcon },
];

// Content sub-sections
export const contentSections: SubSection[] = [
  { id: 'files', title: 'Files', href: '/profile/content/files', icon: FilesIcon },
  { id: 'blog', title: 'Blog Posts', href: '/profile/content/blog', icon: BlogIcon },
];

// All expandable sections configuration
export const expandableSections: ExpandableSection[] = [
  {
    id: 'marketing',
    name: 'Marketing',
    icon: MarketingIcon,
    sections: marketingSections,
    basePath: '/profile/marketing',
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: OrdersIcon,
    sections: ordersSections,
    basePath: '/profile/orders',
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: CustomersIcon,
    sections: customersSections,
    basePath: '/profile/customers',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: FinanceIcon,
    sections: financeSections,
    basePath: '/profile/finance',
  },
  {
    id: 'content',
    name: 'Content',
    icon: ContentIcon,
    sections: contentSections,
    basePath: '/profile/content',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: SettingsIcon,
    sections: [], // Settings sections are dynamically loaded
    basePath: '/profile/settings',
  },
];

// Auth pages that should NOT require authentication
export const AUTH_PAGES = ['/profile/login', '/profile/signup', '/profile/reset-password-required'];

// ============================================================================
// useProfileSidebar Hook
// ============================================================================

/**
 * Hook for managing profile sidebar state and navigation
 */
export function useProfileSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Expansion states for each section - using a Map for dynamic sections
  const [expandedSections, setExpandedSections] = useState<Map<string, boolean>>(new Map());

  // Profile tabs visibility state (includes tab and subsection visibility)
  const [tabsVisibility, setTabsVisibility] = useState<Map<string, boolean>>(new Map());
  const [subsectionsVisibility, setSubsectionsVisibility] = useState<Map<string, Map<string, boolean>>>(new Map());

  // Fetch profile tabs visibility settings
  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const response = await fetch('/api/content-settings/profile-tabs', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
          const visibilityMap = new Map<string, boolean>();
          const subsectionsMap = new Map<string, Map<string, boolean>>();

          data.data.forEach((tab: { id: string; isVisible: boolean; subsections?: Array<{ id: string; isVisible: boolean }> }) => {
            visibilityMap.set(tab.id, tab.isVisible);

            // Store subsection visibility
            if (tab.subsections && tab.subsections.length > 0) {
              const tabSubsections = new Map<string, boolean>();
              tab.subsections.forEach(subsection => {
                tabSubsections.set(subsection.id, subsection.isVisible);
              });
              subsectionsMap.set(tab.id, tabSubsections);
            }
          });

          setTabsVisibility(visibilityMap);
          setSubsectionsVisibility(subsectionsMap);
        }
      } catch (error) {
        console.error('Error fetching profile tabs visibility:', error);
        // On error, default to hiding all tabs
        setTabsVisibility(new Map([
          ['marketing', false],
          ['orders', false],
          ['customers', false],
          ['finance', false],
          ['content', false],
          ['settings', false]
        ]));
      }
    };

    fetchVisibility();
  }, []);

  // Auto-expand sections when on their pages
  useEffect(() => {
    const newExpanded = new Map<string, boolean>();

    expandableSections.forEach(section => {
      if (pathname.startsWith(section.basePath)) {
        newExpanded.set(section.id, true);
      }
    });

    setExpandedSections(newExpanded);
  }, [pathname]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newMap = new Map(prev);
      newMap.set(sectionId, !prev.get(sectionId));
      return newMap;
    });
  };

  // Check if section is expanded
  const isSectionExpanded = (sectionId: string) => {
    return expandedSections.get(sectionId) || false;
  };

  // Check if section is active
  const isSectionActive = (basePath: string) => {
    return pathname.startsWith(basePath);
  };

  // Main navigation items
  const navigation: NavItem[] = [
    {
      name: "Overview",
      href: "/profile",
      icon: HomeIcon,
      current: pathname === "/profile",
    },
    {
      name: "Digital Card",
      href: "/profile/digital-card",
      icon: CardIcon,
      current: pathname === "/profile/digital-card",
    },
    {
      name: "Analytics",
      href: "/profile/analytics",
      icon: ChartBarIcon,
      current: pathname === "/profile/analytics",
    },
    {
      name: "Professional",
      href: "/profile/professional",
      icon: ProfessionalIcon,
      current: pathname === "/profile/professional",
    },
    {
      name: "Support",
      href: "/profile/support",
      icon: SupportIcon,
      current: pathname.startsWith("/profile/support"),
    },
  ];

  // Get settings sections for profile variant
  const settingsSections = getSectionsForVariant("profile");

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.displayName) {
      const parts = user.displayName.split(' ');
      return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  // Check if a subsection is visible
  const isSubsectionVisible = (tabId: string, subsectionId: string): boolean => {
    const tabSubsections = subsectionsVisibility.get(tabId);
    if (!tabSubsections) return true; // Default to visible if not configured
    return tabSubsections.get(subsectionId) !== false;
  };

  return {
    pathname,
    user,
    navigation,
    settingsSections,
    tabsVisibility,
    subsectionsVisibility,
    expandableSections,
    // Expansion management
    isSectionExpanded,
    toggleSection,
    isSectionActive,
    // Utilities
    getUserInitials,
    isSubsectionVisible,
  };
}
