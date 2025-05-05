// src/components/dashboard/DashboardMetrics.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Calendar, ArrowRight, RefreshCw } from "lucide-react";
import orderService from "@/services/orderService";
import RealRevenueKPI from "./kpis/RealRevenueKPI";
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

// Composant principal DashboardMetrics
export const DashboardMetrics = () => {
  const { user, roles } = useAuth();
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour les dates (par défaut: 30 derniers jours)
  const [startDate, setStartDate] = useState(getThirtyDaysAgo());
  const [endDate, setEndDate] = useState(new Date());

  // État pour suivre si les données ont été chargées au moins une fois
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Déterminer le tenant code depuis l'utilisateur
  const tenantCode = user?.tenantCode;

  // Fonction pour récupérer les données de revenus
  const fetchRevenueData = async () => {
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

      // Appel API pour les données de la période sélectionnée
      const data = await orderService.getRevenue(
        formattedStartDate,
        formattedEndDate,
        tenantCode
      );

      setRevenueData(data);
      setInitialLoadDone(true);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("Erreur lors de la récupération des données de revenus");
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    if (tenantCode && !initialLoadDone) {
      fetchRevenueData();
    }
  }, [tenantCode, initialLoadDone]);

  // Fonction pour gérer la soumission du formulaire de date
  const handleDateSubmit = (e) => {
    e.preventDefault();
    fetchRevenueData();
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
    <div className="space-y-6">
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

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI Revenus Réels */}
        <RealRevenueKPI value={revenueData?.realRevenue} loading={loading} />

        {/* TODO: Autres KPIs à ajouter ici */}
      </div>
    </div>
  );
};

export default DashboardMetrics;
