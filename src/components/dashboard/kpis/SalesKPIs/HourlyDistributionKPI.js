// src/components/dashboard/kpis/SalesKPIs/HourlyDistributionKPI.js
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, Loader2, Info, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Composant HourlyDistributionKPI
 * Affiche la distribution horaire des commandes pour une date spécifique
 *
 * @param {Object[]} data - Données de distribution horaire
 * @param {boolean} loading - État de chargement
 * @param {Date} date - Date pour laquelle les données sont affichées
 */
export const HourlyDistributionKPI = ({ data = [], loading = false, date }) => {
  // État pour stocker les données formatées pour le graphique
  const [chartData, setChartData] = useState([]);

  // Formater les données pour le graphique
  useEffect(() => {
    if (data && data.length > 0) {
      // Trier les données par heure
      const sortedData = [...data].sort((a, b) => a.hour - b.hour);

      // Formater les données pour le graphique
      const formattedData = sortedData.map((item) => ({
        hour: `${item.hour}h`,
        orders: item.orders || 0,
      }));

      setChartData(formattedData);
    } else {
      setChartData([]);
    }
  }, [data]);

  // Calculer l'heure de pointe (heure avec le plus de commandes)
  const getPeakHour = () => {
    if (chartData.length === 0) return null;

    let maxOrders = 0;
    let peakHour = null;

    chartData.forEach((item) => {
      if (item.orders > maxOrders) {
        maxOrders = item.orders;
        peakHour = item.hour;
      }
    });

    return peakHour;
  };

  // Formater la date pour l'affichage
  const formatDisplayDate = (dateObj) => {
    if (!dateObj) return "";

    // Si c'est déjà une date
    if (dateObj instanceof Date) {
      return dateObj.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Si c'est une string, la parser d'abord
    const parsedDate = new Date(dateObj);
    if (isNaN(parsedDate)) return "";

    return parsedDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Rendu personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-semibold">{label}</p>
          <p>{payload[0].value} commandes</p>
        </div>
      );
    }
    return null;
  };

  // Déterminer l'heure de pointe
  const peakHour = getPeakHour();

  // Déterminer la couleur des barres
  const getBarColor = (entry) => {
    return entry.hour === peakHour ? "#8b5cf6" : "#3b82f6";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="col-span-1 md:col-span-2"
    >
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribution Horaire
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Répartition du nombre de commandes par heure pour la journée
                  sélectionnée
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Clock className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Clock className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          ) : (
            <>
              {/* Affichage de la date */}
              {date && (
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="capitalize">{formatDisplayDate(date)}</span>
                </div>
              )}

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      tickMargin={8}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="orders"
                      radius={[4, 4, 0, 0]}
                      fill="#3b82f6"
                      maxBarSize={40}
                      animationDuration={1500}
                      isAnimationActive={true}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {peakHour && (
                <div className="text-center mt-2 text-xs text-muted-foreground">
                  Heure de pointe:{" "}
                  <span className="font-medium text-violet-500">
                    {peakHour}
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HourlyDistributionKPI;
