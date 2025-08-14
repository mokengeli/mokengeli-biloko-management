// src/services/authService.js
import apiClient from "@/lib/api";

const authService = {
  // Fonction de connexion
  login: async (username, password) => {
    try {
      const platformType = "WEB";
      const response = await apiClient.post("/api/auth/login", {
        username,
        password,
        platformType,
      });

      return response.data;
    } catch (error) {
      console.error(
        "Login request failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer l'utilisateur courant
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/api/auth/me");
      return response.data;
    } catch (error) {
      console.error(
        "getCurrentUser request failed:",
        error.response?.data || error.message
      );
      // Assurez-vous de propager l'erreur pour que la promesse soit correctement rejetée
      throw error;
    }
  },

  // Fonction de déconnexion côté client
  logout: async () => {
    try {
      // IMPORTANT : Toujours tenter de nettoyer le cookie local en premier
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (localError) {
        console.error("Failed to clear local cookie:", localError);
      }

      // Puis informer le backend (mais ne pas bloquer si ça échoue)
      try {
        await apiClient.post("/api/auth/logout");
      } catch (backendError) {
        console.error("Backend logout failed:", backendError);
        // On continue quand même, le cookie local est supprimé
      }

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);

      // En cas d'erreur, forcer quand même le nettoyage local
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (e) {
        console.error("Emergency cookie cleanup failed:", e);
      }

      throw error;
    }
  },

  // Fonction pour enregistrer un nouvel utilisateur
  registerUser: async (userData) => {
    try {
      // S'assurer que toutes les données requises sont présentes
      const registrationData = {
        tenantCode: userData.tenantCode,
        firstName: userData.firstName,
        lastName: userData.lastName,
        postName: userData.postName || null,
        userName: userData.userName,
        email: userData.email || null,
        password: userData.password,
        role: userData.role,
      };

      const response = await apiClient.post(
        "/api/auth/register",
        registrationData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Register user failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.patch("/api/auth/password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Change password failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default authService;
