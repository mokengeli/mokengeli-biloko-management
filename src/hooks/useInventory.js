// src/hooks/useInventory.js
import { useState, useCallback } from "react";
import inventoryService from "@/services/inventoryService";

export const useInventory = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  });

  // Fonction pour récupérer les catégories avec pagination
  const fetchCategories = useCallback(async (page = 0, size = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAllCategories(page, size);
      setCategories(data.content || []);
      setPagination({
        currentPage: data.number || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        pageSize: data.size || size,
      });
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Erreur lors de la récupération des catégories");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour récupérer les produits - MISE À JOUR pour utiliser le code du tenant et la pagination
  const fetchProducts = useCallback(async (tenantCode, page = 0, size = 10) => {
    setLoading(true);
    setError(null);
    try {
      if (!tenantCode) {
        throw new Error(
          "Code du restaurant requis pour récupérer les produits"
        );
      }
      const data = await inventoryService.getAllProducts(
        tenantCode,
        page,
        size
      );
      setProducts(data.content || []);
      setPagination({
        currentPage: data.number || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        pageSize: data.size || size,
      });
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
    pagination,
    fetchCategories,
    fetchProducts,
    // Helpers pour la pagination des catégories
    changePage: (newPage) => fetchCategories(newPage, pagination.pageSize),
    changePageSize: (newSize) => fetchCategories(0, newSize),
    // Helpers pour la pagination des produits
    changeProductPage: (tenantCode, newPage) =>
      fetchProducts(tenantCode, newPage, pagination.pageSize),
    changeProductPageSize: (tenantCode, newSize) =>
      fetchProducts(tenantCode, 0, newSize),
  };
};

export default useInventory;
