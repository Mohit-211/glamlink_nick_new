"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children, customPadding }: { children: React.ReactNode; customPadding?: string }) {
  const pathname = usePathname();
  // Pages that handle their own padding (have -mt-8 to counteract pt-8)
  const hasOwnPadding = pathname?.startsWith("/magazine") || pathname === "/for-professionals" || pathname === "/get-featured";

  // Pages that need white background (override body's bg-gray-50)
  const needsWhiteBackground = pathname?.match(/^\/for-professionals\/[^/]+$/);

  // Determine padding class based on custom prop or default logic
  let paddingClass = "pt-8"; // default
  if (customPadding) {
    paddingClass = "pt-[192px]";
  } else if (hasOwnPadding) {
    paddingClass = "";
  }

  // Determine background class
  const bgClass = needsWhiteBackground ? "bg-white" : "";

  return <main className={`min-h-screen ${paddingClass} ${bgClass}`}>{children}</main>;
}
