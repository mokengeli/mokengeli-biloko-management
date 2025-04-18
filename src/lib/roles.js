// src/lib/roles.js
/**
 * Définition des rôles du système avec leurs descriptions et propriétés d'affichage
 */
export const ROLES = {
  ROLE_ADMIN: {
    id: "ROLE_ADMIN",
    name: "Administrateur",
    description: "Administrateur du système",
    color: "purple", // Couleur du badge
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    icon: "Shield", // Nom de l'icône Lucide à utiliser
  },
  ROLE_USER: {
    id: "ROLE_USER",
    name: "Utilisateur",
    description: "Utilisateur standard",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: "User",
  },
  ROLE_MANAGER: {
    id: "ROLE_MANAGER",
    name: "Manager",
    description: "Responsable du lounge/restaurant",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    icon: "Building",
  },
  ROLE_WAREHOUSE_OPERATOR: {
    id: "ROLE_WAREHOUSE_OPERATOR",
    name: "Inventaire",
    description: "Chargé d'inventaire",
    color: "amber",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
    icon: "Package",
  },
  ROLE_SERVER: {
    id: "ROLE_SERVER",
    name: "Serveur",
    description: "Serveur dans le lounge/restaurant",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: "Utensils",
  },
  ROLE_COOK: {
    id: "ROLE_COOK",
    name: "Cuisinier",
    description: "Cuisinier",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    icon: "ChefHat",
  },
};

/**
 * Obtient les informations d'un rôle à partir de son identifiant
 * @param {string} roleId - Identifiant du rôle (ex: ROLE_ADMIN)
 * @returns {Object|null} Informations sur le rôle ou null si non trouvé
 */
export function getRoleInfo(roleId) {
  return ROLES[roleId] || null;
}

/**
 * Obtient le rôle principal d'un utilisateur (le plus important selon une hiérarchie prédéfinie)
 * @param {Array<string>} userRoles - Liste des rôles de l'utilisateur
 * @returns {Object|null} Informations sur le rôle principal ou null
 */
export function getPrimaryRole(userRoles) {
  if (!userRoles || userRoles.length === 0) return null;

  // Définition de la priorité des rôles (ordre d'importance)
  const rolePriority = [
    "ROLE_ADMIN",
    "ROLE_MANAGER",
    "ROLE_WAREHOUSE_OPERATOR",
    "ROLE_COOK",
    "ROLE_SERVER",
    "ROLE_USER",
  ];

  // Trouver le rôle de plus haute priorité
  for (const priorityRole of rolePriority) {
    if (userRoles.includes(priorityRole)) {
      return getRoleInfo(priorityRole);
    }
  }

  // Si aucun rôle prioritaire n'est trouvé, retourner le premier rôle disponible
  return getRoleInfo(userRoles[0]);
}

/**
 * Génère une couleur d'arrière-plan pour l'avatar basée sur le rôle principal
 * @param {Array<string>} userRoles - Liste des rôles de l'utilisateur
 * @returns {string} Classe CSS pour la couleur d'arrière-plan
 */
export function getAvatarColorClass(userRoles) {
  const primaryRole = getPrimaryRole(userRoles);

  if (!primaryRole) return "bg-gray-200";

  // Map des couleurs d'avatar par rôle
  const colorMap = {
    ROLE_ADMIN: "bg-purple-500",
    ROLE_MANAGER: "bg-blue-500",
    ROLE_WAREHOUSE_OPERATOR: "bg-amber-500",
    ROLE_COOK: "bg-red-500",
    ROLE_SERVER: "bg-green-500",
    ROLE_USER: "bg-gray-500",
  };

  return colorMap[primaryRole.id] || "bg-gray-500";
}
