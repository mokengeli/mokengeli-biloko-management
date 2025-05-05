// src/components/dashboard/kpis/OrderCountKPI.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ShoppingCart, Loader2 } from "lucide-react";

/**
 * Composant OrderCountKPI
 * Affiche le nombre total de commandes dans la période sélectionnée
 *
 * @param {Object} data - Données complètes du revenue dashboard
 * @param {boolean} loading - État de chargement
 * @param {Object} previousData - Données de la période précédente pour la comparaison
 */
export const OrderCountKPI = ({
  data,
  loading = false,
  previousData = null,
}) => {
  // Calcul du nombre de commandes
  const getCurrentOrderCount = () => {
    if (!data?.orders) return 0;
    return data.orders.length;
  };

  // Calcul du nombre de commandes de la période précédente
  const getPreviousOrderCount = () => {
    if (!previousData?.orders) return 0;
    return previousData.orders.length;
  };

  // Calcul du pourcentage de changement
  const calculateChange = () => {
    const currentCount = getCurrentOrderCount();
    const previousCount = getPreviousOrderCount();

    if (previousCount === 0) return null;

    const change = ((currentCount - previousCount) / previousCount) * 100;
    return Math.round(change);
  };

  const orderCount = getCurrentOrderCount();
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
            Nombre de Commandes
          </CardTitle>
          <ShoppingCart className="h-5 w-5 text-violet-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1">{orderCount}</div>
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
                Commandes traitées sur la période
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderCountKPI;
