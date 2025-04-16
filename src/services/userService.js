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
};

export default userService;
