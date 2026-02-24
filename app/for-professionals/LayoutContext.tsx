"use client";

import { createContext, useContext } from "react";

interface LayoutContextType {
  customPadding?: string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    return {};
  }
  return context;
}

export function LayoutProvider({ children, customPadding }: { children: React.ReactNode; customPadding?: string }) {
  return (
    <LayoutContext.Provider value={{ customPadding }}>
      {children}
    </LayoutContext.Provider>
  );
}