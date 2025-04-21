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

  // Fonction pour récupérer tous les tenants/restaurants avec pagination
  getAllTenantsWithPagination: async (page = 0, size = 10) => {
    try {
      const response = await apiClient.get("/api/user/tenant/all/pg", {
        params: {
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching tenants with pagination:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer un tenant par son code
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
  // Fonction pour créer un nouveau restaurant (tenant)
  createTenant: async (tenantData) => {
    try {
      const response = await apiClient.post("/api/user/tenant", tenantData);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating tenant:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer tous les utilisateurs d'un restaurant avec pagination
  getAllUsers: async (tenantCode, page = 0, size = 10) => {
    try {
      const response = await apiClient.get("/api/user", {
        params: {
          code: tenantCode,
          page,
          size
        }
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

  // Fonction pour récupérer un utilisateur par son nom d'employé
  getUserByEmployeeNumber: async (employeeNumber) => {
    try {
      const response = await apiClient.get(`/api/user/by-employee-number`, {
        params: {
          employeeNumber
        }
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user by employee number:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer les rôles autorisés pour le profil d'utilisateur courant
  getAuthorizedRolesByUserProfile: async () => {
    try {
      const response = await apiClient.get("/api/user/roles");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching authorized roles:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
};

export default userService;