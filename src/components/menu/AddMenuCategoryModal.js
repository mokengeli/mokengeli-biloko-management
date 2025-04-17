// src/components/menu/AddMenuCategoryModal.js
"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import menuService from "@/services/menuService";

export default function AddMenuCategoryModal({
  isOpen,
  onClose,
  tenantCode,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Préparer les données pour l'API
      const categoryData = {
        name: data.name,
        tenantCode: tenantCode,
      };

      // Créer la catégorie via l'API
      await menuService.createCategory(categoryData);

      // Réinitialiser le formulaire
      reset();

      // Fermer le modal et signaler le succès
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error creating menu category:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création de la catégorie"
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une catégorie de menu</DialogTitle>
          <DialogDescription>
            Créez une nouvelle catégorie pour organiser les plats du menu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input
                id="name"
                placeholder="Ex: Entrées, Plats principaux, Desserts..."
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Création...
                </div>
              ) : (
                "Créer la catégorie"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
