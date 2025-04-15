// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";

// Créer une action asynchrone pour la connexion
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login(username, password);
      return data;
    } catch (error) {
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

// État initial
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Créer le slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false; // S'assurer que loading est false après déconnexion
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
    // Ajoutons une action pour réinitialiser l'état de chargement si nécessaire
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
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false; // Important : s'assurer que loading est mis à false même en cas d'erreur
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, resetLoading } = authSlice.actions;
export default authSlice.reducer;
