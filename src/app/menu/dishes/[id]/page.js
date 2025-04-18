"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Utensils,
  Receipt,
  TagIcon,
  DollarSign,
  Package,
  Check,
  X,
  Calendar,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NotImplementedModal from "@/components/common/NotImplementedModal";
import { useToast } from "@/components/ui/use-toast";
import dishService from "@/services/dishService";
import userService from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";

export default function DishDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dishId = params?.id;
  const { toast } = useToast();
  const { user, roles } = useAuth();
  const { hasPermission } = usePermissions();

  const [dish, setDish] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertAction, setAlertAction] = useState("");

  const isAdmin = roles.includes("ROLE_ADMIN");
  const canEditDish = hasPermission("CREATE_DISH"); // Même permission que pour créer un plat

  // Charger les détails du plat
  useEffect(() => {
    const fetchDishDetails = async () => {
      if (!dishId) return;

      setLoading(true);
      setError(null);

      try {
        // Récupérer les détails du plat
        const dishData = await dishService.getDishById(dishId);
        setDish(dishData);

        // Si le plat a un code de tenant, récupérer les infos du restaurant
        if (dishData.tenantCode) {
          try {
            const tenantData = await userService.getTenantByCode(
              dishData.tenantCode
            );
            setTenant(tenantData);
          } catch (err) {
            console.error("Error fetching tenant:", err);
            // Ne pas définir d'erreur globale si seul le tenant échoue
          }
        }
      } catch (err) {
        console.error("Error fetching dish details:", err);
        setError("Erreur lors de la récupération des détails du plat");
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du plat",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDishDetails();
  }, [dishId, toast]);

  // Fonction pour gérer les actions non implémentées
  const handleNotImplementedAction = (action, itemName) => {
    setAlertAction(`${action} ${itemName}`);
    setIsAlertModalOpen(true);
  };

  // Fonction pour formater une date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fonction pour formater le prix avec la devise
  const formatPrice = (price, currency) => {
    if (!price) return "N/A";

    const currencyCode = currency?.code || "";
    return `${price} ${currencyCode}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête avec titre et boutons */}
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
              Détails du plat
            </h1>
          </div>

          <div>
            {canEditDish && (
              <Button
                variant="outline"
                onClick={() =>
                  handleNotImplementedAction("modifier", "ce plat")
                }
                className="flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          // Affichage pendant le chargement
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          // Affichage en cas d'erreur
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-xl font-medium text-red-800 mb-2">Erreur</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/menu/dishes")}
            >
              Retour à la liste des plats
            </Button>
          </div>
        ) : dish ? (
          // Affichage des détails du plat
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl">{dish.name}</CardTitle>
                    <CardDescription>
                      Restaurant: {tenant?.name || dish.tenantCode}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Badge className="bg-primary text-white text-lg py-2 px-4">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatPrice(dish.price, dish.currency)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Catégories */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                    <TagIcon className="h-4 w-4 mr-2" />
                    Catégories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dish.categories && dish.categories.length > 0 ? (
                      dish.categories.map((category, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {category}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        Aucune catégorie
                      </span>
                    )}
                  </div>
                </div>

                {/* Restaurant */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Restaurant
                  </h3>
                  <div className="font-medium">
                    {tenant?.name || dish.tenantCode}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingrédients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Composition du plat
                </CardTitle>
                <CardDescription>
                  Liste des ingrédients nécessaires à la préparation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dish.dishProducts && dish.dishProducts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead className="text-center">Optionnel</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dish.dishProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {product.productName}
                          </TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>{product.unitOfMeasure}</TableCell>
                          <TableCell className="text-center">
                            {product.removable ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-gray-400 mx-auto" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Aucun ingrédient associé à ce plat
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => router.push("/menu/dishes")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Button>
            </div>
          </motion.div>
        ) : (
          // Plat non trouvé
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h2 className="text-xl font-medium text-amber-800 mb-2">
              Plat non trouvé
            </h2>
            <p className="text-amber-700 mb-4">
              Le plat que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/menu/dishes")}
            >
              Retour à la liste des plats
            </Button>
          </div>
        )}
      </div>

      {/* Modal pour les fonctionnalités non implémentées */}
      <NotImplementedModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={`Action non disponible : ${alertAction}`}
      />
    </DashboardLayout>
  );
}
