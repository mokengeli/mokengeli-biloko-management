// src/app/menu/categories/assign/page.js
"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";
import menuService from "@/services/menuService";
import userService from "@/services/userService";
import { ArrowLeft, Info, Search, X, Link, Store } from "lucide-react";
import { toast } from "sonner";

function AssignCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantCode = searchParams.get("tenant");
  const { user, roles } = useAuth();
  const { hasPermission } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tenant, setTenant] = useState(null);

  const isAdmin = roles.includes("ROLE_ADMIN");

  // Pagination et recherche pour les catégories
  const [categoryPage, setCategoryPage] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySearchInput, setCategorySearchInput] = useState("");
  const [categoryPagination, setCategoryPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 9,
  });

  const canAssignCategory = isAdmin || hasPermission("ASSIGN_MENU_CATEGORY");

  // Déterminer le tenantCode à utiliser
  const effectiveTenantCode =
    tenantCode || (!isAdmin ? user?.tenantCode : null);

  // Vérifier les permissions et le tenantCode
  useEffect(() => {
    if (!canAssignCategory) {
      router.push("/menu/categories");
      return;
    }

    // Si pas de tenantCode disponible, rediriger
    if (!effectiveTenantCode) {
      toast.error("Aucun restaurant sélectionné");
      router.push("/menu/categories");
      return;
    }

    // Charger les informations du tenant
    const fetchTenant = async () => {
      try {
        const tenantData = await userService.getTenantByCode(
          effectiveTenantCode
        );
        setTenant(tenantData);
      } catch (err) {
        console.error("Error fetching tenant:", err);
      }
    };

    fetchTenant();
  }, [canAssignCategory, effectiveTenantCode, router]);

  // Charger toutes les catégories disponibles avec pagination
  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await menuService.getAllAvailableCategories(
          categoryPage,
          categoryPagination.pageSize,
          categorySearch
        );

        setCategories(response.content || []);
        setCategoryPagination({
          currentPage: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          pageSize: response.size || categoryPagination.pageSize,
        });
      } catch (err) {
        console.error("Error fetching available categories:", err);
        toast.error("Erreur lors du chargement des catégories disponibles");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchAllCategories();
  }, [categoryPage, categorySearch, categoryPagination.pageSize]);

  // Debounce pour la recherche de catégories
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategorySearch(categorySearchInput);
      setCategoryPage(0); // Reset à la première page lors d'une recherche
    }, 500);
    return () => clearTimeout(timer);
  }, [categorySearchInput]);

  const handleAssign = async () => {
    if (!selectedCategory) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Assigner la catégorie au restaurant
      await menuService.assignCategoryToRestaurant(
        selectedCategory.id,
        effectiveTenantCode
      );

      toast.success("Catégorie assignée avec succès");

      // Rediriger avec le tenant si c'était spécifié dans l'URL
      if (tenantCode) {
        router.push(`/menu/categories?tenant=${tenantCode}`);
      } else {
        router.push("/menu/categories");
      }
    } catch (err) {
      console.error("Error assigning category:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'assignation de la catégorie"
      );
      toast.error("Erreur lors de l'assignation de la catégorie");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight"
        >
          Assigner une catégorie existante
        </motion.h1>
      </div>

      {/* Affichage du restaurant */}
      {tenant && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Store className="h-4 w-4" />
          <span>Restaurant :</span>
          <span className="font-medium text-foreground">{tenant.name}</span>
        </motion.div>
      )}

      {/* Alert d'information */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Sélectionnez une catégorie existante pour l'associer à ce restaurant.
          Les catégories déjà assignées ne sont pas affichées.
        </AlertDescription>
      </Alert>

      {/* Sélection de catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionnez une catégorie</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={categorySearchInput}
              onChange={(e) => setCategorySearchInput(e.target.value)}
              className="pl-10 pr-10"
            />
            {categorySearchInput && (
              <button
                type="button"
                onClick={() => setCategorySearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, index) => (
                <Skeleton key={index} className="h-20" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {categorySearch
                ? `Aucune catégorie trouvée pour "${categorySearch}"`
                : "Aucune catégorie disponible à assigner"}
            </div>
          ) : (
            <>
              <RadioGroup
                value={selectedCategory?.id?.toString()}
                onValueChange={(value) => {
                  const category = categories.find(
                    (cat) => cat.id.toString() === value
                  );
                  setSelectedCategory(category);
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                        selectedCategory?.id === category.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-gray-200 hover:bg-gray-50 hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <RadioGroupItem
                        value={category.id.toString()}
                        id={`category-${category.id}`}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium text-base">
                          {category.name}
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </RadioGroup>

              {/* Pagination */}
              {categoryPagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCategoryPage(Math.max(0, categoryPage - 1))
                          }
                          disabled={categoryPage === 0}
                          className={
                            categoryPage === 0
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: categoryPagination.totalPages })
                        .slice(
                          Math.max(0, categoryPage - 2),
                          Math.min(
                            categoryPagination.totalPages,
                            categoryPage + 3
                          )
                        )
                        .map((_, index) => {
                          const pageNumber =
                            Math.max(0, categoryPage - 2) + index;
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                isActive={categoryPage === pageNumber}
                                onClick={() => setCategoryPage(pageNumber)}
                              >
                                {pageNumber + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCategoryPage(
                              Math.min(
                                categoryPagination.totalPages - 1,
                                categoryPage + 1
                              )
                            )
                          }
                          disabled={
                            categoryPage >= categoryPagination.totalPages - 1
                          }
                          className={
                            categoryPage >= categoryPagination.totalPages - 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (tenantCode) {
              router.push(`/menu/categories?tenant=${tenantCode}`);
            } else {
              router.back();
            }
          }}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          onClick={handleAssign}
          disabled={isSubmitting || !selectedCategory}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              Assignation...
            </>
          ) : (
            <>
              <Link className="mr-2 h-4 w-4" />
              Assigner la catégorie
            </>
          )}
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-md bg-red-50 text-red-500 text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}

export default function AssignCategoryPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <AssignCategoryContent />
      </Suspense>
    </DashboardLayout>
  );
}
