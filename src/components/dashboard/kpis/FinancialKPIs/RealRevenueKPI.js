// src/components/dashboard/kpis/FinancialKPIs/RealRevenueKPI.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Banknote,
  Coins,
  Euro,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/dashboardUtils";

/**
 * Composant RealRevenueKPI
 * Affiche le chiffre d'affaires réellement encaissé
 *
 * @param {Object} data - Données complètes du revenue dashboard incluant currency
 * @param {boolean} loading - État de chargement
 * @param {Object} previousData - Données de la période précédente pour le calcul de changement
 */
export const RealRevenueKPI = ({
  data,
  loading = false,
  previousData = null,
}) => {
  // Extraire la valeur et le code de devise
  const value = data?.realRevenue || 0;
  const currencyCode = data?.currency?.code || "€";

  // Calcul du changement par rapport à la période précédente
  const calculateChange = () => {
    if (!previousData?.realRevenue || !value) return null;
    const change =
      ((value - previousData.realRevenue) / previousData.realRevenue) * 100;
    return Math.round(change);
  };

  const changePercentage = calculateChange();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Revenus Réels
          </CardTitle>
          <Wallet className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div
                className="text-2xl font-bold mb-1"
                title={value?.toString()}
              >
                {formatCurrency(value, currencyCode)}
              </div>
              {changePercentage !== null && (
                <div
                  className={`flex items-center text-sm ${
                    changePercentage >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {changePercentage >= 0 ? "+" : ""}
                  {changePercentage}% vs période précédente
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RealRevenueKPI;
