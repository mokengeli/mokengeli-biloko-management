// src/hooks/useDishes.js
import { useState, useCallback } from "react";
import dishService from "@/services/dishService";

export const useDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les plats d'un restaurant spécifique
  const fetchDishes = useCallback(async (tenantCode) => {
    setLoading(true);
    setError(null);
    try {
      if (!tenantCode) {
        throw new Error("Code de restaurant requis");
      }
      const data = await dishService.getAllDishes(tenantCode);
      setDishes(data);
    } catch (err) {
      console.error("Error fetching dishes:", err);
      setError(err.message || "Erreur lors de la récupération des plats");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dishes,
    loading,
    error,
    fetchDishes,
  };
};

export default useDishes;
