// src/app/inventory/products/page.js
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
import { Badge } from "@/components/ui/badge";
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
import useInventory from "@/hooks/useInventory";
import usePermissions from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import NotImplementedModal from "@/components/common/NotImplementedModal";
import AddProductModal from "@/components/inventory/AddProductModal";
import { Plus, Eye, Trash2, AlertCircle } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    changeProductPage,
    changeProductPageSize,
  } = useInventory();
  const { hasPermission } = usePermissions();
  const { user, roles } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [alertAction, setAlertAction] = useState("");
  const isAdmin = roles.includes("ROLE_ADMIN");

  // Vérifier si l'utilisateur a la permission d'éditer l'inventaire
  const canEditInventory = hasPermission("EDIT_INVENTORY");
  const canViewInventory = hasPermission("VIEW_INVENTORY");

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fonction pour obtenir le statut du stock
  const getStockStatus = (quantity) => {
    if (quantity <= 0) return "out-of-stock";
    if (quantity < 10) return "low-stock";
    return "in-stock";
  };

  // Fonction pour obtenir le badge de stock
  const getStockBadge = (product) => {
    const stockQuantity = product?.article?.quantity || 0;
    const status = getStockStatus(stockQuantity);
    const unitOfMeasure = product?.unitOfMeasure || "unités";

    if (status === "out-of-stock") {
      return (
        <div className="flex items-center gap-1">
          <Badge variant="destructive" className="text-xs">
            Rupture
          </Badge>
          <span className="text-xs text-muted-foreground">
            0 {unitOfMeasure}
          </span>
        </div>
      );
    }

    if (status === "low-stock") {
      return (
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3 text-amber-500" />
          <span className="text-xs font-medium text-amber-600">
            {stockQuantity} {unitOfMeasure}
          </span>
        </div>
      );
    }

    return (
      <span className="text-xs font-medium text-green-600">
        {stockQuantity} {unitOfMeasure}
      </span>
    );
  };

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

  // Charger les produits au montage du composant ou au changement de restaurant
  useEffect(() => {
    if (selectedRestaurant) {
      // MISE À JOUR: Passer le code du tenant à fetchProducts
      fetchProducts(selectedRestaurant, 0, 10);
    }
  }, [fetchProducts, selectedRestaurant]);

  // Fonction pour gérer les actions non implémentées
  const handleNotImplementedAction = (action, itemName) => {
    setAlertAction(`${action} ${itemName}`);
    setIsAlertModalOpen(true);
  };

  // Fonction pour gérer le changement de page
  const handlePageChange = (page) => {
    changeProductPage(selectedRestaurant, page);
  };

  // Fonction pour gérer le changement de taille de page
  const handlePageSizeChange = (size) => {
    changeProductPageSize(selectedRestaurant, size);
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

  // Si l'utilisateur n'a pas la permission de voir l'inventaire, rediriger
  if (!canViewInventory) {
    router.push("/dashboard");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            Produits d'inventaire
          </motion.h1>

          <div className="flex flex-col md:flex-row items-center gap-4">
            {isAdmin && (
              <RestaurantSelector
                value={selectedRestaurant}
                onChange={handleRestaurantChange}
              />
            )}

            {selectedRestaurant && canEditInventory && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un produit
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {!selectedRestaurant ? (
          <div className="p-8 text-center bg-gray-50 rounded-md border">
            <p className="text-gray-500">
              {isAdmin
                ? "Veuillez sélectionner un restaurant pour voir ses produits"
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
                  onClick={() => fetchProducts(selectedRestaurant)}
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
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Stock actuel</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                            <TableCell>
                              <Skeleton className="h-5 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-20" />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                {canEditInventory && (
                                  <Skeleton className="h-8 w-8 rounded-md" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-gray-500"
                        >
                          Aucun produit trouvé.{" "}
                          {canEditInventory
                            ? "Commencez par en créer un !"
                            : ""}
                        </TableCell>
                      </TableRow>
                    ) : (
                      // Données réelles
                      products.map((product) => (
                        <TableRow
                          key={product.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            {product.category?.name || "Non catégorisé"}
                          </TableCell>
                          <TableCell>{getStockBadge(product)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-blue-500"
                                onClick={() =>
                                  router.push(
                                    `/inventory/products/${product.id}`
                                  )
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canEditInventory && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() =>
                                    handleNotImplementedAction(
                                      "supprimer",
                                      `le produit "${product.name}"`
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {!loading && products.length > 0 && (
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

      {/* Modal d'alerte pour les fonctionnalités non implémentées */}
      <NotImplementedModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={`Action non disponible : ${alertAction}`}
      />

      {/* Modal d'ajout de produit */}
      {selectedRestaurant && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          tenantCode={selectedRestaurant}
          onSuccess={() => {
            // Rafraîchir la liste des produits après création réussie
            fetchProducts(
              selectedRestaurant,
              pagination.currentPage,
              pagination.pageSize
            );
          }}
        />
      )}
    </DashboardLayout>
  );
}
