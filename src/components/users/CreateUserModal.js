// src/components/users/CreateUserModal.js
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import authService from "@/services/authService";
import userService from "@/services/userService";
import {
  Info,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function CreateUserModal({
  isOpen,
  onClose,
  tenantCode,
  onSuccess,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authorizedRoles, setAuthorizedRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState(null);

  // Formulaire avec validation
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      postName: "",
      userName: "",
      email: "",
      tenantCode: tenantCode || user?.tenantCode || "",
      role: "",
      password: "",
    },
    mode: "onChange",
  });

  // Charger les rôles autorisés
  useEffect(() => {
    if (isOpen) {
      const loadRoles = async () => {
        setRolesLoading(true);
        try {
          const roles = await userService.getAuthorizedRolesByUserProfile();
          setAuthorizedRoles(roles || []);

          // Si un seul rôle est disponible, le sélectionner par défaut
          if (roles && roles.length === 1) {
            form.setValue("role", roles[0]);
          }
        } catch (err) {
          console.error("Error loading roles:", err);
          setError("Impossible de charger les rôles disponibles");
          toast.error("Erreur lors du chargement des rôles");
        } finally {
          setRolesLoading(false);
        }
      };

      loadRoles();

      // Réinitialiser le formulaire avec le code du restaurant actuel
      form.reset({
        firstName: "",
        lastName: "",
        postName: "",
        userName: "",
        email: "",
        tenantCode: tenantCode,
        role: "",
        password: generateTemporaryPassword(), // Générer un mot de passe par défaut
      });

      // Réinitialiser les états
      setError(null);
      setCreatedUser(null);
      setUsernameAvailable(null);
      setUsernameError(null);
    }
  }, [isOpen, tenantCode, form, user]);

  // Vérifier la disponibilité du nom d'utilisateur
  useEffect(() => {
    const checkUsername = async () => {
      const username = form.watch("userName");

      // Ne pas vérifier si le nom d'utilisateur est vide ou trop court
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        setUsernameError(null);
        return;
      }

      setCheckingUsername(true);
      setUsernameError(null);

      try {
        const isAvailable = await userService.checkUsernameAvailability(
          username
        );
        setUsernameAvailable(isAvailable);

        if (!isAvailable) {
          setUsernameError("Ce nom d'utilisateur est déjà pris");
        }
      } catch (err) {
        console.error("Error checking username:", err);
        setUsernameError("Erreur lors de la vérification");
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };

    // Debounce la vérification pour éviter trop d'appels API
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [form.watch("userName")]);

  // Générer un nom d'utilisateur basé sur le prénom et nom
  const generateUsername = () => {
    const firstName = form.getValues("firstName");
    const lastName = form.getValues("lastName");

    if (firstName && lastName) {
      // Format: prenom.nom (en minuscules, sans espaces)
      const baseUsername = `${firstName.toLowerCase().trim()}.${lastName
        .toLowerCase()
        .trim()}`;
      const cleanUsername = baseUsername
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9.-]/gi, "");
      form.setValue("userName", cleanUsername);
    }
  };

  // Générer un mot de passe temporaire sécurisé
  const generateTemporaryPassword = () => {
    const length = 10;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // S'assurer qu'il y a au moins une lettre majuscule, une minuscule, un chiffre et un caractère spécial
    password += "A"; // Majuscule
    password += "a"; // Minuscule
    password += "1"; // Chiffre
    password += "!"; // Caractère spécial

    // Compléter avec des caractères aléatoires
    for (let i = 4; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    // Mélanger tous les caractères
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  // Soumettre le formulaire
  const onSubmit = async (data) => {
    // Vérifier que le nom d'utilisateur est disponible
    if (usernameAvailable === false) {
      setError("Le nom d'utilisateur n'est pas disponible");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.registerUser(data);
      setCreatedUser(response);
      toast.success(
        `L'utilisateur ${data.firstName} ${data.lastName} a été créé avec succès`
      );

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Erreur lors de la création de l'utilisateur";
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
      setCreatedUser(null);
      setUsernameAvailable(null);
      setUsernameError(null);
      if (onClose) onClose();
    }
  };

  // Générer un nouvel employé et rester sur la modal
  const handleCreateAnother = () => {
    setCreatedUser(null);
    setUsernameAvailable(null);
    setUsernameError(null);
    form.reset({
      firstName: "",
      lastName: "",
      postName: "",
      userName: "",
      email: "",
      tenantCode: tenantCode,
      role: form.getValues("role"), // Garder le même rôle
      password: generateTemporaryPassword(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {createdUser
              ? "Utilisateur créé avec succès"
              : "Créer un nouvel utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {createdUser
              ? "L'utilisateur a été créé avec succès. Veuillez communiquer les identifiants."
              : "Remplissez les informations nécessaires pour créer un nouvel utilisateur."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {createdUser ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-green-800 mb-2">
                Informations de connexion
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Nom d'utilisateur :</p>
                  <p className="font-medium text-lg">{createdUser.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Numéro d'employé :</p>
                  <p className="font-medium text-lg">
                    {createdUser.employeeNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mot de passe :</p>
                  <p className="font-medium text-lg">
                    {form.getValues("password")}
                  </p>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-4">
                Veuillez communiquer ces informations à l'utilisateur pour qu'il
                puisse se connecter.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCreateAnother}
              >
                Créer un autre utilisateur
              </Button>
              <Button type="button" onClick={handleClose}>
                Fermer
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  rules={{
                    required: "Le prénom est requis",
                    minLength: {
                      value: 2,
                      message: "Le prénom doit contenir au moins 2 caractères",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jean"
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            generateUsername();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  rules={{
                    required: "Le nom est requis",
                    minLength: {
                      value: 2,
                      message: "Le nom doit contenir au moins 2 caractères",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dupont"
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            generateUsername();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="postName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post-Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Post-Nom (optionnel)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Le deuxième nom de l'utilisateur
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userName"
                rules={{
                  required: "Le nom d'utilisateur est requis",
                  minLength: {
                    value: 3,
                    message:
                      "Le nom d'utilisateur doit contenir au moins 3 caractères",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9.-]+$/,
                    message:
                      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points et tirets",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur *</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="jean.dupont"
                          {...field}
                          className={
                            usernameAvailable === true
                              ? "pr-10 border-green-500"
                              : usernameAvailable === false
                              ? "pr-10 border-red-500"
                              : "pr-10"
                          }
                        />
                      </FormControl>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {checkingUsername && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {!checkingUsername && usernameAvailable === true && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {!checkingUsername && usernameAvailable === false && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <FormDescription>
                      {checkingUsername ? (
                        "Vérification en cours..."
                      ) : usernameAvailable === true ? (
                        <span className="text-green-600">
                          Ce nom d'utilisateur est disponible
                        </span>
                      ) : usernameAvailable === false ? (
                        <span className="text-red-600">
                          {usernameError ||
                            "Ce nom d'utilisateur est déjà pris"}
                        </span>
                      ) : (
                        "Nom d'utilisateur pour la connexion"
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@example.com (optionnel)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      L'adresse email de l'utilisateur (optionnel)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenantCode"
                rules={{ required: "Le restaurant est requis" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant *</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                rules={{ required: "Le rôle est requis" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={rolesLoading || authorizedRoles.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {authorizedRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Le rôle définit les permissions de l'utilisateur
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Le mot de passe est requis",
                  minLength: {
                    value: 8,
                    message:
                      "Le mot de passe doit contenir au moins 8 caractères",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Mot de passe"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          field.onChange(generateTemporaryPassword());
                        }}
                      >
                        Générer
                      </Button>
                    </div>
                    <FormDescription>
                      Doit contenir au moins 8 caractères
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
                  disabled={
                    loading ||
                    rolesLoading ||
                    checkingUsername ||
                    usernameAvailable === false ||
                    !form.formState.isValid
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer l'utilisateur"
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
