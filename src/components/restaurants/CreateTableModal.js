// src/components/restaurants/CreateTableModal.js
"use client";

import { useState } from "react";
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
import orderService from "@/services/orderService";
import { Info, Loader2 } from "lucide-react";

export default function CreateTableModal({ isOpen, onClose, tenantCode, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Formulaire avec validation
    const form = useForm({
        defaultValues: {
            name: "",
        },
        mode: "onChange"
    });

    // Soumettre le formulaire
    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const tableData = {
                name: data.name,
                tenantCode: tenantCode,
            };

            const response = await orderService.createTable(tableData);
            toast.success(`La table "${data.name}" a été créée avec succès`);

            if (onSuccess) {
                onSuccess(response);
            }

            form.reset();
            onClose();
        } catch (err) {
            console.error("Error creating table:", err);
            const errorMessage = err.response?.data?.message || "Erreur lors de la création de la table";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Fermer la modal et réinitialiser les états
    const handleClose = () => {
        if (!loading) {
            setError(null);
            form.reset();
            if (onClose) onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter une table</DialogTitle>
                    <DialogDescription>
                        Créez une nouvelle table pour le plan de salle.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{
                                required: "Le nom de la table est requis",
                                minLength: {
                                    value: 1,
                                    message: "Le nom doit contenir au moins 1 caractère"
                                },
                                maxLength: {
                                    value: 50,
                                    message: "Le nom ne peut pas dépasser 50 caractères"
                                }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom de la table *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Table 1, Terrasse, VIP..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Donnez un nom identifiable à cette table
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
                                    'Créer la table'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}