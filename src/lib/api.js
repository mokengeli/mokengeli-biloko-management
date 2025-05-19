//src/lib/api.js
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

// Fonction utilitaire pour effacer le cookie d'authentification côté client
const clearAuthCookie = async () => {
  try {
    // Appeler notre API locale pour supprimer le cookie
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    console.log("Auth cookie cleared successfully");
  } catch (err) {
    console.error("Failed to clear auth cookie:", err);
  }
};

// Intercepteur pour gérer les erreurs d'une manière uniforme
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Gestion des erreurs 401 (non autorisé) ou 429 (trop de requêtes)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 429)
    ) {
      console.error(
        `Received ${error.response.status} error:`,
        error.response.data
      );

      // Effacer le cookie d'authentification
      await clearAuthCookie();

      // Si nous sommes dans un navigateur
      if (typeof window !== "undefined") {
        // Stocker un message d'erreur approprié dans le localStorage pour l'afficher après redirection
        if (error.response.status === 401) {
          localStorage.setItem(
            "auth_error",
            "Votre session a expiré. Veuillez vous reconnecter."
          );
        } else if (error.response.status === 429) {
          localStorage.setItem(
            "auth_error",
            "Trop de requêtes. Veuillez réessayer plus tard."
          );
        }

        // Redirection vers la page de login
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
