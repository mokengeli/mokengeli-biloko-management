// src/hooks/useTenants.js
import { useState, useCallback } from "react";
import userService from "@/services/userService";

export const useTenants = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 10,
    });

    // Fonction pour récupérer tous les restaurants avec pagination
    const fetchTenants = useCallback(async (page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getAllTenantsWithPagination(page, size);
            setTenants(data.content || []);
            setPagination({
                currentPage: data.number || 0,
                totalPages: data.totalPages || 0,
                totalElements: data.totalElements || 0,
                pageSize: data.size || size,
            });
        } catch (err) {
            console.error("Error fetching tenants:", err);
            setError(err.message || "Erreur lors de la récupération des restaurants");
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        tenants,
        loading,
        error,
        pagination,
        fetchTenants,
        // Helpers pour la pagination
        changePage: (newPage) =>
            fetchTenants(newPage, pagination.pageSize),
        changePageSize: (newSize) =>
            fetchTenants(0, newSize),
    };
};

export default useTenants;