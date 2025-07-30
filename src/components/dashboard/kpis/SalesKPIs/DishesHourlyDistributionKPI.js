// src/components/dashboard/kpis/SalesKPIs/DishesHourlyDistributionKPI.js
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChefHat, Loader2, Info, Calendar } from "lucide-react";
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
 * Composant DishesHourlyDistributionKPI
 * Affiche la distribution horaire des plats préparés pour une date spécifique
 *
 * @param {Object[]} data - Données de distribution horaire des plats
 * @param {boolean} loading - État de chargement
 * @param {Date} date - Date pour laquelle les données sont affichées
 */
export const DishesHourlyDistributionKPI = ({
  data = [],
  loading = false,
  date,
}) => {
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
        dishes: item.dishes || 0,
      }));

      setChartData(formattedData);
    } else {
      setChartData([]);
    }
  }, [data]);

  // Calculer l'heure de pointe (heure avec le plus de plats)
  const getPeakHour = () => {
    if (chartData.length === 0) return null;

    let maxDishes = 0;
    let peakHour = null;

    chartData.forEach((item) => {
      if (item.dishes > maxDishes) {
        maxDishes = item.dishes;
        peakHour = item.hour;
      }
    });

    return { hour: peakHour, count: maxDishes };
  };

  // Calculer le total des plats
  const getTotalDishes = () => {
    return chartData.reduce((sum, item) => sum + item.dishes, 0);
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
      const percentage = ((payload[0].value / getTotalDishes()) * 100).toFixed(
        1
      );
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-semibold">{label}</p>
          <p>{payload[0].value} plats préparés</p>
          <p className="text-muted-foreground">{percentage}% du total</p>
        </div>
      );
    }
    return null;
  };

  // Déterminer l'heure de pointe
  const peakData = getPeakHour();
  const totalDishes = getTotalDishes();

  // Déterminer la couleur des barres (dégradé selon l'intensité)
  const getBarColor = (entry) => {
    if (peakData && entry.hour === peakData.hour) {
      return "#dc2626"; // Rouge pour l'heure de pointe
    }
    return "#f97316"; // Orange par défaut
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="col-span-1 md:col-span-2"
    >
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribution Horaire des Plats
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Répartition du nombre de plats préparés par heure pour la
                  journée sélectionnée. Permet d'identifier les pics d'activité
                  en cuisine.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ChefHat className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <ChefHat className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          ) : (
            <>
              {/* Affichage de la date et du total */}
              <div className="flex items-center justify-between mb-4">
                {date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="capitalize">
                      {formatDisplayDate(date)}
                    </span>
                  </div>
                )}
                <div className="text-sm font-medium">
                  Total:{" "}
                  <span className="text-orange-600">{totalDishes} plats</span>
                </div>
              </div>

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
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Nombre de plats",
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 12 },
                      }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="dishes"
                      radius={[4, 4, 0, 0]}
                      fill="#f97316"
                      maxBarSize={40}
                      animationDuration={1500}
                      isAnimationActive={true}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {peakData && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-muted-foreground">
                        Heure de pointe cuisine:
                      </span>
                      <span className="font-medium text-red-600">
                        {peakData.hour}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {peakData.count} plats (
                      {((peakData.count / totalDishes) * 100).toFixed(0)}% du
                      total)
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DishesHourlyDistributionKPI;
