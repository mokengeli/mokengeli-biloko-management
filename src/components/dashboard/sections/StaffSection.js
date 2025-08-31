// src/components/dashboard/sections/StaffSection.js
"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import TopWaitersKPI from "../kpis/WaiterKPIs/TopWaitersKPI";

/**
 * Section Performance du Personnel du Dashboard
 * Affiche les métriques liées aux performances des serveurs et du personnel
 *
 * @param {Object} data - Données du dashboard incluant waiterPerformance
 * @param {Object} enabledMetrics - Métriques activées par l'utilisateur
 * @param {boolean} loading - États de chargement par métrique
 * @param {Object} errors - Erreurs par métrique
 */
export const StaffSection = ({
  data,
  enabledMetrics = {},
  loading = {},
  errors = {},
}) => {
  // Vérifier si la section staff est activée
  if (!enabledMetrics.staff?.enabled) {
    return null;
  }

  const staffMetrics = enabledMetrics.staff.metrics || {};
  const waiterPerformanceData = data?.waiterPerformance;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="space-y-6"
    >
      {/* En-tête de section */}
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-semibold text-foreground">Performance du Personnel</h2>
      </div>

      {/* Grille des KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Top 5 des Serveurs */}
        {staffMetrics.topWaiters && (
          <TopWaitersKPI
            data={waiterPerformanceData}
            loading={loading.waiterPerformance}
            error={errors.waiterPerformance}
          />
        )}

        {/* Placeholder pour futures KPIs staff */}
        {/* Ici on pourra ajouter d'autres KPIs comme AverageServiceTimeKPI, TotalActiveStaffKPI, etc. */}
      </div>
    </motion.div>
  );
};

export default StaffSection;