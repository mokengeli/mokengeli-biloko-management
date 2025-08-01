// src/lib/pinValidation.js

/**
 * Valide un PIN selon les règles métier
 * @param {string} pin - Le PIN à valider
 * @returns {string|null} Message d'erreur ou null si valide
 */
export const validatePin = (pin) => {
  // Vérifier que c'est une chaîne
  if (typeof pin !== "string") {
    return "Le PIN doit être une chaîne de caractères";
  }

  // Exactement 4 chiffres
  if (!/^\d{4}$/.test(pin)) {
    return "Le PIN doit contenir exactement 4 chiffres";
  }

  // Vérifier les séquences croissantes et décroissantes
  const sequential = ["0123", "1234", "2345", "3456", "4567", "5678", "6789"];
  const reverseSeq = ["9876", "8765", "7654", "6543", "5432", "4321", "3210"];

  if (sequential.includes(pin) || reverseSeq.includes(pin)) {
    return "Le PIN ne doit pas être une séquence (ex: 1234, 4321)";
  }

  // Vérifier les répétitions
  if (/^(\d)\1{3}$/.test(pin)) {
    return "Le PIN ne doit pas contenir 4 chiffres identiques (ex: 1111)";
  }

  // Vérifier les patterns trop simples
  const commonPins = [
    "0000",
    "1111",
    "2222",
    "3333",
    "4444",
    "5555",
    "6666",
    "7777",
    "8888",
    "9999",
  ];
  if (commonPins.includes(pin)) {
    return "Ce PIN est trop simple, veuillez en choisir un autre";
  }

  return null; // PIN valide
};

/**
 * Génère un PIN aléatoire valide
 * @returns {string} Un PIN valide de 4 chiffres
 */
export const generateRandomPin = () => {
  let pin;
  do {
    // Générer un nombre entre 1000 et 9999
    pin = Math.floor(Math.random() * 9000 + 1000).toString();
  } while (validatePin(pin) !== null);

  return pin;
};

/**
 * Masque un PIN pour l'affichage (ex: "****")
 * @param {string} pin - Le PIN à masquer
 * @returns {string} Le PIN masqué
 */
export const maskPin = (pin) => {
  if (!pin) return "";
  return "•".repeat(pin.length);
};
