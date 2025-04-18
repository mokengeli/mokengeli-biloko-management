// src/hooks/useMenu.js
import { useState, useCallback } from "react";
import menuService from "@/services/menuService";

export const useMenu = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  });

  // Fonction pour récupérer les catégories de menu d'un restaurant spécifique
  // Mise à jour pour supporter la pagination
  const fetchCategories = useCallback(
    async (tenantCode, page = 0, size = 10) => {
      setLoading(true);
      setError(null);
      try {
        if (!tenantCode) {
          throw new Error("Code de restaurant requis");
        }
        const data = await menuService.getAllCategories(tenantCode, page, size);
        setCategories(data.content || []);
        setPagination({
          currentPage: data.number || 0,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          pageSize: data.size || size,
        });
      } catch (err) {
        console.error("Error fetching menu categories:", err);
        setError(
          err.message || "Erreur lors de la récupération des catégories de menu"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fonction pour récupérer toutes les catégories disponibles
  // Mise à jour pour supporter la pagination
  const fetchAllAvailableCategories = useCallback(
    async (page = 0, size = 10) => {
      setLoading(true);
      setError(null);
      try {
        const data = await menuService.getAllAvailableCategories(page, size);
        setCategories(data.content || []);
        setPagination({
          currentPage: data.number || 0,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          pageSize: data.size || size,
        });
      } catch (err) {
        console.error("Error fetching all available categories:", err);
        setError(
          err.message ||
            "Erreur lors de la récupération des catégories disponibles"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    categories,
    loading,
    error,
    pagination,
    fetchCategories,
    fetchAllAvailableCategories,
    // Helpers pour la pagination
    changePage: (tenantCode, newPage) =>
      fetchCategories(tenantCode, newPage, pagination.pageSize),
    changePageSize: (tenantCode, newSize) =>
      fetchCategories(tenantCode, 0, newSize),
    changeAllCategoriesPage: (newPage) =>
      fetchAllAvailableCategories(newPage, pagination.pageSize),
    changeAllCategoriesPageSize: (newSize) =>
      fetchAllAvailableCategories(0, newSize),
  };
};

export default useMenu;
