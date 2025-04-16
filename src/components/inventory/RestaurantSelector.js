// src/components/inventory/RestaurantSelector.js
"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import userService from "@/services/userService";

export default function RestaurantSelector({ onChange, value }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, roles } = useAuth();
  const isAdmin = roles.includes("ROLE_ADMIN");

  useEffect(() => {
    // Si l'utilisateur n'est pas admin, pas besoin de charger les restaurants
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userService.getAllTenants();
        setRestaurants(data);

        // Si pas de restaurant sélectionné et qu'il y a des restaurants,
        // sélectionner automatiquement le premier
        if (!value && data.length > 0) {
          onChange(data[0].code);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError(
          err.message || "Erreur lors de la récupération des restaurants"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [isAdmin, onChange, value]);

  // Si l'utilisateur n'est pas admin, on n'affiche pas le sélecteur
  if (!isAdmin) return null;

  return (
    <div className="w-full max-w-xs">
      {error ? (
        <div className="text-sm text-red-500 mb-2">
          Erreur: Impossible de charger les restaurants
        </div>
      ) : null}

      <Select value={value || ""} onValueChange={onChange} disabled={loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionner un restaurant" />
        </SelectTrigger>
        <SelectContent>
          {restaurants.map((restaurant) => (
            <SelectItem key={restaurant.id} value={restaurant.code}>
              {restaurant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading && (
        <div className="text-sm text-gray-500 mt-2">
          Chargement des restaurants...
        </div>
      )}
    </div>
  );
}
