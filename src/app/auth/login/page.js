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
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const router = useRouter();

  // Si l'utilisateur est déjà authentifié, rediriger vers le dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Vérifier si un message d'erreur a été stocké dans le localStorage après une redirection
  useEffect(() => {
    const storedError = localStorage.getItem("auth_error");
    if (storedError) {
      setFormError(storedError);
      // Effacer le message d'erreur du localStorage après l'avoir récupéré
      localStorage.removeItem("auth_error");
    }
  }, []);

  // Synchroniser l'erreur du store Redux avec l'état local
  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  // Effacer les erreurs seulement lorsque les valeurs changent
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (formError) setFormError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (formError) setFormError(null);
  };

  // Synchroniser l'état local avec l'état global du chargement
  useEffect(() => {
    setIsSubmitting(loading);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation côté client
    if (!username.trim()) {
      setFormError("Veuillez entrer votre nom d'utilisateur");
      return;
    }

    if (!password.trim()) {
      setFormError("Veuillez entrer votre mot de passe");
      return;
    }

    // Éviter les soumissions multiples
    if (isSubmitting) return;

    try {
      // Effacer les erreurs précédentes
      setFormError(null);
      if (error) clearError();

      // Activer immédiatement l'état de soumission pour un feedback visuel instantané
      setIsSubmitting(true);

      // Appel au service de login
      await login(username, password);

      // La redirection est gérée par l'effet qui surveille isAuthenticated
    } catch (err) {
      console.error("Login error in component:", err);

      // Personnaliser les messages d'erreur pour l'utilisateur
      const errorMessage =
        err.message || "Une erreur est survenue lors de la connexion";

      // Traduction des erreurs techniques en messages utilisateur
      if (errorMessage.includes("Network Error")) {
        setFormError(
          "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet."
        );
      } else if (errorMessage.includes("401")) {
        setFormError("Nom d'utilisateur ou mot de passe incorrect");
      } else if (errorMessage.includes("404")) {
        setFormError(
          "Le service d'authentification est indisponible. Veuillez réessayer plus tard."
        );
      } else if (errorMessage.includes("429")) {
        setFormError(
          "Trop de tentatives de connexion. Veuillez réessayer plus tard."
        );
      } else {
        setFormError(errorMessage);
      }

      // Désactiver l'état de soumission
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
                    onChange={handleUsernameChange}
                    required
                    disabled={isSubmitting}
                    aria-invalid={formError && !username ? "true" : "false"}
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
                    onChange={handlePasswordChange}
                    required
                    disabled={isSubmitting}
                    aria-invalid={formError && !password ? "true" : "false"}
                  />
                </div>

                {/* Message d'erreur conditionnel sans réservation d'espace */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  className="mt-4" // Espacement fixe au lieu d'un espace conditionnel
                >
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
