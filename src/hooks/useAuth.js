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
} from "../store/authSlice";
import authService from "@/services/authService";

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading, error, roles, permissions } =
    useSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Référence pour suivre si un appel est en cours
  const authCheckInProgressRef = useRef(false);
  // Référence pour suivre si nous avons déjà fait une vérification initiale
  const initialCheckDoneRef = useRef(false);

  const loginUser = async (username, password) => {
    try {
      const resultAction = await dispatch(loginAction({ username, password }));

      if (loginAction.fulfilled.match(resultAction)) {
        console.log("Login successful, redirecting...");
        router.push("/dashboard");
        initialCheckDoneRef.current = true;
        return resultAction.payload;
      }

      return resultAction;
    } catch (err) {
      console.error("Login error in hook:", err);
      throw err;
    }
  };

  const logoutUser = async () => {
    // Évite les déconnexions multiples simultanées
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      // 1. Indiquer que la déconnexion est en cours
      dispatch(prepareLogout());

      // 2. Appeler le service qui gère à la fois l'appel API backend et le nettoyage côté client
      await authService.logout();

      // 3. Réinitialiser l'état de vérification
      initialCheckDoneRef.current = false;

      // 4. Rediriger vers la page de login
      router.push("/auth/login");

      // 5. Terminer la déconnexion après redirection
      setTimeout(() => {
        dispatch(completeLogout());
      }, 100);
    } catch (error) {
      console.error("Error during logout:", error);

      // Même en cas d'erreur, on continue avec la redirection et le nettoyage
      router.push("/auth/login");

      // Terminer la déconnexion
      setTimeout(() => {
        dispatch(completeLogout());
      }, 100);
    } finally {
      setIsLoggingOut(false);
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
        if (err.message === "Not authenticated") {
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
    logout: logoutUser,
    checkAuthStatus,
    clearError,
    // Exposer cette propriété pour que les composants puissent savoir
    // si une vérification initiale a été effectuée
    initialCheckDone: initialCheckDoneRef.current,
  };
};

export default useAuth;