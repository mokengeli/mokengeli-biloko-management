// src/hooks/useAuth.js
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useRef, useCallback, useState } from "react";
import {
  login as loginAction,
  getCurrentUser,
  clearError as clearErrorAction,
  prepareLogout,
  completeLogout,
  logoutUser,
  forceLogout,
} from "../store/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    loading,
    error,
    roles,
    permissions,
    isLoggingOut,
  } = useSelector((state) => state.auth);

  // Référence pour suivre si un appel est en cours
  const authCheckInProgressRef = useRef(false);
  // Référence pour suivre si nous avons déjà fait une vérification initiale
  const initialCheckDoneRef = useRef(false);

  const loginUser = async (username, password) => {
    try {
      // S'assurer que les champs ne sont pas vides avant d'appeler l'API
      if (!username.trim()) {
        throw new Error("Veuillez entrer votre nom d'utilisateur");
      }

      if (!password.trim()) {
        throw new Error("Veuillez entrer votre mot de passe");
      }

      const resultAction = await dispatch(loginAction({ username, password }));

      if (loginAction.fulfilled.match(resultAction)) {
        initialCheckDoneRef.current = true;
        return resultAction.payload;
      }

      // Amélioration de la gestion des erreurs
      if (loginAction.rejected.match(resultAction)) {
        // Formatage des messages d'erreur pour l'utilisateur final
        let errorMessage = resultAction.payload || "Échec de la connexion";

        // Traduction des codes d'erreur en messages plus clairs
        if (typeof errorMessage === "string") {
          if (errorMessage.includes("credentials")) {
            errorMessage =
              "Identifiants incorrects. Veuillez vérifier votre nom d'utilisateur et mot de passe.";
          } else if (errorMessage.includes("locked")) {
            errorMessage =
              "Votre compte est temporairement verrouillé. Veuillez réessayer plus tard.";
          } else if (errorMessage.includes("expired")) {
            errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
          }
        }

        throw new Error(errorMessage);
      }

      return resultAction;
    } catch (err) {
      console.error("Login error in hook:", err);
      throw err;
    }
  };

  const logoutUserNormal = async () => {
    // Évite les déconnexions multiples simultanées
    if (isLoggingOut) return;

    try {
      // Utiliser l'action asynchrone pour gérer la déconnexion
      await dispatch(logoutUser());

      // Réinitialiser l'état de vérification
      initialCheckDoneRef.current = false;

      // Rediriger vers la page de login
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);

      // Même en cas d'erreur, rediriger vers la page de login
      router.push("/auth/login");
    }
  };

  // Nouvelle fonction pour gérer les déconnexions forcées (401/429)
  const handleForceLogout = async (errorMessage) => {
    try {
      // Utiliser l'action asynchrone pour gérer la déconnexion forcée
      await dispatch(forceLogout(errorMessage));

      // Réinitialiser l'état de vérification
      initialCheckDoneRef.current = false;

      // Rediriger vers la page de login
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during forced logout:", error);

      // Même en cas d'erreur, rediriger vers la page de login
      router.push("/auth/login");
    }
  };

  // Utiliser useCallback pour s'assurer que la référence de la fonction reste stable
  const checkAuthStatus = useCallback(
    async (force = false) => {
      // Si nous avons déjà fait une vérification et que l'utilisateur est authentifié,
      // et que nous ne forçons pas une nouvelle vérification, ne rien faire
      if (initialCheckDoneRef.current && isAuthenticated && !force) {
        console.log(
          "Initial auth check already done and user is authenticated"
        );
        return { type: "skipped" };
      }

      // Si une vérification est déjà en cours, ne pas en lancer une nouvelle
      if (authCheckInProgressRef.current) {
        console.log("Auth check already in progress");
        return { type: "in-progress" };
      }

      try {
        authCheckInProgressRef.current = true;
        const resultAction = await dispatch(getCurrentUser());
        initialCheckDoneRef.current = true;
        authCheckInProgressRef.current = false;
        return resultAction;
      } catch (err) {
        authCheckInProgressRef.current = false;

        // Gérer spécifiquement les erreurs 401 et 429
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 429)
        ) {
          let errorMessage =
            "Votre session a expiré. Veuillez vous reconnecter.";

          if (err.response.status === 429) {
            errorMessage = "Trop de requêtes. Veuillez réessayer plus tard.";
          }

          // Déconnexion forcée avec message d'erreur
          await handleForceLogout(errorMessage);
        } else if (err.message === "Not authenticated") {
          router.push("/auth/login");
        }

        throw err;
      }
    },
    [dispatch, isAuthenticated, router]
  );

  const clearError = () => {
    dispatch(clearErrorAction());
  };

  return {
    user,
    isAuthenticated,
    roles,
    permissions,
    loading,
    error,
    isLoggingOut,
    login: loginUser,
    logout: logoutUserNormal,
    forceLogout: handleForceLogout,
    checkAuthStatus,
    clearError,
    // Exposer cette propriété pour que les composants puissent savoir
    // si une vérification initiale a été effectuée
    initialCheckDone: initialCheckDoneRef.current,
  };
};

export default useAuth;
