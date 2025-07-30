// src/components/inventory/RestaurantSelector.js
"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import userService from "@/services/userService";

// Cache statique pour stocker les restaurants
let restaurantsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function RestaurantSelector({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref pour éviter les doubles appels
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      // Éviter les appels multiples simultanés
      if (fetchingRef.current) return;

      // Vérifier le cache
      if (restaurantsCache && cacheTimestamp) {
        const now = Date.now();
        if (now - cacheTimestamp < CACHE_DURATION) {
          //console.log("Using cached restaurants data");
          setRestaurants(restaurantsCache);
          return;
        }
      }

      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const data = await userService.getAllTenants();

        if (!mountedRef.current) return;

        // Mettre en cache
        restaurantsCache = data;
        cacheTimestamp = Date.now();

        setRestaurants(data);
      } catch (err) {
        if (!mountedRef.current) return;

        console.error("Error fetching restaurants:", err);
        setError("Erreur lors du chargement des restaurants");

        // Si erreur mais cache disponible, utiliser le cache
        if (restaurantsCache) {
          setRestaurants(restaurantsCache);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          fetchingRef.current = false;
        }
      }
    };

    fetchRestaurants();
  }, []); // Tableau de dépendances vide = appelé une seule fois

  // Fonction pour forcer le rechargement (si nécessaire)
  const refreshRestaurants = async () => {
    restaurantsCache = null;
    cacheTimestamp = null;
    fetchingRef.current = false;

    // Déclencher un nouveau chargement
    const data = await userService.getAllTenants();
    restaurantsCache = data;
    cacheTimestamp = Date.now();
    setRestaurants(data);
  };

  // Trouver le restaurant sélectionné
  const selectedRestaurant = restaurants.find((r) => r.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[300px] justify-between", className)}
          disabled={loading}
        >
          {loading ? (
            <span className="text-muted-foreground">Chargement...</span>
          ) : selectedRestaurant ? (
            <span className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              {selectedRestaurant.name}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Sélectionner un restaurant...
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un restaurant..." />
          <CommandEmpty>Aucun restaurant trouvé.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {restaurants.map((restaurant) => (
              <CommandItem
                key={restaurant.code}
                value={restaurant.name}
                onSelect={() => {
                  onChange(restaurant.code);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === restaurant.code ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1">
                  <div className="font-medium">{restaurant.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {restaurant.code}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
