// src/hooks/useInventory.js
import { useState, useEffect, useCallback } from "react";
import inventoryService from "@/services/inventoryService";

export const useInventory = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les catégories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Erreur lors de la récupération des catégories");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour récupérer les produits
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Erreur lors de la récupération des produits");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    products,
    loading,
    error,
    fetchCategories,
    fetchProducts,
  };
};

export default useInventory;
