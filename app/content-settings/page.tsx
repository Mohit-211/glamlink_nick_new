"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/features/auth/useAuth";
import { ContentSettingsTab, EditablePage } from "@/lib/pages/content-settings/types";
import { useContentSettings } from "@/lib/pages/content-settings/hooks/useContentSettings";
import { usePageContent } from "@/lib/pages/content-settings/hooks/usePageContent";
import { useMagazineManagement } from "@/lib/pages/content-settings/hooks/useMagazineManagement";
import ContentSettingsLayout from "@/lib/pages/content-settings/components/ContentSettingsLayout";
import LoginForm from "@/lib/pages/content-settings/components/LoginForm";
import AccessDenied from "@/lib/pages/content-settings/components/AccessDenied";
import PageVisibilityTab from "@/lib/pages/content-settings/components/PageVisibilityTab";
import PageContentTab from "@/lib/pages/content-settings/components/PageContentTab";
import MagazineManagementTab from "@/lib/pages/content-settings/components/MagazineManagementTab";

const ALLOWED_EMAILS = ["mohit@blockcod.com", "melanie@glamlink.net", "admin@glamlink.com"];

export default function ContentSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentSettingsTab>("visibility");
  const [selectedPage, setSelectedPage] = useState<EditablePage>("home");

  // Content settings hooks
  const {
    settings,
    isLoading: isLoadingSettings,
    isSaving,
    showSuccess,
    handleToggle,
    handleSave,
    handleReset,
    handleExport,
    handleImport,
  } = useContentSettings();

  // Page content hooks
  const {
    pageContent,
    isLoadingContent,
    isSavingContent,
    updateContentField,
    handleSaveContent,
  } = usePageContent(selectedPage, isAuthenticated, activeTab);

  // Magazine management hooks
  const {
    magazineIssues,
    isLoadingMagazine,
    isSavingMagazine,
    editingIssue,
    showAddIssue,
    setEditingIssue,
    setShowAddIssue,
    handleToggleFeatured,
    handleDeleteIssue,
    handleSaveMagazineIssue,
  } = useMagazineManagement(isAuthenticated, activeTab);

  useEffect(() => {
    if (!authLoading) {
      if (user?.email && ALLOWED_EMAILS.includes(user.email)) {
        setIsAuthenticated(true);
      }
    }
  }, [user, authLoading]);

  // Loading state
  if (authLoading || isLoadingSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glamlink-teal mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    // Check if user is logged in but not authorized
    if (user && !ALLOWED_EMAILS.includes(user.email || "")) {
      return <AccessDenied />;
    }
    // Show login form
    return <LoginForm />;
  }

  // Authenticated - show content settings
  return (
    <ContentSettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "visibility" && (
        <PageVisibilityTab
          isAuthenticated={isAuthenticated}
          settings={settings}
          isSaving={isSaving}
          showSuccess={showSuccess}
          onToggle={handleToggle}
          onSave={handleSave}
          onReset={handleReset}
          onExport={handleExport}
          onImport={handleImport}
        />
      )}

      {activeTab === "content" && (
        <PageContentTab
          isAuthenticated={isAuthenticated}
          selectedPage={selectedPage}
          pageContent={pageContent}
          isLoadingContent={isLoadingContent}
          isSavingContent={isSavingContent}
          onPageChange={setSelectedPage}
          onContentUpdate={updateContentField}
          onSave={handleSaveContent}
        />
      )}

      {activeTab === "magazine" && (
        <MagazineManagementTab
          isAuthenticated={isAuthenticated}
          magazineIssues={magazineIssues}
          isLoadingMagazine={isLoadingMagazine}
          isSavingMagazine={isSavingMagazine}
          editingIssue={editingIssue}
          showAddIssue={showAddIssue}
          onToggleFeatured={handleToggleFeatured}
          onDeleteIssue={handleDeleteIssue}
          onEditIssue={setEditingIssue}
          onAddIssue={() => setShowAddIssue(true)}
          onSaveIssue={handleSaveMagazineIssue}
          onCancelEdit={() => {
            setEditingIssue(null);
            setShowAddIssue(false);
          }}
        />
      )}
    </ContentSettingsLayout>
  );
}