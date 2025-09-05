// src/components/dashboard/kpis/WaiterKPIs/TopWaitersKPI.js
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Award,
  Users,
  Loader2,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/dashboardUtils";

/**
 * Composant TopWaitersKPI
 * Affiche le top 5 des serveurs les plus performants
 *
 * @param {Object} data - Données de performance des serveurs
 * @param {Object} data.waiterStats - Array des stats par serveur
 * @param {string} data.waiterStats[].waiterName - Nom du serveur
 * @param {number} data.waiterStats[].ordersCount - Nombre de commandes passées
 * @param {number} data.waiterStats[].totalRevenue - Revenu total de ces commandes
 * @param {number} data.waiterStats[].totalItemsServed - Nombre de plats servis
 * @param {boolean} loading - État de chargement
 * @param {Object} previousData - Données de la période précédente pour comparaisons
 */
export const TopWaitersKPI = ({
  data,
  loading = false,
  previousData = null,
}) => {
  // Extraire les données nécessaires
  const waiterStats = data?.waiterStats || [];
  const totalWaiters = waiterStats.length;
  const totalOrders = data?.totalOrders || 0;
  const totalRevenue = data?.totalRevenue || 0;

  // Tri et limitation au top 5
  // Champs corrects de l'API : waiterName, ordersCount, totalRevenue, totalItemsServed
  const topWaiters = [...waiterStats]
    .sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0))
    .slice(0, 5);

  // Icônes pour le podium
  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1: return <Medal className="h-4 w-4 text-gray-400" />;
      case 2: return <Award className="h-4 w-4 text-amber-600" />;
      default: return <Badge variant="outline" className="h-4 w-4 text-xs">{index + 1}</Badge>;
    }
  };

  // Emojis pour le podium
  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      case 3: return "4️⃣";
      case 4: return "5️⃣";
      default: return "🏃";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top 5 des Serveurs
          </CardTitle>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Statistiques globales */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{totalWaiters} serveur{totalWaiters !== 1 ? 's' : ''} actif{totalWaiters !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{totalOrders} commandes</span>
                  <span>•</span>
                  <span>{formatCurrency(totalRevenue)}</span>
                </div>
              </div>

              {/* Liste des top serveurs */}
              {topWaiters.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune donnée de serveur disponible</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topWaiters.map((waiter, index) => (
                    <motion.div
                      key={waiter.waiterId || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getRankEmoji(index)}</span>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {waiter.waiterName || `Serveur ${index + 1}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {waiter.totalItemsServed || 0} plats servis
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          <span className="font-medium">{waiter.ordersCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">
                            {formatCurrency(waiter.totalRevenue || 0)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Message si moins de 5 serveurs */}
              {totalWaiters > 0 && totalWaiters < 5 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Affichage de tous les {totalWaiters} serveur{totalWaiters !== 1 ? 's' : ''} actif{totalWaiters !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopWaitersKPI;