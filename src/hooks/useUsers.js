// src/hooks/useUsers.js
import { useState, useCallback } from "react";
import userService from "@/services/userService";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  });

  // Fonction pour récupérer les utilisateurs d'un restaurant spécifique avec recherche
  const fetchUsers = useCallback(
    async (tenantCode, page = 0, size = 10, search = "") => {
      setLoading(true);
      setError(null);
      try {
        if (!tenantCode) {
          throw new Error("Code de restaurant requis");
        }
        const data = await userService.getAllUsers(
          tenantCode,
          page,
          size,
          search
        );
        setUsers(data.content || []);
        setPagination({
          currentPage: data.number || 0,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          pageSize: data.size || size,
        });
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          err.message || "Erreur lors de la récupération des utilisateurs"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    // Helpers pour la pagination avec support de la recherche
    changePage: (tenantCode, newPage, search = "") =>
      fetchUsers(tenantCode, newPage, pagination.pageSize, search),
    changePageSize: (tenantCode, newSize, search = "") =>
      fetchUsers(tenantCode, 0, newSize, search),
  };
};

export default useUsers;
