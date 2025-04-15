import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Ajoutez d'autres reducers ici au fur et à mesure
  },
});

export default store;
