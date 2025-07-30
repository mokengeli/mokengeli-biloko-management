// src/components/dashboard/kpis/FinancialKPIs/RevenueGapKPI.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingDown, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/dashboardUtils";

/**
 * Composant RevenueGapKPI
 * Affiche l'écart entre revenus théoriques et réels (montant des remises)
 *
 * @param {Object} data - Données complètes du revenue dashboard incluant currency
 * @param {boolean} loading - État de chargement
 */
export const RevenueGapKPI = ({ data, loading = false }) => {
  // Extraire le code de devise
  const currencyCode = data?.currency?.code || "€";

  // Calcul de l'écart entre revenus théoriques et réels
  const calculateGap = () => {
    if (!data?.theoreticalRevenue || !data?.realRevenue) return 0;
    return data.theoreticalRevenue - data.realRevenue;
  };

  // Calcul du pourcentage de remise
  const calculateDiscountPercentage = () => {
    if (!data?.theoreticalRevenue || data.theoreticalRevenue === 0) return 0;
    const gap = calculateGap();
    return ((gap / data.theoreticalRevenue) * 100).toFixed(1);
  };

  const gap = calculateGap();
  const discountPercentage = calculateDiscountPercentage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }} // Légèrement décalé pour l'effet cascade
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Écart de Revenus
          </CardTitle>
          <TrendingDown className="h-5 w-5 text-amber-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1" title={gap.toString()}>
                {formatCurrency(gap, currencyCode)}
              </div>
              <div className="text-sm text-amber-600">
                {discountPercentage}% du CA théorique
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Montant total des remises accordées
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RevenueGapKPI;
