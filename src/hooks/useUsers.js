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

  // Fonction pour récupérer les utilisateurs d'un restaurant spécifique
  const fetchUsers = useCallback(async (tenantCode, page = 0, size = 10) => {
    setLoading(true);
    setError(null);
    try {
      if (!tenantCode) {
        throw new Error("Code de restaurant requis");
      }
      const data = await userService.getAllUsers(tenantCode, page, size);
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
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    // Helpers pour la pagination
    changePage: (tenantCode, newPage) =>
      fetchUsers(tenantCode, newPage, pagination.pageSize),
    changePageSize: (tenantCode, newSize) => fetchUsers(tenantCode, 0, newSize),
  };
};

export default useUsers;
