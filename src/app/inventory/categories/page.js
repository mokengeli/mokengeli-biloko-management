// src/app/inventory/categories/page.js
"use client";

import { useEffect, useState } from "react";
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
import DashboardLayout from "@/components/layout/DashboardLayout";
import useInventory from "@/hooks/useInventory";
import usePermissions from "@/hooks/usePermissions";
import AddCategoryModal from "@/components/inventory/AddCategoryModal";
import NotImplementedModal from "@/components/common/NotImplementedModal";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const router = useRouter();
  const {
    categories,
    loading,
    error,
    pagination,
    fetchCategories,
    changePage,
    changePageSize,
  } = useInventory();
  const { hasPermission } = usePermissions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertAction, setAlertAction] = useState("");

  // Vérifier si l'utilisateur a la permission d'éditer l'inventaire
  const canEditInventory = hasPermission("EDIT_INVENTORY");

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Charger les catégories au montage du composant
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fonction pour gérer les actions non implémentées
  const handleNotImplementedAction = (action, itemName) => {
    setAlertAction(`${action} ${itemName}`);
    setIsAlertModalOpen(true);
  };

  // Fonction pour gérer le changement de page
  const handlePageChange = (page) => {
    changePage(page);
  };

  // Fonction pour gérer le changement de taille de page
  const handlePageSizeChange = (size) => {
    changePageSize(size);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            Catégories d'inventaire
          </motion.h1>

          {canEditInventory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une catégorie
              </Button>
            </motion.div>
          )}
        </div>

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
                onClick={fetchCategories}
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
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date de création
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Dernière modification
                    </TableHead>
                    {canEditInventory && (
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
                            <Skeleton className="h-5 w-10" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-40" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-5 w-28" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-5 w-28" />
                          </TableCell>
                          {canEditInventory && (
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
                        colSpan={canEditInventory ? 5 : 4}
                        className="text-center py-8 text-gray-500"
                      >
                        Aucune catégorie trouvée.{" "}
                        {canEditInventory ? "Commencez par en créer une !" : ""}
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Données réelles
                    categories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {category.id}
                        </TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(category.createdAt)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(category.updatedAt)}
                        </TableCell>
                        {canEditInventory && (
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
                <div className="border-t p-4">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.pageSize}
                    totalItems={pagination.totalElements}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[5, 10, 25, 50]}
                  />
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal d'ajout de catégorie (seulement accessible avec la permission) */}
      {canEditInventory && (
        <AddCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            // Rafraîchir la liste des catégories après création réussie
            fetchCategories();
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
