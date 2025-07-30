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
        responseType: "blob",
      });

      // Extraire le nom du fichier depuis les headers de la réponse
      const contentDisposition = response.headers["content-disposition"];

      let fileName = "export.csv"; // Nom par défaut

      if (contentDisposition) {
        // Extraire le nom du fichier depuis Content-Disposition
        // Format attendu : attachment; filename="revenus_quotidiens_REST001_2024-01-01_2024-01-31.csv"
        const fileNameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          contentDisposition
        );
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, "");
        }
      }

      // Créer et télécharger le fichier
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // Utiliser le nom fourni par le serveur
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
