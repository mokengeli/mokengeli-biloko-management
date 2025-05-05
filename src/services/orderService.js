// src/services/orderService.js
import apiClient from "@/lib/api";

const orderService = {
  // Fonction pour récupérer les tables d'un restaurant
  getRestaurantTables: async (tenantCode, page = 0, size = 10) => {
    try {
      if (!tenantCode) {
        throw new Error("Code de restaurant requis");
      }
      const response = await apiClient.get("/api/order/table", {
        params: {
          code: tenantCode,
          page,
          size,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching restaurant tables:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour créer une table
  createTable: async (tableData) => {
    try {
      const response = await apiClient.post("/api/order/table", tableData);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating table:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer les données de revenus
  getRevenue: async (startDate, endDate, tenantCode) => {
    try {
      if (!startDate || !endDate || !tenantCode) {
        throw new Error(
          "Paramètres requis manquants pour récupérer les revenus"
        );
      }
      const response = await apiClient.get("/api/order/dashboard/revenue", {
        params: {
          startDate,
          endDate,
          tenantCode,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching revenue data:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  // Fonction pour récupérer les plats les plus vendus
  getTopDishes: async (startDate, endDate, tenantCode, limit = 5) => {
    try {
      if (!startDate || !endDate || !tenantCode) {
        throw new Error(
          "Paramètres requis manquants pour récupérer les plats populaires"
        );
      }
      const response = await apiClient.get("/api/order/dashboard/dishes/top", {
        params: {
          startDate,
          endDate,
          tenantCode,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching top dishes:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default orderService;
