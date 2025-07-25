// src/services/menuService.js
import apiClient from "@/lib/api";

const menuService = {
  // Fonction pour récupérer toutes les catégories de menu d'un restaurant spécifique
  getAllCategories: async (tenantCode, page = 0, size = 10, search = "") => {
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

      const response = await apiClient.get("api/order/category", { params });
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
  getAllAvailableCategories: async (page = 0, size = 10, search = "") => {
    try {
      const params = {
        page,
        size,
      };
      // Ajouter le paramètre search seulement s'il n'est pas vide
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiClient.get("/api/order/category/all", {
        params,
      });
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
