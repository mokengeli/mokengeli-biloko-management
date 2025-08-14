// src/lib/api.js
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag global pour éviter les redirections multiples
let isRedirecting = false;

const clearAuthCookie = async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Failed to clear auth cookie:", err);
  }
};

// Intercepteur de réponse amélioré
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // MODIFICATION 1: Éviter les redirections multiples
    if (isRedirecting) {
      return Promise.reject(error);
    }

    // MODIFICATION 2: Vérifier qu'on n'est pas déjà sur la page de login
    const isOnLoginPage =
      typeof window !== "undefined" &&
      (window.location.pathname === "/auth/login" ||
        window.location.pathname.includes("/auth/"));

    // MODIFICATION 3: Ne rediriger que pour 401/429 ET si pas déjà sur login
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 429) &&
      !isOnLoginPage
    ) {
      console.error(
        `Received ${error.response.status} error:`,
        error.response.data
      );

      // Marquer qu'on est en train de rediriger
      isRedirecting = true;

      // Effacer le cookie d'authentification
      await clearAuthCookie();

      // Stocker le message d'erreur approprié
      if (typeof window !== "undefined") {
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

        // MODIFICATION 4: Utiliser replace et délai pour éviter les conflits
        setTimeout(() => {
          window.location.replace("/auth/login");
          // Réinitialiser le flag après un délai
          setTimeout(() => {
            isRedirecting = false;
          }, 2000);
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
