// src/services/menuService.js
import apiClient from "@/lib/api";

const menuService = {
  // Fonction pour récupérer toutes les catégories de menu d'un restaurant spécifique
  getAllCategories: async (tenantCode) => {
    try {
      if (!tenantCode) {
        throw new Error("Code de restaurant requis");
      }
      const response = await apiClient.get(
        `api/order/category?code=${tenantCode}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching menu categories:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour créer une catégorie de menu
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post(
        "/api/order/category",
        categoryData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating menu category:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  // Fonction pour récupérer toutes les catégories sans filtre de restaurant
  getAllAvailableCategories: async () => {
    try {
      const response = await apiClient.get("/api/order/category/all");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching all menu categories:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  assignCategoryToRestaurant: async (categoryId, tenantCode) => {
    try {
      // S'assurer que categoryId est un nombre
      const categoryIdNum = parseInt(categoryId, 10);

      const response = await apiClient.post(`/api/order/category/assign`, {
        categoryId: categoryIdNum,
        tenantCode: tenantCode,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error assigning category to restaurant:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Autres fonctions pour les menus...
};

export default menuService;
