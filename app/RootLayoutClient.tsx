"use client";

import { usePathname } from "next/navigation";
import Navigation from "../lib/components/Navigation";
import Footer from "../lib/components/Footer";
import AlertNavigationCTA from "../lib/components/ctas/AlertNavigationCTA";
import MainWrapper from "./MainWrapper";
import { useLayoutContext } from "./for-professionals/LayoutContext";
import { isPlainPage } from "../lib/config/plainPages";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const { customPadding } = useLayoutContext();
  const pathname = usePathname();

  // Check if this is a plain page (no nav/footer)
  if (isPlainPage(pathname)) {
    // Plain pages get white background, no padding, no MainWrapper
    return (
      <div className="min-h-screen bg-white p-0">
        {children}
      </div>
    );
  }

  // Full layout with nav and footer - gray background
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AlertNavigationCTA />
      <Navigation />
      <MainWrapper customPadding={customPadding}>
        {children}
      </MainWrapper>
      <Footer />
    </div>
  );
}