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
      // Si votre API a un endpoint de déconnexion, vous pouvez l'appeler ici
      // await apiClient.post("/api/auth/logout");

      // Redirection vers la page de login
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
};

export default authService;
