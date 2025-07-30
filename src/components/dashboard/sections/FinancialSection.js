// src/components/dashboard/sections/FinancialSection.js
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import RealRevenueKPI from "../kpis/FinancialKPIs/RealRevenueKPI";
import TheoreticalRevenueKPI from "../kpis/FinancialKPIs/TheoreticalRevenueKPI";
import RevenueGapKPI from "../kpis/FinancialKPIs/RevenueGapKPI";
import DiscountRateKPI from "../kpis/FinancialKPIs/DiscountRateKPI";

const FinancialSection = ({
  revenueData,
  previousPeriodData,
  loading,
  visibleMetrics = {
    realRevenue: true,
    theoreticalRevenue: true,
    revenueGap: true,
    discountRate: true,
  },
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Compter le nombre de métriques visibles
  const visibleCount = Object.values(visibleMetrics).filter((v) => v).length;

  // Si aucune métrique n'est visible, ne rien afficher
  if (visibleCount === 0) return null;

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold">
          Métriques Financières
          <span className="text-sm text-muted-foreground ml-2">
            ({visibleCount} métriques)
          </span>
        </h2>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* KPI Revenus Réels - Passer data complet au lieu de juste value */}
          {visibleMetrics.realRevenue && (
            <RealRevenueKPI
              data={revenueData}
              loading={loading}
              previousData={previousPeriodData}
            />
          )}

          {/* KPI Revenus Théoriques - Passer data complet au lieu de juste value */}
          {visibleMetrics.theoreticalRevenue && (
            <TheoreticalRevenueKPI
              data={revenueData}
              loading={loading}
              previousData={previousPeriodData}
            />
          )}

          {/* KPI Écart de Revenus */}
          {visibleMetrics.revenueGap && (
            <RevenueGapKPI data={revenueData} loading={loading} />
          )}

          {/* KPI Taux de Remise */}
          {visibleMetrics.discountRate && (
            <DiscountRateKPI data={revenueData} loading={loading} />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FinancialSection;
