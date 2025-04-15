// src/hooks/useInventory.js
import { useState, useEffect, useCallback } from "react";
import inventoryService from "@/services/inventoryService";

export const useInventory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les catégories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Utiliser l'appel API réel
      const data = await inventoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Erreur lors de la récupération des catégories");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les catégories au montage du composant
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
  };
};

export default useInventory;
