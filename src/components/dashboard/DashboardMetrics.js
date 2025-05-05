// src/components/dashboard/DashboardMetrics.js
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Package,
  ShoppingCart,
  Euro,
  Utensils,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  formatCurrency,
  formatPercentage,
  getChangeColor,
  getChartColor,
} from "@/lib/dashboardUtils";

// Données simulées
const getDummyData = () => {
  // Sales des 7 derniers jours
  const salesData = [
    { date: "Lun", sales: 1800 },
    { date: "Mar", sales: 2200 },
    { date: "Mer", sales: 1950 },
    { date: "Jeu", sales: 2450 },
    { date: "Ven", sales: 3100 },
    { date: "Sam", sales: 3500 },
    { date: "Dim", sales: 2800 },
  ];

  // Tendances pour KPIs
  const salesTrendData = [
    { value: 2100 },
    { value: 2300 },
    { value: 2200 },
    { value: 2400 },
    { value: 2450 },
  ];

  const ordersTrendData = [
    { value: 75 },
    { value: 82 },
    { value: 79 },
    { value: 86 },
    { value: 86 },
  ];

  // Top 5 plats
  const topDishes = [
    { name: "Burger Classic", quantity: 45, revenue: 900 },
    { name: "Pizza Margherita", quantity: 38, revenue: 760 },
    { name: "Frites Maison", quantity: 35, revenue: 175 },
    { name: "Steak Frites", quantity: 28, revenue: 700 },
    { name: "Caesar Salad", quantity: 25, revenue: 375 },
  ];

  // Distribution par catégorie
  const categoryData = [
    { name: "Plats", value: 40, color: "#3b82f6" },
    { name: "Entrées", value: 25, color: "#10b981" },
    { name: "Desserts", value: 15, color: "#f59e0b" },
    { name: "Boissons", value: 20, color: "#8b5cf6" },
  ];

  // Commandes par heure
  const hourlyOrders = [
    { hour: "12h", orders: 15 },
    { hour: "13h", orders: 32 },
    { hour: "14h", orders: 28 },
    { hour: "15h", orders: 10 },
    { hour: "19h", orders: 25 },
    { hour: "20h", orders: 45 },
    { hour: "21h", orders: 30 },
    { hour: "22h", orders: 12 },
  ];

  return {
    salesData,
    topDishes,
    categoryData,
    hourlyOrders,
    salesTrendData,
    ordersTrendData,
  };
};

// Composant pour les KPIs principaux
const KPICard = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  color = "blue",
}) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={`h-5 w-5 text-${color}-500`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">{value}</div>
          {change !== undefined && (
            <div
              className={`flex items-center text-sm ${getChangeColor(change)}`}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}% vs hier
            </div>
          )}
          {trend && (
            <div className="mt-2 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={getChartColor(color)}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Composant pour les alertes
const AlertSection = () => {
  const stockAlerts = [
    { item: "Tomates", level: "critique" },
    { item: "Fromage", level: "bas" },
    { item: "Huile d'olive", level: "critique" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-6"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
        Alertes Stock
      </h2>
      <div className="grid gap-2">
        {stockAlerts.map((alert, index) => (
          <Alert
            key={index}
            variant={alert.level === "critique" ? "destructive" : "default"}
            className="bg-background"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">{alert.item}</span> - Stock{" "}
              {alert.level}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </motion.div>
  );
};

// Composant principal du Dashboard
export const DashboardMetrics = () => {
  const {
    salesData,
    topDishes,
    categoryData,
    hourlyOrders,
    salesTrendData,
    ordersTrendData,
  } = getDummyData();

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="CA Aujourd'hui"
          value={formatCurrency(2450)}
          change={15}
          icon={Euro}
          color="green"
          trend={salesTrendData}
        />
        <KPICard
          title="Ticket Moyen"
          value={formatCurrency(28.5)}
          change={12}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="Commandes Total"
          value="86"
          change={20}
          icon={Package}
          color="violet"
          trend={ordersTrendData}
        />
        <KPICard
          title="Plats Servis"
          value="198"
          change={-5}
          icon={Utensils}
          color="orange"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Graphique CA 7 derniers jours */}
        <Card>
          <CardHeader>
            <CardTitle>Chiffre d'affaires - 7 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "CA"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 plats */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Plats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDishes.map((dish, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-100 text-gray-700"
                        : index === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-600"
                    }
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
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribution par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Commandes par heure */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes par Heure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyOrders}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}`, "Commandes"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section des alertes */}
      <AlertSection />
    </div>
  );
};

export default DashboardMetrics;
