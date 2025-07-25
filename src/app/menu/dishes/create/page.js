// src/app/menu/dishes/create/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Minus,
  Info,
  Trash2,
  ArrowLeft,
  Utensils,
  Save,
  Store,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";
import dishService from "@/services/dishService";
import menuService from "@/services/menuService";
import inventoryService from "@/services/inventoryService";
import userService from "@/services/userService";

export default function CreateDishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantCode = searchParams.get("tenant");
  const { user, roles } = useAuth();
  const { hasPermission } = usePermissions();
  const [tenant, setTenant] = useState(null);
  const isAdmin = roles.includes("ROLE_ADMIN");
  const canCreateDish = hasPermission("CREATE_DISH");

  // États pour stocker les données récupérées
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    page: true,
    submitting: false,
    currencies: false,
    categories: false,
    products: false,
  });
  const [error, setError] = useState(null);

  // État pour la pagination des catégories
  const [categoryPage, setCategoryPage] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySearchInput, setCategorySearchInput] = useState("");
  const [categoryPagination, setCategoryPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 6,
  });

  // État pour la pagination des produits
  const [productPagination, setProductPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 100,
  });

  // Déterminer le tenantCode à utiliser
  const effectiveTenantCode =
    tenantCode || (!isAdmin ? user?.tenantCode : null);

  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      price: "",
      tenantCode: effectiveTenantCode || "",
      currencyId: "",
      categories: [],
      dishProducts: [],
    },
  });

  // Configuration du tableau des produits
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dishProducts",
  });

  // Vérifier les permissions et le tenantCode
  useEffect(() => {
    if (!canCreateDish) {
      router.push("/menu/dishes");
      return;
    }

    // Si pas de tenantCode disponible, rediriger
    if (!effectiveTenantCode) {
      toast.error("Aucun restaurant sélectionné");
      router.push("/menu/dishes");
      return;
    }

    // Charger les informations du tenant
    const fetchTenant = async () => {
      try {
        const tenantData = await userService.getTenantByCode(
          effectiveTenantCode
        );
        setTenant(tenantData);
        setValue("tenantCode", effectiveTenantCode);
      } catch (err) {
        console.error("Error fetching tenant:", err);
      }
    };

    fetchTenant();
    setLoading((prev) => ({ ...prev, page: false }));
  }, [canCreateDish, effectiveTenantCode, router, setValue]);

  // Charger les données lorsque le tenant est défini
  useEffect(() => {
    if (effectiveTenantCode) {
      loadData(effectiveTenantCode);
    }
  }, [effectiveTenantCode]);

  // Fonction pour charger toutes les données nécessaires
  const loadData = async (tenantCode) => {
    if (!tenantCode) return;

    // Réinitialiser les erreurs
    setError(null);

    // Charger les devises
    setLoading((prev) => ({ ...prev, currencies: true }));
    try {
      const currenciesData = await dishService.getAllCurrencies();
      setCurrencies(currenciesData);

      // Définir la première devise comme valeur par défaut si elle existe
      if (currenciesData.length > 0) {
        setValue("currencyId", currenciesData[0].id.toString());
      }
    } catch (err) {
      console.error("Error loading currencies:", err);
      setError("Erreur lors du chargement des devises");
      toast.error("Impossible de charger les devises");
    } finally {
      setLoading((prev) => ({ ...prev, currencies: false }));
    }

    // Charger les catégories avec pagination
    await loadCategories(tenantCode);

    // Charger les produits d'inventaire avec pagination
    await loadProducts(tenantCode);
  };

  // Fonction pour charger les catégories avec pagination
  const loadCategories = async (tenantCode, page = 0, search = "") => {
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const categoriesData = await menuService.getAllCategories(
        tenantCode,
        page,
        categoryPagination.pageSize,
        search
      );
      setCategories(categoriesData.content || []);
      setCategoryPagination({
        currentPage: categoriesData.number || 0,
        totalPages: categoriesData.totalPages || 0,
        totalElements: categoriesData.totalElements || 0,
        pageSize: categoriesData.size || categoryPagination.pageSize,
      });
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Erreur lors du chargement des catégories");
      toast.error("Impossible de charger les catégories du menu");
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  // Debounce pour la recherche de catégories
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategorySearch(categorySearchInput);
      setCategoryPage(0); // Reset à la première page lors d'une recherche
    }, 500);
    return () => clearTimeout(timer);
  }, [categorySearchInput]);

  // Charger les catégories quand la page ou la recherche change
  useEffect(() => {
    if (effectiveTenantCode) {
      loadCategories(effectiveTenantCode, categoryPage, categorySearch);
    }
  }, [effectiveTenantCode, categoryPage, categorySearch]);

  // Fonction pour charger les produits avec pagination
  const loadProducts = async (tenantCode, page = 0, size = 100) => {
    setLoading((prev) => ({ ...prev, products: true }));
    try {
      const productsData = await inventoryService.getAllProducts(
        tenantCode,
        page,
        size
      );

      setProducts(productsData.content || []);
      setProductPagination({
        currentPage: productsData.number || 0,
        totalPages: productsData.totalPages || 0,
        totalElements: productsData.totalElements || 0,
        pageSize: productsData.size || size,
      });

      if (productsData.totalPages > 1 && productsData.number === 0) {
        toast.info(
          `${productsData.totalElements} produits trouvés. Les 100 premiers sont affichés.`
        );
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Erreur lors du chargement des produits");
      toast.error("Impossible de charger les produits d'inventaire");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  // Fonction pour gérer le changement de page des produits
  const handleProductPageChange = (page) => {
    if (effectiveTenantCode) {
      loadProducts(effectiveTenantCode, page, productPagination.pageSize);
    }
  };

  // Fonction pour ajouter un produit au plat
  const handleAddProduct = () => {
    append({
      productId: "",
      quantity: 1,
      removable: false,
    });
  };

  // Gérer la soumission du formulaire
  const onSubmit = async (data) => {
    setLoading((prev) => ({ ...prev, submitting: true }));
    setError(null);

    try {
      // S'assurer que les valeurs numériques sont correctement typées
      const formattedData = {
        ...data,
        price: parseFloat(data.price),
        currencyId: parseInt(data.currencyId, 10),
        tenantCode: effectiveTenantCode,
        dishProducts: data.dishProducts.map((product) => ({
          ...product,
          productId: parseInt(product.productId, 10),
          quantity: parseFloat(product.quantity),
        })),
      };

      // Créer le plat via l'API
      await dishService.createDish(formattedData);

      // Afficher un message de succès
      toast.success(`Le plat "${data.name}" a été ajouté au menu`);

      // Rediriger vers la liste des plats avec le tenant si spécifié
      if (tenantCode) {
        router.push(`/menu/dishes?tenant=${tenantCode}`);
      } else {
        router.push("/menu/dishes");
      }
    } catch (err) {
      console.error("Error creating dish:", err);
      const errorMessage =
        err.response?.data?.message || "Erreur lors de la création du plat";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Vérifie si l'utilisateur a la permission de créer un plat
  if (!canCreateDish) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="bg-amber-50 text-amber-800 p-6 rounded-lg border border-amber-200 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Accès non autorisé</h2>
            <p className="mb-4">
              Vous n'avez pas les permissions requises pour créer un plat.
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => router.push("/menu/dishes")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste des plats
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {loading.page ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* En-tête avec titre et boutons d'action */}
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
              className="text-2xl font-bold tracking-tight flex items-center"
            >
              <Utensils className="h-6 w-6 mr-2" />
              Créer un nouveau plat
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

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Définissez les informations de base du plat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nom et Prix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom du plat */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du plat *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Burger Classic"
                      {...register("name", {
                        required: "Le nom du plat est requis",
                        minLength: {
                          value: 2,
                          message: "Le nom doit contenir au moins 2 caractères",
                        },
                      })}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Prix */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 9.99"
                        {...register("price", {
                          required: "Le prix est requis",
                          min: {
                            value: 0,
                            message: "Le prix doit être positif",
                          },
                          valueAsNumber: true,
                        })}
                      />
                      <Controller
                        name="currencyId"
                        control={control}
                        rules={{ required: "La devise est requise" }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value?.toString()}
                            disabled={loading.currencies}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Devise" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem
                                  key={currency.id}
                                  value={currency.id.toString()}
                                >
                                  {currency.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-red-500">
                        {errors.price.message}
                      </p>
                    )}
                    {errors.currencyId && (
                      <p className="text-sm text-red-500">
                        {errors.currencyId.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Catégories avec recherche et pagination */}
            <Card>
              <CardHeader>
                <CardTitle>Catégories *</CardTitle>
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
                {loading.categories ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-12" />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {categorySearch
                      ? `Aucune catégorie trouvée pour "${categorySearch}"`
                      : "Aucune catégorie disponible. Veuillez en créer d'abord."}
                  </div>
                ) : (
                  <>
                    <Controller
                      name="categories"
                      control={control}
                      defaultValue={[]}
                      rules={{
                        validate: (value) =>
                          (value && value.length > 0) ||
                          "Sélectionnez au moins une catégorie",
                      }}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {categories.map((category) => (
                            <motion.div
                              key={category.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`relative flex items-center space-x-2 rounded-lg border p-3 transition-colors ${
                                field.value.includes(category.name)
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <Checkbox
                                id={`category-${category.id}`}
                                checked={field.value.includes(category.name)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...field.value, category.name]
                                    : field.value.filter(
                                        (v) => v !== category.name
                                      );
                                  field.onChange(updatedValue);
                                }}
                              />
                              <label
                                htmlFor={`category-${category.id}`}
                                className="flex-1 cursor-pointer text-sm font-medium"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const checkbox = document.getElementById(
                                    `category-${category.id}`
                                  );
                                  checkbox?.click();
                                }}
                              >
                                {category.name}
                              </label>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    />

                    {/* Pagination des catégories */}
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

                            {Array.from({
                              length: categoryPagination.totalPages,
                            })
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
                                      onClick={() =>
                                        setCategoryPage(pageNumber)
                                      }
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
                {errors.categories && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.categories.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Ingrédients du plat */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Composition du plat</CardTitle>
                  <CardDescription>
                    Ajoutez les ingrédients qui composent ce plat
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={loading.products || products.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter un ingrédient
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading.products ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin inline-block h-8 w-8 border-2 border-primary rounded-full border-t-transparent mb-4"></div>
                    <p className="text-gray-500">
                      Chargement des produits d'inventaire...
                    </p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                    <h3 className="text-lg font-medium text-amber-800 mb-2">
                      Aucun produit disponible
                    </h3>
                    <p className="text-amber-700">
                      Veuillez ajouter des produits dans l'inventaire avant de
                      créer un plat.
                    </p>
                  </div>
                ) : fields.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <div className="mb-2">
                      <Info className="h-12 w-12 text-muted-foreground inline-block" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Aucun ingrédient ajouté
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Cliquez sur "Ajouter un ingrédient" pour composer votre
                      plat
                    </p>
                    <Button type="button" onClick={handleAddProduct}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter un ingrédient
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="border border-gray-200">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-md">
                              Ingrédient #{index + 1}
                            </CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Produit */}
                            <div className="space-y-2">
                              <Label
                                htmlFor={`dishProducts.${index}.productId`}
                              >
                                Produit *
                              </Label>
                              <Controller
                                name={`dishProducts.${index}.productId`}
                                control={control}
                                rules={{ required: "Le produit est requis" }}
                                render={({ field }) => (
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value?.toString()}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner un produit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {products.map((product) => (
                                        <SelectItem
                                          key={product.id}
                                          value={product.id.toString()}
                                        >
                                          {product.name} (
                                          {product.unitOfMeasure})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {errors.dishProducts?.[index]?.productId && (
                                <p className="text-sm text-red-500">
                                  {errors.dishProducts[index].productId.message}
                                </p>
                              )}
                            </div>

                            {/* Quantité */}
                            <div className="space-y-2">
                              <Label htmlFor={`dishProducts.${index}.quantity`}>
                                Quantité *
                              </Label>
                              <Input
                                id={`dishProducts.${index}.quantity`}
                                type="number"
                                step="0.01"
                                placeholder="Ex: 100"
                                {...register(`dishProducts.${index}.quantity`, {
                                  required: "La quantité est requise",
                                  min: {
                                    value: 0.01,
                                    message: "La quantité doit être positive",
                                  },
                                  valueAsNumber: true,
                                })}
                              />
                              {errors.dishProducts?.[index]?.quantity && (
                                <p className="text-sm text-red-500">
                                  {errors.dishProducts[index].quantity.message}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Option - Amovible */}
                          <div className="flex items-center space-x-2 pt-2">
                            <Controller
                              name={`dishProducts.${index}.removable`}
                              control={control}
                              render={({ field }) => (
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  id={`dishProducts.${index}.removable`}
                                />
                              )}
                            />
                            <Label
                              htmlFor={`dishProducts.${index}.removable`}
                              className="text-sm cursor-pointer flex items-center"
                            >
                              Ingrédient optionnel
                              <Info
                                className="h-4 w-4 text-gray-400 ml-1 cursor-help"
                                title="Un ingrédient optionnel peut être retiré lors de la commande (ex: sauce, fromage)"
                              />
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {errors.dishProducts && (
                  <p className="text-sm text-red-500">
                    Vous devez ajouter au moins un ingrédient
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                {productPagination.totalPages > 1 && (
                  <div className="text-sm text-muted-foreground">
                    Page {productPagination.currentPage + 1} sur{" "}
                    {productPagination.totalPages} (
                    {productPagination.totalElements} produits au total)
                    {productPagination.currentPage <
                      productPagination.totalPages - 1 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          handleProductPageChange(
                            productPagination.currentPage + 1
                          )
                        }
                        className="ml-2"
                      >
                        Voir plus de produits
                      </Button>
                    )}
                  </div>
                )}
                {fields.length > 0 && (
                  <Button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={loading.products}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter un autre
                    ingrédient
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Affichage des erreurs */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-md bg-red-50 text-red-600 border border-red-200"
              >
                <div className="flex items-start">
                  <Info className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
                  <div>
                    <h3 className="font-medium">
                      Erreur lors de la création du plat
                    </h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (tenantCode) {
                    router.push(`/menu/dishes?tenant=${tenantCode}`);
                  } else {
                    router.push("/menu/dishes");
                  }
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  loading.submitting || !isDirty || !effectiveTenantCode
                }
              >
                {loading.submitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer le plat
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
