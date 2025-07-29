// src/components/dashboard/sections/SalesSection.js (version mise à jour)
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import TopDishesKPI from "../kpis/SalesKPIs/TopDishesKPI";
import CategoryBreakdownKPI from "../kpis/SalesKPIs/CategoryBreakdownKPI";
import HourlyDistributionKPI from "../kpis/SalesKPIs/HourlyDistributionKPI";

const SalesSection = ({
  tenantCode,
  startDate,
  endDate,
  categoryData,
  hourlyData,
  topDishesData,
  loading = {
    categoryBreakdown: false,
    hourlyDistribution: false,
    topDishes: false,
  },
  visibleMetrics = {
    topDishes: false,
    categoryBreakdown: false,
    hourlyDistribution: false,
  },
  errors = {
    categoryBreakdown: null,
    hourlyDistribution: null,
    topDishes: null,
  },
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Compter le nombre de métriques visibles
  const visibleCount = Object.values(visibleMetrics).filter((v) => v).length;

  // Si aucune métrique n'est visible, ne rien afficher
  if (visibleCount === 0) return null;

  // Vérifier s'il y a des erreurs
  const hasErrors = Object.values(errors).some((error) => error !== null);

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold">
          Analyse de Ventes
          <span className="text-sm text-muted-foreground ml-2">
            ({visibleCount} métriques)
          </span>
        </h2>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Afficher les erreurs si présentes */}
          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Certaines données de ventes n'ont pas pu être chargées.
              </AlertDescription>
            </Alert>
          )}

          {/* KPI Top Dishes - Version optimisée */}
          {visibleMetrics.topDishes && (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              <TopDishesKPIOptimized
                data={topDishesData}
                loading={loading.topDishes}
                error={errors.topDishes}
              />
            </div>
          )}

          {/* Graphiques */}
          {(visibleMetrics.categoryBreakdown ||
            visibleMetrics.hourlyDistribution) && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Graphique Répartition par Catégorie */}
              {visibleMetrics.categoryBreakdown && (
                <CategoryBreakdownKPI
                  data={categoryData}
                  loading={loading.categoryBreakdown}
                  error={errors.categoryBreakdown}
                />
              )}

              {/* Graphique Distribution Horaire - avec la date */}
              {visibleMetrics.hourlyDistribution && (
                <HourlyDistributionKPI
                  data={hourlyData}
                  loading={loading.hourlyDistribution}
                  error={errors.hourlyDistribution}
                  date={endDate} // Passage de la date de fin utilisée pour l'API
                />
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Nouveau composant TopDishesKPI optimisé qui utilise les données centralisées
const TopDishesKPIOptimized = ({ data, loading, error }) => {
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
                  Classement des plats les plus vendus sur la période
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
            <div className="text-center text-red-500 py-4">
              Erreur lors du chargement des plats populaires
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucune donnée disponible pour cette période
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((dish, index) => (
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
                      {Math.round((dish.revenue / dish.quantity) * 100) /
                        100}{" "}
                      /unité
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

// Import des composants nécessaires pour TopDishesKPIOptimized
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp, Loader2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/dashboardUtils";

// Fonction pour obtenir la couleur du rang
const getRankColor = (index) => {
  switch (index) {
    case 0:
      return "bg-yellow-100 text-yellow-700"; // Or
    case 1:
      return "bg-gray-100 text-gray-700"; // Argent
    case 2:
      return "bg-amber-100 text-amber-700"; // Bronze
    default:
      return "bg-blue-100 text-blue-600"; // Autres
  }
};

export default SalesSection;
