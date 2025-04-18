// src/components/common/UserMenu.js
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import { PrimaryRoleBadge } from "./RoleBadge";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, ChevronDown, Building } from "lucide-react";

/**
 * Menu contextuel pour l'utilisateur connecté
 */
export function UserMenu() {
  const router = useRouter();
  const { user, isLoggingOut, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Si aucun utilisateur n'est connecté, ne rien afficher
  if (!user) return null;

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  // Fonction pour naviguer vers une page
  const navigateTo = (path) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 h-auto py-1.5 hover:bg-primary/5"
        >
          <UserAvatar user={user} size="sm" showTooltip={false} />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium leading-none">
              {user.firstName} {user.lastName.charAt(0)}.
            </span>
            <span className="text-xs text-muted-foreground">
              {user.postName || user.tenantCode || ""}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" sideOffset={8} asChild>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {/* En-tête du menu avec les informations utilisateur */}
          <div className="p-3 pb-2 flex items-start gap-3">
            <UserAvatar user={user} size="lg" />
            <div className="flex flex-col">
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {user.email}
              </span>
              <div className="mt-1.5">
                <PrimaryRoleBadge roles={user.roles} size="sm" />
              </div>
            </div>
          </div>

          {/* Information sur le restaurant */}
          {user.tenantCode && (
            <div className="px-3 py-1.5 flex items-center gap-2 mb-1 border-b">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Restaurant:{" "}
                <span className="font-medium">{user.tenantCode}</span>
              </span>
            </div>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => navigateTo("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                <span>Déconnexion en cours...</span>
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </>
            )}
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
