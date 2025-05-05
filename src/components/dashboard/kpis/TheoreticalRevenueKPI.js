// src/components/dashboard/kpis/TheoreticalRevenueKPI.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CreditCard, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/dashboardUtils";

/**
 * Composant TheoreticalRevenueKPI
 * Affiche le chiffre d'affaires théorique (montant total sans remises)
 *
 * @param {number} value - Montant des revenus théoriques
 * @param {boolean} loading - État de chargement
 * @param {Object} previousData - Données de la période précédente pour le calcul de changement
 */
export const TheoreticalRevenueKPI = ({
  value,
  loading = false,
  previousData = null,
}) => {
  // Calcul du changement par rapport à la période précédente
  const calculateChange = () => {
    if (!previousData?.theoreticalRevenue || !value) return null;
    const change =
      ((value - previousData.theoreticalRevenue) /
        previousData.theoreticalRevenue) *
      100;
    return Math.round(change);
  };

  const changePercentage = calculateChange();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }} // Légèrement décalé pour l'effet cascade
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Revenus Théoriques
          </CardTitle>
          <CreditCard className="h-5 w-5 text-blue-500" />
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
                {formatCurrency(value || 0)}
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
              <div className="text-xs text-muted-foreground mt-1">
                Chiffre d'affaires total avant remises
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TheoreticalRevenueKPI;
