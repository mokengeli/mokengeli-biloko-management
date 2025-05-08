// src/components/layout/Topbar.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserMenu } from "../common/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import userService from "@/services/userService";
import { Menu, Building } from "lucide-react";

export default function Topbar({ onToggleSidebar }) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTenant, setActiveTenant] = useState(null);
  const [loading, setLoading] = useState(false);

  // Récupérer les informations du tenant actif
  useEffect(() => {
    if (user?.tenantCode) {
      setActiveTenant({
        code: user.tenantCode,
        name: user.tenantName || user.tenantCode,
      });
    }
  }, [user]);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>

      {/* Logo ou titre de la page centrale pour mobiles */}
      <div className="flex md:hidden items-center justify-center flex-1">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-semibold"
        >
          Mokengeli Biloko
        </motion.h1>
      </div>

      {/* Affichage du restaurant actif */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        {activeTenant && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-background/80"
          >
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{activeTenant.name}</span>
          </motion.div>
        )}
      </div>

      {/* Profil utilisateur */}
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  );
}
