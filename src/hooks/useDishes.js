// src/hooks/useDishes.js
import { useState, useCallback } from "react";
import dishService from "@/services/dishService";

export const useDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  });

  // Fonction pour récupérer les plats d'un restaurant spécifique
  const fetchDishes = useCallback(async (tenantCode, page = 0, size = 10) => {
    setLoading(true);
    setError(null);
    try {
      if (!tenantCode) {
        throw new Error("Code de restaurant requis");
      }
      const data = await dishService.getAllDishes(tenantCode, page, size);
      setDishes(data.content || []);
      setPagination({
        currentPage: data.number || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        pageSize: data.size || size,
      });
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
    pagination,
    fetchDishes,
    // Helpers pour la pagination
    changePage: (tenantCode, newPage) =>
      fetchDishes(tenantCode, newPage, pagination.pageSize),
    changePageSize: (tenantCode, newSize) =>
      fetchDishes(tenantCode, 0, newSize),
  };
};

export default useDishes;
