// src/app/profile/page.js
"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserAvatar } from "@/components/common/UserAvatar";
import { RoleBadge } from "@/components/common/RoleBadge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import usePermissions from "@/hooks/usePermissions";
import {
  User,
  Mail,
  Calendar,
  Building,
  Shield,
  Key,
  Clock,
  BadgeInfo,
  ChevronRight,
  Bell,
  MoonStar,
  AlertCircle,
  Store,
  Coffee,
  Beer,
  Sofa,
  Crown,
} from "lucide-react";
import { PasswordChangeSection } from "@/components/profile/PasswordChangeSection";

export default function ProfilePage() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState("general");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Si aucun utilisateur n'est connecté, afficher un message
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p>Chargement des informations utilisateur...</p>
        </div>
      </DashboardLayout>
    );
  }

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
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight"
        >
          Mon Profil
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte de profil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Informations Utilisateur</CardTitle>
                <CardDescription>Vos informations personnelles</CardDescription>
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
                      <span className="text-muted-foreground">N° Employé:</span>
                      <span className="font-medium ml-auto">
                        {user.employeeNumber}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm py-1.5 border-t">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Restaurant:</span>
                    <span className="font-medium ml-auto">
                      {user.tenantName}
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
                className={`grid ${isAdmin() ? "grid-cols-3" : "grid-cols-2"}`}
              >
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
                {isAdmin() && (
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="general" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profil Général</CardTitle>
                    <CardDescription>
                      Vos informations de base et préférences
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
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Email</label>
                        <div className="p-2 bg-muted/50 rounded-md">
                          {user.email || "Non spécifié"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Poste</label>
                        <div className="p-2 bg-muted/50 rounded-md">
                          {user.postName || "Non spécifié"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled variant="outline" className="ml-auto">
                      Éditer les informations
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Informations sur l'établissement</CardTitle>
                    <CardDescription>
                      Détails sur votre établissement et plan de souscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Type d'établissement */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Type d'établissement
                      </label>
                      <div className="p-3 bg-muted/50 rounded-md flex items-center gap-2">
                        {user.establishmentCode === "RESTAURANT" && (
                          <Store className="h-5 w-5 text-primary" />
                        )}
                        {user.establishmentCode === "BAR" && (
                          <Beer className="h-5 w-5 text-primary" />
                        )}
                        {user.establishmentCode === "LOUNGE" && (
                          <Sofa className="h-5 w-5 text-primary" />
                        )}
                        {user.establishmentCode === "PLATFORM" && (
                          <Coffee className="h-5 w-5 text-primary" />
                        )}
                        {!user.establishmentCode && (
                          <Building className="h-5 w-5 text-primary" />
                        )}
                        <span className="font-medium">
                          {user.establishmentCode === "RESTAURANT" &&
                            "Restaurant"}
                          {user.establishmentCode === "BAR" && "Bar"}
                          {user.establishmentCode === "LOUNGE" && "Lounge"}
                          {user.establishmentCode === "PLATFORM" &&
                            "Plateforme"}
                          {!user.establishmentCode && "Non spécifié"}
                        </span>
                      </div>
                    </div>

                    {/* Plan de souscription */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Plan de souscription
                      </label>
                      <div
                        className={`p-3 rounded-md flex items-center gap-2 ${
                          user.subscriptionCode === "PREMIUM"
                            ? "bg-amber-50 border border-amber-200"
                            : "bg-muted/50"
                        }`}
                      >
                        <Crown
                          className={`h-5 w-5 ${
                            user.subscriptionCode === "PREMIUM"
                              ? "text-amber-500"
                              : "text-gray-500"
                          }`}
                        />
                        <div className="flex flex-col">
                          <span
                            className={`font-medium ${
                              user.subscriptionCode === "PREMIUM"
                                ? "text-amber-700"
                                : ""
                            }`}
                          >
                            Plan{" "}
                            {user.subscriptionCode === "PREMIUM"
                              ? "Premium"
                              : "Starter"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.subscriptionCode === "PREMIUM"
                              ? "Accès à toutes les fonctionnalités avancées"
                              : "Fonctionnalités de base uniquement"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nom de l'établissement */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Nom de l'établissement
                      </label>
                      <div className="p-2 bg-muted/50 rounded-md">
                        {user.tenantName || "Non spécifié"}
                      </div>
                    </div>
                  </CardContent>
                  {user.subscriptionCode !== "PREMIUM" && (
                    <CardFooter>
                      <Button disabled variant="outline" className="ml-auto">
                        <Crown className="mr-2 h-4 w-4" />
                        Passer au plan Premium
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Changer votre mot de passe</CardTitle>
                    <CardDescription>
                      Mettez à jour votre mot de passe pour maintenir votre
                      compte sécurisé
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PasswordChangeSection />
                  </CardContent>
                </Card>
              </TabsContent>

              {isAdmin() && (
                <TabsContent value="permissions" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rôles et Permissions</CardTitle>
                      <CardDescription>
                        Liste des rôles et permissions associés à votre compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Rôles</h3>
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
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Permissions
                        </h3>
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
                              Aucune permission spécifique trouvée
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
