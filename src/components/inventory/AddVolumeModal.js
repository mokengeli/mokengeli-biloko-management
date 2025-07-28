// src/components/inventory/AddArticleUnitsModal.js
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
import inventoryService from "@/services/inventoryService";

export default function AddVolumeModal({
  isOpen,
  onClose,
  product,
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
      numberOfUnits: 1,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Préparer les données pour l'API
      const productRequest = {
        productId: product.id,
        numberOfUnits: parseInt(data.numberOfUnits),
      };

      // Ajouter l'article via l'API
      await inventoryService.addArticleByProduct(productRequest);

      // Réinitialiser le formulaire
      reset();

      // Fermer le modal et signaler le succès
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error adding article units:", err);
      setError(
        err.response?.data?.message || "Erreur lors de l'ajout à l'inventaire"
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
          <DialogTitle>Ajouter au stock (Volume)</DialogTitle>
          <DialogDescription>Ajoutez un volume au stcok</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="numberOfUnits">
                Volume a ajouter (
                {product?.volume !== undefined && product?.volume !== null
                  ? `${product.volume} ${product.unitOfMeasure}`
                  : "Non spécifié"}
                ) par unité
              </Label>
              <Input
                id="numberOfUnits"
                type="number"
                placeholder="Entrez le nombre d'unités..."
                {...register("numberOfUnits", {
                  required: "Le nombre d'unités est requis",
                  min: {
                    value: 1,
                    message: "Le nombre d'unités doit être positif",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.numberOfUnits && (
                <p className="text-sm text-red-500">
                  {errors.numberOfUnits.message}
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
                  Ajout en cours...
                </div>
              ) : (
                "Ajouter les unités"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
