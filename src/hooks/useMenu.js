// src/hooks/useMenu.js
import { useState, useCallback } from "react";
import menuService from "@/services/menuService";

export const useMenu = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les catégories de menu d'un restaurant spécifique
  const fetchCategories = useCallback(async (tenantCode) => {
    setLoading(true);
    setError(null);
    try {
      if (!tenantCode) {
        throw new Error("Code de restaurant requis");
      }
      const data = await menuService.getAllCategories(tenantCode);
      setCategories(data);
    } catch (err) {
      console.error("Error fetching menu categories:", err);
      setError(
        err.message || "Erreur lors de la récupération des catégories de menu"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
  };
};

export default useMenu;
