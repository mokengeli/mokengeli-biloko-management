// src/lib/redirectUtils.js
import { getPrimaryRole } from "./roles";

/**
 * Détermine la route de redirection appropriée selon les rôles de l'utilisateur
 * @param {Array<string>} userRoles - Liste des rôles de l'utilisateur
 * @returns {string} Chemin de redirection
 */
export function getRedirectPathByRole(userRoles) {
  if (!userRoles || userRoles.length === 0) {
    // Fallback vers dashboard si pas de rôles définis
    return "/dashboard";
  }

  const primaryRole = getPrimaryRole(userRoles);
  
  // ADMIN et MANAGER vont au dashboard
  if (primaryRole && (primaryRole.id === 'ROLE_ADMIN' || primaryRole.id === 'ROLE_MANAGER')) {
    return "/dashboard";
  }
  
  // Tous les autres rôles (USER, WAREHOUSE_OPERATOR, SERVER, COOK) vont au profil
  return "/profile";
}