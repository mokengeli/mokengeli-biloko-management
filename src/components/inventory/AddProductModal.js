// src/components/inventory/AddProductModal.js (version corrigée)
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import inventoryService from "@/services/inventoryService";

export default function AddProductModal({
  isOpen,
  onClose,
  tenantCode,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      unitOfMeasure: "",
      volume: "",
      categories: "",
      tenantCode: tenantCode || "",
    },
  });

  // Charger les données nécessaires
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      // Charger les catégories
      setLoadingCategories(true);
      try {
        // Récupérer les catégories (maintenant avec pagination)
        const categoriesResponse = await inventoryService.getAllCategories();
        // Extraire seulement le tableau content du résultat paginé
        const categoriesData = categoriesResponse.content || [];
        setCategories(categoriesData);

        // Définir une catégorie par défaut si disponible
        if (categoriesData && categoriesData.length > 0) {
          reset({
            ...control._formValues,
            categories: categoriesData[0].name,
          });
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Erreur lors du chargement des catégories");
      } finally {
        setLoadingCategories(false);
      }

      // Charger les unités de mesure
      setLoadingUnits(true);
      try {
        const unitsData = await inventoryService.getAllUnitOfMeasurement();
        setUnits(unitsData);

        // Si des unités sont disponibles, définir la première comme valeur par défaut
        if (unitsData && unitsData.length > 0) {
          reset({
            ...control._formValues,
            unitOfMeasure: unitsData[0],
          });
        }
      } catch (err) {
        console.error("Error fetching units of measurement:", err);
        setError("Erreur lors du chargement des unités de mesure");
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchData();
  }, [isOpen, control, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Vérifier que categories est bien un tableau avant d'utiliser find
      console.log("Categories:", categories);

      // Trouver l'objet catégorie complet à partir de son nom
      const selectedCategory = Array.isArray(categories)
        ? categories.find((cat) => cat.name === data.categories)
        : null;

      // Préparer les données pour l'API avec le format correct
      const productData = {
        name: data.name,
        description: data.description,
        unitOfMeasure: data.unitOfMeasure,
        volume: parseFloat(data.volume),
        category: selectedCategory
          ? {
              id: selectedCategory.id,
              name: selectedCategory.name,
            }
          : null,
        tenantCode: tenantCode,
      };

      console.log("Sending product data:", productData);

      // Créer le produit via l'API
      await inventoryService.createProduct(productData);

      // Réinitialiser le formulaire
      reset();

      // Fermer le modal et signaler le succès
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error creating product:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la création du produit"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        reset();
        setError(null);
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
          <DialogDescription>
            Créez un nouveau produit pour votre inventaire.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
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
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Catégorie */}
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                {categories.length > 0 && (
                  <Controller
                    name="categories"
                    control={control}
                    render={({
                      field: { onChange, onBlur, name, ref, value },
                    }) => (
                      <Select
                        onValueChange={onChange}
                        onOpenChange={onBlur}
                        name={name}
                        ref={ref}
                        value={value || categories[0]?.name}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {loadingCategories && (
                  <p className="text-sm text-gray-500">
                    Chargement des catégories...
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unité de mesure */}
              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure">Unité de mesure *</Label>
                {units.length > 0 && (
                  <Controller
                    name="unitOfMeasure"
                    control={control}
                    rules={{ required: "L'unité de mesure est requise" }}
                    render={({
                      field: { onChange, onBlur, name, ref, value },
                    }) => (
                      <Select
                        onValueChange={onChange}
                        onOpenChange={onBlur}
                        name={name}
                        ref={ref}
                        value={value || units[0]}
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
                )}
                {loadingUnits && (
                  <p className="text-sm text-gray-500">
                    Chargement des unités...
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
                <Label htmlFor="volume">Volume *</Label>
                <Input
                  id="volume"
                  type="number"
                  placeholder="Ex: 100, 250, 1000..."
                  {...register("volume", {
                    required: "Le volume est requis",
                    min: { value: 0, message: "Le volume doit être positif" },
                    valueAsNumber: true,
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
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loadingCategories || loadingUnits}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Création...
                </div>
              ) : (
                "Créer le produit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
