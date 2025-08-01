// src/app/users/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import usePermissions from "@/hooks/usePermissions";
import UserPermissionsCard from "@/components/users/UserPermissionsCard";
import UserProfileCard from "@/components/users/UserProfileCard";
import { PinManagementSection } from "@/components/profile/PinManagementSection";

export default function UserDetailPage() {
  const { id: employeeNumber } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  // Vérifier si l'utilisateur actuel peut gérer les PINs
  const canManagePins = () => {
    if (!currentUser || !user) return false;

    // Admin peut tout faire
    if (isAdmin()) return true;

    // Manager peut gérer les PINs des utilisateurs de son restaurant
    if (
      currentUser.roles?.includes("ROLE_MANAGER") &&
      currentUser.tenantCode === user.tenantCode
    ) {
      return true;
    }

    // Utilisateur avec permission ORDER_DEBT_VALIDATION peut gérer son propre PIN seulement
    if (
      hasPermission("ORDER_DEBT_VALIDATION") &&
      currentUser.employeeNumber === user.employeeNumber
    ) {
      return true;
    }

    return false;
  };

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

      // Un manager peut voir les utilisateurs de son restaurant
      if (
        currentUser.roles?.includes("ROLE_MANAGER") &&
        currentUser.tenantCode === user.tenantCode
      )
        return;

      // Un utilisateur ne peut voir que son propre profil
      if (currentUser.employeeNumber === user.employeeNumber) return;

      // Sinon, pas d'accès
      toast.error("Vous n'avez pas accès à cet utilisateur");
      router.push("/dashboard");
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

  // Déterminer les onglets à afficher
  const tabs = ["general", "permissions"];
  if (canManagePins()) {
    tabs.push("pin");
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
              <TabsList className={`grid grid-cols-${tabs.length}`}>
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                {canManagePins() && <TabsTrigger value="pin">PIN</TabsTrigger>}
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
                      {isAdmin() && (
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
                <UserPermissionsCard
                  user={user}
                  title="Rôles et Permissions"
                  description="Liste des rôles et permissions de l'utilisateur"
                  showRoleDetails={true}
                  showPermissionDetails={isAdmin()}
                />
              </TabsContent>

              {canManagePins() && (
                <TabsContent value="pin" className="mt-4 space-y-4">
                  <PinManagementSection
                    user={user}
                    isOwnProfile={
                      currentUser?.employeeNumber === user.employeeNumber
                    }
                  />
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
