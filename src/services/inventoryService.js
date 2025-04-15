// src/services/inventoryService.js
import apiClient from "@/lib/api";

const inventoryService = {
  // Fonction pour récupérer toutes les catégories
  getAllCategories: async () => {
    try {
      const response = await apiClient.get("/api/inventory/category/all");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching categories:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour créer une nouvelle catégorie
  createCategory: async (categoryData) => {
    try {
      // D'après le contrat d'interface, nous devons envoyer un objet avec une propriété "name"
      const response = await apiClient.post(
        "/api/inventory/category",
        categoryData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating category:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default inventoryService;
