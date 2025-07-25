// src/app/inventory/products/new/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";
import inventoryService from "@/services/inventoryService";
import { ArrowLeft, Info, Search, X, Package, Store } from "lucide-react";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantCode = searchParams.get("tenant");
  const { user, roles } = useAuth();
  const { hasPermission } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
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
    pageSize: 6, // Afficher 6 catégories par page
  });

  const canEditInventory = hasPermission("EDIT_INVENTORY");

  // Déterminer le tenantCode à utiliser
  const effectiveTenantCode =
    tenantCode || (!isAdmin ? user?.tenantCode : null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      unitOfMeasure: "",
      volume: "",
      categoryId: null,
    },
  });

  // Vérifier les permissions et le tenantCode
  useEffect(() => {
    if (!canEditInventory) {
      router.push("/inventory/products");
      return;
    }

    // Si pas de tenantCode disponible, rediriger
    if (!effectiveTenantCode) {
      toast.error("Aucun restaurant sélectionné");
      router.push("/inventory/products");
      return;
    }

    // Charger les informations du tenant
    const fetchTenant = async () => {
      try {
        const { default: userService } = await import("@/services/userService");
        const tenantData = await userService.getTenantByCode(
          effectiveTenantCode
        );
        setTenant(tenantData);
      } catch (err) {
        console.error("Error fetching tenant:", err);
      }
    };

    fetchTenant();
  }, [canEditInventory, effectiveTenantCode, router]);

  // Charger les unités de mesure
  useEffect(() => {
    const fetchUnits = async () => {
      setLoadingUnits(true);
      try {
        const unitsData = await inventoryService.getAllUnitOfMeasurement();
        setUnits(unitsData);
        if (unitsData && unitsData.length > 0) {
          setValue("unitOfMeasure", unitsData[0]);
        }
      } catch (err) {
        console.error("Error fetching units:", err);
        toast.error("Erreur lors du chargement des unités de mesure");
      } finally {
        setLoadingUnits(false);
      }
    };
    fetchUnits();
  }, [setValue]);

  // Charger les catégories avec pagination
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await inventoryService.getAllCategories(
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
        console.error("Error fetching categories:", err);
        toast.error("Erreur lors du chargement des catégories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [categoryPage, categorySearch]);

  // Debounce pour la recherche de catégories
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategorySearch(categorySearchInput);
      setCategoryPage(0); // Reset à la première page lors d'une recherche
    }, 500);
    return () => clearTimeout(timer);
  }, [categorySearchInput]);

  const onSubmit = async (data) => {
    if (!selectedCategory) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const productData = {
        name: data.name,
        description: data.description,
        unitOfMeasure: data.unitOfMeasure,
        volume: parseFloat(data.volume),
        category: {
          id: selectedCategory.id,
          name: selectedCategory.name,
        },
        tenantCode: effectiveTenantCode,
      };

      await inventoryService.createProduct(productData);
      toast.success("Produit créé avec succès");

      // Rediriger avec le tenant si c'était spécifié dans l'URL
      if (tenantCode) {
        router.push(`/inventory/products?tenant=${tenantCode}`);
      } else {
        router.push("/inventory/products");
      }
    } catch (err) {
      console.error("Error creating product:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la création du produit"
      );
      toast.error("Erreur lors de la création du produit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
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
            Ajouter un nouveau produit
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
            Ce formulaire ajoute un nouveau type de produit dans l'inventaire
            avec un stock initial de 0. Vous pourrez ensuite ajuster le stock
            depuis la liste des produits.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom du produit */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Tomate, Farine, Sel..."
                    {...register("name", {
                      required: "Le nom est requis",
                      minLength: {
                        value: 2,
                        message: "Le nom doit contenir au moins 2 caractères",
                      },
                      maxLength: {
                        value: 50,
                        message: "Le nom ne peut pas dépasser 50 caractères",
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Unité de mesure */}
                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">Unité de mesure *</Label>
                  {loadingUnits ? (
                    <Skeleton className="h-10 w-full" />
                  ) : units.length > 0 ? (
                    <Controller
                      name="unitOfMeasure"
                      control={control}
                      rules={{ required: "L'unité de mesure est requise" }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une unité" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      Aucune unité disponible
                    </p>
                  )}
                  {errors.unitOfMeasure && (
                    <p className="text-sm text-red-500">
                      {errors.unitOfMeasure.message}
                    </p>
                  )}
                </div>

                {/* Volume */}
                <div className="space-y-2">
                  <Label htmlFor="volume">
                    Volume par unité *
                    <span className="text-xs text-muted-foreground ml-1">
                      (quantité contenue dans une unité)
                    </span>
                  </Label>
                  <Input
                    id="volume"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 0.5, 1.5, 100, 250..."
                    {...register("volume", {
                      required: "Le volume est requis",
                      min: { value: 0, message: "Le volume doit être positif" },
                    })}
                  />
                  {errors.volume && (
                    <p className="text-sm text-red-500">
                      {errors.volume.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez ce produit..."
                  className="resize-none h-20"
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sélection de catégorie */}
          <Card>
            <CardHeader>
              <CardTitle>Catégorie du produit</CardTitle>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-16" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {categorySearch
                    ? `Aucune catégorie trouvée pour "${categorySearch}"`
                    : "Aucune catégorie disponible"}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map((category) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                            selectedCategory?.id === category.id
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:bg-gray-50"
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
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Créée le{" "}
                              {new Date(
                                category.createdAt
                              ).toLocaleDateString()}
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
                                categoryPage >=
                                categoryPagination.totalPages - 1
                              }
                              className={
                                categoryPage >=
                                categoryPagination.totalPages - 1
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
                  router.push(`/inventory/products?tenant=${tenantCode}`);
                } else {
                  router.back();
                }
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedCategory}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                  Création...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Créer le produit
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
        </form>
      </div>
    </DashboardLayout>
  );
}
