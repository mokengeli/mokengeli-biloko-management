// src/services/exportService.js
import apiClient from "@/lib/api";

const exportService = {
  // Fonction pour exporter les revenus quotidiens en CSV
  exportDailyRevenue: async (startDate, endDate, tenantCode) => {
    try {
      if (!startDate || !endDate || !tenantCode) {
        throw new Error("Paramètres requis manquants pour l'export");
      }

      const response = await apiClient.get("api/order/reports/daily-revenue", {
        params: {
          start: startDate,
          end: endDate,
          tenantCode: tenantCode,
        },
        responseType: "blob", // Important pour recevoir le fichier
      });

      // Créer un nom de fichier avec la date et le tenant
      const fileName = `revenus_quotidiens_${tenantCode}_${startDate}_${endDate}.csv`;

      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error(
        "Error exporting daily revenue:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer la liste des exports disponibles
  // Pour l'instant, on retourne une liste statique, mais cela pourrait
  // venir d'une API dans le futur
  getAvailableExports: () => {
    return [
      {
        id: "daily-revenue",
        name: "Revenus quotidiens",
        format: "CSV",
        icon: "FileText",
        action: exportService.exportDailyRevenue,
      },
    ];
  },
};

export default exportService;
