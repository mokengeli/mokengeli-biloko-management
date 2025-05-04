// src/app/restaurants/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import usePermissions from "@/hooks/usePermissions";
import userService from "@/services/userService";
import orderService from "@/services/orderService";
import NotImplementedModal from "@/components/common/NotImplementedModal";
import CreateTableModal from "@/components/restaurants/CreateTableModal";
import {
    ArrowLeft,
    Mail,
    Calendar,
    Building,
    Shield,
    User as UserIcon,
    Edit,
    Trash2,
    Clock,
    BadgeInfo,
    LayoutGrid,
    Grid3X3,
    PlusCircle,
    MapPin,
    AlertTriangle,
    Info
} from "lucide-react";

export default function RestaurantDetailPage() {
    const router = useRouter();
    const params = useParams();
    const restaurantId = params?.id;
    const { isAdmin } = usePermissions();

    const [restaurant, setRestaurant] = useState(null);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tablesLoading, setTablesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("general");
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertAction, setAlertAction] = useState("");
    const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 10,
    });

    // Fonction pour récupérer les détails du restaurant
    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            if (!restaurantId) {
                setError("Identifiant restaurant non valide");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Simulation: Dans un vrai cas, il faudrait un endpoint getUserById
                // Pour cette démo, nous allons récupérer la liste et filtrer
                const allRestaurants = await userService.getAllTenants();
                const currentRestaurant = allRestaurants.find(
                    r => r.id === parseInt(restaurantId)
                );

                if (currentRestaurant) {
                    setRestaurant(currentRestaurant);
                } else {
                    setError("Restaurant non trouvé");
                }
            } catch (err) {
                console.error("Error fetching restaurant details:", err);
                setError("Erreur lors de la récupération des détails du restaurant");
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantDetails();
    }, [restaurantId]);

    // Fonction pour récupérer les tables
    useEffect(() => {
        const fetchTables = async () => {
            if (!restaurant?.code) return;

            setTablesLoading(true);
            try {
                const response = await orderService.getRestaurantTables(
                    restaurant.code,
                    pagination.currentPage,
                    pagination.pageSize
                );
                setTables(response.content || []);
                setPagination({
                    currentPage: response.number || 0,
                    totalPages: response.totalPages || 0,
                    totalElements: response.totalElements || 0,
                    pageSize: response.size || pagination.pageSize,
                });
            } catch (err) {
                console.error("Error fetching tables:", err);
                // En cas d'erreur, on garde les tables vides pour l'affichage
            } finally {
                setTablesLoading(false);
            }
        };

        if (restaurant) {
            fetchTables();
        }
    }, [restaurant, pagination.currentPage, pagination.pageSize]);

    // Fonction pour gérer les actions non implémentées
    const handleNotImplementedAction = (action, itemName) => {
        setAlertAction(`${action} ${itemName}`);
        setIsAlertModalOpen(true);
    };

    // Formater une date pour l'affichage
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

    // Fonction pour gérer le changement de page des tables
    const handleTablePageChange = (newPage) => {
        fetchTables(newPage, pagination.pageSize);
    };

    // Fonction pour gérer la création réussie d'une table
    const handleTableCreated = () => {
        // Récupérer les tables à nouveau
        if (restaurant?.code) {
            const fetchTables = async () => {
                setTablesLoading(true);
                try {
                    const response = await orderService.getRestaurantTables(
                        restaurant.code,
                        pagination.currentPage,
                        pagination.pageSize
                    );
                    setTables(response.content || []);
                    setPagination({
                        currentPage: response.number || 0,
                        totalPages: response.totalPages || 0,
                        totalElements: response.totalElements || 0,
                        pageSize: response.size || pagination.pageSize,
                    });
                } catch (err) {
                    console.error("Error fetching tables:", err);
                } finally {
                    setTablesLoading(false);
                }
            };
            fetchTables();
        }
    };

    if (!isAdmin) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="bg-amber-50 text-amber-800 p-6 rounded-lg border border-amber-200 max-w-md text-center">
                        <h2 className="text-xl font-semibold mb-4">Accès non autorisé</h2>
                        <p className="mb-4">
                            Vous n'avez pas les permissions requises pour voir les détails des restaurants.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => router.push("/restaurants")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à la liste des restaurants
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* En-tête avec titre et boutons d'action */}
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/restaurants")}
                            className="h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center">
                            <Building className="h-6 w-6 mr-2" />
                            Détails du restaurant
                        </h1>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                handleNotImplementedAction("modifier", "ce restaurant")
                            }
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                handleNotImplementedAction("supprimer", "ce restaurant")
                            }
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                {loading ? (
                    // Affichage pendant le chargement
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : error ? (
                    // Affichage en cas d'erreur
                    <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                        <h2 className="text-xl font-medium text-red-800 mb-2">Erreur</h2>
                        <p className="text-red-700 mb-4">{error}</p>
                        <Button variant="outline" onClick={() => router.push("/restaurants")}>
                            Retour à la liste des restaurants
                        </Button>
                    </div>
                ) : restaurant ? (
                    // Affichage des détails du restaurant
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Carte de profil */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle>Profil Restaurant</CardTitle>
                                    <CardDescription>Informations du restaurant</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <Building className="h-8 w-8 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-bold">
                                            {restaurant.name}
                                        </h2>
                                        <p className="text-muted-foreground mt-1">
                                            Code: {restaurant.code}
                                        </p>
                                    </div>

                                    <div className="w-full space-y-2">
                                        <div className="flex items-center gap-2 text-sm py-1.5 border-t">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="font-medium ml-auto">
                                                {restaurant.email || 'Non spécifié'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm py-1.5 border-t">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Création:</span>
                                            <span className="font-medium ml-auto">
                                                {formatDate(restaurant.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm py-1.5 border-t">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Modification:</span>
                                            <span className="font-medium ml-auto">
                                                {formatDate(restaurant.updatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Contenu principal */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-2"
                        >
                            <Tabs
                                defaultValue="general"
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="w-full"
                            >
                                <TabsList className="grid grid-cols-2">
                                    <TabsTrigger value="general">Informations</TabsTrigger>
                                    <TabsTrigger value="tables">Plan de salle</TabsTrigger>
                                </TabsList>
                                <TabsContent value="general" className="mt-4 space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Informations du restaurant</CardTitle>
                                            <CardDescription>
                                                Détails complets sur le restaurant
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Code du restaurant</label>
                                                    <div className="p-2 bg-muted/50 rounded-md">
                                                        {restaurant.code}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Nom</label>
                                                    <div className="p-2 bg-muted/50 rounded-md">
                                                        {restaurant.name}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Email</label>
                                                    <div className="p-2 bg-muted/50 rounded-md">
                                                        {restaurant.email || 'Non spécifié'}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Statistiques</CardTitle>
                                            <CardDescription>
                                                Aperçu des métriques du restaurant
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Statistiques à implémenter */}
                                                <div className="p-4 border rounded-lg">
                                                    <h3 className="text-sm font-medium text-muted-foreground">Utilisateurs</h3>
                                                    <p className="text-2xl font-bold mt-1">-</p>
                                                </div>
                                                <div className="p-4 border rounded-lg">
                                                    <h3 className="text-sm font-medium text-muted-foreground">Tables</h3>
                                                    <p className="text-2xl font-bold mt-1">{pagination.totalElements || 0}</p>
                                                </div>
                                                <div className="p-4 border rounded-lg">
                                                    <h3 className="text-sm font-medium text-muted-foreground">Commandes</h3>
                                                    <p className="text-2xl font-bold mt-1">-</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="tables" className="mt-4 space-y-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Plan de salle</CardTitle>
                                                <CardDescription>
                                                    Gestion des tables du restaurant
                                                </CardDescription>
                                            </div>
                                            <Button
                                                onClick={() => setIsCreateTableModalOpen(true)}
                                            >
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Ajouter une table
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {tablesLoading ? (
                                                <div className="space-y-4">
                                                    {Array(5).fill(0).map((_, index) => (
                                                        <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                                                            <Skeleton className="h-5 w-32" />
                                                            <Skeleton className="h-5 w-24" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : tables.length === 0 ? (
                                                <div className="text-center py-8 border rounded-lg">
                                                    <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">Aucune table configurée</h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        Commencez par ajouter des tables à votre restaurant
                                                    </p>
                                                    <Button
                                                        onClick={() => setIsCreateTableModalOpen(true)}
                                                    >
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                        Ajouter une table
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {tables.map((table) => (
                                                            <Card key={table.id} className="border-2">
                                                                <CardHeader className="p-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <CardTitle className="text-lg">{table.name}</CardTitle>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="h-8 w-8"
                                                                                onClick={() => handleNotImplementedAction("modifier", `la table ${table.name}`)}
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="h-8 w-8 text-red-500"
                                                                                onClick={() => handleNotImplementedAction("supprimer", `la table ${table.name}`)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </CardHeader>
                                                                <CardContent className="pt-0">
                                                                    <div className="text-sm text-muted-foreground">
                                                                        Créée le {formatDate(table.createdAt)}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>

                                                    {pagination.totalPages > 1 && (
                                                        <div className="flex justify-center pt-4">
                                                            <Pagination
                                                                currentPage={pagination.currentPage}
                                                                totalPages={pagination.totalPages}
                                                                onPageChange={handleTablePageChange}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </div>
                ) : (
                    // Restaurant non trouvé
                    <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                        <h2 className="text-xl font-medium text-amber-800 mb-2">
                            Restaurant non trouvé
                        </h2>
                        <p className="text-amber-700 mb-4">
                            Le restaurant que vous recherchez n'existe pas ou a été supprimé.
                        </p>
                        <Button variant="outline" onClick={() => router.push("/restaurants")}>
                            Retour à la liste des restaurants
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

            {/* Modal de création de table */}
            {restaurant?.code && (
                <CreateTableModal
                    isOpen={isCreateTableModalOpen}
                    onClose={() => setIsCreateTableModalOpen(false)}
                    tenantCode={restaurant.code}
                    onSuccess={handleTableCreated}
                />
            )}
        </DashboardLayout>
    );
}