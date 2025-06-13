"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function LogoutPage() {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const [logoutAttempted, setLogoutAttempted] = useState(false);

  useEffect(() => {
    // Si déjà déconnecté, rediriger immédiatement
    if (!isAuthenticated && logoutAttempted) {
      router.push("/auth/login");
      return;
    }

    const performLogout = async () => {
      try {
        await logout();
        setLogoutAttempted(true);

        // Redirection avec délai pour l'animation
        setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
      } catch (error) {
        console.error("Logout error:", error);
        // Redirection même en cas d'erreur
        setTimeout(() => {
          router.push("/auth/login");
        }, 500);
      }
    };

    if (!logoutAttempted) {
      performLogout();
    }
  }, [logout, router, isAuthenticated, logoutAttempted]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <h2 className="mt-6 text-xl font-semibold text-gray-700">
            Déconnexion en cours...
          </h2>
          <p className="mt-2 text-gray-500 max-w-md">
            Vous allez être redirigé vers la page de connexion.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
