// src/components/dashboard/DashboardFilters.js
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import ExportMenu from "./ExportMenu";

// Configuration des sections et métriques
const METRIC_SECTIONS = {
  financial: {
    id: "financial",
    label: "Métriques Financières",
    icon: TrendingUp,
    color: "text-green-600",
    defaultEnabled: true,
    metrics: [
      { id: "realRevenue", label: "Revenus Réels", defaultEnabled: true },
      {
        id: "theoreticalRevenue",
        label: "Revenus Théoriques",
        defaultEnabled: true,
      },
      { id: "revenueGap", label: "Écart de Revenus", defaultEnabled: true },
      { id: "discountRate", label: "Taux de Remise", defaultEnabled: true },
    ],
  },
  operational: {
    id: "operational",
    label: "Métriques Opérationnelles",
    icon: ShoppingCart,
    color: "text-blue-600",
    defaultEnabled: true,
    metrics: [
      { id: "orderCount", label: "Nombre de Commandes", defaultEnabled: true },
      { id: "averageTicket", label: "Ticket Moyen", defaultEnabled: true },
      { id: "fullPayments", label: "Paiements Complets", defaultEnabled: true },
    ],
  },
  sales: {
    id: "sales",
    label: "Analyse de Ventes",
    icon: BarChart3,
    color: "text-purple-600",
    defaultEnabled: false,
    metrics: [
      {
        id: "topDishes",
        label: "Plats les plus vendus",
        defaultEnabled: false,
      },
      {
        id: "categoryBreakdown",
        label: "Répartition par Catégorie",
        defaultEnabled: false,
      },
      {
        id: "hourlyDistribution",
        label: "Distribution Horaire Commandes",
        defaultEnabled: false,
      },
      {
        id: "dishesHourlyDistribution",
        label: "Distribution Horaire Plats",
        defaultEnabled: false,
      },
      {
        id: "dishesStats",
        label: "Vue Globale des Plats",
        defaultEnabled: false,
      },
      {
        id: "paymentStatusStats",
        label: "État des Paiements",
        defaultEnabled: false,
      },
      {
        id: "ordersDailyTrend",
        label: "Tendance Quotidienne Commandes",
        defaultEnabled: false,
      },
      {
        id: "dishesDailyTrend",
        label: "Tendance Quotidienne Plats",
        defaultEnabled: false,
      },
    ],
  },
};

// Fonction utilitaire pour formater les dates
const formatDateForAPI = (date) => {
  return date.toISOString().split("T")[0];
};

// Fonction pour obtenir des dates prédéfinies
const getPresetDates = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  return {
    today,
    yesterday,
    last7Days,
    last30Days,
    thisMonthStart,
    lastMonthStart,
    lastMonthEnd,
  };
};

// Composant pour une section de métriques
const MetricSection = ({ section, state, onSectionToggle, onMetricToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = section.icon;

  const allChecked = Object.values(state.metrics).every((v) => v);
  const someChecked = Object.values(state.metrics).some((v) => v);
  const activeCount = Object.values(state.metrics).filter((v) => v).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={cn("h-5 w-5", section.color)} />
            <CardTitle className="text-base">{section.label}</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {activeCount}/{section.metrics.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allChecked}
              onCheckedChange={() => onSectionToggle(section.id)}
              className={cn(
                someChecked &&
                  !allChecked &&
                  "data-[state=checked]:bg-primary/50"
              )}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 pb-4">
              <div className="space-y-2">
                {section.metrics.map((metric) => (
                  <label
                    key={metric.id}
                    className="flex items-center space-x-3 cursor-pointer py-1.5 hover:bg-muted/50 rounded-md px-2 transition-colors"
                  >
                    <Checkbox
                      checked={state.metrics[metric.id]}
                      onCheckedChange={() =>
                        onMetricToggle(section.id, metric.id)
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm select-none">{metric.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export const DashboardFilters = ({
  startDate,
  endDate,
  onDateChange,
  onApply,
  onMetricsChange,
  loading = false,
  className,
  tenantCode, // Nouveau prop pour l'export
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(() => {
    // Initialiser avec les valeurs par défaut
    const initial = {};
    Object.values(METRIC_SECTIONS).forEach((section) => {
      initial[section.id] = {
        enabled: section.defaultEnabled,
        metrics: {},
      };
      section.metrics.forEach((metric) => {
        initial[section.id].metrics[metric.id] = metric.defaultEnabled;
      });
    });
    return initial;
  });

  // Raccourcis de période
  const handlePresetPeriod = (preset) => {
    const dates = getPresetDates();

    switch (preset) {
      case "today":
        setLocalStartDate(dates.today);
        setLocalEndDate(dates.today);
        break;
      case "yesterday":
        setLocalStartDate(dates.yesterday);
        setLocalEndDate(dates.yesterday);
        break;
      case "last7days":
        setLocalStartDate(dates.last7Days);
        setLocalEndDate(dates.today);
        break;
      case "last30days":
        setLocalStartDate(dates.last30Days);
        setLocalEndDate(dates.today);
        break;
      case "thisMonth":
        setLocalStartDate(dates.thisMonthStart);
        setLocalEndDate(dates.today);
        break;
      case "lastMonth":
        setLocalStartDate(dates.lastMonthStart);
        setLocalEndDate(dates.lastMonthEnd);
        break;
    }
  };

  // Gestion du changement de section entière
  const handleSectionToggle = (sectionId) => {
    const newState = { ...selectedMetrics };
    const currentEnabled = newState[sectionId].enabled;

    newState[sectionId].enabled = !currentEnabled;
    // Activer/désactiver toutes les métriques de la section
    Object.keys(newState[sectionId].metrics).forEach((metricId) => {
      newState[sectionId].metrics[metricId] = !currentEnabled;
    });

    setSelectedMetrics(newState);
  };

  // Gestion du changement de métrique individuelle
  const handleMetricToggle = (sectionId, metricId) => {
    const newState = { ...selectedMetrics };
    newState[sectionId].metrics[metricId] =
      !newState[sectionId].metrics[metricId];

    // Mettre à jour l'état de la section
    const someMetricsEnabled = Object.values(newState[sectionId].metrics).some(
      (v) => v
    );
    newState[sectionId].enabled = someMetricsEnabled;

    setSelectedMetrics(newState);
  };

  // Réinitialiser aux valeurs par défaut
  const handleReset = () => {
    const newState = {};
    Object.values(METRIC_SECTIONS).forEach((section) => {
      newState[section.id] = {
        enabled: section.defaultEnabled,
        metrics: {},
      };
      section.metrics.forEach((metric) => {
        newState[section.id].metrics[metric.id] = metric.defaultEnabled;
      });
    });
    setSelectedMetrics(newState);
  };

  // Calculer le nombre total de métriques actives
  const getActiveMetricsCount = () => {
    let count = 0;
    Object.values(selectedMetrics).forEach((section) => {
      count += Object.values(section.metrics).filter((v) => v).length;
    });
    return count;
  };

  // Appliquer les filtres
  const handleApply = () => {
    onDateChange(localStartDate, localEndDate);
    onMetricsChange(selectedMetrics);
    onApply();
  };

  const activeCount = getActiveMetricsCount();
  const totalCount = Object.values(METRIC_SECTIONS).reduce(
    (sum, section) => sum + section.metrics.length,
    0
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Section de sélection de dates */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Raccourcis de période */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetPeriod("today")}
                className="text-xs"
              >
                Aujourd'hui
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetPeriod("yesterday")}
                className="text-xs"
              >
                Hier
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetPeriod("last7days")}
                className="text-xs"
              >
                7 derniers jours
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetPeriod("last30days")}
                className="text-xs"
              >
                30 derniers jours
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetPeriod("thisMonth")}
                className="text-xs"
              >
                Ce mois
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetPeriod("lastMonth")}
                className="text-xs"
              >
                Mois dernier
              </Button>
            </div>

            {/* Sélecteurs de dates */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Date de début
                </label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={formatDateForAPI(localStartDate)}
                    onChange={(e) =>
                      setLocalStartDate(new Date(e.target.value))
                    }
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center justify-center">
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
                    value={formatDateForAPI(localEndDate)}
                    onChange={(e) => setLocalEndDate(new Date(e.target.value))}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApply}
                  disabled={loading}
                  className="min-w-[120px] h-10"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Chargement
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Appliquer
                    </>
                  )}
                </Button>
                <ExportMenu
                  startDate={localStartDate}
                  endDate={localEndDate}
                  tenantCode={tenantCode}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section des filtres de métriques */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Filtres des métriques</h3>
            <Badge variant="outline">
              {activeCount} / {totalCount} actives
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              {filtersExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {filtersExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {Object.values(METRIC_SECTIONS).map((section) => (
                <MetricSection
                  key={section.id}
                  section={section}
                  state={selectedMetrics[section.id]}
                  onSectionToggle={handleSectionToggle}
                  onMetricToggle={handleMetricToggle}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardFilters;
