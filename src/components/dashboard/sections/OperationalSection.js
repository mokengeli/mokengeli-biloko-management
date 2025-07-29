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
  visibleMetrics = {
    orderCount: true,
    averageTicket: true,
    fullPayments: true,
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
          Métriques Opérationnelles
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
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* KPI Nombre de Commandes */}
          {visibleMetrics.orderCount && (
            <OrderCountKPI
              data={revenueData}
              loading={loading}
              previousData={previousPeriodData}
            />
          )}

          {/* KPI Ticket Moyen */}
          {visibleMetrics.averageTicket && (
            <AverageTicketKPI
              data={revenueData}
              loading={loading}
              previousData={previousPeriodData}
            />
          )}

          {/* KPI Paiements Complets */}
          {visibleMetrics.fullPayments && (
            <FullPaymentsKPI
              data={revenueData}
              loading={loading}
              previousData={previousPeriodData}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OperationalSection;
