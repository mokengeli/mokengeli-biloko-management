"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { TooltipProvider } from "@/components/providers/TooltipProvider";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <TooltipProvider>{children}</TooltipProvider>
    </Provider>
  );
}
