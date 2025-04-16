// src/hooks/useProductDetail.js
import { useState, useEffect } from "react";
import inventoryService from "@/services/inventoryService";
import userService from "@/services/userService";

export const useProductDetail = (productId) => {
  const [product, setProduct] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        // Récupérer les détails du produit
        const productData = await inventoryService.getProductById(productId);
        setProduct(productData);

        // Si le produit a un code de tenant, récupérer les infos du tenant
        if (productData.tenantCode) {
          try {
            const tenantData = await userService.getTenantByCode(
              productData.tenantCode
            );
            setTenant(tenantData);
          } catch (tenantError) {
            console.error("Error fetching tenant:", tenantError);
            // Ne pas définir d'erreur globale si seul le tenant échoue
          }
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(
          err.message || "Erreur lors de la récupération des détails du produit"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  return {
    product,
    tenant,
    loading,
    error,
  };
};

export default useProductDetail;
