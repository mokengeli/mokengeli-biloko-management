// src/lib/api.js
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 secondes
});

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isRedirecting) {
      return Promise.reject(error);
    }

    const isOnAuthPage =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/auth/");

    // AJOUT : Nettoyer le cookie sur plus d'erreurs
    const shouldClearAuth =
      error.response &&
      (error.response.status === 401 ||
        error.response.status === 429 ||
        error.response.status === 403 || // AJOUT
        (error.response.status >= 500 &&
          window.location.pathname !== "/auth/login")); // AJOUT : Erreurs serveur

    // AJOUT : Gérer les timeouts et erreurs réseau
    const isNetworkError =
      !error.response &&
      (error.code === "ECONNABORTED" || // Timeout
        error.message.includes("Network Error") ||
        error.message.includes("timeout"));

    // Si erreur d'auth ET pas déjà sur une page auth
    if (shouldClearAuth && !isOnAuthPage) {
      isRedirecting = true;
      console.error(
        `Auth error ${error.response?.status}:`,
        error.response?.data
      );

      await clearAuthCookie();

      if (typeof window !== "undefined") {
        const errorMessage =
          error.response?.status === 401
            ? "Votre session a expiré"
            : error.response?.status === 429
            ? "Trop de requêtes"
            : error.response?.status === 403
            ? "Accès non autorisé"
            : "Erreur de connexion au serveur";

        localStorage.setItem("auth_error", errorMessage);

        setTimeout(() => {
          window.location.replace("/auth/login");
          setTimeout(() => {
            isRedirecting = false;
          }, 2000);
        }, 100);
      }
    }

    // AJOUT : Pour les erreurs réseau critiques sur pages protégées
    if (isNetworkError && !isOnAuthPage && window.location.pathname !== "/") {
      console.warn("Network error detected:", error.message);
      // Optionnel : Vous pouvez décider de nettoyer le cookie ou pas
      // await clearAuthCookie();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
