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
        platformType
      });

      console.log("Login request completed successfully");
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
      console.log("Starting getCurrentUser request");
      const response = await apiClient.get("/api/auth/me");
      console.log("getCurrentUser request completed successfully");
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
      // 1. Appeler l'endpoint backend décrit dans le contrat
      await apiClient.post("/api/auth/logout");

      // 2. Appeler notre API locale pour s'assurer que le cookie est supprimé côté client
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);

      // Même en cas d'erreur dans l'API backend, tenter de supprimer le cookie localement
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (clientError) {
        console.error("Failed to clean client cookie:", clientError);
      }

      // On propage l'erreur pour la gestion dans useAuth
      throw error;
    }
  },

  // Fonction pour enregistrer un nouvel utilisateur
  registerUser: async (userData) => {
    try {
      const response = await apiClient.post("/api/auth/register", userData);
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
