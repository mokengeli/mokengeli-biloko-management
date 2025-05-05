// src/components/dashboard/kpis/AverageTicketKPI.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Receipt, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/dashboardUtils";

/**
 * Composant AverageTicketKPI
 * Affiche le ticket moyen (revenu réel divisé par le nombre de commandes)
 *
 * @param {Object} data - Données complètes du revenue dashboard
 * @param {boolean} loading - État de chargement
 * @param {Object} previousData - Données de la période précédente pour la comparaison
 */
export const AverageTicketKPI = ({
  data,
  loading = false,
  previousData = null,
}) => {
  // Calcul du ticket moyen actuel
  const calculateCurrentAverageTicket = () => {
    if (!data?.realRevenue || !data?.orders || data.orders.length === 0)
      return 0;
    return data.realRevenue / data.orders.length;
  };

  // Calcul du ticket moyen de la période précédente
  const calculatePreviousAverageTicket = () => {
    if (
      !previousData?.realRevenue ||
      !previousData?.orders ||
      previousData.orders.length === 0
    )
      return 0;
    return previousData.realRevenue / previousData.orders.length;
  };

  // Calcul du pourcentage de changement
  const calculateChange = () => {
    const currentAvg = calculateCurrentAverageTicket();
    const previousAvg = calculatePreviousAverageTicket();

    if (previousAvg === 0) return null;

    const change = ((currentAvg - previousAvg) / previousAvg) * 100;
    return Math.round(change);
  };

  const averageTicket = calculateCurrentAverageTicket();
  const changePercentage = calculateChange();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }} // Légèrement décalé
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ticket Moyen
          </CardTitle>
          <Receipt className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1">
                {formatCurrency(averageTicket)}
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
                Montant moyen dépensé par commande
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AverageTicketKPI;
