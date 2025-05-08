// src/app/users/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserAvatar } from "@/components/common/UserAvatar";
import { RoleBadge } from "@/components/common/RoleBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import userService from "@/services/userService";
import { toast } from "sonner";
import {
  User,
  Mail,
  Calendar,
  Building,
  Badge,
  AlertCircle,
  ChevronLeft,
  Shield,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import usePermissions from "@/hooks/usePermissions";
import UserProfileCard from "@/components/users/UserProfileCard";

export default function UserDetailPage() {
  const { id: employeeNumber } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { isAdmin } = usePermissions();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  // Récupérer les données de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Utiliser le service pour récupérer l'utilisateur par numéro d'employé
        const userData = await userService.getUserByEmployeeNumber(
          employeeNumber
        );
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Impossible de récupérer les détails de l'utilisateur");
        toast.error("Erreur lors du chargement des informations utilisateur");
      } finally {
        setLoading(false);
      }
    };

    if (employeeNumber) {
      fetchUserData();
    }
  }, [employeeNumber]);

  // Vérifier si l'utilisateur courant a le droit de voir ces informations
  useEffect(() => {
    // Si nous avons l'utilisateur courant et l'utilisateur demandé
    if (currentUser && user) {
      // Un admin peut voir tous les utilisateurs
      if (isAdmin()) return;

      // Un utilisateur ne peut voir que les utilisateurs de son restaurant
      if (currentUser.tenantCode !== user.tenantCode) {
        toast.error("Vous n'avez pas accès à cet utilisateur");
        router.push("/dashboard");
      }
    }
  }, [currentUser, user, router, isAdmin]);

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

  // Si chargement en cours
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Si erreur
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">{error}</h2>
          <Button variant="secondary" onClick={() => router.push("/users")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour à la liste des utilisateurs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Si aucun utilisateur trouvé
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <User className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Utilisateur non trouvé</h2>
          <Button variant="secondary" onClick={() => router.push("/users")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour à la liste des utilisateurs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête avec navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/users")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
              Détails de l'utilisateur
            </motion.h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/users/${employeeNumber}/edit`)}
              disabled={!isAdmin() && currentUser?.id !== user.id}
            >
              Modifier
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte de profil */}
          <UserProfileCard
            user={user}
            title="Profil Utilisateur"
            description="Informations personnelles"
            formatDate={formatDate}
          />

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
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de base</CardTitle>
                    <CardDescription>
                      Détails personnels de l'utilisateur
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Post-Nom</label>
                        <div className="p-2 bg-muted/50 rounded-md">
                          {user.postName || "Non spécifié"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Email</label>
                        <div className="p-2 bg-muted/50 rounded-md">
                          {user.email || "Non spécifié"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informations de l'établissement</CardTitle>
                    <CardDescription>
                      Restaurant associé à cet utilisateur
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">
                          Nom du restaurant
                        </label>
                        <div className="p-2 bg-muted/50 rounded-md">
                          {user.tenantName || "Non spécifié"}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Code du restaurant
                          </label>
                          <div className="p-2 bg-muted/50 rounded-md">
                            {user.tenantCode || "Non spécifié"}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rôles et Permissions</CardTitle>
                    <CardDescription>
                      Liste des rôles et permissions de l'utilisateur
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Rôles de l'utilisateur */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Star className="mr-2 h-5 w-5 text-amber-500" />
                        Rôles
                      </h3>
                      {user.roles && user.roles.length > 0 ? (
                        <div className="space-y-2">
                          {user.roles.map((role) => (
                            <div
                              key={role}
                              className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                            >
                              <RoleBadge roleId={role} showTooltip={false} />
                              <span className="text-sm ml-2">{role}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center border rounded-md">
                          <p className="text-muted-foreground">
                            Aucun rôle attribué
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Permissions de l'utilisateur */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-blue-500" />
                        Permissions
                      </h3>
                      {user.permissions && user.permissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {user.permissions.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center gap-2 p-2 border rounded-md"
                            >
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="text-sm">{permission}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center border rounded-md">
                          <p className="text-muted-foreground">
                            Aucune permission spécifique
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
