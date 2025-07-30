// src/components/dashboard/DashboardMetrics.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import DashboardFilters from "./DashboardFilters";
import FinancialSection from "./sections/FinancialSection";
import OperationalSection from "./sections/OperationalSection";
import SalesSection from "./sections/SalesSection";
import RestaurantSelector from "@/components/common/RestaurantSelector";

import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";

// Fonction pour obtenir la date d'il y a 30 jours
const getThirtyDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};

// Configuration initiale des métriques visibles
const getInitialMetricsConfig = () => ({
  financial: {
    enabled: true,
    metrics: {
      realRevenue: true,
      theoreticalRevenue: true,
      revenueGap: true,
      discountRate: true,
    },
  },
  operational: {
    enabled: true,
    metrics: {
      orderCount: true,
      averageTicket: true,
      fullPayments: true,
    },
  },
  sales: {
    enabled: false,
    metrics: {
      topDishes: false,
      categoryBreakdown: false,
      hourlyDistribution: false,
      dishesHourlyDistribution: false,
      dishesDailyTrend: false,
      ordersDailyTrend: false,
      dishesStats: false,
      paymentStatusStats: false,
    },
  },
});

// Composant principal DashboardMetrics
export const DashboardMetrics = () => {
  const { user, roles } = useAuth();

  // État pour les dates
  const [startDate, setStartDate] = useState(getThirtyDaysAgo());
  const [endDate, setEndDate] = useState(new Date());

  // Vérifier si l'utilisateur est admin
  const isAdmin = roles.includes("ROLE_ADMIN");

  // État pour le tenant sélectionné (initialisé avec le tenantCode de l'utilisateur pour les non-admins)
  const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
    return user?.tenantCode || "";
  });

  // État pour les métriques visibles
  const [visibleMetrics, setVisibleMetrics] = useState(
    getInitialMetricsConfig()
  );

  // Déterminer le tenant code à utiliser
  const tenantCode = isAdmin ? selectedRestaurant : user?.tenantCode;

  // Utiliser le hook optimisé pour les données
  const { data, loading, errors, isLoading, refetch } = useDashboardData(
    tenantCode,
    startDate,
    endDate,
    visibleMetrics
  );

  // Mettre à jour le restaurant sélectionné si l'utilisateur change (pour les non-admins)
  useEffect(() => {
    if (!isAdmin && user?.tenantCode && !selectedRestaurant) {
      setSelectedRestaurant(user.tenantCode);
    }
  }, [isAdmin, user, selectedRestaurant]);

  // Callback pour le changement de restaurant
  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
  };

  // Callback pour le changement de dates
  const handleDateChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Callback pour le changement de métriques visibles
  const handleMetricsChange = (newMetrics) => {
    setVisibleMetrics(newMetrics);
  };

  // Callback pour appliquer les filtres
  const handleApplyFilters = () => {
    // Forcer le refetch même si les dépendances n'ont pas changé
    refetch();
  };

  // Fonction pour rafraîchir manuellement les données
  const handleManualRefresh = () => {
    refetch();
  };

  // Message si pas de restaurant assigné/sélectionné
  if (!tenantCode && !isLoading) {
    return (
      <Alert className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {isAdmin
            ? "Veuillez sélectionner un restaurant pour afficher le tableau de bord."
            : "Aucun restaurant assigné à votre compte. Veuillez contacter l'administrateur."}
        </AlertDescription>
      </Alert>
    );
  }

  // Vérifier s'il y a des erreurs critiques
  const hasErrors = Object.values(errors).some((error) => error !== null);

  return (
    <div className="space-y-10">
      {/* En-tête avec sélecteur de restaurant et bouton refresh */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col sm:flex-row justify-between items-start gap-4"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Tableau de bord</h2>
          {tenantCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
          )}
        </div>
        {isAdmin && (
          <RestaurantSelector
            value={selectedRestaurant}
            onChange={handleRestaurantChange}
          />
        )}
      </motion.div>

      {/* Composant de filtres avec export intégré */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DashboardFilters
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          onMetricsChange={handleMetricsChange}
          onApply={handleApplyFilters}
          loading={isLoading}
          tenantCode={tenantCode}
        />
      </motion.div>

      {/* Afficher les erreurs s'il y en a */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Certaines données n'ont pas pu être chargées. Les métriques
            disponibles sont affichées.
          </AlertDescription>
        </Alert>
      )}

      {/* Section des métriques financières */}
      {visibleMetrics.financial.enabled && (
        <FinancialSection
          revenueData={data.revenue}
          previousPeriodData={data.previousRevenue}
          loading={loading.revenue}
          visibleMetrics={visibleMetrics.financial.metrics}
          error={errors.revenue}
        />
      )}

      {/* Section des métriques opérationnelles */}
      {visibleMetrics.operational.enabled && (
        <OperationalSection
          revenueData={data.revenue}
          previousPeriodData={data.previousRevenue}
          loading={loading.revenue}
          visibleMetrics={visibleMetrics.operational.metrics}
          error={errors.revenue}
        />
      )}

      {/* Section d'analyse des ventes */}
      {visibleMetrics.sales.enabled && (
        <SalesSection
          tenantCode={tenantCode}
          startDate={startDate}
          endDate={endDate}
          categoryData={data.categoryBreakdown}
          hourlyData={data.hourlyDistribution}
          topDishesData={data.topDishes}
          dishesHourlyData={data.dishesHourlyDistribution}
          dishesDailyData={data.dishesDailyTrend}
          ordersDailyData={data.ordersDailyTrend}
          dishesStatsData={data.dishesStats}
          paymentStatusData={data.paymentStatusStats}
          loading={{
            categoryBreakdown: loading.categoryBreakdown,
            hourlyDistribution: loading.hourlyDistribution,
            topDishes: loading.topDishes,
            dishesHourlyDistribution: loading.dishesHourlyDistribution,
            dishesDailyTrend: loading.dishesDailyTrend,
            ordersDailyTrend: loading.ordersDailyTrend,
            dishesStats: loading.dishesStats,
            paymentStatusStats: loading.paymentStatusStats,
          }}
          visibleMetrics={visibleMetrics.sales.metrics}
          errors={{
            categoryBreakdown: errors.categoryBreakdown,
            hourlyDistribution: errors.hourlyDistribution,
            topDishes: errors.topDishes,
            dishesHourlyDistribution: errors.dishesHourlyDistribution,
            dishesDailyTrend: errors.dishesDailyTrend,
            ordersDailyTrend: errors.ordersDailyTrend,
            dishesStats: errors.dishesStats,
            paymentStatusStats: errors.paymentStatusStats,
          }}
          currencyCode={data.revenue?.currency?.code || "$"}
        />
      )}
    </div>
  );
};

export default DashboardMetrics;
