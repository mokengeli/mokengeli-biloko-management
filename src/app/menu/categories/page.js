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
import DashboardLayout from "@/components/layout/DashboardLayout";
import RestaurantSelector from "@/components/inventory/RestaurantSelector";
import useMenu from "@/hooks/useMenu";
import usePermissions from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import NotImplementedModal from "@/components/common/NotImplementedModal";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function MenuCategoriesPage() {
  const router = useRouter();
  const { categories, loading, error, fetchCategories } = useMenu();
  const { hasPermission } = usePermissions();
  const { user, roles } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertAction, setAlertAction] = useState("");
  const isAdmin = roles.includes("ROLE_ADMIN");

  // Vérifier si l'utilisateur a la permission d'éditer les menus
  const canEditMenu = hasPermission("EDIT_INVENTORY"); // Adapter selon vos permissions

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
      fetchCategories(selectedRestaurant);
    }
  }, [fetchCategories, selectedRestaurant]);

  // Fonction pour gérer les actions non implémentées
  const handleNotImplementedAction = (action, itemName) => {
    setAlertAction(`${action} ${itemName}`);
    setIsAlertModalOpen(true);
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

            {selectedRestaurant && canEditMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  onClick={() =>
                    handleNotImplementedAction(
                      "ajouter",
                      "une nouvelle catégorie de menu"
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une catégorie
                </Button>
              </motion.div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Nom</TableHead>
                    {canEditMenu && (
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
                          {canEditMenu && (
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
                        colSpan={canEditMenu ? 3 : 2}
                        className="text-center py-8 text-gray-500"
                      >
                        Aucune catégorie de menu trouvée.{" "}
                        {canEditMenu ? "Commencez par en créer une !" : ""}
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
                        {canEditMenu && (
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
    </DashboardLayout>
  );
}
