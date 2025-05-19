import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// On récupère la config de Next.js…
const base = compat.extends("next/core-web-vitals");

export default [
  // … puis on y greffe notre override
  ...base,
  {
    rules: {
      // Désactive l’erreur sur les caractères non échappés dans JSX
      "react/no-unescaped-entities": "off",
      // Optionnel : passe les hooks missing deps en warning
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
