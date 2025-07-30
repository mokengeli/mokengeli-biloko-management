// src/components/dashboard/kpis/OperationalKPIs/FullPaymentsKPI.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CreditCard, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/dashboardUtils";

/**
 * Composant FullPaymentsKPI
 * Affiche le montant total des paiements complets (sans remise)
 *
 * @param {Object} data - Données complètes du revenue dashboard incluant currency
 * @param {boolean} loading - État de chargement
 * @param {Object} previousData - Données de la période précédente pour la comparaison
 */
export const FullPaymentsKPI = ({
  data,
  loading = false,
  previousData = null,
}) => {
  // Extraire le code de devise
  const currencyCode = data?.currency?.code || "€";

  // Calcul du montant des paiements complets
  const getCurrentFullPayments = () => {
    if (!data?.breakdown?.fullPayments) return 0;
    return data.breakdown.fullPayments;
  };

  // Calcul du montant des paiements complets de la période précédente
  const getPreviousFullPayments = () => {
    if (!previousData?.breakdown?.fullPayments) return 0;
    return previousData.breakdown.fullPayments;
  };

  // Calcul du pourcentage de changement
  const calculateChange = () => {
    const currentPayments = getCurrentFullPayments();
    const previousPayments = getPreviousFullPayments();

    if (previousPayments === 0) return null;

    const change =
      ((currentPayments - previousPayments) / previousPayments) * 100;
    return Math.round(change);
  };

  // Calcul du pourcentage des paiements complets par rapport au revenu total
  const calculateFullPaymentsPercentage = () => {
    if (!data?.realRevenue || data.realRevenue === 0) return 0;

    const fullPayments = getCurrentFullPayments();
    return ((fullPayments / data.realRevenue) * 100).toFixed(1);
  };

  const fullPayments = getCurrentFullPayments();
  const changePercentage = calculateChange();
  const fullPaymentsPercentage = calculateFullPaymentsPercentage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }} // Légèrement décalé
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Paiements Complets
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
              <div className="text-2xl font-bold mb-1">
                {formatCurrency(fullPayments, currencyCode)}
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
              <div className="text-sm text-blue-600 mt-1">
                {fullPaymentsPercentage}% du revenu total
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Paiements sans remise ni rejet
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FullPaymentsKPI;
