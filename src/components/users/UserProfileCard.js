// src/components/users/UserProfileCard.js
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/common/UserAvatar";
import { RoleBadge } from "@/components/common/RoleBadge";
import { Mail, Calendar, Building, Badge, Clock } from "lucide-react";

/**
 * Composant réutilisable pour afficher le profil d'un utilisateur
 *
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.user - Données de l'utilisateur à afficher
 * @param {string} props.title - Titre de la carte (optionnel)
 * @param {string} props.description - Description de la carte (optionnel)
 * @param {boolean} props.showAnimation - Activer les animations (défaut: true)
 * @param {boolean} props.showRoles - Afficher les badges des rôles (défaut: true)
 * @param {function} props.formatDate - Fonction pour formater les dates (optionnel)
 * @param {React.ReactNode} props.footer - Contenu additionnel à afficher en bas de la carte (optionnel)
 */
export default function UserProfileCard({
  user,
  title = "Profil Utilisateur",
  description = "Informations personnelles",
  showAnimation = true,
  showRoles = true,
  formatDate,
  footer,
}) {
  // Si aucun utilisateur n'est fourni, ne rien afficher
  if (!user) return null;

  // Fonction par défaut pour formater les dates
  const defaultFormatDate = (dateString) => {
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

  // Utiliser la fonction de formatage fournie ou la fonction par défaut
  const formatDateFn = formatDate || defaultFormatDate;

  // Composant de base sans animation
  const CardComponent = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <UserAvatar user={user} size="xl" className="mb-4" />
        <h2 className="text-xl font-bold">
          {user.firstName} {user.lastName}
        </h2>
        {user.postName && (
          <p className="text-sm text-muted-foreground mb-2">{user.postName}</p>
        )}

        {showRoles && user.roles && user.roles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {user.roles.map((role) => (
              <RoleBadge key={role} roleId={role} />
            ))}
          </div>
        )}

        <div className="w-full mt-6 space-y-2">
          {user.employeeNumber && (
            <div className="flex items-center gap-2 text-sm py-1.5 border-t">
              <Badge className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">N° Employé:</span>
              <span className="font-medium ml-auto">{user.employeeNumber}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm py-1.5 border-t">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium ml-auto">
              {user.email || "Non spécifié"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm py-1.5 border-t">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Restaurant:</span>
            <span className="font-medium ml-auto">
              {user.tenantName || user.tenantCode || "Non spécifié"}
            </span>
          </div>

          {user.createdAt && (
            <div className="flex items-center gap-2 text-sm py-1.5 border-t">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Création:</span>
              <span className="font-medium ml-auto">
                {formatDateFn(user.createdAt)}
              </span>
            </div>
          )}

          {user.updatedAt && (
            <div className="flex items-center gap-2 text-sm py-1.5 border-t">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Mis à jour:</span>
              <span className="font-medium ml-auto">
                {formatDateFn(user.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {footer && <div className="mt-4 w-full">{footer}</div>}
      </CardContent>
    </Card>
  );

  // Si l'animation est activée, envelopper le composant avec motion
  if (showAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardComponent />
      </motion.div>
    );
  }

  // Sinon, retourner simplement le composant sans animation
  return <CardComponent />;
}
