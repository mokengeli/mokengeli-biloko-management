// src/components/providers/TooltipProvider.js
"use client";

import { TooltipProvider as ShadcnTooltipProvider } from "@/components/ui/tooltip";

export function TooltipProvider({ children }) {
  return (
    <ShadcnTooltipProvider delayDuration={300}>
      {children}
    </ShadcnTooltipProvider>
  );
}
