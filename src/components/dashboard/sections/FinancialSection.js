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
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold">Métriques Financières</h2>
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
          {/* KPI Revenus Réels */}
          <RealRevenueKPI
            value={revenueData?.realRevenue}
            loading={loading}
            previousData={previousPeriodData}
          />

          {/* KPI Revenus Théoriques */}
          <TheoreticalRevenueKPI
            value={revenueData?.theoreticalRevenue}
            loading={loading}
            previousData={previousPeriodData}
          />

          {/* KPI Écart de Revenus */}
          <RevenueGapKPI data={revenueData} loading={loading} />

          {/* KPI Taux de Remise */}
          <DiscountRateKPI data={revenueData} loading={loading} />
        </motion.div>
      )}
    </div>
  );
};

export default FinancialSection;
