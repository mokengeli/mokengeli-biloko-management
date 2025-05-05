// src/components/dashboard/DashboardMetrics.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Package,
  ShoppingCart,
  Euro,
  Utensils,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import orderService from "@/services/orderService";
import { formatCurrency, getChangeColor } from "@/lib/dashboardUtils";

// Composant KPICard réutilisable
const KPICard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "blue",
  loading = false,
}) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={`h-5 w-5 text-${color}-500`} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1">{value}</div>
              {change !== undefined && (
                <div
                  className={`flex items-center text-sm ${getChangeColor(
                    change
                  )}`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(change)}% vs hier
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Composant LoadingState
const LoadingState = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <KPICard key={i} title="" value="" loading={true} />
      ))}
    </div>
  </div>
);

// Composant FinancialKPISection
const FinancialKPISection = ({ data, loading }) => {
  if (!data && !loading) return null;

  const realRevenue = data?.realRevenue || 0;
  const theoreticalRevenue = data?.theoreticalRevenue || 0;
  const revenueGap = theoreticalRevenue - realRevenue;
  const discountRate =
    theoreticalRevenue > 0
      ? ((revenueGap / theoreticalRevenue) * 100).toFixed(1)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Revenus Réels"
        value={formatCurrency(realRevenue)}
        icon={Euro}
        color="green"
        loading={loading}
      />
      <KPICard
        title="Revenus Théoriques"
        value={formatCurrency(theoreticalRevenue)}
        icon={Euro}
        color="blue"
        loading={loading}
      />
      <KPICard
        title="Écart de Revenus"
        value={formatCurrency(revenueGap)}
        icon={ArrowDown}
        color="red"
        loading={loading}
      />
      <KPICard
        title="Taux de Remise"
        value={`${discountRate}%`}
        icon={Package}
        color="amber"
        loading={loading}
      />
    </div>
  );
};

// Composant de KPIs Opérationnels
const OperationalKPISection = ({ data, loading }) => {
  if (!data && !loading) return null;

  const orders = data?.orders || [];
  const totalOrders = orders.length;
  const totalAmount = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  const averageTicket = totalOrders > 0 ? totalAmount / totalOrders : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <KPICard
        title="Nombre de Commandes"
        value={totalOrders.toString()}
        icon={ShoppingCart}
        color="blue"
        loading={loading}
      />
      <KPICard
        title="Ticket Moyen"
        value={formatCurrency(averageTicket)}
        icon={Euro}
        color="green"
        loading={loading}
      />
      <KPICard
        title="Paiements Complets"
        value={formatCurrency(data?.breakdown?.fullPayments || 0)}
        icon={Utensils}
        color="violet"
        loading={loading}
      />
    </div>
  );
};

// Composant principal DashboardMetrics
export const DashboardMetrics = ({ tenantCode, startDate, endDate }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!tenantCode) return;

      setLoading(true);
      setError(null);

      try {
        const revenueData = await orderService.getRevenue(
          startDate,
          endDate,
          tenantCode
        );

        setDashboardData(revenueData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          "Erreur lors de la récupération des données du tableau de bord"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenantCode, startDate, endDate]);

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Financiers */}
      <FinancialKPISection data={dashboardData} loading={loading} />

      {/* KPIs Opérationnels */}
      <OperationalKPISection data={dashboardData} loading={loading} />

      {/* TODO: Ajouter d'autres sections pour :
          - TopDishes (via /api/order/dashboard/dishes/top)
          - CategoryBreakdown (via /api/order/dashboard/revenue/breakdown-by-category)
          - HourlyDistribution (via /api/order/dashboard/hourly-distribution)
          - InventoryAlerts
      */}
    </div>
  );
};

export default DashboardMetrics;
