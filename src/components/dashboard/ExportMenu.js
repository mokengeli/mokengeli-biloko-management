// src/components/dashboard/ExportMenu.js
"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
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

export default function ExportMenu({ startDate, endDate, tenantCode }) {
  const [isExporting, setIsExporting] = useState(false);

  // Formater la date pour l'API (yyyy-mm-dd)
  const formatDateForAPI = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  // Récupérer les exports disponibles
  const availableExports = exportService.getAvailableExports();

  // Gérer l'export
  const handleExport = async (exportConfig) => {
    setIsExporting(true);

    try {
      toast.info("Export en cours...");

      await exportConfig.action(
        formatDateForAPI(startDate),
        formatDateForAPI(endDate),
        tenantCode
      );

      toast.success("Export terminé ✓");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
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
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Exports disponibles</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableExports.map((exportConfig) => (
          <DropdownMenuItem
            key={exportConfig.id}
            className="flex items-center gap-2 cursor-pointer"
            onSelect={() => handleExport(exportConfig)}
            disabled={isExporting}
          >
            <FileText className="h-4 w-4" />
            <span>
              {exportConfig.name} ({exportConfig.format})
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
