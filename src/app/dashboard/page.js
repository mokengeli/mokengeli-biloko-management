// src/app/dashboard/page.js
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      <p className="mt-4">Bienvenue, {user?.firstName || "Utilisateur"}</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold">Ventes</h2>
          <p className="text-3xl font-bold mt-2">0€</p>
          <p className="text-sm text-gray-500 mt-2">Aujourd'hui</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold">Commandes</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-2">Aujourd'hui</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold">Produits</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-2">Total</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold">Utilisateurs</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-2">Total</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
