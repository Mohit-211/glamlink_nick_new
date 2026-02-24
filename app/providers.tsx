"use client";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { AuthProvider } from "@/lib/features/auth/AuthProvider";
import { PreferencesProvider } from "@/lib/features/profile-settings/preferences";
import PageVisibilitySync from "@/lib/components/PageVisibilitySync";
import GoogleAnalytics from "@/lib/components/GoogleAnalytics";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <PreferencesProvider>
          <PageVisibilitySync />
          <GoogleAnalytics />
          {children}
        </PreferencesProvider>
      </AuthProvider>
    </Provider>
  );
} 