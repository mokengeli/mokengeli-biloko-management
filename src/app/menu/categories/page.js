// src/app/menu/categories/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RestaurantSelector from "@/components/inventory/RestaurantSelector";
import useMenu from "@/hooks/useMenu";
import usePermissions from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import NotImplementedModal from "@/components/common/NotImplementedModal";
import AddMenuCategoryModal from "@/components/menu/AddMenuCategoryModal";
import AssignCategoryModal from "@/components/menu/AssignCategoryModal";
import { Plus, Pencil, Trash2, Link } from "lucide-react";

export default function MenuCategoriesPage() {
  const router = useRouter();
  const {
    categories,
    loading,
    error,
    pagination,
    fetchCategories,
    changePage,
    changePageSize,
  } = useMenu();
  const { hasPermission } = usePermissions();
  const { user, roles } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [alertAction, setAlertAction] = useState("");
  const isAdmin = roles.includes("ROLE_ADMIN");

  // Vérifier si l'utilisateur a les permissions nécessaires
  // L'admin peut toujours créer et assigner des catégories
  const canCreateCategory = isAdmin || hasPermission("CREATE_MENU_CATEGORY");
  const canAssignCategory = isAdmin || hasPermission("ASSIGN_MENU_CATEGORY");
  const canEditCategory =
    isAdmin ||
    hasPermission("CREATE_MENU_CATEGORY") ||
    hasPermission("ASSIGN_MENU_CATEGORY");

  // Définir le restaurant par défaut lors du chargement initial
  useEffect(() => {
    if (!isAdmin && user?.tenantCode) {
      setSelectedRestaurant(user.tenantCode);
    }
  }, [isAdmin, user]);

  // Définir le callback de changement de restaurant
  const handleRestaurantChange = useCallback((value) => {
    setSelectedRestaurant(value);
  }, []);

  // Charger les catégories au changement de restaurant
  useEffect(() => {
    if (selectedRestaurant) {
      // Mise à jour: Utilisation de fetchCategories avec pagination
      fetchCategories(selectedRestaurant, 0, 10);
    }
  }, [fetchCategories, selectedRestaurant]);

  // Fonction pour gérer les actions non implémentées
  const handleNotImplementedAction = (action, itemName) => {
    setAlertAction(`${action} ${itemName}`);
    setIsAlertModalOpen(true);
  };

  // Fonction pour gérer le changement de page
  const handlePageChange = (page) => {
    changePage(selectedRestaurant, page);
  };

  // Fonction pour gérer le changement de taille de page
  const handlePageSizeChange = (size) => {
    changePageSize(selectedRestaurant, size);
  };

  // Fonction pour générer les items de pagination
  const generatePaginationItems = () => {
    const { currentPage, totalPages } = pagination;
    const items = [];

    // Si pas assez de pages pour nécessiter des ellipsis
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
      return items;
    }

    // Première page toujours affichée
    items.push(
      <PaginationItem key={0}>
        <PaginationLink
          isActive={currentPage === 0}
          onClick={() => handlePageChange(0)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Déterminer où commencer les ellipsis
    let startPage;
    let endPage;

    if (currentPage <= 2) {
      // Près du début, montrer les premières pages
      startPage = 1;
      endPage = 3;
      items.push(
        ...Array.from({ length: endPage - startPage + 1 }, (_, index) => {
          const pageNum = startPage + index;
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                isActive={currentPage === pageNum}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })
      );

      // Ajouter ellipsis si nécessaire
      if (totalPages > 4) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    } else if (currentPage >= totalPages - 3) {
      // Près de la fin, montrer les dernières pages
      // Ajouter ellipsis si nécessaire
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      startPage = totalPages - 4;
      endPage = totalPages - 2;
      items.push(
        ...Array.from({ length: endPage - startPage + 1 }, (_, index) => {
          const pageNum = startPage + index;
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                isActive={currentPage === pageNum}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })
      );
    } else {
      // Au milieu, montrer la page courante et avant/après
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      );

      // Page précédente, courante, et suivante
      const pagesBefore = Math.max(0, currentPage - 1);
      const pagesAfter = Math.min(totalPages - 1, currentPage + 1);

      items.push(
        ...Array.from({ length: pagesAfter - pagesBefore + 1 }, (_, index) => {
          const pageNum = pagesBefore + index;
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                isActive={currentPage === pageNum}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })
      );

      // Second ellipsis si nécessaire
      if (pagesAfter < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Dernière page toujours affichée sauf si c'est la première
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages - 1}>
          <PaginationLink
            isActive={currentPage === totalPages - 1}
            onClick={() => handlePageChange(totalPages - 1)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            Catégories de menu
          </motion.h1>

          <div className="flex flex-col md:flex-row items-center gap-4">
            {isAdmin && (
              <RestaurantSelector
                value={selectedRestaurant}
                onChange={handleRestaurantChange}
              />
            )}

            {selectedRestaurant && (
              <div className="flex gap-2">
                {canCreateCategory && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer une catégorie
                    </Button>
                  </motion.div>
                )}

                {canAssignCategory && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setIsAssignModalOpen(true)}
                    >
                      <Link className="mr-2 h-4 w-4" />
                      Assigner une catégorie
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {!selectedRestaurant ? (
          <div className="p-8 text-center bg-gray-50 rounded-md border">
            <p className="text-gray-500">
              {isAdmin
                ? "Veuillez sélectionner un restaurant pour voir ses catégories de menu"
                : "Chargement..."}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-md border"
          >
            {error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchCategories(selectedRestaurant)}
                  className="mt-4"
                >
                  Réessayer
                </Button>
              </div>
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      {canEditCategory && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Squelettes de chargement
                      Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-5 w-40" />
                            </TableCell>
                            {canEditCategory && (
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Skeleton className="h-8 w-8 rounded-md" />
                                  <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={canEditCategory ? 2 : 1}
                          className="text-center py-8 text-gray-500"
                        >
                          Aucune catégorie de menu trouvée.{" "}
                          {canCreateCategory
                            ? "Commencez par en créer une !"
                            : ""}
                          {!canCreateCategory && canAssignCategory
                            ? "Commencez par assigner une catégorie existante !"
                            : ""}
                        </TableCell>
                      </TableRow>
                    ) : (
                      // Données réelles
                      categories.map((category) => (
                        <TableRow
                          key={category.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>{category.name}</TableCell>
                          {canEditCategory && (
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-blue-500"
                                  onClick={() =>
                                    handleNotImplementedAction(
                                      "modifier",
                                      `la catégorie "${category.name}"`
                                    )
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() =>
                                    handleNotImplementedAction(
                                      "supprimer",
                                      `la catégorie "${category.name}"`
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {!loading && categories.length > 0 && (
                  <div className="border-t py-4 px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Informations sur la pagination */}
                      <div className="text-sm text-muted-foreground">
                        Affichage{" "}
                        {pagination.currentPage * pagination.pageSize + 1}-
                        {Math.min(
                          (pagination.currentPage + 1) * pagination.pageSize,
                          pagination.totalElements
                        )}{" "}
                        sur {pagination.totalElements} éléments
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Sélecteur du nombre d'éléments par page */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Éléments par page:
                          </span>
                          <Select
                            value={pagination.pageSize.toString()}
                            onValueChange={(value) =>
                              handlePageSizeChange(parseInt(value, 10))
                            }
                          >
                            <SelectTrigger className="w-[70px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 10, 25, 50].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Composant de pagination de shadcn */}
                        <Pagination className="mt-0">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() =>
                                  handlePageChange(pagination.currentPage - 1)
                                }
                                disabled={pagination.currentPage === 0}
                                aria-disabled={pagination.currentPage === 0}
                                tabIndex={pagination.currentPage === 0 ? -1 : 0}
                                className={
                                  pagination.currentPage === 0
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }
                              />
                            </PaginationItem>

                            {generatePaginationItems()}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  handlePageChange(pagination.currentPage + 1)
                                }
                                disabled={
                                  pagination.currentPage >=
                                  pagination.totalPages - 1
                                }
                                aria-disabled={
                                  pagination.currentPage >=
                                  pagination.totalPages - 1
                                }
                                tabIndex={
                                  pagination.currentPage >=
                                  pagination.totalPages - 1
                                    ? -1
                                    : 0
                                }
                                className={
                                  pagination.currentPage >=
                                  pagination.totalPages - 1
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal d'ajout de catégorie */}
      {selectedRestaurant && (
        <AddMenuCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          tenantCode={selectedRestaurant}
          onSuccess={() => {
            // Rafraîchir la liste des catégories après création réussie
            fetchCategories(
              selectedRestaurant,
              pagination.currentPage,
              pagination.pageSize
            );
          }}
        />
      )}

      {/* Modal d'assignation de catégorie */}
      {selectedRestaurant && (
        <AssignCategoryModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          tenantCode={selectedRestaurant}
          onSuccess={() => {
            // Rafraîchir la liste des catégories après assignation réussie
            fetchCategories(
              selectedRestaurant,
              pagination.currentPage,
              pagination.pageSize
            );
          }}
        />
      )}

      {/* Modal d'alerte pour les fonctionnalités non implémentées */}
      <NotImplementedModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={`Action non disponible : ${alertAction}`}
      />
    </DashboardLayout>
  );
}
