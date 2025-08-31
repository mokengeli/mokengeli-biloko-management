// src/app/dashboard/page.js
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";

export default function Dashboard() {
  const { user, roles } = useAuth();
  const router = useRouter();

  // Protection de rôle selon Sidebar.js: canViewDashboard = isAdmin || isManager
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isManager = roles.includes("ROLE_MANAGER");
  const canViewDashboard = isAdmin || isManager;

  useEffect(() => {
    if (user && !canViewDashboard) {
      router.push("/profile");
    }
  }, [user, canViewDashboard, router]);

  // Si pas d'accès, ne rien afficher (redirection en cours)
  if (user && !canViewDashboard) {
    return null;
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
      <p className="text-gray-500 mb-8">
        Bienvenue, {user?.firstName || "Utilisateur"}
      </p>

      {/* Nouvelles métriques du dashboard */}
      <DashboardMetrics />
    </DashboardLayout>
  );
}
