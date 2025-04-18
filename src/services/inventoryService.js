// src/services/inventoryService.js
import apiClient from "@/lib/api";

const inventoryService = {
  // Fonction pour récupérer toutes les catégories avec pagination
  getAllCategories: async (page = 0, size = 10) => {
    try {
      const response = await apiClient.get("/api/inventory/category/all", {
        params: { page, size },
      });
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

  // Fonction pour récupérer tous les produits - MISE À JOUR pour utiliser le code du tenant
  getAllProducts: async (tenantCode) => {
    try {
      if (!tenantCode) {
        throw new Error(
          "Code de restaurant requis pour récupérer les produits"
        );
      }
      const response = await apiClient.get(
        `/api/inventory/product/all?code=${tenantCode}`
      );
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

  // 1. Fonction pour ajouter un article avec une quantité (volume)
  addArticle: async (articleData) => {
    try {
      const response = await apiClient.put(
        "/api/inventory/article/add",
        articleData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error adding article:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // 2. Fonction pour ajouter un article en spécifiant le nombre d'unités
  addArticleByProduct: async (productRequest) => {
    try {
      const response = await apiClient.put(
        "/api/inventory/article/add/by-product",
        productRequest
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error adding article by product:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // 3. Fonction pour retirer des articles de l'inventaire
  removeArticle: async (articleList) => {
    try {
      const response = await apiClient.put(
        "/api/inventory/article/remove",
        articleList
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error removing article:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default inventoryService;
