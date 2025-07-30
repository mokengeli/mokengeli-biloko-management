// src/hooks/useDashboardData.js
import { useState, useEffect, useRef, useCallback } from "react";
import orderService from "@/services/orderService";

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
  dishesHourlyDistribution: ["dishesHourlyDistribution"],
  dishesDailyTrend: ["dishesDailyTrend"],
  ordersDailyTrend: ["ordersDailyTrend"],
  dishesStats: ["dishesStats"],
  paymentStatusStats: ["paymentStatusStats"], // NOUVEAU
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
    dishesHourlyDistribution: [],
    dishesDailyTrend: [],
    ordersDailyTrend: [],
    dishesStats: null,
    paymentStatusStats: [], // NOUVEAU
  });

  const [loading, setLoading] = useState({
    revenue: false,
    categoryBreakdown: false,
    hourlyDistribution: false,
    topDishes: false,
    dishesHourlyDistribution: false,
    dishesDailyTrend: false,
    ordersDailyTrend: false,
    dishesStats: false,
    paymentStatusStats: false, // NOUVEAU
  });

  const [errors, setErrors] = useState({
    revenue: null,
    categoryBreakdown: null,
    hourlyDistribution: null,
    topDishes: null,
    dishesHourlyDistribution: null,
    dishesDailyTrend: null,
    ordersDailyTrend: null,
    dishesStats: null,
    paymentStatusStats: null, // NOUVEAU
  });

  // État pour forcer le refetch
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Références pour les abort controllers
  const abortControllersRef = useRef({});
  const fetchTimeoutRef = useRef(null);

  const isFirstMount = useRef(true);
  const lastFetchParams = useRef(null);

  // Fonction pour calculer la période précédente
  const calculatePreviousPeriod = useCallback((start, end) => {
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setTime(prevEnd.getTime() - duration);
    return { prevStart, prevEnd };
  }, []);

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

      return { current: currentRevenue, previous: previousRevenue };
    },
    [calculatePreviousPeriod]
  );

  // Fonction pour fetch les données de catégories
  const fetchCategoryData = useCallback(
    async (tenantCode, startDate, endDate, signal) => {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const data = await orderService.getCategoryBreakdown(
        formattedStartDate,
        formattedEndDate,
        tenantCode
      );

      return data;
    },
    []
  );

  // Fonction pour fetch les données horaires
  const fetchHourlyData = useCallback(async (tenantCode, endDate, signal) => {
    const formattedEndDate = formatDateForAPI(endDate);

    const data = await orderService.getHourlyDistribution(
      formattedEndDate,
      tenantCode
    );

    return data;
  }, []);

  // Fonction pour fetch les top dishes
  const fetchTopDishesData = useCallback(
    async (tenantCode, startDate, endDate, signal) => {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const data = await orderService.getTopDishes(
        formattedStartDate,
        formattedEndDate,
        tenantCode,
        5
      );

      return data;
    },
    []
  );

  // Fonction pour fetch les données horaires des plats
  const fetchDishesHourlyData = useCallback(
    async (tenantCode, endDate, signal) => {
      const formattedEndDate = formatDateForAPI(endDate);

      const data = await orderService.getDishesHourlyDistribution(
        formattedEndDate,
        tenantCode
      );

      return data;
    },
    []
  );

  // Fonction pour fetch les données quotidiennes des plats
  const fetchDishesDailyData = useCallback(
    async (tenantCode, startDate, endDate, signal) => {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const data = await orderService.getDishesDailyDistribution(
        formattedStartDate,
        formattedEndDate,
        tenantCode
      );

      return data;
    },
    []
  );

  // Fonction pour fetch les données quotidiennes des commandes
  const fetchOrdersDailyData = useCallback(
    async (tenantCode, startDate, endDate, signal) => {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const data = await orderService.getOrdersDailyDistribution(
        formattedStartDate,
        formattedEndDate,
        tenantCode
      );

      return data;
    },
    []
  );

  // Fonction pour fetch les statistiques des plats
  const fetchDishesStatsData = useCallback(
    async (tenantCode, startDate, endDate, signal) => {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const data = await orderService.getDishesStats(
        formattedStartDate,
        formattedEndDate,
        tenantCode
      );

      return data;
    },
    []
  );

  // NOUVEAU: Fonction pour fetch les statistiques de paiement
  const fetchPaymentStatusData = useCallback(
    async (tenantCode, startDate, endDate, signal) => {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const data = await orderService.getPaymentStatusStats(
        formattedStartDate,
        formattedEndDate,
        tenantCode
      );

      return data;
    },
    []
  );

  // Effect pour fetch les données
  useEffect(() => {
    // Créer une clé unique pour les paramètres actuels
    const currentParams = JSON.stringify({
      tenantCode,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      selectedMetrics,
      fetchTrigger,
    });

    // Si c'est le premier mount, sauvegarder les paramètres
    if (isFirstMount.current) {
      isFirstMount.current = false;
      lastFetchParams.current = currentParams;
    } else {
      // Vérifier si les paramètres ont vraiment changé
      if (lastFetchParams.current === currentParams && fetchTrigger === 0) {
        console.log("Parameters unchanged, skipping fetch");
        return;
      }
      lastFetchParams.current = currentParams;
    }
    // Fonction interne pour éviter les problèmes de dépendances
    const fetchData = async () => {
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
          dishesHourlyDistribution: null,
          dishesDailyTrend: null,
          ordersDailyTrend: null,
          dishesStats: null,
          paymentStatusStats: null, // NOUVEAU
        });

        // Créer les abort controllers
        const controllers = {};
        requiredAPIs.forEach((api) => {
          controllers[api] = new AbortController();
        });
        abortControllersRef.current = controllers;

        // Fetch conditionnel basé sur les métriques sélectionnées
        const fetchPromises = [];
        const newLoading = {
          revenue: false,
          categoryBreakdown: false,
          hourlyDistribution: false,
          topDishes: false,
          dishesHourlyDistribution: false,
          dishesDailyTrend: false,
          ordersDailyTrend: false,
          dishesStats: false,
          paymentStatusStats: false, // NOUVEAU
        };
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

        // 5. Dishes hourly distribution
        if (requiredAPIs.includes("dishesHourlyDistribution")) {
          newLoading.dishesHourlyDistribution = true;
          fetchPromises.push(
            fetchDishesHourlyData(
              tenantCode,
              endDate,
              controllers.dishesHourlyDistribution?.signal
            )
              .then((result) => {
                newData.dishesHourlyDistribution = result || [];
                newLoading.dishesHourlyDistribution = false;
              })
              .catch((error) => {
                if (error.name !== "AbortError") {
                  setErrors((prev) => ({
                    ...prev,
                    dishesHourlyDistribution: error.message,
                  }));
                }
                newLoading.dishesHourlyDistribution = false;
              })
          );
        }

        // 6. Dishes daily trend
        if (requiredAPIs.includes("dishesDailyTrend")) {
          newLoading.dishesDailyTrend = true;
          fetchPromises.push(
            fetchDishesDailyData(
              tenantCode,
              startDate,
              endDate,
              controllers.dishesDailyTrend?.signal
            )
              .then((result) => {
                newData.dishesDailyTrend = result || [];
                newLoading.dishesDailyTrend = false;
              })
              .catch((error) => {
                if (error.name !== "AbortError") {
                  setErrors((prev) => ({
                    ...prev,
                    dishesDailyTrend: error.message,
                  }));
                }
                newLoading.dishesDailyTrend = false;
              })
          );
        }

        // 7. Orders daily trend
        if (requiredAPIs.includes("ordersDailyTrend")) {
          newLoading.ordersDailyTrend = true;
          fetchPromises.push(
            fetchOrdersDailyData(
              tenantCode,
              startDate,
              endDate,
              controllers.ordersDailyTrend?.signal
            )
              .then((result) => {
                newData.ordersDailyTrend = result || [];
                newLoading.ordersDailyTrend = false;
              })
              .catch((error) => {
                if (error.name !== "AbortError") {
                  setErrors((prev) => ({
                    ...prev,
                    ordersDailyTrend: error.message,
                  }));
                }
                newLoading.ordersDailyTrend = false;
              })
          );
        }

        // 8. Dishes stats
        if (requiredAPIs.includes("dishesStats")) {
          newLoading.dishesStats = true;
          fetchPromises.push(
            fetchDishesStatsData(
              tenantCode,
              startDate,
              endDate,
              controllers.dishesStats?.signal
            )
              .then((result) => {
                newData.dishesStats = result || null;
                newLoading.dishesStats = false;
              })
              .catch((error) => {
                if (error.name !== "AbortError") {
                  setErrors((prev) => ({
                    ...prev,
                    dishesStats: error.message,
                  }));
                }
                newLoading.dishesStats = false;
              })
          );
        }

        // 9. NOUVEAU: Payment status stats
        if (requiredAPIs.includes("paymentStatusStats")) {
          newLoading.paymentStatusStats = true;
          fetchPromises.push(
            fetchPaymentStatusData(
              tenantCode,
              startDate,
              endDate,
              controllers.paymentStatusStats?.signal
            )
              .then((result) => {
                newData.paymentStatusStats = result || [];
                newLoading.paymentStatusStats = false;
              })
              .catch((error) => {
                if (error.name !== "AbortError") {
                  setErrors((prev) => ({
                    ...prev,
                    paymentStatusStats: error.message,
                  }));
                }
                newLoading.paymentStatusStats = false;
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
          dishesHourlyDistribution: false,
          dishesDailyTrend: false,
          ordersDailyTrend: false,
          dishesStats: false,
          paymentStatusStats: false, // NOUVEAU
        });
      }, 300); // Délai de debouncing
    };

    fetchData();

    // Cleanup
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      cancelPendingRequests();
    };
  }, [
    tenantCode,
    startDate,
    endDate,
    selectedMetrics,
    fetchTrigger,
    cancelPendingRequests,
    getRequiredAPIs,
    fetchRevenueData,
    fetchCategoryData,
    fetchHourlyData,
    fetchTopDishesData,
    fetchDishesHourlyData,
    fetchDishesDailyData,
    fetchOrdersDailyData,
    fetchDishesStatsData,
    fetchPaymentStatusData, // NOUVEAU
  ]);

  // Fonction pour forcer le refresh
  const refetch = useCallback(() => {
    console.log("Manual refetch triggered");
    setFetchTrigger((prev) => prev + 1);
  }, []);

  // Calculer l'état de chargement global
  const isLoading = Object.values(loading).some((l) => l);

  return {
    data,
    loading,
    errors,
    isLoading,
    refetch,
  };
};

export default useDashboardData;
