// src/components/dashboard/DashboardMetrics.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

import DashboardFilters from "./DashboardFilters";
import FinancialSection from "./sections/FinancialSection";
import OperationalSection from "./sections/OperationalSection";
import SalesSection from "./sections/SalesSection";
import RestaurantSelector from "@/components/inventory/RestaurantSelector";

import orderService from "@/services/orderService";
import { useAuth } from "@/hooks/useAuth";

// Fonction utilitaire pour formater les dates pour l'API
const formatDateForAPI = (date) => {
  return date.toISOString().split("T")[0]; // Format yyyy-mm-dd
};

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
    },
  },
});

// Composant principal DashboardMetrics
export const DashboardMetrics = () => {
  const { user, roles } = useAuth();
  const [revenueData, setRevenueData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [previousPeriodData, setPreviousPeriodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour les dates (par défaut: 30 derniers jours)
  const [startDate, setStartDate] = useState(getThirtyDaysAgo());
  const [endDate, setEndDate] = useState(new Date());

  // État pour le tenant sélectionné (pour les admins)
  const [selectedRestaurant, setSelectedRestaurant] = useState("");

  // État pour les métriques visibles
  const [visibleMetrics, setVisibleMetrics] = useState(
    getInitialMetricsConfig()
  );

  // État pour suivre si les données ont été chargées au moins une fois
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Vérifier si l'utilisateur est admin
  const isAdmin = roles.includes("ROLE_ADMIN");

  // Déterminer le tenant code à utiliser
  const tenantCode = isAdmin ? selectedRestaurant : user?.tenantCode;

  // Définir le restaurant par défaut lors du chargement initial (pour les admins)
  useEffect(() => {
    if (!isAdmin && user?.tenantCode) {
      setSelectedRestaurant(user.tenantCode);
    }
  }, [isAdmin, user]);

  // Fonction pour calculer la période précédente (même durée)
  const calculatePreviousPeriod = (start, end) => {
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const prevStart = new Date(prevEnd);
    prevStart.setTime(prevEnd.getTime() - duration);

    return { prevStart, prevEnd };
  };

  // Fonction pour récupérer les données du dashboard
  const fetchDashboardData = async () => {
    if (!tenantCode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format requis par l'API (yyyy-mm-dd)
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      // Calcul de la période précédente (même durée)
      const { prevStart, prevEnd } = calculatePreviousPeriod(
        startDate,
        endDate
      );
      const formattedPrevStartDate = formatDateForAPI(prevStart);
      const formattedPrevEndDate = formatDateForAPI(prevEnd);

      // Appel API pour toutes les données du dashboard
      const [
        currentRevenueData,
        previousRevenueData,
        categoryBreakdownData,
        hourlyDistributionData,
      ] = await Promise.all([
        orderService.getRevenue(
          formattedStartDate,
          formattedEndDate,
          tenantCode
        ),
        orderService.getRevenue(
          formattedPrevStartDate,
          formattedPrevEndDate,
          tenantCode
        ),
        orderService.getCategoryBreakdown(
          formattedStartDate,
          formattedEndDate,
          tenantCode
        ),
        orderService.getHourlyDistribution(formattedEndDate, tenantCode),
      ]);

      setRevenueData(currentRevenueData);
      setPreviousPeriodData(previousRevenueData);
      setCategoryData(categoryBreakdownData || []);
      setHourlyData(hourlyDistributionData || []);
      setInitialLoadDone(true);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Erreur lors de la récupération des données du tableau de bord");
    } finally {
      setLoading(false);
    }
  };

  // Callback pour le changement de restaurant
  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    setInitialLoadDone(false);
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
    fetchDashboardData();
  };

  // Chargement initial des données
  useEffect(() => {
    if (tenantCode && !initialLoadDone) {
      fetchDashboardData();
    }
  }, [tenantCode, initialLoadDone]);

  // Message si pas de restaurant assigné/sélectionné
  if (!tenantCode && !loading) {
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

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-10">
      {/* Sélecteur de restaurant (pour les admins uniquement) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col sm:flex-row justify-between items-start gap-4"
        >
          <h2 className="text-xl font-bold">Tableau de bord</h2>
          <RestaurantSelector
            value={selectedRestaurant}
            onChange={handleRestaurantChange}
          />
        </motion.div>
      )}

      {/* Nouveau composant de filtres */}
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
          loading={loading}
        />
      </motion.div>

      {/* Section des métriques financières */}
      {visibleMetrics.financial.enabled && (
        <FinancialSection
          revenueData={revenueData}
          previousPeriodData={previousPeriodData}
          loading={loading}
          visibleMetrics={visibleMetrics.financial.metrics}
        />
      )}

      {/* Section des métriques opérationnelles */}
      {visibleMetrics.operational.enabled && (
        <OperationalSection
          revenueData={revenueData}
          previousPeriodData={previousPeriodData}
          loading={loading}
          visibleMetrics={visibleMetrics.operational.metrics}
        />
      )}

      {/* Section d'analyse des ventes */}
      {visibleMetrics.sales.enabled && (
        <SalesSection
          tenantCode={tenantCode}
          startDate={formatDateForAPI(startDate)}
          endDate={formatDateForAPI(endDate)}
          categoryData={categoryData}
          hourlyData={hourlyData}
          loading={loading}
          visibleMetrics={visibleMetrics.sales.metrics}
        />
      )}
    </div>
  );
};

export default DashboardMetrics;
