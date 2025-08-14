"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuthStatus, loading } = useAuth();
  useEffect(() => {
    // Vérifier s'il y a un flag de déconnexion en cours
    const logoutPending = sessionStorage.getItem("logout_pending");
    if (logoutPending) {
      // Nettoyer le cookie si la déconnexion n'a pas été terminée
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).then(() => {
        sessionStorage.removeItem("logout_pending");
        router.push("/auth/login");
      });
      return;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuthStatus();
        router.push("/dashboard");
      } catch (error) {
        router.push("/auth/login");
      }
    };

    initAuth();
  }, [checkAuthStatus, router, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
