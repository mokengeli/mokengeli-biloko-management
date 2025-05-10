// src/app/auth/login/page.js 
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
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // État local pour le contrôle précis du bouton
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

  // Synchroniser l'état local avec l'état global
  useEffect(() => {
    setIsSubmitting(loading);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Éviter les soumissions multiples
    if (isSubmitting) return;

    try {
      // Activer immédiatement l'état de soumission pour un feedback visuel instantané
      setIsSubmitting(true);

      // Appel au service de login
      await login(username, password);

      // La redirection est gérée par l'effet qui surveille isAuthenticated
    } catch (err) {
      console.error("Login error in component:", err);
      // En cas d'erreur, désactiver l'état de soumission
      setIsSubmitting(false);
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded bg-red-50 text-red-500 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div whileTap={{ scale: isSubmitting ? 1 : 0.95 }}>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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