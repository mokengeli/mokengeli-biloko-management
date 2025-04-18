// src/app/users/[id]/page.js
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
import { RoleBadge } from "@/components/common/RoleBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";
import userService from "@/services/userService";
import NotImplementedModal from "@/components/common/NotImplementedModal";
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
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const { isAdmin } = usePermissions();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertAction, setAlertAction] = useState("");

  // Fonction pour récupérer les détails de l'utilisateur
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setError("Identifiant utilisateur non valide");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Simulation de l'appel API pour récupérer les détails d'un utilisateur par son ID
        // Comme nous n'avons pas d'endpoint getUserById, on utiliserait getUserById de userService
        // Pour cette démo, nous allons simuler une réponse

        // Normalement, on utiliserait: const userData = await userService.getUserById(userId);
        // Remplacer par une simulation
        setTimeout(() => {
          const userData = {
            id: parseInt(userId),
            firstName: "Jean",
            lastName: "Dupont",
            postName: "Responsable",
            email: "jean.dupont@example.com",
            employeeNumber: "EMP" + userId,
            tenantCode: "RESTAURANT_1",
            tenantName: "Restaurant Le Gourmand",
            roles: ["ROLE_MANAGER", "ROLE_USER"],
            permissions: [
              "VIEW_INVENTORY",
              "EDIT_INVENTORY",
              "VIEW_ORDERS",
              "EDIT_ORDERS",
            ],
            createdAt: "2023-12-01T10:30:00Z",
            updatedAt: "2024-03-15T14:45:00Z",
          };

          setUser(userData);

          // Simuler la récupération des informations du restaurant
          const tenantData = {
            id: 1,
            code: userData.tenantCode,
            name: userData.tenantName || "Restaurant " + userData.tenantCode,
          };
          setTenant(tenantData);

          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Erreur lors de la récupération des détails de l'utilisateur");
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête avec titre et boutons d'action */}
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/users")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight flex items-center">
              <UserIcon className="h-6 w-6 mr-2" />
              Détails de l'utilisateur
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                handleNotImplementedAction("modifier", "cet utilisateur")
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                handleNotImplementedAction("supprimer", "cet utilisateur")
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
            <Button variant="outline" onClick={() => router.push("/users")}>
              Retour à la liste des utilisateurs
            </Button>
          </div>
        ) : user ? (
          // Affichage des détails de l'utilisateur
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Carte de profil */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Profil Utilisateur</CardTitle>
                  <CardDescription>Informations personnelles</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <UserAvatar user={user} size="xl" className="mb-4" />
                  <h2 className="text-xl font-bold">
                    {user.firstName} {user.lastName}
                  </h2>
                  {user.postName && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {user.postName}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {user.roles?.map((role) => (
                      <RoleBadge key={role} roleId={role} />
                    ))}
                  </div>
                  <div className="w-full mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm py-1.5 border-t">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium ml-auto">{user.email}</span>
                    </div>
                    {user.employeeNumber && (
                      <div className="flex items-center gap-2 text-sm py-1.5 border-t">
                        <BadgeInfo className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          N° Employé:
                        </span>
                        <span className="font-medium ml-auto">
                          {user.employeeNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm py-1.5 border-t">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Restaurant:</span>
                      <span className="font-medium ml-auto">
                        {tenant?.name || user.tenantCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm py-1.5 border-t">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Création:</span>
                      <span className="font-medium ml-auto">
                        {formatDate(user.createdAt)}
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
                <TabsList
                  className={`grid ${
                    isAdmin() ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  <TabsTrigger value="general">
                    Informations générales
                  </TabsTrigger>
                  {isAdmin() && (
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="general" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Détails du compte</CardTitle>
                      <CardDescription>
                        Informations complètes sur l'utilisateur
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Prénom</label>
                          <div className="p-2 bg-muted/50 rounded-md">
                            {user.firstName}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Nom</label>
                          <div className="p-2 bg-muted/50 rounded-md">
                            {user.lastName}
                          </div>
                        </div>
                        {user.postName && (
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Poste</label>
                            <div className="p-2 bg-muted/50 rounded-md">
                              {user.postName}
                            </div>
                          </div>
                        )}
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Email</label>
                          <div className="p-2 bg-muted/50 rounded-md">
                            {user.email}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            N° Employé
                          </label>
                          <div className="p-2 bg-muted/50 rounded-md">
                            {user.employeeNumber || "Non spécifié"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Restaurant
                          </label>
                          <div className="p-2 bg-muted/50 rounded-md">
                            {tenant?.name} ({user.tenantCode})
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Rôles</CardTitle>
                      <CardDescription>
                        Rôles assignés à cet utilisateur
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {user.roles?.map((role) => (
                          <div
                            key={role}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <RoleBadge
                                roleId={role}
                                size="default"
                                showTooltip={false}
                              />
                              <span className="text-sm text-muted-foreground ml-2">
                                {role}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                        {(!user.roles || user.roles.length === 0) && (
                          <div className="p-4 text-center border rounded-md">
                            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                              Aucun rôle assigné
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Historique du compte</CardTitle>
                      <CardDescription>
                        Dates importantes concernant ce compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Création du compte</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(user.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                Dernière modification
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(user.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {isAdmin() && (
                  <TabsContent value="permissions" className="mt-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>
                          Liste des permissions accordées à cet utilisateur
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {user.permissions?.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center gap-2 p-2 border rounded-md"
                            >
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="text-sm">{permission}</span>
                            </div>
                          ))}
                        </div>

                        {(!user.permissions ||
                          user.permissions.length === 0) && (
                          <div className="p-4 text-center border rounded-md">
                            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                              Aucune permission spécifique
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </motion.div>
          </div>
        ) : (
          // Utilisateur non trouvé
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h2 className="text-xl font-medium text-amber-800 mb-2">
              Utilisateur non trouvé
            </h2>
            <p className="text-amber-700 mb-4">
              L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button variant="outline" onClick={() => router.push("/users")}>
              Retour à la liste des utilisateurs
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
