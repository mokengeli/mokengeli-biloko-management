// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";

// Créer une action asynchrone pour la connexion
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // Simuler un délai minimum pour éviter les flashs d'UI sur les connexions très rapides
      const startTime = Date.now();
      const data = await authService.login(username, password);

      // S'assurer que l'animation de chargement est visible pendant au moins 500ms
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - elapsedTime));
      }

      return data;
    } catch (error) {
      // Détection spécifique des erreurs 401 et 429 pour un traitement approprié
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 429)
      ) {
        const statusCode = error.response.status;
        let errorMessage = "Échec de la connexion";

        if (statusCode === 401) {
          errorMessage =
            "Identifiants incorrects. Veuillez vérifier votre nom d'utilisateur et mot de passe.";
        } else if (statusCode === 429) {
          errorMessage =
            "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
        }

        return rejectWithValue(errorMessage);
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Échec de la connexion";
      return rejectWithValue(errorMessage);
    }
  }
);

// Action pour récupérer l'utilisateur courant
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getCurrentUser();
      return data;
    } catch (error) {
      // S'assurer que cette erreur est bien rejetée
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erreur lors de la récupération des informations utilisateur";
      return rejectWithValue(errorMessage);
    }
  }
);

// Action asynchrone pour gérer la déconnexion
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      // 1. Indiquer que la déconnexion est en cours
      dispatch(prepareLogout());

      // 2. Appeler le service de déconnexion
      await authService.logout();

      // 3. Finaliser la déconnexion
      dispatch(completeLogout());

      return { success: true };
    } catch (error) {
      console.error("Error during logout:", error);

      // Même en cas d'erreur, terminer la déconnexion
      dispatch(completeLogout());

      return { success: false, error: error.message };
    }
  }
);

// Action spécifique pour gérer la déconnexion forcée (erreurs 401/429)
export const forceLogout = createAsyncThunk(
  "auth/forceLogout",
  async (errorMessage, { dispatch }) => {
    try {
      // 1. Indiquer que la déconnexion est en cours
      dispatch(prepareLogout());

      // 2. Appeler notre API locale pour supprimer le cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // 3. Finaliser la déconnexion
      dispatch(completeLogout());

      // 4. Stocker le message d'erreur pour affichage après redirection
      if (errorMessage && typeof window !== "undefined") {
        localStorage.setItem("auth_error", errorMessage);
      }

      return { success: true };
    } catch (error) {
      console.error("Error during forced logout:", error);

      // Même en cas d'erreur, terminer la déconnexion
      dispatch(completeLogout());

      return { success: false, error: error.message };
    }
  }
);

// État initial
const initialState = {
  user: null,
  isAuthenticated: false,
  roles: [],
  permissions: [],
  loading: false,
  error: null,
  isLoggingOut: false,
};

// Créer le slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Création d'une action de "préparation de déconnexion" qui ne vide pas encore les données
    prepareLogout: (state) => {
      // Marque simplement l'utilisateur comme en cours de déconnexion
      state.isLoggingOut = true;
      // Mais garde les données utilisateur pour éviter les erreurs durant la transition
    },
    completeLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.roles = [];
      state.permissions = [];
      state.loading = false;
      state.isLoggingOut = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetLoading: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Gestion des états pour login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        // Stocker les rôles et permissions
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Gestion des états pour getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        // Stocker les rôles et permissions
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.permissions = [];
        state.error = action.payload;
      })
      // Gestion des états pour logoutUser et forceLogout
      .addCase(logoutUser.pending, (state) => {
        state.isLoggingOut = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // Déjà géré par completeLogout
      })
      .addCase(logoutUser.rejected, (state) => {
        // Même en cas d'erreur, on finit la déconnexion
        state.isLoggingOut = false;
      })
      .addCase(forceLogout.pending, (state) => {
        state.isLoggingOut = true;
      })
      .addCase(forceLogout.fulfilled, (state) => {
        // Déjà géré par completeLogout
      })
      .addCase(forceLogout.rejected, (state) => {
        // Même en cas d'erreur, on finit la déconnexion
        state.isLoggingOut = false;
      });
  },
});

export const { prepareLogout, completeLogout, clearError, resetLoading } =
  authSlice.actions;
export default authSlice.reducer;
