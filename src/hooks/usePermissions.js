// src/hooks/usePermissions.js
import { useSelector } from "react-redux";

export const usePermissions = () => {
  const { roles, permissions } = useSelector((state) => state.auth);

  const hasRole = (role) => {
    return roles.includes(role);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions) => {
    return requiredPermissions.some((permission) =>
      permissions.includes(permission)
    );
  };

  const hasAllPermissions = (requiredPermissions) => {
    return requiredPermissions.every((permission) =>
      permissions.includes(permission)
    );
  };

  const isAdmin = () => {
    return roles.includes("ROLE_ADMIN");
  };

  return {
    roles,
    permissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
  };
};

export default usePermissions;
