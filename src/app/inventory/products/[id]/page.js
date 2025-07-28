// src/app/inventory/products/[id]/page.js - Mise à jour pour inclure les informations de stock
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building,
  Calendar,
  Info,
  PackagePlus,
  PackageMinus,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import useProductDetail from "@/hooks/useProductDetail";
import usePermissions from "@/hooks/usePermissions";
import RemoveArticleModal from "@/components/inventory/RemoveArticleModal";

import AddArticleModal from "@/components/inventory/AddArticleModal";
import AddVolumeModal from "@/components/inventory/AddVolumeModal";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const { product, tenant, loading, error, refreshProduct } =
    useProductDetail(productId);
  const { hasPermission } = usePermissions();
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  // Vérifier si l'utilisateur a les permissions nécessaires
  const canViewInventory = hasPermission("VIEW_INVENTORY");
  const canEditInventory = hasPermission("EDIT_INVENTORY");

  const [isAddArticleModalOpen, setIsAddArticleModalOpen] = useState(false);
  const [isAddVolumeModalOpen, setIsAddVolumeModalOpen] = useState(false);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Stock disponible
  const stockQuantity = product?.article?.quantity || 0;
  const stockStatus =
    stockQuantity <= 0
      ? "out-of-stock"
      : stockQuantity < 10
      ? "low-stock"
      : "in-stock";

  // Si l'utilisateur n'a pas la permission de voir l'inventaire, rediriger
  if (!canViewInventory) {
    router.push("/dashboard");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
            Détails du produit
          </motion.h1>
        </div>

        {error ? (
          <div className="p-8 text-center bg-red-50 rounded-md border border-red-200">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Retour
            </Button>
          </div>
        ) : loading ? (
          // Squelette de chargement
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Contenu réel
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    {product?.name}
                  </CardTitle>
                </div>
                {/* Badge de stock */}
                <Badge
                  className={`
                    ${
                      stockStatus === "out-of-stock"
                        ? "bg-red-100 text-red-800"
                        : ""
                    }
                    ${
                      stockStatus === "low-stock"
                        ? "bg-amber-100 text-amber-800"
                        : ""
                    }
                    ${
                      stockStatus === "in-stock"
                        ? "bg-green-100 text-green-800"
                        : ""
                    }
                  `}
                >
                  {stockStatus === "out-of-stock" && "Rupture de stock"}
                  {stockStatus === "low-stock" && "Stock bas"}
                  {stockStatus === "in-stock" && "En stock"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Restaurant */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Restaurant
                    </div>
                    <div className="font-medium">
                      {tenant
                        ? tenant.name
                        : product?.tenantCode || "Non spécifié"}
                    </div>
                  </div>

                  {/* Catégorie */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Catégorie
                    </div>
                    <div className="font-medium">
                      {product?.category?.name || "Non catégorisé"}
                    </div>
                  </div>

                  {/* Stock actuel - NOUVEAU */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Stock actuel
                    </div>
                    <div className="font-medium flex items-center">
                      {stockQuantity} {product?.unitOfMeasure || "unités"}
                      {stockStatus === "out-of-stock" && (
                        <span className="ml-2 text-red-500 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Rupture
                        </span>
                      )}
                      {stockStatus === "low-stock" && (
                        <span className="ml-2 text-amber-500 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Faible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unité de mesure */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Unité de mesure
                    </div>
                    <div className="font-medium">
                      {product?.unitOfMeasure || "Non spécifié"}
                    </div>
                  </div>

                  {/* Volume */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Volume par unité
                    </div>
                    <div className="font-medium">
                      {product?.volume !== undefined && product?.volume !== null
                        ? `${product.volume} ${product.unitOfMeasure}`
                        : "Non spécifié"}
                    </div>
                  </div>

                  {/* Code */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Code
                    </div>
                    <div className="font-medium">
                      {product?.code || "Non spécifié"}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Dates
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Créé le:
                      </div>
                      <div className="text-sm">
                        {formatDate(product?.createdAt)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Modifié le:
                      </div>
                      <div className="text-sm">
                        {formatDate(product?.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {product?.description && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="text-sm font-medium text-muted-foreground flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Description
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {product.description}
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Boutons pour gérer le stock - NOUVEAU */}
              {canEditInventory && (
                <CardFooter className="flex flex-wrap gap-3 pt-6 border-t justify-start">
                  <Button
                    onClick={() => setIsAddArticleModalOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Ajouter article
                  </Button>

                  <Button
                    onClick={() => setIsRemoveModalOpen(true)}
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={stockQuantity <= 0}
                  >
                    <PackageMinus className="mr-2 h-4 w-4" />
                    Retirer article
                  </Button>

                  <Button
                    onClick={() => setIsAddVolumeModalOpen(true)}
                    className="w-full sm:w-auto"
                    variant="secondary"
                  >
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Ajouter produit
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        )}

        {/* Modaux pour gérer le stock */}
        {product && (
          <>
            <AddArticleModal
              isOpen={isAddArticleModalOpen}
              onClose={() => setIsAddArticleModalOpen(false)}
              product={product}
              onSuccess={() => refreshProduct(productId)}
            />

            <AddVolumeModal
              isOpen={isAddVolumeModalOpen}
              onClose={() => setIsAddVolumeModalOpen(false)}
              product={product}
              onSuccess={() => refreshProduct(productId)}
            />

            <RemoveArticleModal
              isOpen={isRemoveModalOpen}
              onClose={() => setIsRemoveModalOpen(false)}
              product={product}
              onSuccess={() => refreshProduct(productId)}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
