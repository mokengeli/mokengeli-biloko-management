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
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold">Analyse de Ventes</h2>
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
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <TopDishesKPI
              tenantCode={tenantCode}
              startDate={startDate}
              endDate={endDate}
              limit={5}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Graphique Répartition par Catégorie */}
            <CategoryBreakdownKPI data={categoryData} loading={loading} />

            {/* Graphique Distribution Horaire */}
            <HourlyDistributionKPI data={hourlyData} loading={loading} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SalesSection;
