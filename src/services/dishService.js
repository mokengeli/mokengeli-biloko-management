// src/services/dishService.js
import apiClient from "@/lib/api";

const dishService = {
  // Mise à jour pour prendre en compte la pagination
  getAllDishes: async (tenantCode, page = 0, size = 10, search = "") => {
    try {
      if (!tenantCode) {
        throw new Error("Code de restaurant requis");
      }
      const params = {
        code: tenantCode,
        page,
        size,
      };
      // Ajouter le paramètre search seulement s'il n'est pas vide
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const response = await apiClient.get(`/api/order/dish`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching dishes:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer un plat par son ID
  getDishById: async (dishId) => {
    try {
      const response = await apiClient.get(`/api/order/dish/${dishId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching dish details:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour créer un nouveau plat
  createDish: async (dishData) => {
    try {
      const response = await apiClient.post("/api/order/dish", dishData);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating dish:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer toutes les devises disponibles
  getAllCurrencies: async () => {
    try {
      const response = await apiClient.get("/api/order/currency/all");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching currencies:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default dishService;
