// src/services/dishService.js
import apiClient from "@/lib/api";

const dishService = {
  // Fonction pour récupérer tous les plats d'un restaurant spécifique
  getAllDishes: async (tenantCode) => {
    try {
      if (!tenantCode) {
        throw new Error("Code de restaurant requis");
      }
      const response = await apiClient.get(
        `/api/order/dish?code=${tenantCode}`
      );
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
