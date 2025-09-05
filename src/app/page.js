"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getRedirectPathByRole } from "@/lib/redirectUtils";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuthStatus, loading, user } = useAuth();
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
      } catch (error) {
        router.push("/auth/login");
      }
    };

    initAuth();
  }, [checkAuthStatus, router]);

  // Effet séparé pour gérer la redirection une fois les données utilisateur chargées
  useEffect(() => {
    if (isAuthenticated && user && user.roles) {
      const redirectPath = getRedirectPathByRole(user.roles);
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
