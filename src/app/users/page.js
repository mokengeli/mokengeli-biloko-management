// src/app/users/page.js
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
import useUsers from "@/hooks/useUsers";
import usePermissions from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { PrimaryRoleBadge } from "@/components/common/RoleBadge";
import NotImplementedModal from "@/components/common/NotImplementedModal";
import { Plus, Eye, Trash2 } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    changePage,
    changePageSize,
  } = useUsers();
  const { hasPermission } = usePermissions();
  const { user, roles } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertAction, setAlertAction] = useState("");
  const isAdmin = roles.includes("ROLE_ADMIN");

  // Vérifier si l'utilisateur a les permissions nécessaires pour gérer les utilisateurs
  const canCreateUser = isAdmin || hasPermission("CREATE_USER");
  const canViewUsers = isAdmin || hasPermission("VIEW_USERS");

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

  // Charger les utilisateurs au changement de restaurant
  useEffect(() => {
    if (selectedRestaurant) {
      fetchUsers(selectedRestaurant, 0, 10);
    }
  }, [fetchUsers, selectedRestaurant]);

  // Fonction pour gérer les actions non implémentées
  const handleNotImplementedAction = (action, itemName) => {
    setAlertAction(`${action} ${itemName}`);
    setIsAlertModalOpen(true);
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Redirection vers la page de détail d'un utilisateur (non implémentée)
  const handleViewUser = (userId) => {
    router.push(`/users/${userId}`);
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
              onClick={() => changePage(selectedRestaurant, i)}
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
          onClick={() => changePage(selectedRestaurant, 0)}
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
                onClick={() => changePage(selectedRestaurant, pageNum)}
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
                onClick={() => changePage(selectedRestaurant, pageNum)}
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
                onClick={() => changePage(selectedRestaurant, pageNum)}
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
            onClick={() => changePage(selectedRestaurant, totalPages - 1)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Si l'utilisateur n'a pas la permission de voir les utilisateurs, rediriger
  if (!canViewUsers && !isAdmin) {
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
            Utilisateurs
          </motion.h1>

          <div className="flex flex-col md:flex-row items-center gap-4">
            {isAdmin && (
              <RestaurantSelector
                value={selectedRestaurant}
                onChange={handleRestaurantChange}
              />
            )}

            {selectedRestaurant && canCreateUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  onClick={() =>
                    handleNotImplementedAction("créer", "un utilisateur")
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un utilisateur
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {!selectedRestaurant ? (
          <div className="p-8 text-center bg-gray-50 rounded-md border">
            <p className="text-gray-500">
              {isAdmin
                ? "Veuillez sélectionner un restaurant pour voir ses utilisateurs"
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
                  onClick={() => fetchUsers(selectedRestaurant)}
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
                      <TableHead>Prénom</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Date de création
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
                              <Skeleton className="h-5 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-24" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="h-5 w-28" />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          Aucun utilisateur trouvé.
                          {canCreateUser ? " Commencez par en créer un !" : ""}
                        </TableCell>
                      </TableRow>
                    ) : (
                      // Données réelles
                      users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {user.lastName}
                          </TableCell>
                          <TableCell>{user.firstName}</TableCell>
                          <TableCell>
                            {user.roles && user.roles.length > 0 && (
                              <PrimaryRoleBadge roles={user.roles} size="sm" />
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-blue-500"
                                onClick={() => handleViewUser(user.id)}
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
                                    `l'utilisateur "${user.firstName} ${user.lastName}"`
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

                {/* Pagination */}
                {!loading && users.length > 0 && (
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
                              changePageSize(
                                selectedRestaurant,
                                parseInt(value, 10)
                              )
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

                        {/* Composant de pagination */}
                        <Pagination className="mt-0">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() =>
                                  changePage(
                                    selectedRestaurant,
                                    pagination.currentPage - 1
                                  )
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
                                  changePage(
                                    selectedRestaurant,
                                    pagination.currentPage + 1
                                  )
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
    </DashboardLayout>
  );
}
