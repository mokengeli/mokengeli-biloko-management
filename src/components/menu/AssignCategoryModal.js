// src/components/menu/AssignCategoryModal.js
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import menuService from "@/services/menuService";

export default function AssignCategoryModal({
  isOpen,
  onClose,
  tenantCode,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const { handleSubmit, reset } = useForm();

  // Charger toutes les catégories disponibles
  useEffect(() => {
    const fetchAllCategories = async () => {
      if (!isOpen) return;

      setLoadingCategories(true);
      try {
        // Mise à jour pour gérer la pagination - demander 100 éléments maximum
        const data = await menuService.getAllAvailableCategories(0, 100);

        // Mise à jour: extraire les catégories du champ 'content' de la réponse paginée
        const categoryList = data.content || [];

        // Transformer les données pour le format attendu par Combobox
        const formattedCategories = categoryList.map((category) => ({
          label: category.name,
          value: category.id.toString(),
        }));
        setCategories(formattedCategories);
      } catch (err) {
        console.error("Error fetching available categories:", err);
        setError("Erreur lors du chargement des catégories disponibles");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchAllCategories();
  }, [isOpen]);

  const onSubmit = async () => {
    if (!selectedCategory) {
      setError("Veuillez sélectionner une catégorie");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Assigner la catégorie au restaurant
      await menuService.assignCategoryToRestaurant(
        parseInt(selectedCategory),
        tenantCode
      );

      // Réinitialiser le formulaire
      reset();
      setSelectedCategory("");

      // Fermer le modal et signaler le succès
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error assigning category:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'assignation de la catégorie"
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
        setSelectedCategory("");
        setError(null);
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assigner une catégorie existante</DialogTitle>
          <DialogDescription>
            Associez une catégorie existante à ce restaurant.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <Combobox
                options={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Sélectionner une catégorie"
                emptyText="Aucune catégorie trouvée."
                searchPlaceholder="Rechercher une catégorie..."
                disabled={loadingCategories}
                className="w-full"
              />
              {loadingCategories && (
                <p className="text-sm text-gray-500">
                  Chargement des catégories...
                </p>
              )}
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
                setSelectedCategory("");
                onClose();
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedCategory}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Assignation...
                </div>
              ) : (
                "Assigner la catégorie"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
