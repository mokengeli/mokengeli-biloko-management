// src/components/inventory/AddArticleVolumeModal.js
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

export default function AddArticleVolumeModal({
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
      quantity: 1,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Préparer les données pour l'API
      const articleData = {
        productId: product.id,
        quantity: parseFloat(data.quantity),
      };

      // Ajouter l'article via l'API
      await inventoryService.addArticle(articleData);

      // Réinitialiser le formulaire
      reset();

      // Fermer le modal et signaler le succès
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error adding article volume:", err);
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
          <DialogDescription>
            Ajoutez un volume de {product?.name || "produit"} à l'inventaire.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">
                Quantité à ajouter ({product?.unitOfMeasure})
              </Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                placeholder="Entrez la quantité..."
                {...register("quantity", {
                  required: "La quantité est requise",
                  min: {
                    value: 0.01,
                    message: "La quantité doit être positive",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">
                  {errors.quantity.message}
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
                "Ajouter le volume"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
