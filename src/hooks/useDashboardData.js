// src/hooks/useDashboardData.js
import { useState, useEffect, useRef, useCallback } from "react";
import orderService from "@/services/orderService";

// Configuration du cache avec TTL (Time To Live)
const CACHE_CONFIG = {
  revenue: { ttl: 0 }, // 5 * 60 * 1000  : 5 minutes
  categoryBreakdown: { ttl: 0 }, // 10 * 60 * 1000 :10 minutes
  hourlyDistribution: { ttl: 0 }, // 15 * 60 * 1000 :15 minutes
  topDishes: { ttl: 0 }, // 10 * 60 * 1000 :10 minutes
};

// Mapping des métriques vers les dépendances API
const API_DEPENDENCIES = {
  // Métriques financières
  realRevenue: ["revenue"],
  theoreticalRevenue: ["revenue"],
  revenueGap: ["revenue"],
  discountRate: ["revenue"],

  // Métriques opérationnelles
  orderCount: ["revenue"],
  averageTicket: ["revenue"],
  fullPayments: ["revenue"],

  // Analyse de ventes
  topDishes: ["topDishes"],
  categoryBreakdown: ["categoryBreakdown"],
  hourlyDistribution: ["hourlyDistribution"],
};

// Fonction utilitaire pour formater les dates
const formatDateForAPI = (date) => {
  return date.toISOString().split("T")[0];
};

// Hook personnalisé pour gérer les données du dashboard
export const useDashboardData = (
  tenantCode,
  startDate,
  endDate,
  selectedMetrics
) => {
  // États
  const [data, setData] = useState({
    revenue: null,
    previousRevenue: null,
    categoryBreakdown: [],
    hourlyDistribution: [],
    topDishes: [],
  });

  const [loading, setLoading] = useState({
    revenue: false,
    categoryBreakdown: false,
    hourlyDistribution: false,
    topDishes: false,
  });

  const [errors, setErrors] = useState({
    revenue: null,
    categoryBreakdown: null,
    hourlyDistribution: null,
    topDishes: null,
  });

  // Références pour le cache et les abort controllers
  const cacheRef = useRef({});
  const abortControllersRef = useRef({});
  const fetchTimeoutRef = useRef(null);

  // Fonction pour calculer la période précédente
  const calculatePreviousPeriod = useCallback((start, end) => {
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setTime(prevEnd.getTime() - duration);
    return { prevStart, prevEnd };
  }, []);

  // Fonction pour vérifier si une donnée est en cache et valide
  const getCachedData = useCallback((key, tenantCode, startDate, endDate) => {
    const cacheKey = `${key}-${tenantCode}-${startDate}-${endDate}`;
    const cached = cacheRef.current[cacheKey];

    if (!cached) return null;

    const now = Date.now();
    const ttl = CACHE_CONFIG[key]?.ttl || 0;

    if (cached.timestamp && now - cached.timestamp < ttl) {
      console.log(`Using cached data for ${key}`);
      return cached.data;
    }

    // Cache expiré
    delete cacheRef.current[cacheKey];
    return null;
  }, []);

  // Fonction pour mettre en cache
  const setCachedData = useCallback(
    (key, data, tenantCode, startDate, endDate) => {
      const cacheKey = `${key}-${tenantCode}-${startDate}-${endDate}`;
      cacheRef.current[cacheKey] = {
        data,
        timestamp: Date.now(),
      };
    },
    []
  );

  // Fonction pour annuler les requêtes en cours
  const cancelPendingRequests = useCallback(() => {
    Object.values(abortControllersRef.current).forEach((controller) => {
      if (controller) {
        controller.abort();
      }
    });
    abortControllersRef.current = {};
  }, []);

  // Fonction pour déterminer quelles APIs appeler
  const getRequiredAPIs = useCallback((metrics) => {
    const requiredAPIs = new Set();

    Object.entries(metrics).forEach(([sectionId, section]) => {
      if (section.enabled) {
        Object.entries(section.metrics).forEach(([metricId, enabled]) => {
          if (enabled && API_DEPENDENCIES[metricId]) {
            API_DEPENDENCIES[metricId].forEach((api) => requiredAPIs.add(api));
          }
        });
      }
    });

    return Array.from(requiredAPIs);
  }, []);

  // Fonction pour fetch les données de revenue
  const fetchRevenueData = useCallback(
    async (tenantCode, startDate, endDate, signal) => {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      // Vérifier le cache
      const cached = getCachedData(
        "revenue",
        tenantCode,
        formattedStartDate,
        formattedEndDate
      );
      if (cached) return { current: cached, previous: null };

      // Calculer la période précédente
      const { prevStart, prevEnd } = calculatePreviousPeriod(
        startDate,
        endDate
      );
      const formattedPrevStartDate = formatDateForAPI(prevStart);
      const formattedPrevEndDate = formatDateForAPI(prevEnd);

      // Fetch en parallèle
      const [currentRevenue, previousRevenue] = await Promise.all([
        orderService.getRevenue(
          formattedStartDate,
          formattedEndDate,
          tenantCode
        ),
        orderService.getRevenue(
          formattedPrevStartDate,
          formattedPrevEndDate,
          tenantCode
        ),
      ]);

      // Mettre en cache
      setCachedData(
        "revenue",
        currentRevenue,
        tenantCode,
        formattedStartDate,
        formattedEndDate
      );

      return { current: currentRevenue, previous: previousRevenue };
    },
    [getCachedData, setCachedData, calculatePreviousPeriod]
  );

  // Fonction pour fetch les données de catégories
  const fetchCategoryData = useCallback(
    async (tenantCode, startDate, endDate, signal) => {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      // Vérifier le cache
      const cached = getCachedData(
        "categoryBreakdown",
        tenantCode,
        formattedStartDate,
        formattedEndDate
      );
      if (cached) return cached;

      const data = await orderService.getCategoryBreakdown(
        formattedStartDate,
        formattedEndDate,
        tenantCode
      );

      // Mettre en cache
      setCachedData(
        "categoryBreakdown",
        data,
        tenantCode,
        formattedStartDate,
        formattedEndDate
      );

      return data;
    },
    [getCachedData, setCachedData]
  );

  // Fonction pour fetch les données horaires
  const fetchHourlyData = useCallback(
    async (tenantCode, endDate, signal) => {
      const formattedEndDate = formatDateForAPI(endDate);

      // Vérifier le cache
      const cached = getCachedData(
        "hourlyDistribution",
        tenantCode,
        formattedEndDate,
        formattedEndDate
      );
      if (cached) return cached;

      const data = await orderService.getHourlyDistribution(
        formattedEndDate,
        tenantCode
      );

      // Mettre en cache
      setCachedData(
        "hourlyDistribution",
        data,
        tenantCode,
        formattedEndDate,
        formattedEndDate
      );

      return data;
    },
    [getCachedData, setCachedData]
  );

  // Fonction pour fetch les top dishes
  const fetchTopDishesData = useCallback(
    async (tenantCode, startDate, endDate, signal) => {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      // Vérifier le cache
      const cached = getCachedData(
        "topDishes",
        tenantCode,
        formattedStartDate,
        formattedEndDate
      );
      if (cached) return cached;

      const data = await orderService.getTopDishes(
        formattedStartDate,
        formattedEndDate,
        tenantCode,
        5
      );

      // Mettre en cache
      setCachedData(
        "topDishes",
        data,
        tenantCode,
        formattedStartDate,
        formattedEndDate
      );

      return data;
    },
    [getCachedData, setCachedData]
  );

  // Fonction principale de fetch avec debouncing
  const fetchDashboardData = useCallback(async () => {
    if (!tenantCode) return;

    // Annuler le timeout précédent
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debouncing de 300ms
    fetchTimeoutRef.current = setTimeout(async () => {
      // Annuler les requêtes en cours
      cancelPendingRequests();

      // Déterminer quelles APIs appeler
      const requiredAPIs = getRequiredAPIs(selectedMetrics);

      if (requiredAPIs.length === 0) {
        console.log("No metrics selected, skipping API calls");
        return;
      }

      console.log("Required APIs:", requiredAPIs);

      // Réinitialiser les erreurs
      setErrors({
        revenue: null,
        categoryBreakdown: null,
        hourlyDistribution: null,
        topDishes: null,
      });

      // Créer les abort controllers
      const controllers = {};
      requiredAPIs.forEach((api) => {
        controllers[api] = new AbortController();
      });
      abortControllersRef.current = controllers;

      // Fetch conditionnel basé sur les métriques sélectionnées
      const fetchPromises = [];
      const newLoading = { ...loading };
      const newData = { ...data };

      // 1. Revenue data (pour métriques financières et opérationnelles)
      if (requiredAPIs.includes("revenue")) {
        newLoading.revenue = true;
        fetchPromises.push(
          fetchRevenueData(
            tenantCode,
            startDate,
            endDate,
            controllers.revenue?.signal
          )
            .then(({ current, previous }) => {
              newData.revenue = current;
              newData.previousRevenue = previous;
              newLoading.revenue = false;
            })
            .catch((error) => {
              if (error.name !== "AbortError") {
                setErrors((prev) => ({ ...prev, revenue: error.message }));
              }
              newLoading.revenue = false;
            })
        );
      }

      // 2. Category breakdown
      if (requiredAPIs.includes("categoryBreakdown")) {
        newLoading.categoryBreakdown = true;
        fetchPromises.push(
          fetchCategoryData(
            tenantCode,
            startDate,
            endDate,
            controllers.categoryBreakdown?.signal
          )
            .then((result) => {
              newData.categoryBreakdown = result || [];
              newLoading.categoryBreakdown = false;
            })
            .catch((error) => {
              if (error.name !== "AbortError") {
                setErrors((prev) => ({
                  ...prev,
                  categoryBreakdown: error.message,
                }));
              }
              newLoading.categoryBreakdown = false;
            })
        );
      }

      // 3. Hourly distribution
      if (requiredAPIs.includes("hourlyDistribution")) {
        newLoading.hourlyDistribution = true;
        fetchPromises.push(
          fetchHourlyData(
            tenantCode,
            endDate,
            controllers.hourlyDistribution?.signal
          )
            .then((result) => {
              newData.hourlyDistribution = result || [];
              newLoading.hourlyDistribution = false;
            })
            .catch((error) => {
              if (error.name !== "AbortError") {
                setErrors((prev) => ({
                  ...prev,
                  hourlyDistribution: error.message,
                }));
              }
              newLoading.hourlyDistribution = false;
            })
        );
      }

      // 4. Top dishes
      if (requiredAPIs.includes("topDishes")) {
        newLoading.topDishes = true;
        fetchPromises.push(
          fetchTopDishesData(
            tenantCode,
            startDate,
            endDate,
            controllers.topDishes?.signal
          )
            .then((result) => {
              newData.topDishes = result || [];
              newLoading.topDishes = false;
            })
            .catch((error) => {
              if (error.name !== "AbortError") {
                setErrors((prev) => ({ ...prev, topDishes: error.message }));
              }
              newLoading.topDishes = false;
            })
        );
      }

      // Mettre à jour l'état de chargement immédiatement
      setLoading(newLoading);

      // Attendre toutes les promesses
      await Promise.allSettled(fetchPromises);

      // Mettre à jour les données
      setData(newData);
      setLoading({
        revenue: false,
        categoryBreakdown: false,
        hourlyDistribution: false,
        topDishes: false,
      });
    }, 300); // Délai de debouncing
  }, [
    tenantCode,
    startDate,
    endDate,
    selectedMetrics,
    cancelPendingRequests,
    getRequiredAPIs,
    fetchRevenueData,
    fetchCategoryData,
    fetchHourlyData,
    fetchTopDishesData,
  ]);

  // Effect pour fetch les données quand les dépendances changent
  useEffect(() => {
    fetchDashboardData();

    // Cleanup
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      cancelPendingRequests();
    };
  }, [fetchDashboardData, cancelPendingRequests]);

  // Fonction pour forcer le refresh (ignore le cache)
  const refetch = useCallback(() => {
    // Vider le cache pour forcer un nouveau fetch
    cacheRef.current = {};
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fonction pour vider le cache
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  // Calculer l'état de chargement global
  const isLoading = Object.values(loading).some((l) => l);

  return {
    data,
    loading,
    errors,
    isLoading,
    refetch,
    clearCache,
  };
};

export default useDashboardData;
