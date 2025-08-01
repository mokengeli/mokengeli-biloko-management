// src/components/profile/PinManagementSection.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Info,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import userService from "@/services/userService";
import { validatePin, generateRandomPin, maskPin } from "@/lib/pinValidation";

export function PinManagementSection({ user, isOwnProfile = true }) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasPinSet, setHasPinSet] = useState(false);

  // État pour la validation en temps réel
  const [pinValidationError, setPinValidationError] = useState(null);

  // Validation du nouveau PIN en temps réel
  useEffect(() => {
    if (newPin) {
      const error = validatePin(newPin);
      setPinValidationError(error);
    } else {
      setPinValidationError(null);
    }
  }, [newPin]);

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    // Si c'est son propre profil et qu'il a déjà un PIN, il faut le PIN actuel
    if (isOwnProfile && hasPinSet && !currentPin) return false;

    // Le nouveau PIN doit être valide
    if (!newPin || pinValidationError) return false;

    // Les PINs doivent correspondre
    if (newPin !== confirmPin) return false;

    return true;
  };

  // Générer un PIN aléatoire
  const handleGeneratePin = () => {
    const generated = generateRandomPin();
    setNewPin(generated);
    setConfirmPin(generated);
    setShowNewPin(true);
    toast.info(`PIN généré : ${generated}`);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setError(null);
    setPinValidationError(null);
    setShowCurrentPin(false);
    setShowNewPin(false);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Déterminer si on modifie le PIN d'un autre utilisateur
      const targetEmployeeNumber = !isOwnProfile ? user.employeeNumber : null;

      await userService.updatePin(
        hasPinSet && isOwnProfile ? currentPin : null,
        newPin,
        targetEmployeeNumber
      );

      toast.success(
        isOwnProfile
          ? "Votre PIN a été mis à jour avec succès"
          : `Le PIN de ${user.firstName} ${user.lastName} a été mis à jour`
      );

      setHasPinSet(true);
      resetForm();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Une erreur s'est produite lors de la mise à jour du PIN";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isOwnProfile
            ? "Gérer votre PIN de validation"
            : `Gérer le PIN de ${user.firstName} ${user.lastName}`}
        </CardTitle>
        <CardDescription>
          Le PIN est utilisé pour valider des opérations sensibles comme la
          fermeture de commandes avec dette.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <Alert variant="outline" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Le PIN doit contenir exactement 4 chiffres, ne pas être une
              séquence (1234, 4321) ni une répétition (1111).
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {/* PIN actuel - seulement pour son propre profil et si un PIN existe */}
            {isOwnProfile && hasPinSet && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="current-pin">PIN actuel</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                  >
                    {showCurrentPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Input
                  id="current-pin"
                  type={showCurrentPin ? "text" : "password"}
                  value={currentPin}
                  onChange={(e) =>
                    setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="••••"
                  maxLength={4}
                  required={isOwnProfile && hasPinSet}
                />
              </div>
            )}

            {/* Nouveau PIN */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-pin">
                  {hasPinSet ? "Nouveau PIN" : "Définir un PIN"}
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                  >
                    {showNewPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleGeneratePin}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Générer
                  </Button>
                </div>
              </div>
              <Input
                id="new-pin"
                type={showNewPin ? "text" : "password"}
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="••••"
                maxLength={4}
                required
              />
              {pinValidationError && newPin && (
                <p className="text-sm text-red-600 mt-1">
                  {pinValidationError}
                </p>
              )}
            </div>

            {/* Confirmation du PIN */}
            <div className="space-y-1">
              <Label htmlFor="confirm-pin">Confirmer le PIN</Label>
              <Input
                id="confirm-pin"
                type={showNewPin ? "text" : "password"}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="••••"
                maxLength={4}
                required
              />
              {confirmPin && newPin !== confirmPin && (
                <p className="text-sm text-red-600 mt-1">
                  Les PINs ne correspondent pas
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!isFormValid() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {hasPinSet ? "Mettre à jour le PIN" : "Définir le PIN"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
