"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { ToastProvider } from "@/components/ui/use-toast";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}
