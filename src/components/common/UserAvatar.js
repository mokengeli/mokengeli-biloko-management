// src/components/common/UserAvatar.js
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
 */
export function UserAvatar({
  user,
  className,
  size = "default",
  showTooltip = false,
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

  const avatarComponent = (
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
  );

  // Afficher avec tooltip si demandé
  if (showTooltip) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{avatarComponent}</TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
          {user.postName && (
            <p className="text-xs text-muted-foreground">{user.postName}</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return avatarComponent;
}
