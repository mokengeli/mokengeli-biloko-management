import axios from "axios";

// Récupérer l'URL de base de l'API depuis les variables d'environnement
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Créer une instance axios avec la configuration de base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Pour gérer les cookies HttpOnly
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour gérer les erreurs d'une manière uniforme
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs 401 (non autorisé) - redirection vers la page de login
    if (error.response && error.response.status === 401) {
      // Si nous sommes dans un navigateur
      if (typeof window !== "undefined") {
        // Redirection vers la page de login
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
