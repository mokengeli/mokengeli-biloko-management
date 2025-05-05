// src/components/dashboard/DashboardMetrics.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Calendar,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import orderService from "@/services/orderService";
import { useAuth } from "@/hooks/useAuth";

// Importer les KPIs
import RealRevenueKPI from "./kpis/RealRevenueKPI";
import TheoreticalRevenueKPI from "./kpis/TheoreticalRevenueKPI";
import RevenueGapKPI from "./kpis/RevenueGapKPI";
import DiscountRateKPI from "./kpis/DiscountRateKPI";
import OrderCountKPI from "./kpis/OrderCountKPI";
import AverageTicketKPI from "./kpis/AverageTicketKPI";
import FullPaymentsKPI from "./kpis/FullPaymentsKPI";
import TopDishesKPI from "./kpis/TopDishesKPI";
import CategoryBreakdownKPI from "./kpis/CategoryBreakdownKPI";
import HourlyDistributionKPI from "./kpis/HourlyDistributionKPI";

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

// Composant Section avec possibilité de collapse
const CollapsibleSection = ({ title, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>

      {isExpanded && children}
    </div>
  );
};

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

  // État pour suivre si les données ont été chargées au moins une fois
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Déterminer le tenant code depuis l'utilisateur
  const tenantCode = user?.tenantCode;

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
        orderService.getHourlyDistribution(formattedEndDate, tenantCode), // On utilise la date de fin pour la distribution horaire
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

  // Chargement initial des données
  useEffect(() => {
    if (tenantCode && !initialLoadDone) {
      fetchDashboardData();
    }
  }, [tenantCode, initialLoadDone]);

  // Fonction pour gérer la soumission du formulaire de date
  const handleDateSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  // Message si pas de restaurant assigné à l'utilisateur
  if (!tenantCode && !loading) {
    return (
      <Alert className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Aucun restaurant assigné à votre compte. Veuillez contacter
          l'administrateur.
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
      {/* Sélecteur de période */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={handleDateSubmit}
              className="flex flex-col sm:flex-row gap-4 items-end"
            >
              <div className="space-y-2 flex-1">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Date de début
                </label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={formatDateForAPI(startDate)}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center justify-center mt-2 sm:mt-0">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="space-y-2 flex-1">
                <label htmlFor="endDate" className="text-sm font-medium">
                  Date de fin
                </label>
                <div className="relative">
                  <Input
                    id="endDate"
                    type="date"
                    value={formatDateForAPI(endDate)}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px] h-10"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Chargement
                  </>
                ) : (
                  "Appliquer"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPIs Financiers */}
      <CollapsibleSection title="Métriques Financières" defaultExpanded={true}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </CollapsibleSection>

      {/* KPIs Opérationnels */}
      <CollapsibleSection
        title="Métriques Opérationnelles"
        defaultExpanded={true}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </CollapsibleSection>

      {/* Visualisations */}
      <CollapsibleSection title="Analyse de Ventes" defaultExpanded={true}>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          {/* KPI Top Dishes */}
          <TopDishesKPI
            tenantCode={tenantCode}
            startDate={formatDateForAPI(startDate)}
            endDate={formatDateForAPI(endDate)}
            limit={5}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Graphique Répartition par Catégorie */}
          <CategoryBreakdownKPI data={categoryData} loading={loading} />

          {/* Graphique Distribution Horaire */}
          <HourlyDistributionKPI data={hourlyData} loading={loading} />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default DashboardMetrics;
