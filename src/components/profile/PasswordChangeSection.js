// src/components/profile/PasswordChangeSection.js
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Eye, EyeOff, LockKeyhole, AlertCircle } from "lucide-react";
import authService from "@/services/authService";

export function PasswordChangeSection() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // État pour la validation du mot de passe
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Validation du mot de passe en temps réel
  const validatePassword = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  // Mettre à jour et valider le nouveau mot de passe
  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    validatePassword(password);
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    return (
      oldPassword.length > 0 &&
      newPassword.length >= 8 &&
      newPassword === confirmPassword &&
      passwordValidation.minLength &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasNumber &&
      passwordValidation.hasSpecial
    );
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setPasswordValidation({
      minLength: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecial: false,
    });
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
      await authService.changePassword(oldPassword, newPassword);
      toast.success("Votre mot de passe a été mis à jour avec succès");
      resetForm();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Une erreur s'est produite lors de la modification du mot de passe";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Alert variant="outline" className="mb-4">
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription>
          Votre mot de passe doit contenir au moins 8 caractères, incluant une
          lettre majuscule, un chiffre et un caractère spécial.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Input
            id="current-password"
            type={showPassword ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Entrez votre mot de passe actuel"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="new-password">Nouveau mot de passe</Label>
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={handleNewPasswordChange}
            placeholder="Entrez votre nouveau mot de passe"
            required
          />

          {/* Indicateurs de validation du mot de passe */}
          {newPassword.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div
                className={`flex items-center gap-1 ${
                  passwordValidation.minLength
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    passwordValidation.minLength ? "bg-green-600" : "bg-red-600"
                  }`}
                ></div>
                Au moins 8 caractères
              </div>
              <div
                className={`flex items-center gap-1 ${
                  passwordValidation.hasUppercase
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    passwordValidation.hasUppercase
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                ></div>
                Une lettre majuscule
              </div>
              <div
                className={`flex items-center gap-1 ${
                  passwordValidation.hasNumber
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    passwordValidation.hasNumber ? "bg-green-600" : "bg-red-600"
                  }`}
                ></div>
                Un chiffre
              </div>
              <div
                className={`flex items-center gap-1 ${
                  passwordValidation.hasSpecial
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    passwordValidation.hasSpecial
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                ></div>
                Un caractère spécial
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmez votre nouveau mot de passe"
            required
          />

          {/* Message d'erreur si les mots de passe ne correspondent pas */}
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <p className="text-sm text-red-600 mt-1">
              Les mots de passe ne correspondent pas
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
              <LockKeyhole className="mr-2 h-4 w-4" />
              Mettre à jour le mot de passe
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
