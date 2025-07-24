// src/components/tenants/CreateTenantModal.js
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import userService from "@/services/userService";
import { Info, Loader2, Store } from "lucide-react";

export default function CreateTenantModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdTenant, setCreatedTenant] = useState(null);

  // Formulaire avec validation
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onChange",
  });

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCreatedTenant(null);
      form.reset({
        name: "",
        email: "",
      });
    }
  }, [isOpen, form]);

  // Soumettre le formulaire
  const onSubmit = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);

      try {
        const response = await userService.createTenant(data);
        setCreatedTenant(response);
        toast.success(`Le restaurant "${data.name}" a été créé avec succès`);

        if (onSuccess) {
          onSuccess(response);
        }
      } catch (err) {
        console.error("Error creating restaurant:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Erreur lors de la création du restaurant";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  // Fermer la modal et réinitialiser les états
  const handleClose = useCallback(() => {
    if (!loading) {
      if (onClose) onClose();
    }
  }, [loading, onClose]);

  // Créer un autre restaurant
  const handleCreateAnother = useCallback(() => {
    setCreatedTenant(null);
    form.reset({
      name: "",
      email: "",
    });
  }, [form]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {createdTenant
              ? "Restaurant créé avec succès"
              : "Créer un nouveau restaurant"}
          </DialogTitle>
          <DialogDescription>
            {createdTenant
              ? "Le restaurant a été créé avec succès."
              : "Remplissez les informations nécessaires pour créer un nouveau restaurant."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {createdTenant ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-green-800 mb-2">
                Restaurant créé
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Code:</p>
                  <p className="font-medium text-lg">{createdTenant.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nom:</p>
                  <p className="font-medium text-lg">{createdTenant.name}</p>
                </div>
                {createdTenant.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email:</p>
                    <p className="font-medium text-lg">{createdTenant.email}</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-green-600 mt-4">
                Vous pouvez maintenant ajouter des utilisateurs à ce restaurant.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCreateAnother}
              >
                Créer un autre restaurant
              </Button>
              <Button type="button" onClick={handleClose}>
                Fermer
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{
                  required: "Le nom est requis",
                  minLength: {
                    value: 2,
                    message: "Le nom doit contenir au moins 2 caractères",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du restaurant *</FormLabel>
                    <FormControl>
                      <Input placeholder="Restaurant Le Gourmand" {...field} />
                    </FormControl>
                    <FormDescription>Nom complet du restaurant</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "L'email est requis",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresse email invalide",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@restaurant.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Adresse email du restaurant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !form.formState.isValid}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Store className="mr-2 h-4 w-4" />
                      Créer le restaurant
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
