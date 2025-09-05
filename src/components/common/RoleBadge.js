// src/components/common/RoleBadge.js
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getRoleInfo } from "@/lib/roles";
import * as LucideIcons from "lucide-react";

/**
 * Composant Badge pour afficher le rôle d'un utilisateur
 *
 * @param {Object} props - Propriétés du composant
 * @param {string} props.roleId - Identifiant du rôle à afficher
 * @param {boolean} props.showIcon - Affiche l'icône du rôle si true
 * @param {boolean} props.showTooltip - Affiche un tooltip avec la description complète du rôle
 * @param {string} props.size - Taille du badge ('sm', 'default', 'lg')
 * @param {string} props.className - Classes CSS additionnelles
 */
export function RoleBadge({
  roleId,
  showIcon = true,
  showTooltip = true,
  size = "default",
  className,
}) {
  const roleInfo = getRoleInfo(roleId);

  if (!roleInfo) return null;

  // Déterminer les classes CSS en fonction de la taille
  const sizeClasses = {
    sm: "text-xs py-0 px-2",
    default: "text-xs py-1 px-2",
    lg: "text-sm py-1 px-3",
  };

  // Récupérer l'icône correspondante depuis Lucide
  const IconComponent = roleInfo.icon ? LucideIcons[roleInfo.icon] : null;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        roleInfo.bgColor,
        roleInfo.textColor,
        "font-medium border-transparent",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
      {roleInfo.name}
    </Badge>
  );

  // Wrapper avec Tooltip si demandé
  if (showTooltip) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>{roleInfo.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}

/**
 * Affiche le badge du rôle principal d'un utilisateur
 */
export function PrimaryRoleBadge({ roles = [], ...props }) {
  if (!roles || roles.length === 0) return null;

  // Définition de la priorité des rôles
  const rolePriority = [
    "ROLE_ADMIN",
    "ROLE_MANAGER",
    "ROLE_WAREHOUSE_OPERATOR",
    "ROLE_COOK",
    "ROLE_SERVER",
    "ROLE_CASHIER",
    "ROLE_USER",
  ];

  // Trouver le rôle de plus haute priorité
  let primaryRole = null;
  for (const priorityRole of rolePriority) {
    if (roles.includes(priorityRole)) {
      primaryRole = priorityRole;
      break;
    }
  }

  // Si aucun rôle prioritaire trouvé, prendre le premier de la liste
  if (!primaryRole && roles.length > 0) {
    primaryRole = roles[0];
  }

  return primaryRole ? <RoleBadge roleId={primaryRole} {...props} /> : null;
}
