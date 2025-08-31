// src/services/exportService.js
import apiClient from "@/lib/api";

const exportService = {
  // Fonction pour exporter les revenus quotidiens en CSV
  exportDailyRevenue: async (startDate, endDate, tenantCode) => {
    try {
      if (!startDate || !endDate || !tenantCode) {
        throw new Error("Paramètres requis manquants pour l'export");
      }

      const response = await apiClient.get("/api/order/reports/daily-revenue", {
        params: {
          start: startDate,
          end: endDate,
          tenantCode: tenantCode,
        },
        responseType: "blob",
      });

      // Extraire le nom du fichier depuis les headers
      let fileName = "revenus_quotidiens.csv";

      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
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
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, fileName };
    } catch (error) {
      console.error(
        "Error exporting daily revenue:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Nouvelle fonction pour exporter la matrice horaire quotidienne
  exportDailyHourlyMatrix: async (startDate, endDate, tenantCode) => {
    try {
      if (!startDate || !endDate || !tenantCode) {
        throw new Error("Paramètres requis manquants pour l'export");
      }

      const response = await apiClient.get(
        "/api/order/reports/daily-hourly-matrix",
        {
          params: {
            start: startDate,
            end: endDate,
            tenantCode: tenantCode,
          },
          responseType: "blob",
        }
      );

      // Extraire le nom du fichier depuis les headers
      let fileName = "matrice_horaire_quotidienne.csv";

      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
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
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, fileName };
    } catch (error) {
      console.error(
        "Error exporting daily hourly matrix:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Nouvelle fonction pour exporter le rapport journalier des plats
  exportDailyDishReport: async (date, tenantCode) => {
    try {
      if (!date || !tenantCode) {
        throw new Error("Paramètres requis manquants pour l'export");
      }

      const response = await apiClient.get("/api/order/reports/daily-dish-report", {
        params: {
          date: date, // Format: YYYY-MM-DD
          tenantCode: tenantCode,
        },
        responseType: "blob",
      });

      // Extraire le nom du fichier depuis les headers
      let fileName = `rapport_plats_${date}.csv`;

      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
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
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, fileName };
    } catch (error) {
      console.error(
        "Error exporting daily dish report:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Fonction pour récupérer la liste des exports disponibles
  // Organisée par catégories pour une meilleure ergonomie
  getAvailableExports: () => {
    return {
      financier: {
        label: "Rapports Financiers",
        icon: "TrendingUp",
        exports: [
          {
            id: "daily-revenue",
            name: "Revenus quotidiens",
            description: "Export détaillé des revenus par jour",
            format: "CSV",
            icon: "FileText",
            action: exportService.exportDailyRevenue,
          },
        ],
      },
      operationnel: {
        label: "Rapports Opérationnels",
        icon: "Clock",
        exports: [
          {
            id: "daily-hourly-matrix",
            name: "Matrice horaire",
            description: "Analyse croisée jours/heures",
            format: "CSV",
            icon: "Grid",
            action: exportService.exportDailyHourlyMatrix,
          },
        ],
      },
      plats: {
        label: "Rapports Plats",
        icon: "Grid",
        exports: [
          {
            id: "daily-dish-report",
            name: "Rapport journalier des plats",
            description: "Quantités et montants par plat pour une date donnée",
            format: "CSV",
            icon: "FileText",
            action: (startDate, endDate, tenantCode) => {
              // Utiliser uniquement la date de début pour ce rapport journalier
              return exportService.exportDailyDishReport(startDate, tenantCode);
            },
          },
        ],
      },
    };
  },
};

export default exportService;
