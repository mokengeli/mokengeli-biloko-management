// src/components/dashboard/kpis/SalesKPIs/PaymentStatusStatsKPI.js
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  CreditCard,
  Loader2,
  Info,
  CheckCircle,
  Clock,
  XCircle,
  Percent,
  AlertCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PieChart,
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
import { Badge } from "@/components/ui/badge";

// Mapping des statuts avec leurs traductions et configurations
const STATUS_CONFIG = {
  UNPAID: {
    label: "Non payé",
    color: "#ef4444", // rouge
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    icon: XCircle,
    description: "Aucun paiement effectué",
  },
  PARTIALLY_PAID: {
    label: "Partiellement payé",
    color: "#f59e0b", // orange
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    icon: Clock,
    description: "Une partie de la commande a été payée",
  },
  FULLY_PAID: {
    label: "Totalement payé",
    color: "#10b981", // vert
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    icon: CheckCircle,
    description: "Tous les items sont payés au prix complet",
  },
  PAID_WITH_DISCOUNT: {
    label: "Payé avec remise",
    color: "#3b82f6", // bleu
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    icon: Percent,
    description: "Payée avec une remise",
  },
  PAID_WITH_REJECTED_ITEM: {
    label: "Payé avec rejets",
    color: "#8b5cf6", // violet
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    icon: AlertCircle,
    description: "Payée malgré certains items rejetés",
  },
};

/**
 * Composant PaymentStatusStatsKPI
 * Affiche les statistiques des commandes par état de paiement
 *
 * @param {Object[]} data - Données des statistiques de paiement
 * @param {boolean} loading - État de chargement
 */
export const PaymentStatusStatsKPI = ({ data = [], loading = false }) => {
  const [chartData, setChartData] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    unpaidCount: 0,
    unpaidPercentage: 0,
    fullyPaidPercentage: 0,
    problemPayments: 0,
  });

  // Préparer les données pour les graphiques
  useEffect(() => {
    if (data && data.length > 0) {
      // Formater les données pour les graphiques
      const formattedData = data.map((item) => {
        const config = STATUS_CONFIG[item.status] || {
          label: item.status,
          color: "#6b7280",
        };
        return {
          status: item.status,
          label: config.label,
          count: item.count || 0,
          color: config.color,
          ...config,
        };
      });

      // Calculer les statistiques
      const total = formattedData.reduce((sum, item) => sum + item.count, 0);
      const unpaid = formattedData.find((item) => item.status === "UNPAID");
      const fullyPaid = formattedData.find(
        (item) => item.status === "FULLY_PAID"
      );
      const problematic = formattedData
        .filter((item) =>
          ["UNPAID", "PARTIALLY_PAID", "PAID_WITH_REJECTED_ITEM"].includes(
            item.status
          )
        )
        .reduce((sum, item) => sum + item.count, 0);

      setChartData(formattedData);
      setStatistics({
        total,
        unpaidCount: unpaid?.count || 0,
        unpaidPercentage: total > 0 ? ((unpaid?.count || 0) / total) * 100 : 0,
        fullyPaidPercentage:
          total > 0 ? ((fullyPaid?.count || 0) / total) * 100 : 0,
        problemPayments: problematic,
      });
    } else {
      setChartData([]);
      setStatistics({
        total: 0,
        unpaidCount: 0,
        unpaidPercentage: 0,
        fullyPaidPercentage: 0,
        problemPayments: 0,
      });
    }
  }, [data]);

  // Rendu personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = statistics.total
        ? ((data.count / statistics.total) * 100).toFixed(1)
        : 0;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-semibold text-sm flex items-center gap-2">
            <data.icon className="h-4 w-4" style={{ color: data.color }} />
            {data.label}
          </p>
          <p className="text-lg font-bold">{data.count} commandes</p>
          <p className="text-xs text-muted-foreground">
            {percentage}% du total
          </p>
          <p className="text-xs mt-1 italic">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  // Rendu personnalisé de la légende
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
              État des Paiements
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Répartition des commandes selon leur statut de paiement sur la
                  période sélectionnée
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CreditCard className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <CreditCard className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistiques clés */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    Total commandes
                  </p>
                  <p className="text-lg font-bold">{statistics.total}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Non payées</p>
                  <p className="text-lg font-bold text-red-600">
                    {statistics.unpaidCount}
                  </p>
                  <p className="text-xs text-red-600">
                    {statistics.unpaidPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    Paiement complet
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {statistics.fullyPaidPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    Paiements à risque
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    {statistics.problemPayments}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    Non payé + Partiel + Rejet
                  </Badge>
                </div>
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique camembert */}
                <div>
                  <h4 className="text-sm font-medium mb-4">
                    Répartition par statut
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend content={renderCustomizedLegend} />
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Graphique en barres */}
                <div>
                  <h4 className="text-sm font-medium mb-4">
                    Nombre de commandes par statut
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Détails par statut */}
              <div className="space-y-2 mt-6">
                <h4 className="text-sm font-medium mb-3">Détail par statut</h4>
                {chartData.map((item) => {
                  const IconComponent = item.icon;
                  const percentage = statistics.total
                    ? ((item.count / statistics.total) * 100).toFixed(1)
                    : 0;
                  return (
                    <div
                      key={item.status}
                      className={`flex items-center justify-between p-3 rounded-lg ${item.bgColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent
                          className={`h-5 w-5 ${item.textColor}`}
                        />
                        <div>
                          <p className={`font-medium ${item.textColor}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${item.textColor}`}>
                          {item.count}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentStatusStatsKPI;
