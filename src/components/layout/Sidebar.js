"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// Import des icônes (vous devrez les installer)
import {
  LayoutDashboard,
  Store,
  Menu as MenuIcon,
  Users,
  Package,
  Utensils,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    submenu: false,
  },
  {
    title: "Restaurants",
    href: "/restaurants",
    icon: <Store className="w-5 h-5" />,
    submenu: false,
  },
  {
    title: "Inventaire",
    href: "/inventory",
    icon: <Package className="w-5 h-5" />,
    submenu: true,
    submenuItems: [
      { title: "Catégories", href: "/inventory/categories" },
      { title: "Produits", href: "/inventory/products" },
    ],
  },
  {
    title: "Menu",
    href: "/menu",
    icon: <Utensils className="w-5 h-5" />,
    submenu: true,
    submenuItems: [
      { title: "Catégories", href: "/menu/categories" },
      { title: "Plats", href: "/menu/dishes" },
    ],
  },
  {
    title: "Commandes",
    href: "/orders",
    icon: <ShoppingCart className="w-5 h-5" />,
    submenu: false,
  },
  {
    title: "Utilisateurs",
    href: "/users",
    icon: <Users className="w-5 h-5" />,
    submenu: false,
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
    submenu: false,
  },
];

export default function Sidebar({ isMobile = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      // La redirection est gérée par le service d'authentification
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  const isActive = (path) =>
    pathname === path || pathname.startsWith(path + "/");

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Mokengeli Biloko</h2>
        <p className="text-xs text-gray-500 mt-1">Gestion de restaurants</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <div key={item.href} className="mb-1">
            {item.submenu ? (
              <div>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={`w-full justify-between ${
                    isActive(item.href) ? "bg-primary/10" : ""
                  }`}
                  onClick={() => toggleSubmenu(index)}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </div>
                  {openSubmenu === index ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {openSubmenu === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-6 mt-1 space-y-1"
                  >
                    {item.submenuItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={
                          // Correction des URLs pour les pages d'inventaire et de menu
                          item.title === "Inventaire" &&
                          subItem.title === "Catégories"
                            ? "/inventory/categories"
                            : item.title === "Inventaire" &&
                              subItem.title === "Produits"
                            ? "/inventory/products"
                            : item.title === "Menu" &&
                              subItem.title === "Catégories"
                            ? "/menu/categories"
                            : "/not-found"
                        }
                        className={`block px-4 py-2 text-sm rounded-md ${
                          isActive(subItem.href)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                href={item.title === "Dashboard" ? item.href : "/not-found"}
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <div className="animate-spin h-4 w-4 mr-3 border-2 border-red-500 rounded-full border-t-transparent"></div>
              Déconnexion...
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Version mobile de la sidebar (avec le menu burger)
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <div className="sr-only">
            <SheetTitle>Menu de navigation</SheetTitle>
            <SheetDescription>
              Menu principal permettant d'accéder aux différentes
              fonctionnalités de l'application
            </SheetDescription>
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Version desktop de la sidebar
  return (
    <div className="hidden md:block w-64 h-screen fixed top-0 left-0 border-r">
      <SidebarContent />
    </div>
  );
}
