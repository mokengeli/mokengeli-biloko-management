// src/services/userService.js
import apiClient from "@/lib/api";

const userService = {
  // Fonction pour récupérer tous les tenants/restaurants
  getAllTenants: async () => {
    try {
      const response = await apiClient.get("/api/user/tenant/all");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching tenants:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getTenantByCode: async (code) => {
    try {
      const response = await apiClient.get(`/api/user/tenant?code=${code}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching tenant:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Nouvelle fonction pour récupérer tous les utilisateurs d'un restaurant avec pagination
  getAllUsers: async (tenantCode, page = 0, size = 10) => {
    try {
      const response = await apiClient.get("/api/user", {
        params: {
          code: tenantCode,
          page,
          size,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  // Fonction pour récupérer un utilisateur par son nom d'utilisateur
  getUserByUsername: async (username) => {
    try {
      const response = await apiClient.get(`/api/user/by-username`, {
        params: {
          username,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user by username:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default userService;
