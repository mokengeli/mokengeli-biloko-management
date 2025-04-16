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
import DashboardLayout from "@/components/layout/DashboardLayout";
import RestaurantSelector from "@/components/inventory/RestaurantSelector";
import useInventory from "@/hooks/useInventory";
import usePermissions from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Eye, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const { products, loading, error, fetchProducts } = useInventory();
  const { hasPermission } = usePermissions();
  const { user, roles } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const isAdmin = roles.includes("ROLE_ADMIN");

  // Vérifier si l'utilisateur a la permission d'éditer l'inventaire
  const canEditInventory = hasPermission("EDIT_INVENTORY");
  const canViewInventory = hasPermission("VIEW_INVENTORY");

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      fetchProducts();
    }
  }, [fetchProducts, selectedRestaurant]);

  // Filtrer les produits par restaurant sélectionné
  const filteredProducts = selectedRestaurant
    ? products.filter((product) => product.tenantCode === selectedRestaurant)
    : [];

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
                <Button onClick={() => router.push("/not-found")}>
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
                  onClick={fetchProducts}
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
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Unité de mesure
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date de création
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Dernière modification
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
                            <Skeleton className="h-5 w-16" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-5 w-28" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-5 w-28" />
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
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        Aucun produit trouvé.{" "}
                        {canEditInventory ? "Commencez par en créer un !" : ""}
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Données réelles
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          {product.category?.name || "Non catégorisé"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.unitOfMeasure}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(product.createdAt)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(product.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-500"
                              onClick={() =>
                                router.push(`/inventory/products/${product.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEditInventory && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500"
                                onClick={() => router.push("/not-found")}
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
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
