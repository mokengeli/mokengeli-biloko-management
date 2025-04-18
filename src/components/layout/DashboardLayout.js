// src/components/layout/DashboardLayout.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }) {
  const { isAuthenticated, checkAuthStatus, user } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await checkAuthStatus();
        if (!isAuthenticated) {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/auth/login");
      }
    };

    checkAuth();
    setIsMounted(true);
  }, [checkAuthStatus, isAuthenticated, router]);

  // Si le composant n'est pas encore monté, ne rien afficher
  if (!isMounted || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar avec animation */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: isSidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-y-0 left-0 z-30 w-64 shrink-0 border-r bg-background md:relative md:flex ${
          isSidebarOpen ? "flex" : "hidden"
        }`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </motion.div>

      {/* Contenu principal */}
      <main className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Contenu de la page avec animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          {children}
        </motion.div>
      </main>

      {/* Overlay pour fermer le menu sur mobile */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black md:hidden"
        />
      )}
    </div>
  );
}
