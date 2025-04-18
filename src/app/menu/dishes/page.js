// src/app/menu/dishes/page.js
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
import useDishes from "@/hooks/useDishes";
import usePermissions from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import NotImplementedModal from "@/components/common/NotImplementedModal";
import { Plus, Eye, Trash2 } from "lucide-react";

export default function DishesPage() {
  const router = useRouter();
  const { dishes, loading, error, fetchDishes } = useDishes();
  const { hasPermission } = usePermissions();
  const { user, roles } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertAction, setAlertAction] = useState("");
  const isAdmin = roles.includes("ROLE_ADMIN");

  // Vérifier si l'utilisateur a les permissions nécessaires
  const canCreateDish = hasPermission("CREATE_DISH");

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

  // Charger les plats au changement de restaurant
  useEffect(() => {
    if (selectedRestaurant) {
      fetchDishes(selectedRestaurant);
    }
  }, [fetchDishes, selectedRestaurant]);

  // Fonction pour gérer les actions non implémentées
  const handleNotImplementedAction = (action, itemName) => {
    setAlertAction(`${action} ${itemName}`);
    setIsAlertModalOpen(true);
  };

  // Redirection correcte pour la visualisation détaillée d'un plat
  const handleViewDish = (dishId) => {
    // Ici, vous redirigerez vers la page de détail du plat lorsqu'elle sera implémentée
    // Pour l'instant, on montre une alerte "non implémenté"
    handleNotImplementedAction("voir les détails du", "plat");
  };

  // Cette page est accessible à tous les utilisateurs authentifiés
  // Seules certaines actions comme la création de plats sont conditionnées par les permissions

  // Fonction pour formater le prix avec la devise
  const formatPrice = (price, currency) => {
    if (!price) return "N/A";

    const currencyCode = currency?.code || "";
    return `${price} ${currencyCode}`;
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
            Plats du menu
          </motion.h1>

          <div className="flex flex-col md:flex-row items-center gap-4">
            {isAdmin && (
              <RestaurantSelector
                value={selectedRestaurant}
                onChange={handleRestaurantChange}
              />
            )}

            {selectedRestaurant && canCreateDish && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  onClick={() =>
                    handleNotImplementedAction("créer", "un nouveau plat")
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un plat
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {!selectedRestaurant ? (
          <div className="p-8 text-center bg-gray-50 rounded-md border">
            <p className="text-gray-500">
              {isAdmin
                ? "Veuillez sélectionner un restaurant pour voir ses plats"
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
                  onClick={() => fetchDishes(selectedRestaurant)}
                  className="mt-4"
                >
                  Réessayer
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Catégories
                    </TableHead>
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
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-5 w-32" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : dishes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        Aucun plat trouvé.{" "}
                        {canCreateDish ? "Commencez par en créer un !" : ""}
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Données réelles
                    dishes.map((dish) => (
                      <TableRow key={dish.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {dish.name}
                        </TableCell>
                        <TableCell>
                          {formatPrice(dish.price, dish.currency)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {dish.categories?.length > 0
                            ? dish.categories.join(", ")
                            : "Non catégorisé"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-500"
                              onClick={() => handleViewDish(dish.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500"
                              onClick={() =>
                                handleNotImplementedAction(
                                  "supprimer",
                                  `le plat "${dish.name}"`
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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
