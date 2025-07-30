// src/components/dashboard/ExportMenu.js
"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  TrendingUp,
  Clock,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import exportService from "@/services/exportService";

// Mapping des icônes
const iconMap = {
  TrendingUp: TrendingUp,
  Clock: Clock,
  FileText: FileText,
  Grid: Grid,
};

export default function ExportMenu({ startDate, endDate, tenantCode }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingId, setExportingId] = useState(null);

  // Formater la date pour l'API (yyyy-mm-dd)
  const formatDateForAPI = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  // Récupérer tous les exports disponibles de manière aplatie
  const getAllExports = () => {
    const exportCategories = exportService.getAvailableExports();
    const allExports = [];

    Object.entries(exportCategories).forEach(([categoryKey, category]) => {
      category.exports.forEach((exportConfig) => {
        allExports.push({
          ...exportConfig,
          categoryLabel: category.label,
          categoryIcon: category.icon,
        });
      });
    });

    return allExports;
  };

  const exports = getAllExports();

  // Gérer l'export
  const handleExport = async (exportConfig) => {
    setIsExporting(true);
    setExportingId(exportConfig.id);

    try {
      toast.info("Export en cours...");

      const result = await exportConfig.action(
        formatDateForAPI(startDate),
        formatDateForAPI(endDate),
        tenantCode
      );

      toast.success(`Export terminé ✓`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
      setExportingId(null);
    }
  };

  // Si pas de tenant sélectionné, désactiver le bouton
  const isDisabled = !tenantCode || isExporting;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isDisabled} className="gap-2 h-10">
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exports disponibles
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Liste directe de tous les exports */}
        {exports.map((exportConfig) => {
          const ExportIcon = iconMap[exportConfig.icon] || FileText;
          return (
            <DropdownMenuItem
              key={exportConfig.id}
              className="cursor-pointer py-3"
              onSelect={() => handleExport(exportConfig)}
              disabled={isExporting}
            >
              <div className="flex items-start gap-3 w-full">
                <ExportIcon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">{exportConfig.name}</div>
                  {exportConfig.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {exportConfig.description}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {exportConfig.categoryLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      Format {exportConfig.format}
                    </span>
                  </div>
                </div>
                {isExporting && exportingId === exportConfig.id && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
