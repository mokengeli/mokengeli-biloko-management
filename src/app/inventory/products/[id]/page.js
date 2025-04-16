// src/app/inventory/products/[id]/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, Calendar, Info } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import useProductDetail from "@/hooks/useProductDetail";
import usePermissions from "@/hooks/usePermissions";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const { product, tenant, loading, error } = useProductDetail(productId);
  const { hasPermission } = usePermissions();
  const canViewInventory = hasPermission("VIEW_INVENTORY");

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
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-20 w-full" />
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
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  {product?.name}
                </CardTitle>
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
                      Volume
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
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
