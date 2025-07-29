// src/components/dashboard/sections/SalesSection.js
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import TopDishesKPI from "../kpis/SalesKPIs/TopDishesKPI";
import CategoryBreakdownKPI from "../kpis/SalesKPIs/CategoryBreakdownKPI";
import HourlyDistributionKPI from "../kpis/SalesKPIs/HourlyDistributionKPI";

const SalesSection = ({
  tenantCode,
  startDate,
  endDate,
  categoryData,
  hourlyData,
  loading,
  visibleMetrics = {
    topDishes: false,
    categoryBreakdown: false,
    hourlyDistribution: false,
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
          Analyse de Ventes
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
          className="space-y-6"
        >
          {/* KPI Top Dishes */}
          {visibleMetrics.topDishes && (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              <TopDishesKPI
                tenantCode={tenantCode}
                startDate={startDate}
                endDate={endDate}
                limit={5}
              />
            </div>
          )}

          {/* Graphiques */}
          {(visibleMetrics.categoryBreakdown ||
            visibleMetrics.hourlyDistribution) && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Graphique Répartition par Catégorie */}
              {visibleMetrics.categoryBreakdown && (
                <CategoryBreakdownKPI data={categoryData} loading={loading} />
              )}

              {/* Graphique Distribution Horaire */}
              {visibleMetrics.hourlyDistribution && (
                <HourlyDistributionKPI data={hourlyData} loading={loading} />
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SalesSection;
