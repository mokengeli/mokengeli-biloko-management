// src/components/dashboard/kpis/SalesKPIs/OrdersDailyTrendKPI.js
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Info,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Dot,
} from "recharts";

/**
 * Composant OrdersDailyTrendKPI
 * Affiche la tendance quotidienne des commandes sur une période
 *
 * @param {Object[]} data - Données de distribution quotidienne
 * @param {boolean} loading - État de chargement
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 */
export const OrdersDailyTrendKPI = ({
  data = [],
  loading = false,
  startDate,
  endDate,
}) => {
  const [chartData, setChartData] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    average: 0,
    peak: { day: null, value: 0 },
    lowest: { day: null, value: 0 },
    trend: 0,
    stdDev: 0,
  });

  // Formater les données et calculer les statistiques
  useEffect(() => {
    if (data && data.length > 0) {
      // Trier les données par date
      const sortedData = [...data].sort(
        (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
      );

      // Formater les données pour le graphique
      const formattedData = sortedData.map((item) => {
        const date = new Date(item.day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        return {
          day: item.day,
          displayDay: formatShortDate(date),
          orders: item.orders || 0,
          isWeekend,
        };
      });

      // Calculer les statistiques
      const total = formattedData.reduce((sum, item) => sum + item.orders, 0);
      const average = total / formattedData.length;

      // Trouver le pic et le creux
      let peak = { day: null, value: 0 };
      let lowest = { day: null, value: Infinity };

      formattedData.forEach((item) => {
        if (item.orders > peak.value) {
          peak = {
            day: item.day,
            value: item.orders,
            displayDay: item.displayDay,
          };
        }
        if (item.orders < lowest.value) {
          lowest = {
            day: item.day,
            value: item.orders,
            displayDay: item.displayDay,
          };
        }
      });

      // Calculer la tendance (régression linéaire simple)
      const trend = calculateTrend(formattedData);

      // Calculer l'écart-type
      const variance =
        formattedData.reduce(
          (sum, item) => sum + Math.pow(item.orders - average, 2),
          0
        ) / formattedData.length;
      const stdDev = Math.sqrt(variance);

      setChartData(formattedData);
      setStatistics({
        total: Math.round(total),
        average: Math.round(average),
        peak,
        lowest,
        trend,
        stdDev: Math.round(stdDev),
      });
    } else {
      setChartData([]);
      setStatistics({
        total: 0,
        average: 0,
        peak: { day: null, value: 0 },
        lowest: { day: null, value: 0 },
        trend: 0,
        stdDev: 0,
      });
    }
  }, [data]);

  // Formater une date courte pour l'affichage
  const formatShortDate = (date) => {
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    return `${day} ${dayNum}`;
  };

  // Calculer la tendance (pente de la régression linéaire)
  const calculateTrend = (data) => {
    if (data.length < 2) return 0;

    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, item) => sum + item.orders, 0);
    const sumXY = data.reduce((sum, item, i) => sum + i * item.orders, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Convertir en pourcentage de changement
    const avgY = sumY / n;
    const percentChange = (slope / avgY) * 100 * n;

    return percentChange;
  };

  // Rendu personnalisé du tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.day);
      const variation = (
        ((data.orders - statistics.average) / statistics.average) *
        100
      ).toFixed(1);

      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-semibold text-sm">
            {date.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <p className="text-lg font-bold text-blue-600">
            {data.orders} commandes
          </p>
          <p className="text-xs text-muted-foreground">
            {variation > 0 ? "+" : ""}
            {variation}% vs moyenne
          </p>
          {data.isWeekend && (
            <p className="text-xs text-blue-600 mt-1">Weekend</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Rendu personnalisé des points
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;

    if (payload.day === statistics.peak.day) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#dc2626"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }

    if (payload.isWeekend) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#3b82f6"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#8b5cf6"
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  // Déterminer l'icône et la couleur de tendance
  const getTrendIcon = () => {
    if (statistics.trend > 5) {
      return { icon: TrendingUp, color: "text-green-600" };
    } else if (statistics.trend < -5) {
      return { icon: TrendingDown, color: "text-red-600" };
    }
    return { icon: Minus, color: "text-gray-600" };
  };

  const { icon: TrendIcon, color: trendColor } = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="col-span-1 md:col-span-3"
    >
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tendance Quotidienne des Commandes
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Évolution du nombre de commandes par jour. Permet d'identifier
                  les tendances et patterns d'activité.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <TrendIcon className={`h-5 w-5 ${trendColor}`} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          ) : (
            <>
              {/* Cards de statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Total période</p>
                  <p className="text-lg font-bold">
                    {statistics.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">commandes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Moyenne/jour</p>
                  <p className="text-lg font-bold">
                    {statistics.average.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ±{statistics.stdDev}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    Pic d'activité
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {statistics.peak.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {statistics.peak.displayDay}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Tendance</p>
                  <p className={`text-lg font-bold ${trendColor}`}>
                    {statistics.trend > 0 ? "+" : ""}
                    {statistics.trend.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    sur la période
                  </p>
                </div>
              </div>

              {/* Graphique */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="displayDay"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                      tickMargin={8}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      domain={["dataMin - 10", "dataMax + 10"]}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />

                    {/* Ligne de moyenne */}
                    <ReferenceLine
                      y={statistics.average}
                      stroke="#6b7280"
                      strokeDasharray="5 5"
                      label={{
                        value: "Moyenne",
                        position: "right",
                        fontSize: 12,
                      }}
                    />

                    {/* Zone au-dessus/en-dessous de la moyenne */}
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="none"
                      fill="#10b981"
                      fillOpacity={0.1}
                    />

                    {/* Ligne principale */}
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={<CustomDot />}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Légende */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Jour normal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Weekend</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Pic d'activité</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrdersDailyTrendKPI;
