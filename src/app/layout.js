// src/app/layout.js
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
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
        <Toaster />
      </body>
    </html>
  );
}
