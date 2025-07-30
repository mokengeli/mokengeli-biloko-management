// src/components/dashboard/kpis/SalesKPIs/CategoryBreakdownKPI.js
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PieChart, Loader2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/dashboardUtils";
import {
  PieChart as RechartPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Composant CategoryBreakdownKPI
 * Affiche la répartition du chiffre d'affaires par catégorie
 *
 * @param {Object[]} data - Données de répartition par catégorie
 * @param {boolean} loading - État de chargement
 * @param {string} currencyCode - Code de la devise
 */
export const CategoryBreakdownKPI = ({
  data = [],
  loading = false,
  currencyCode = "€",
}) => {
  // Palette de couleurs pour le graphique
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#6366f1",
  ];

  // État pour stocker les données formatées pour le graphique
  const [chartData, setChartData] = useState([]);

  // Formater les données pour le graphique pie
  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((item, index) => ({
        name: item.categoryName || `Catégorie ${index + 1}`,
        value: item.value || 0,
        revenue: item.revenue || 0,
        fill: COLORS[index % COLORS.length],
      }));
      setChartData(formattedData);
    } else {
      setChartData([]);
    }
  }, [data]);

  // Calculer le total des revenus
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

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

  // Rendu personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-semibold">{data.name}</p>
          <p>Quantité: {data.value}</p>
          <p>{formatCurrency(data.revenue, currencyCode)}</p>
          <p>{((data.revenue / totalRevenue) * 100).toFixed(1)}% du CA</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-1 md:col-span-2"
    >
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Répartition par Catégorie
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Distribution du chiffre d'affaires par catégorie de produits
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <PieChart className="h-5 w-5 text-violet-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <PieChart className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend content={renderCustomizedLegend} />
                  <RechartsTooltip content={<CustomTooltip />} />
                </RechartPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CategoryBreakdownKPI;
