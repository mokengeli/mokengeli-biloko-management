// src/app/auth/login/page.js (partie modifiée)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const router = useRouter();

  // Si l'utilisateur est déjà authentifié, rediriger vers le dashboard
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Effacer les erreurs lorsque l'utilisateur modifie les champs
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [username, password, clearError, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(username, password);
      // Si pas d'erreur, la redirection est gérée dans le hook useAuth

      // Solution de secours: forcer la redirection après un court délai
      if (!error && result) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }
    } catch (err) {
      console.error("Login error in component:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Mokengeli Biloko
            </CardTitle>
            <CardDescription className="text-center">
              Connectez-vous pour accéder à la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Nom d'utilisateur
                  </label>
                  <Input
                    id="username"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded bg-red-50 text-red-500 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                        Connexion en cours...
                      </div>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500">
            Plateforme de gestion pour restaurants multi-enseignes
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
