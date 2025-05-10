// src/components/layout/Sidebar.js
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Package,
  Users,
  ChevronDown,
  ChevronUp,
  LogOut,
  Home,
  X,
  Utensils,
  Store
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import usePermissions from "@/hooks/usePermissions";

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { hasPermission } = usePermissions();
  const [openMenus, setOpenMenus] = useState({});

  const isAdmin = user && user.roles && user.roles.includes("ROLE_ADMIN");
  const canViewInventory = hasPermission("VIEW_INVENTORY") || isAdmin;
  const canViewUsers = hasPermission("VIEW_USERS") || isAdmin;
  const canViewTenants = hasPermission("VIEW_TENANTS") || isAdmin;

  // Définir les menus à ouvrir en fonction de la page actuelle
  useEffect(() => {
    if (pathname) {
      if (pathname.startsWith("/inventory")) {
        setOpenMenus((prev) => ({ ...prev, inventory: true }));
      }
      if (pathname.startsWith("/menu")) {
        setOpenMenus((prev) => ({ ...prev, menu: true }));
      }
    }
  }, [pathname]);

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    router.push("/auth/logout");
  };

  // Fonction pour basculer l'état d'un menu
  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // Fonction pour vérifier si un lien est actif
  const isActive = (path) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return path !== "/dashboard" && pathname.startsWith(path);
  };

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex items-center justify-between p-4">
        <Link href="/dashboard">
          <h1 className="text-xl font-semibold tracking-tight">
            Mokengeli Biloko
          </h1>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <nav className="flex flex-col gap-2">
          {/* 1. Tableau de bord */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:bg-accent",
              isActive("/dashboard") && "bg-primary text-primary-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span>Tableau de bord</span>
          </Link>

          {/* 2. Restaurants */}
          {canViewTenants && (
            <Link
              href="/restaurants"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                isActive("/restaurants") && "bg-primary text-primary-foreground"
              )}
            >
              <Store className="h-5 w-5" />
              <span>Restaurants</span>
            </Link>
          )}

          {/* 3. Utilisateurs */}
          {canViewUsers && (
            <Link
              href="/users"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                isActive("/users") && "bg-primary text-primary-foreground"
              )}
            >
              <Users className="h-5 w-5" />
              <span>Utilisateurs</span>
            </Link>
          )}

          {/* 4. Inventaire */}
          {canViewInventory && (
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2",
                  openMenus.inventory && "font-medium"
                )}
                onClick={() => toggleMenu("inventory")}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <span>Inventaire</span>
                </div>
                {openMenus.inventory ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {openMenus.inventory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4 mt-1 flex flex-col space-y-1"
                >
                  <Link
                    href="/inventory/categories"
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm hover:bg-accent",
                      isActive("/inventory/categories") &&
                      "bg-primary/10 font-medium"
                    )}
                  >
                    Catégories
                  </Link>
                  <Link
                    href="/inventory/products"
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm hover:bg-accent",
                      isActive("/inventory/products") &&
                      "bg-primary/10 font-medium"
                    )}
                  >
                    Produits
                  </Link>
                </motion.div>
              )}
            </div>
          )}

          {/* 5. Menu */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-between px-3 py-2",
                openMenus.menu && "font-medium"
              )}
              onClick={() => toggleMenu("menu")}
            >
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                <span>Menu</span>
              </div>
              {openMenus.menu ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {openMenus.menu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 mt-1 flex flex-col space-y-1"
              >
                <Link
                  href="/menu/categories"
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm hover:bg-accent",
                    isActive("/menu/categories") && "bg-primary/10 font-medium"
                  )}
                >
                  Catégories
                </Link>
                <Link
                  href="/menu/dishes"
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm hover:bg-accent",
                    isActive("/menu/dishes") && "bg-primary/10 font-medium"
                  )}
                >
                  Plats
                </Link>
              </motion.div>
            )}
          </div>
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}