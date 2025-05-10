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
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./UserAvatar";
import { PrimaryRoleBadge } from "./RoleBadge";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  LogOut,
  ChevronDown,
  Building,
  Store,
  Coffee,
  Beer,
  Sofa,
  Crown,
} from "lucide-react";

/**
 * Menu contextuel pour l'utilisateur connecté
 */
export function UserMenu({ showSubscriptionBadge = false }) {
  const router = useRouter();
  const { user, isLoggingOut, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Si aucun utilisateur n'est connecté, ne rien afficher
  if (!user) return null;

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    router.push("/auth/logout");
    setOpen(false);
  };

  // Fonction pour naviguer vers une page
  const navigateTo = (path) => {
    router.push(path);
    setOpen(false);
  };

  // Fonction pour obtenir l'icône correspondant au type d'établissement
  const getEstablishmentIcon = () => {
    if (!user?.establishmentCode) return <Building className="h-4 w-4" />;

    switch (user.establishmentCode) {
      case "RESTAURANT":
        return <Store className="h-4 w-4" />;
      case "BAR":
        return <Beer className="h-4 w-4" />;
      case "LOUNGE":
        return <Sofa className="h-4 w-4" />;
      case "PLATFORM":
        return <Coffee className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  // Fonction pour obtenir le texte complet du type d'établissement
  const getEstablishmentType = () => {
    if (!user?.establishmentCode) return "Établissement";

    const types = {
      RESTAURANT: "Restaurant",
      BAR: "Bar",
      LOUNGE: "Lounge",
      PLATFORM: "Plateforme",
    };

    return types[user.establishmentCode] || "Établissement";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 h-auto py-1.5 hover:bg-primary/5"
        >
          <UserAvatar
            user={user}
            size="sm"
            showTooltip={false}
            showSubscriptionBadge={showSubscriptionBadge}
          />
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

          {/* Information sur le restaurant et le plan */}
          <div className="px-3 py-1.5 flex flex-col gap-2 mb-1 border-b">
            {/* Type d'établissement */}
            <div className="flex items-center gap-2">
              {getEstablishmentIcon()}
              <span className="text-xs text-muted-foreground">
                {getEstablishmentType()}:{" "}
                <span className="font-medium">
                  {user.tenantName || user.tenantCode}
                </span>
              </span>
            </div>

            {/* Plan de souscription */}
            {user.subscriptionCode && (
              <div className="flex items-center gap-2">
                {user.subscriptionCode === "PREMIUM" ? (
                  <Crown className="h-4 w-4 text-amber-500" />
                ) : (
                  <Crown className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-xs text-muted-foreground">
                  Plan:{" "}
                  <span
                    className={`font-medium ${user.subscriptionCode === "PREMIUM"
                        ? "text-amber-500"
                        : ""
                      }`}
                  >
                    {user.subscriptionCode === "PREMIUM"
                      ? "Premium"
                      : "Starter"}
                  </span>
                </span>
              </div>
            )}
          </div>

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
