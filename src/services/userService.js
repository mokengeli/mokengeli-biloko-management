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
  getAllTenantsWithPagination: async (page = 0, size = 10, search = "") => {
    try {
      const params = {
        page,
        size,
      };
      // Ajouter le paramètre search seulement s'il n'est pas vide
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiClient.get("/api/user/tenant/all/pg", {
        params,
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
  getAllUsers: async (tenantCode, page = 0, size = 10, search = "") => {
    try {
      const params = {
        code: tenantCode,
        page,
        size,
      };
      // Ajouter le paramètre search seulement s'il n'est pas vide
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiClient.get("/api/user", {
        params,
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
          employeeNumber,
        },
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
  },
  countUsersByRole: async (tenantCode) => {
    try {
      const response = await apiClient.get("/api/user/count-by-role", {
        params: { tenantCode },
      });
      return response.data;
    } catch (error) {
      console.error("Error counting users by role:", error);
      throw error;
    }
  },
  // Fonction pour vérifier la disponibilité d'un nom d'utilisateur
  checkUsernameAvailability: async (username) => {
    try {
      const response = await apiClient.get("/api/user/username/check", {
        params: { userName: username },
      });
      return response.data; // retourne un boolean
    } catch (error) {
      console.error(
        "Error checking username availability:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  updatePin: async (currentPin, newPin, targetEmployeeNumber = null) => {
    try {
      const payload = {
        newPin: parseInt(newPin, 10), // Conversion en int32 comme requis par l'API
      };

      // Ajouter currentPin seulement s'il est fourni
      if (currentPin) {
        payload.currentPin = currentPin;
      }

      // Ajouter targetEmployeeNumber seulement s'il est fourni (pour les managers)
      if (targetEmployeeNumber) {
        payload.targetEmployeeNumber = targetEmployeeNumber;
      }

      const response = await apiClient.put("/api/user/pin", payload);
      return response.data;
    } catch (error) {
      console.error(
        "Error updating PIN:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default userService;
