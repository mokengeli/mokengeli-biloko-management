// src/components/menu/AddDishModal.js
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus, Info, Trash2 } from "lucide-react";

import dishService from "@/services/dishService";
import menuService from "@/services/menuService";
import inventoryService from "@/services/inventoryService";

export default function AddDishModal({
  isOpen,
  onClose,
  tenantCode,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // États pour stocker les données récupérées
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    currencies: false,
    categories: false,
    products: false,
  });

  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      price: "",
      tenantCode: tenantCode,
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

  // Chargement des données lors de l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, tenantCode]);

  // Fonction pour charger toutes les données nécessaires
  const loadData = async () => {
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
        setValue("currencyId", currenciesData[0].id);
      }
    } catch (err) {
      console.error("Error loading currencies:", err);
      setError("Erreur lors du chargement des devises");
    } finally {
      setLoading((prev) => ({ ...prev, currencies: false }));
    }

    // Charger les catégories de menu
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const categoriesData = await menuService.getAllCategories(tenantCode);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Erreur lors du chargement des catégories");
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
    setIsSubmitting(true);
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

      // Réinitialiser le formulaire
      reset();

      // Fermer le modal et signaler le succès
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error creating dish:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la création du plat"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la fermeture du modal
  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau plat</DialogTitle>
          <DialogDescription>
            Définissez les détails du plat et sa composition
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-4">
            {/* Informations de base du plat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-sm text-red-500">{errors.name.message}</p>
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
                  <p className="text-sm text-red-500">{errors.price.message}</p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {loading.categories ? (
                  <p className="text-sm text-gray-500">
                    Chargement des catégories...
                  </p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-amber-500">
                    Aucune catégorie disponible. Veuillez en créer d'abord.
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
            {/* Ingrédients du plat */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Composition du plat *</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddProduct}
                  disabled={loading.products || products.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter un ingrédient
                </Button>
              </div>

              {loading.products ? (
                <p className="text-sm text-gray-500">
                  Chargement des produits...
                </p>
              ) : products.length === 0 ? (
                <p className="text-sm text-amber-500">
                  Aucun produit disponible. Veuillez ajouter des produits dans
                  l'inventaire d'abord.
                </p>
              ) : fields.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucun ingrédient ajouté. Cliquez sur "Ajouter un ingrédient"
                  pour commencer.
                </p>
              ) : (
                fields.map((field, index) => (
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
                          <Label htmlFor={`dishProducts.${index}.productId`}>
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
                                      {product.name} ({product.unitOfMeasure})
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
                          className="text-sm cursor-pointer"
                        >
                          Ingrédient optionnel
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">
                                Un ingrédient optionnel peut être retiré lors de
                                la commande (ex: sauce, fromage).
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              {errors.dishProducts && (
                <p className="text-sm text-red-500">
                  Vous devez ajouter au moins un ingrédient
                </p>
              )}
            </div>

            {/* Affichage des erreurs */}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Création en cours...
                </div>
              ) : (
                "Créer le plat"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
