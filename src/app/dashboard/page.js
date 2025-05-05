// src/app/dashboard/page.js
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";

export default function Dashboard() {
  const { user } = useAuth();

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
