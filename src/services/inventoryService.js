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
  // Fonction pour récupérer tous les produits
  getAllProducts: async () => {
    try {
      const response = await apiClient.get("/api/inventory/product/all");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching products:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer un produit par son ID
  getProductById: async (productId) => {
    try {
      const response = await apiClient.get(
        `/api/inventory/product/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching product:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post(
        "/api/inventory/product",
        productData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating product:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getAllUnitOfMeasurement: async () => {
    try {
      const response = await apiClient.get("/api/inventory/product/unitm/all");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching units of measurement:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default inventoryService;
