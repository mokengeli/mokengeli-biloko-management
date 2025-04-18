import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className,
  pageSizeOptions = [5, 10, 25, 50],
}) {
  // Si pas de pages ou une seule page, ne pas afficher la pagination
  if (totalPages <= 1) return null;

  // Calculer les numéros de page à afficher
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Nombre max de boutons de page à afficher

    if (totalPages <= maxPagesToShow) {
      // Si le nombre total de pages est inférieur au max, afficher toutes les pages
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Toujours montrer la première page
      pageNumbers.push(0);

      // Calculer les pages du milieu à afficher
      const startPage = Math.max(
        1,
        currentPage - Math.floor((maxPagesToShow - 3) / 2)
      );
      const endPage = Math.min(totalPages - 2, startPage + maxPagesToShow - 4);

      // Ajouter un ellipsis si nécessaire au début
      if (startPage > 1) {
        pageNumbers.push("ellipsis1");
      }

      // Ajouter les pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Ajouter un ellipsis si nécessaire à la fin
      if (endPage < totalPages - 2) {
        pageNumbers.push("ellipsis2");
      }

      // Toujours montrer la dernière page
      pageNumbers.push(totalPages - 1);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  // Calculer l'affichage des items (ex: "1-10 de 100 items")
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);
  const itemsDisplay = `${startItem}-${endItem} sur ${totalItems} éléments`;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      <div className="text-sm text-muted-foreground">{itemsDisplay}</div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Page précédente</span>
        </Button>

        {pageNumbers.map((pageNumber, index) =>
          pageNumber === "ellipsis1" || pageNumber === "ellipsis2" ? (
            <Button
              key={pageNumber}
              variant="ghost"
              size="icon"
              disabled
              className="h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Plus de pages</span>
            </Button>
          ) : (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageNumber)}
              className="h-8 w-8"
            >
              {pageNumber + 1}
              <span className="sr-only">Page {pageNumber + 1}</span>
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Page suivante</span>
        </Button>

        {/* Sélecteur du nombre d'éléments par page */}
        <div className="flex items-center ml-2">
          <span className="text-sm text-muted-foreground mr-2">Par page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
