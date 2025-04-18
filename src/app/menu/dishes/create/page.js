// src/app/menu/dishes/create/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Plus,
  Minus,
  Info,
  Trash2,
  ArrowLeft,
  Utensils,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/components/layout/DashboardLayout";
import RestaurantSelector from "@/components/inventory/RestaurantSelector";
import { useAuth } from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";
import dishService from "@/services/dishService";
import menuService from "@/services/menuService";
import inventoryService from "@/services/inventoryService";

export default function CreateDishPage() {
  const router = useRouter();
  const { user, roles } = useAuth();
  const { hasPermission } = usePermissions();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
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
      tenantCode: "",
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

  // Définir le restaurant par défaut lors du chargement initial
  useEffect(() => {
    if (!isAdmin && user?.tenantCode) {
      setSelectedRestaurant(user.tenantCode);
      setValue("tenantCode", user.tenantCode);
    }
    setLoading((prev) => ({ ...prev, page: false }));
  }, [isAdmin, user, setValue]);

  // Fonction pour gérer le changement de restaurant
  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    setValue("tenantCode", value);

    // Réinitialiser le formulaire sauf le tenantCode
    reset({
      name: "",
      price: "",
      tenantCode: value,
      currencyId: currencies.length > 0 ? currencies[0].id.toString() : "",
      categories: [],
      dishProducts: [],
    });

    // Charger les données pour ce restaurant
    if (value) {
      loadData(value);
    }
  };

  // Charger les données lorsque le restaurant change
  useEffect(() => {
    if (selectedRestaurant) {
      loadData(selectedRestaurant);
    }
  }, [selectedRestaurant]);

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

    // Charger les catégories de menu
    try {
      // Mise à jour pour gérer la pagination - demander 100 éléments maximum
      const categoriesData = await menuService.getAllCategories(
        tenantCode,
        0,
        100
      );
      // Extraction des catégories du contenu de la pagination
      setCategories(categoriesData.content || []);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Erreur lors du chargement des catégories");
      toast.error("Impossible de charger les catégories du menu");
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }

    // Charger les produits d'inventaire
    setLoading((prev) => ({ ...prev, products: true }));
    try {
      const productsData = await inventoryService.getAllProducts(tenantCode);
      setProducts(productsData);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Erreur lors du chargement des produits");
      toast.error("Impossible de charger les produits d'inventaire");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
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

      // Rediriger vers la liste des plats
      router.push("/menu/dishes");
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
        <div className="space-y-6">
          {/* En-tête avec titre et boutons d'action */}
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/menu/dishes")}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold tracking-tight flex items-center">
                <Utensils className="h-6 w-6 mr-2" />
                Créer un nouveau plat
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {isAdmin && (
                <RestaurantSelector
                  value={selectedRestaurant}
                  onChange={handleRestaurantChange}
                />
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/menu/dishes")}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={
                    loading.submitting || !isDirty || !selectedRestaurant
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
            </div>
          </div>

          {!selectedRestaurant ? (
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h2 className="text-xl font-medium text-amber-800 mb-2">
                Restaurant requis
              </h2>
              <p className="text-amber-700">
                {isAdmin
                  ? "Veuillez sélectionner un restaurant pour créer un plat."
                  : "Erreur lors de la récupération du restaurant. Veuillez réessayer."}
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Informations de base du plat */}
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
                            message:
                              "Le nom doit contenir au moins 2 caractères",
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

                  {/* Catégories */}
                  <div className="space-y-2">
                    <Label>Catégories *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-4 rounded-md">
                      {loading.categories ? (
                        <p className="text-sm text-gray-500">
                          Chargement des catégories...
                        </p>
                      ) : categories.length === 0 ? (
                        <p className="text-sm text-amber-500">
                          Aucune catégorie disponible. Veuillez en créer
                          d'abord.
                        </p>
                      ) : (
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
                            <>
                              {categories.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`category-${category.id}`}
                                    checked={field.value.includes(
                                      category.name
                                    )}
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
                                    className="text-sm cursor-pointer"
                                    onClick={() => {
                                      const isChecked = field.value.includes(
                                        category.name
                                      );
                                      const updatedValue = isChecked
                                        ? field.value.filter(
                                            (v) => v !== category.name
                                          )
                                        : [...field.value, category.name];
                                      field.onChange(updatedValue);
                                    }}
                                  >
                                    {category.name}
                                  </label>
                                </div>
                              ))}
                            </>
                          )}
                        />
                      )}
                    </div>
                    {errors.categories && (
                      <p className="text-sm text-red-500">
                        {errors.categories.message}
                      </p>
                    )}
                  </div>
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
                                    {
                                      errors.dishProducts[index].productId
                                        .message
                                    }
                                  </p>
                                )}
                              </div>

                              {/* Quantité */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`dishProducts.${index}.quantity`}
                                >
                                  Quantité *
                                </Label>
                                <Input
                                  id={`dishProducts.${index}.quantity`}
                                  type="number"
                                  step="0.01"
                                  placeholder="Ex: 100"
                                  {...register(
                                    `dishProducts.${index}.quantity`,
                                    {
                                      required: "La quantité est requise",
                                      min: {
                                        value: 0.01,
                                        message:
                                          "La quantité doit être positive",
                                      },
                                      valueAsNumber: true,
                                    }
                                  )}
                                />
                                {errors.dishProducts?.[index]?.quantity && (
                                  <p className="text-sm text-red-500">
                                    {
                                      errors.dishProducts[index].quantity
                                        .message
                                    }
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
                <CardFooter className="flex justify-end pt-0">
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
                  onClick={() => router.push("/menu/dishes")}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading.submitting || !isDirty || !selectedRestaurant
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
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
