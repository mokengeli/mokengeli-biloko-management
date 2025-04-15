// src/app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, isAuthenticated, checkAuthStatus, loading, initialCheckDone } =
    useAuth();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Effet pour vérifier l'authentification au montage seulement
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      if (!initialCheckDone) {
        try {
          await checkAuthStatus();
        } catch (error) {
          console.error("Authentication check failed:", error);
        }
      }

      if (isMounted) {
        setCheckingAuth(false);
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuthStatus, initialCheckDone]);

  if (checkingAuth || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      <p className="mt-4">Bienvenue, {user?.firstName || "Utilisateur"}</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Ventes</h2>
          <p className="text-3xl font-bold mt-2">0€</p>
          <p className="text-sm text-gray-500 mt-2">Aujourd'hui</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Commandes</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-2">Aujourd'hui</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Produits</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-2">Total</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Utilisateurs</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-2">Total</p>
        </div>
      </div>
    </div>
  );
}
