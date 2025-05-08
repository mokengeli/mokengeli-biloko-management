// src/components/users/UserPermissionsCard.js
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RoleBadge } from "@/components/common/RoleBadge";
import { AlertCircle, Shield, Star, ChevronRight } from "lucide-react";

/**
 * Composant réutilisable pour afficher les rôles et permissions d'un utilisateur
 *
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.user - Données de l'utilisateur
 * @param {string} props.title - Titre de la carte (optionnel)
 * @param {string} props.description - Description de la carte (optionnel)
 * @param {boolean} props.showAnimation - Activer les animations (défaut: true)
 * @param {boolean} props.showRoleDetails - Afficher les détails des rôles (défaut: true)
 * @param {boolean} props.showPermissionDetails - Afficher les détails des permissions (défaut: true)
 * @param {boolean} props.compact - Affichage compact (défaut: false)
 */
export default function UserPermissionsCard({
  user,
  title = "Rôles et Permissions",
  description = "Liste des rôles et permissions associés à ce compte",
  showAnimation = true,
  showRoleDetails = true,
  showPermissionDetails = true,
  compact = false,
}) {
  // Si aucun utilisateur n'est fourni, ne rien afficher
  if (!user) return null;

  // Vérifier si l'utilisateur a des rôles
  const hasRoles = user.roles && user.roles.length > 0;

  // Vérifier si l'utilisateur a des permissions
  const hasPermissions = user.permissions && user.permissions.length > 0;

  // Si l'utilisateur n'a ni rôles ni permissions et qu'on ne veut pas afficher les états vides
  if (!hasRoles && !hasPermissions && compact) return null;

  // Composant de base sans animation
  const CardComponent = () => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section des rôles */}
        {showRoleDetails && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Star className="mr-2 h-5 w-5 text-amber-500" />
              Rôles
            </h3>
            {hasRoles ? (
              <div className="space-y-2">
                {user.roles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <RoleBadge roleId={role} showTooltip={false} />
                      <span className="text-sm text-muted-foreground ml-2">
                        {role}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center border rounded-md">
                <p className="text-muted-foreground">Aucun rôle attribué</p>
              </div>
            )}
          </div>
        )}

        {/* Section des permissions */}
        {showPermissionDetails && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              Permissions
            </h3>
            {hasPermissions ? (
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
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Aucune permission spécifique trouvée
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Si l'animation est activée, envelopper le composant avec motion
  if (showAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardComponent />
      </motion.div>
    );
  }

  // Sinon, retourner simplement le composant sans animation
  return <CardComponent />;
}
