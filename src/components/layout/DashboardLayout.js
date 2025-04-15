"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ children }) {
  const { isAuthenticated, checkAuthStatus, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        router.push("/auth/login");
      }
    };

    if (!isAuthenticated) {
      verifyAuth();
    }
  }, [isAuthenticated, checkAuthStatus, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <Topbar />

      <main className="pt-16 md:ml-64 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={router.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
