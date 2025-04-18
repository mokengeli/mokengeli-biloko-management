// src/components/ui/use-toast.js
// Ce hook est une version simplifiée d'un système de toast pour notre application
import { useState, useCallback, createContext, useContext } from "react";

// Créer un contexte pour les toasts
const ToastContext = createContext({
  toast: () => {},
  toasts: [],
  removeToast: () => {},
});

// Provider pour le contexte de toast
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Fonction pour ajouter un toast
  const toast = useCallback(
    ({ title, description, variant = "default", duration = 5000 }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = {
        id,
        title,
        description,
        variant,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Supprimer automatiquement le toast après la durée spécifiée
      setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    []
  );

  // Fonction pour supprimer un toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      {/* Toasts UI */}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-xs w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border shadow-lg p-4 animate-in slide-in-from-right-5 ${
              toast.variant === "destructive"
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-white border-gray-200 text-gray-800"
            }`}
          >
            {toast.title && (
              <div className="font-medium mb-1">{toast.title}</div>
            )}
            {toast.description && <div>{toast.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook pour utiliser le toast
export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
