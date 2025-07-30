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
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
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

  // Récupérer les exports disponibles organisés par catégories
  const exportCategories = exportService.getAvailableExports();

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

  // Compter le nombre total d'exports disponibles
  const totalExports = Object.values(exportCategories).reduce(
    (total, category) => total + category.exports.length,
    0
  );

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
          {totalExports > 1 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({totalExports})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exports disponibles
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Si un seul export, affichage simple */}
        {totalExports === 1
          ? Object.entries(exportCategories).map(([categoryKey, category]) =>
              category.exports.map((exportConfig) => {
                const ExportIcon = iconMap[exportConfig.icon] || FileText;
                return (
                  <DropdownMenuItem
                    key={exportConfig.id}
                    className="cursor-pointer"
                    onSelect={() => handleExport(exportConfig)}
                    disabled={isExporting}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <ExportIcon className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {exportConfig.name}
                          <span className="text-xs text-muted-foreground">
                            ({exportConfig.format})
                          </span>
                        </div>
                        {exportConfig.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {exportConfig.description}
                          </div>
                        )}
                      </div>
                      {isExporting && exportingId === exportConfig.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })
            )
          : /* Si plusieurs exports, organiser par catégories */
            Object.entries(exportCategories).map(([categoryKey, category]) => {
              const CategoryIcon = iconMap[category.icon] || FileText;

              return (
                <DropdownMenuSub key={categoryKey}>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <CategoryIcon className="h-4 w-4 mr-2" />
                    <span>{category.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {category.exports.length}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-64">
                      {category.exports.map((exportConfig) => {
                        const ExportIcon =
                          iconMap[exportConfig.icon] || FileText;
                        return (
                          <DropdownMenuItem
                            key={exportConfig.id}
                            className="cursor-pointer"
                            onSelect={() => handleExport(exportConfig)}
                            disabled={isExporting}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <ExportIcon className="h-4 w-4 mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {exportConfig.name}
                                  <span className="text-xs text-muted-foreground">
                                    ({exportConfig.format})
                                  </span>
                                </div>
                                {exportConfig.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {exportConfig.description}
                                  </div>
                                )}
                              </div>
                              {isExporting &&
                                exportingId === exportConfig.id && (
                                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                )}
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              );
            })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
