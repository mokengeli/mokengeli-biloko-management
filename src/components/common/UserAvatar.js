// src/components/common/UserAvatar.js
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAvatarColorClass } from "@/lib/roles";

/**
 * Composant d'avatar pour l'utilisateur qui s'adapte aux rôles
 *
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.user - Objet utilisateur
 * @param {string} props.className - Classes CSS additionnelles
 * @param {string} props.size - Taille de l'avatar ('sm', 'default', 'lg')
 * @param {boolean} props.showTooltip - Affiche un tooltip avec le nom complet
 * @param {boolean} props.showSubscriptionBadge - Affiche un badge pour le plan de souscription
 */
export function UserAvatar({
  user,
  className,
  size = "default",
  showTooltip = false,
  showSubscriptionBadge = false,
  ...props
}) {
  if (!user) return null;

  // Déterminer les initiales de l'utilisateur (première lettre du prénom et du nom)
  const getInitials = () => {
    const firstNameInitial = user.firstName ? user.firstName.charAt(0) : "";
    const lastNameInitial = user.lastName ? user.lastName.charAt(0) : "";
    return (firstNameInitial + lastNameInitial).toUpperCase();
  };

  // Définir les classes CSS de taille
  const sizeClasses = {
    xs: "h-8 w-8 text-xs",
    sm: "h-10 w-10 text-sm",
    default: "h-12 w-12",
    lg: "h-14 w-14 text-lg",
    xl: "h-16 w-16 text-xl",
  };

  // Obtenir la couleur de l'avatar en fonction du rôle
  const avatarColorClass = getAvatarColorClass(user.roles || []);

  // Configuration pour le badge de souscription
  const getSubscriptionBadgeStyles = () => {
    if (!user.subscriptionCode) return null;

    return user.subscriptionCode === "PREMIUM"
      ? "bg-gradient-to-r from-amber-500 to-yellow-300 text-black border-amber-400"
      : "bg-gray-200 text-gray-700 border-gray-300";
  };

  const avatarComponent = (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)} {...props}>
        <AvatarImage
          src={user.avatarUrl}
          alt={`${user.firstName} ${user.lastName}`}
        />
        <AvatarFallback
          className={cn("font-semibold text-white", avatarColorClass)}
        >
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      {/* Badge de souscription */}
      {showSubscriptionBadge && user.subscriptionCode && (
        <div
          className={cn(
            "absolute -bottom-1 -right-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 border shadow-sm",
            getSubscriptionBadgeStyles()
          )}
        >
          {user.subscriptionCode === "PREMIUM" ? "P" : "S"}
        </div>
      )}
    </div>
  );

  // Afficher avec tooltip si demandé
  if (showTooltip) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{avatarComponent}</TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">
              {user.firstName} {user.lastName}
            </p>
            {user.postName && (
              <p className="text-xs text-muted-foreground">{user.postName}</p>
            )}
            {user.subscriptionCode && (
              <Badge
                variant="outline"
                className={cn(
                  "mt-1 text-xs",
                  user.subscriptionCode === "PREMIUM"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : ""
                )}
              >
                Plan{" "}
                {user.subscriptionCode === "PREMIUM" ? "Premium" : "Starter"}
              </Badge>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return avatarComponent;
}
