// src/components/dashboard/kpis/TopDishesKPI.js
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Award, TrendingUp, Loader2, Info } from "lucide-react";
import { formatCurrency } from "@/lib/dashboardUtils";
import orderService from "@/services/orderService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Composant TopDishesKPI
 * Affiche les plats les plus vendus pendant la période sélectionnée
 *
 * @param {string} tenantCode - Code du restaurant
 * @param {string} startDate - Date de début (format yyyy-mm-dd)
 * @param {string} endDate - Date de fin (format yyyy-mm-dd)
 * @param {number} limit - Nombre de plats à afficher
 */
export const TopDishesKPI = ({ tenantCode, startDate, endDate, limit = 5 }) => {
  const [topDishes, setTopDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données des plats populaires
  useEffect(() => {
    const fetchTopDishes = async () => {
      if (!tenantCode || !startDate || !endDate) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await orderService.getTopDishes(
          startDate,
          endDate,
          tenantCode,
          limit
        );

        setTopDishes(data || []);
      } catch (err) {
        console.error("Error fetching top dishes:", err);
        setError("Erreur lors de la récupération des plats populaires");
      } finally {
        setLoading(false);
      }
    };

    fetchTopDishes();
  }, [tenantCode, startDate, endDate, limit]);

  // Génération des couleurs pour les rangs
  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return "bg-yellow-100 text-yellow-700"; // Or (1er)
      case 1:
        return "bg-gray-100 text-gray-700"; // Argent (2ème)
      case 2:
        return "bg-amber-100 text-amber-700"; // Bronze (3ème)
      default:
        return "bg-blue-100 text-blue-600"; // Autres
    }
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
              Plats les plus vendus
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Classement des plats les plus vendus
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Award className="h-5 w-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : topDishes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucune donnée disponible pour cette période
            </div>
          ) : (
            <div className="space-y-4">
              {topDishes.map((dish, index) => (
                <motion.div
                  key={dish.dishId}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold
                      ${getRankColor(index)}
                    `}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{dish.name}</div>
                    <div className="text-sm text-gray-500">
                      {dish.quantity} vendus
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatCurrency(dish.revenue)}
                    </div>
                    <div className="text-xs text-green-600 flex items-center justify-end">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {Math.round((dish.revenue / dish.quantity) * 100) / 100} /
                      unité
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopDishesKPI;
