// src/services/waiterService.js
import apiClient from "@/lib/api";

const waiterService = {
  // Fonction pour récupérer les performances des serveurs
  getWaiterPerformance: async (startDate, endDate, tenantCode) => {
    try {
      if (!startDate || !endDate || !tenantCode) {
        throw new Error("Paramètres requis manquants pour les performances des serveurs");
      }

      const response = await apiClient.get("/api/order/dashboard/waiter-performance", {
        params: {
          startDate: startDate, // Format: YYYY-MM-DD
          endDate: endDate, // Format: YYYY-MM-DD
          tenantCode: tenantCode,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching waiter performance:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Méthodes de calcul des KPIs des serveurs
  calculateWaiterMetrics: (waiterPerformanceData) => {
    if (!waiterPerformanceData || !waiterPerformanceData.waiterStats) {
      return {
        totalWaiters: 0,
        totalOrders: 0,
        totalRevenue: 0,
        avgOrdersPerWaiter: 0,
        avgRevenuePerWaiter: 0,
        topWaiters: []
      };
    }

    const waiterStats = waiterPerformanceData.waiterStats || [];
    const totalOrders = waiterPerformanceData.totalOrders || 0;
    const totalRevenue = waiterPerformanceData.totalRevenue || 0;
    const totalWaiters = waiterStats.length;

    // Tri des serveurs par nombre de commandes (décroissant)
    // Champs corrects : ordersCount, totalRevenue, totalItemsServed, waiterName
    const sortedWaiters = [...waiterStats]
      .sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0));

    return {
      totalWaiters: totalWaiters,
      totalOrders: totalOrders,
      totalRevenue: totalRevenue,
      avgOrdersPerWaiter: totalWaiters > 0 ? totalOrders / totalWaiters : 0,
      avgRevenuePerWaiter: totalWaiters > 0 ? totalRevenue / totalWaiters : 0,
      topWaiters: sortedWaiters.slice(0, 5), // Top 5 des serveurs
      allWaiters: sortedWaiters
    };
  }
};

export default waiterService;