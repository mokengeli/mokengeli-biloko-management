// src/lib/dashboardUtils.js

// Utilitaires pour le formatage des données du dashboard
export const formatCurrency = (value, currencyCode = "€") => {
  // Si on a un code de devise, l'utiliser directement
  if (currencyCode) {
    return `${value.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencyCode}`;
  }

  // Sinon, utiliser le format par défaut
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

export const formatPercentage = (value) => {
  return `${value > 0 ? "+" : ""}${value}%`;
};

// Détermine la couleur selon le type de changement
export const getChangeColor = (change) => {
  if (change > 10) return "text-green-600";
  if (change < -5) return "text-red-600";
  return "text-gray-600";
};

// Gradient de couleurs pour les graphiques
export const getChartColor = (index) => {
  const colors = [
    "#3b82f6", // bleu
    "#10b981", // vert
    "#f59e0b", // jaune
    "#8b5cf6", // violet
    "#ef4444", // rouge
    "#6366f1", // indigo
    "#ec4899", // rose
    "#14b8a6", // teal
  ];
  return colors[index % colors.length];
};

// Détermine le niveau d'alerte
export const getAlertLevel = (value, threshold) => {
  if (value <= threshold * 0.5) return "critical";
  if (value <= threshold) return "warning";
  return "ok";
};

// Simule des données réalistes
export const generateRealisticData = (numDays = 7) => {
  const data = [];
  const baseValue = 2000;
  const today = new Date();
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = dayNames[date.getDay()];

    // Variations réalistes (weekends plus hauts)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const variation = (isWeekend ? 1.3 : 1) * (0.8 + Math.random() * 0.4);

    data.push({
      date: dayName,
      sales: Math.round(baseValue * variation),
    });
  }

  return data;
};
