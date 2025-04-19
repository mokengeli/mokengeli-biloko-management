// src/services/authService.js
import apiClient from "@/lib/api";

const authService = {
  // Fonction de connexion
  login: async (username, password) => {
    try {
      console.log("Starting login request");
      const response = await apiClient.post("/api/auth/login", {
        username,
        password,
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
      // Appeler notre API de déconnexion pour supprimer le cookie
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Échec de la déconnexion");
      }

      return await response.json();
    } catch (error) {
      console.error("Logout error:", error);
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
  }
};

export default authService;