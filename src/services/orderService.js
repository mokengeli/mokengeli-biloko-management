// src/services/orderService.js
import apiClient from "@/lib/api";

const orderService = {
    // Fonction pour récupérer les tables d'un restaurant
    getRestaurantTables: async (tenantCode, page = 0, size = 10) => {
        try {
            if (!tenantCode) {
                throw new Error("Code de restaurant requis");
            }
            const response = await apiClient.get("/api/order/table", {
                params: {
                    code: tenantCode,
                    page,
                    size,
                },
            });
            return response.data;
        } catch (error) {
            console.error(
                "Error fetching restaurant tables:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    // Fonction pour créer une table
    createTable: async (tableData) => {
        try {
            const response = await apiClient.post("/api/order/table", tableData);
            return response.data;
        } catch (error) {
            console.error(
                "Error creating table:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    // Autres fonctions liées aux commandes et tables peuvent être ajoutées ici
};

export default orderService;