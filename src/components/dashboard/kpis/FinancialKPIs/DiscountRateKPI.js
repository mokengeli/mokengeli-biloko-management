// src/components/dashboard/kpis/DiscountRateKPI.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PercentIcon, Loader2 } from "lucide-react";

/**
 * Composant DiscountRateKPI
 * Affiche le taux de remise (paiements avec remise vs paiements totaux)
 *
 * @param {Object} data - Données complètes du revenue dashboard
 * @param {boolean} loading - État de chargement
 */
export const DiscountRateKPI = ({ data, loading = false }) => {
  // Calcul du taux de remise basé sur le breakdown des paiements
  const calculateDiscountRate = () => {
    if (!data?.breakdown) return 0;

    const { fullPayments, discountedPayments } = data.breakdown;
    const totalPayments = fullPayments + discountedPayments;

    if (totalPayments === 0) return 0;

    return ((discountedPayments / totalPayments) * 100).toFixed(1);
  };

  const discountRate = calculateDiscountRate();

  // Détermination du niveau de préoccupation basé sur le taux de remise
  const getDiscountRateStatusColor = () => {
    if (discountRate > 20) return "text-red-600"; // Préoccupant
    if (discountRate > 10) return "text-amber-600"; // Attention
    return "text-blue-600"; // Normal
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }} // Légèrement décalé pour l'effet cascade
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taux de Remise
          </CardTitle>
          <PercentIcon className="h-5 w-5 text-purple-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div
                className={`text-2xl font-bold mb-1 ${getDiscountRateStatusColor()}`}
              >
                {discountRate}%
              </div>
              <div className="text-sm">des paiements avec remise</div>
              <div className="text-xs text-muted-foreground mt-1">
                Ratio des paiements avec réduction
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DiscountRateKPI;
