// src/components/dashboard/sections/OperationalSection.js
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import OrderCountKPI from "../kpis/OperationalKPIs/OrderCountKPI";
import AverageTicketKPI from "../kpis/OperationalKPIs/AverageTicketKPI";
import FullPaymentsKPI from "../kpis/OperationalKPIs/FullPaymentsKPI";

const OperationalSection = ({
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
        <h2 className="text-xl font-semibold">Métriques Opérationnelles</h2>
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
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* KPI Nombre de Commandes */}
          <OrderCountKPI
            data={revenueData}
            loading={loading}
            previousData={previousPeriodData}
          />

          {/* KPI Ticket Moyen */}
          <AverageTicketKPI
            data={revenueData}
            loading={loading}
            previousData={previousPeriodData}
          />

          {/* KPI Paiements Complets */}
          <FullPaymentsKPI
            data={revenueData}
            loading={loading}
            previousData={previousPeriodData}
          />
        </motion.div>
      )}
    </div>
  );
};

export default OperationalSection;
