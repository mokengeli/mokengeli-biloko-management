// src/components/layout/Topbar.js
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import userService from "@/services/userService";

export default function Topbar() {
  const { user, logout, isLoggingOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(false);

  // Récupérer le nom du restaurant à partir du code
  useEffect(() => {
    const fetchTenantName = async () => {
      if (user?.tenantCode) {
        setLoading(true);
        try {
          const tenantData = await userService.getTenantByCode(user.tenantCode);
          setTenantName(tenantData.name);
        } catch (error) {
          console.error("Error fetching tenant name:", error);
          // En cas d'erreur, on utilise le code comme fallback
          setTenantName(user.tenantCode);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTenantName();
  }, [user]);

  // Détecter le défilement pour ajouter une ombre à la barre supérieure
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Gestionnaire pour la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 right-0 left-0 md:left-64 h-16 px-4 flex items-center justify-between z-10 bg-white ${
        scrolled ? "shadow-md" : ""
      } transition-shadow`}
    >
      <div className="flex items-center">
        <Sidebar isMobile={true} />
      </div>

      <div className="flex items-center">
        <div className="mr-6 hidden md:block text-center">
          <h3 className="text-lg font-semibold">
            {loading ? "Chargement..." : tenantName || "Restaurant"}
          </h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.postName || "Utilisateur"}
                </p>
              </div>
              <Avatar className="cursor-pointer transition-transform hover:scale-105">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(`${user?.firstName} ${user?.lastName}`)}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => (window.location.href = "/not-found")}
            >
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (window.location.href = "/not-found")}
            >
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-500"
            >
              {isLoggingOut ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-red-500 rounded-full border-t-transparent"></div>
                  Déconnexion...
                </div>
              ) : (
                "Déconnexion"
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
