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
  const fetchCategories = useCallback(
    async (tenantCode, page = 0, size = 10, search = "") => {
      setLoading(true);
      setError(null);
      try {
        if (!tenantCode) {
          throw new Error("Code de restaurant requis");
        }
        const data = await menuService.getAllCategories(
          tenantCode,
          page,
          size,
          search
        );
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
  const fetchAllAvailableCategories = useCallback(
    async (page = 0, size = 10, search = "") => {
      setLoading(true);
      setError(null);
      try {
        const data = await menuService.getAllAvailableCategories(
          page,
          size,
          search
        );
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
    // Helpers pour la pagination avec search
    changePage: (tenantCode, newPage, search = "") =>
      fetchCategories(tenantCode, newPage, pagination.pageSize, search),
    changePageSize: (tenantCode, newSize, search = "") =>
      fetchCategories(tenantCode, 0, newSize, search),
    changeAllCategoriesPage: (newPage, search = "") =>
      fetchAllAvailableCategories(newPage, pagination.pageSize, search),
    changeAllCategoriesPageSize: (newSize, search = "") =>
      fetchAllAvailableCategories(0, newSize, search),
  };
};

export default useMenu;
