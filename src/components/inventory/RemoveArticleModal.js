// src/components/inventory/RemoveArticleModal.js
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

export default function RemoveArticleModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const maxQuantity = product?.article?.quantity || 0;

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
      // Vérifier que la quantité à retirer n'excède pas le stock
      if (parseFloat(data.quantity) > maxQuantity) {
        throw new Error(
          `La quantité à retirer ne peut pas dépasser le stock disponible (${maxQuantity} ${product.unitOfMeasure})`
        );
      }

      // Préparer les données pour l'API
      const articleList = [
        {
          productId: product.id,
          quantity: parseFloat(data.quantity),
        },
      ];

      // Retirer l'article via l'API
      await inventoryService.removeArticle(articleList);

      // Réinitialiser le formulaire
      reset();

      // Fermer le modal et signaler le succès
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error removing article:", err);
      setError(err.message || "Erreur lors du retrait de l'inventaire");
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
          <DialogTitle>Retirer du stock</DialogTitle>
          <DialogDescription>
            Retirez un volume de {product?.name || "produit"} de l'inventaire.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">
                Quantité à retirer ({product?.unitOfMeasure || "unité"})
                <span className="text-sm text-gray-500 ml-2">
                  (Max: {maxQuantity} {product?.unitOfMeasure})
                </span>
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Entrez la quantité..."
                step="any"
                {...register("quantity", {
                  required: "La quantité est requise",
                  min: {
                    value: 0.01,
                    message: "La quantité doit être positive",
                  },
                  max: {
                    value: maxQuantity,
                    message: `La quantité ne peut pas dépasser ${maxQuantity}`,
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
            <Button
              type="submit"
              disabled={isSubmitting || maxQuantity <= 0}
              variant="destructive"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Retrait en cours...
                </div>
              ) : (
                "Retirer du stock"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
