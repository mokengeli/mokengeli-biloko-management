// src/app/layout.js
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Mokengeli Biloko Management",
  description: "Solution de gestion pour restaurants multi-enseignes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
