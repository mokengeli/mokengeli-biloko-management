// src/components/dashboard/kpis/SalesKPIs/DishesStatsKPI.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChefHat, Loader2, Info, PieChart, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PieChart as RechartPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * Composant DishesStatsKPI
 * Affiche une vue globale des statistiques des plats
 *
 * @param {Object} data - Données des statistiques
 * @param {boolean} loading - État de chargement
 */
export const DishesStatsKPI = ({ data, loading = false }) => {
  // Palette de couleurs
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#6366f1",
    "#ec4899",
    "#14b8a6",
  ];

  // Rendu personnalisé pour le tooltip du camembert
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / (data.totalDishes || 1)) * 100).toFixed(
        1
      );
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-semibold">{data.name}</p>
          <p>Quantité: {data.value}</p>
          <p>{percentage}% du total</p>
        </div>
      );
    }
    return null;
  };

  // Rendu personnalisé pour le tooltip des barres
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-semibold">{label}</p>
          <p>{payload[0].value} plats préparés</p>
        </div>
      );
    }
    return null;
  };

  // Préparer les données pour le graphique camembert
  const pieData =
    data?.dishesPerCategory?.map((item, index) => ({
      name: item.categoryName || `Catégorie ${index + 1}`,
      value: item.value || 0,
      totalDishes: data.totalDishesServed,
      fill: COLORS[index % COLORS.length],
    })) || [];

  // Préparer les données pour le graphique en barres
  const barData =
    data?.dishesPerHour?.map((item) => ({
      hour: `${item.hour}h`,
      value: item.value || 0,
    })) || [];

  // Rendu personnalisé pour la légende
  const renderCustomizedLegend = ({ payload }) => {
    if (!payload || payload.length === 0) return null;

    return (
      <ul className="text-xs flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-1 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-1 md:col-span-3"
    >
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vue Globale des Plats
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Vue d'ensemble complète de l'activité des plats incluant le
                  total servi, la répartition par catégorie et l'activité
                  horaire
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ChefHat className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !data || data.totalDishesServed === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <ChefHat className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Métrique principale */}
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Total des plats servis
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {data.totalDishesServed.toLocaleString()}
                </p>
              </div>

              {/* Graphiques côte à côte */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Répartition par catégorie */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="h-4 w-4 text-purple-500" />
                    <h4 className="text-sm font-medium">
                      Répartition par Catégorie
                    </h4>
                  </div>
                  {pieData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Legend content={renderCustomizedLegend} />
                          <RechartsTooltip content={<CustomPieTooltip />} />
                        </RechartPieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">Aucune donnée de catégorie</p>
                    </div>
                  )}
                </div>

                {/* Distribution horaire */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <h4 className="text-sm font-medium">Activité par Heure</h4>
                  </div>
                  {barData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 11 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={50}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip content={<CustomBarTooltip />} />
                          <Bar
                            dataKey="value"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={30}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">Aucune donnée horaire</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Résumé des pics d'activité */}
              {data.dishesPerHour && data.dishesPerHour.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Heure de pointe:{" "}
                    <span className="font-medium text-blue-600">
                      {(() => {
                        const peak = data.dishesPerHour.reduce((max, item) =>
                          item.value > max.value ? item : max
                        );
                        return `${peak.hour}h avec ${peak.value} plats`;
                      })()}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DishesStatsKPI;
