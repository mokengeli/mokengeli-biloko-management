// src/app/restaurants/page.js
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
import useTenants from "@/hooks/useTenants";
import usePermissions from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import NotImplementedModal from "@/components/common/NotImplementedModal";
import CreateTenantModal from "@/components/tenants/CreateTenantModal";
import { Plus, Eye, Trash2, Building } from "lucide-react";

export default function RestaurantsPage() {
    const router = useRouter();
    const {
        tenants,
        loading,
        error,
        pagination,
        fetchTenants,
        changePage,
        changePageSize,
    } = useTenants();
    const { hasPermission } = usePermissions();
    const { roles } = useAuth();
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [alertAction, setAlertAction] = useState("");
    const isAdmin = roles.includes("ROLE_ADMIN");

    // Vérifier si l'utilisateur a la permission de voir et gérer les restaurants
    const canViewTenants = hasPermission("VIEW_TENANTS") || isAdmin;
    const canCreateTenant = hasPermission("CREATE_TENANT") || isAdmin;

    // Fonction pour gérer les actions non implémentées
    const handleNotImplementedAction = useCallback((action, itemName) => {
        setAlertAction(`${action} ${itemName}`);
        setIsAlertModalOpen(true);
    }, []);

    // Fonction pour formater une date
    const formatDate = useCallback((dateString) => {
        if (!dateString) return "N/A";
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }, []);

    // Fonction pour rediriger vers la page de détail d'un restaurant
    const handleViewRestaurant = useCallback((tenantId) => {
        router.push(`/not-found`);
    }, [router]);

    // Fonction pour gérer le succès de la création d'un restaurant
    const handleCreateSuccess = useCallback(() => {
        fetchTenants(0, pagination.pageSize);
        setIsCreateModalOpen(false);
    }, [fetchTenants, pagination.pageSize]);

    // Charger les restaurants au montage du composant
    useEffect(() => {
        fetchTenants(0, 10);
    }, [fetchTenants]);

    // Fonction pour générer les items de pagination
    const generatePaginationItems = useCallback(() => {
        const { currentPage, totalPages } = pagination;
        const items = [];

        // Si pas assez de pages pour nécessiter des ellipsis
        if (totalPages <= 5) {
            for (let i = 0; i < totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={currentPage === i}
                            onClick={() => changePage(i)}
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
                    onClick={() => changePage(0)}
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
                                onClick={() => changePage(pageNum)}
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
                                onClick={() => changePage(pageNum)}
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
                                onClick={() => changePage(pageNum)}
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
                        onClick={() => changePage(totalPages - 1)}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    }, [pagination, changePage]);

    // Si l'utilisateur n'a pas la permission de voir les restaurants, rediriger
    if (!canViewTenants) {
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
                        Restaurants
                    </motion.h1>

                    <div className="flex items-center gap-4">
                        {canCreateTenant && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Button onClick={() => setIsCreateModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer un restaurant
                                </Button>
                            </motion.div>
                        )}
                    </div>
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
                                onClick={() => fetchTenants()}
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
                                        <TableHead>Code</TableHead>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="hidden md:table-cell">Date de création</TableHead>
                                        <TableHead className="hidden md:table-cell">Dernière modification</TableHead>
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
                                                        <Skeleton className="h-5 w-24" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-5 w-40" />
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
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Skeleton className="h-8 w-8 rounded-md" />
                                                            <Skeleton className="h-8 w-8 rounded-md" />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    ) : tenants.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                Aucun restaurant trouvé.
                                                {canCreateTenant ? " Commencez par en créer un !" : ""}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        // Données réelles
                                        tenants.map((tenant) => (
                                            <TableRow
                                                key={tenant.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">
                                                    {tenant.code}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                        {tenant.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {tenant.email || "Non spécifié"}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {formatDate(tenant.createdAt)}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {formatDate(tenant.updatedAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-blue-500"
                                                            onClick={() => handleViewRestaurant(tenant.id)}
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
                                                                    `le restaurant "${tenant.name}"`
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
                            {!loading && tenants.length > 0 && (
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
                                                        changePageSize(parseInt(value, 10))
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
                                                                changePage(pagination.currentPage - 1)
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
                                                                changePage(pagination.currentPage + 1)
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
            </div>

            {/* Modal d'alerte pour les fonctionnalités non implémentées */}
            <NotImplementedModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                title={`Action non disponible : ${alertAction}`}
            />

            {/* Rendre la modal conditionnellement pour éviter les rendus inutiles */}
            {isCreateModalOpen && (
                <CreateTenantModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </DashboardLayout>
    );
}