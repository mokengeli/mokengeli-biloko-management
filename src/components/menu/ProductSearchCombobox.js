// src/components/menu/ProductSearchCombobox.js
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import inventoryService from "@/services/inventoryService";

export function ProductSearchCombobox({
  tenantCode,
  value,
  onChange,
  disabled = false,
  placeholder = "Rechercher un produit...",
  className,
}) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [products, setProducts] = React.useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Références pour le debounce
  const searchTimeoutRef = React.useRef(null);

  // Charger le produit sélectionné si value change
  React.useEffect(() => {
    const loadSelectedProduct = async () => {
      if (
        value &&
        (!selectedProduct || selectedProduct.id !== parseInt(value))
      ) {
        try {
          const product = await inventoryService.getProductById(value);
          setSelectedProduct(product);
        } catch (error) {
          console.error("Error loading selected product:", error);
        }
      } else if (!value) {
        setSelectedProduct(null);
      }
    };

    loadSelectedProduct();
  }, [value, selectedProduct]);

  // Fonction de recherche avec debounce
  const searchProducts = React.useCallback(
    async (search) => {
      if (!tenantCode) return;

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Si la recherche est vide, ne pas chercher
      if (!search.trim()) {
        setProducts([]);
        setHasSearched(false);
        return;
      }

      // Debounce de 300ms
      searchTimeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          // Rechercher avec un nombre limité de résultats pour la performance
          const response = await inventoryService.getAllProducts(
            tenantCode,
            0,
            3, // Limiter à 20 résultats
            search
          );
          setProducts(response.content || []);
          setHasSearched(true);
        } catch (error) {
          console.error("Error searching products:", error);
          setProducts([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [tenantCode]
  );

  // Gérer le changement de recherche
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    searchProducts(value);
  };

  // Gérer la sélection d'un produit
  const handleSelect = (product) => {
    setSelectedProduct(product);
    onChange(product.id.toString());
    setOpen(false);
    setSearchTerm("");
    setProducts([]);
    setHasSearched(false);
  };

  // Nettoyer le timeout au démontage
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedProduct ? (
            <span className="truncate">
              {selectedProduct.name} ({selectedProduct.unitOfMeasure})
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Tapez pour rechercher un produit..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </div>

          <CommandList>
            {!searchTerm.trim() && !hasSearched ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Commencez à taper pour rechercher des produits
              </div>
            ) : loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Recherche en cours...
              </div>
            ) : products.length === 0 && hasSearched ? (
              <CommandEmpty>
                Aucun produit trouvé pour "{searchTerm}"
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id.toString()}
                    onSelect={() => handleSelect(product)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedProduct?.id === product.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.unitOfMeasure}
                        {product.article?.quantity !== undefined && (
                          <> • Stock: {product.article.quantity}</>
                        )}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
