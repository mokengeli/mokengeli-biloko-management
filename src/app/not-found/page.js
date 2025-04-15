"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-9xl font-extrabold text-primary">404</h1>
        </motion.div>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">
          Page non trouvée
        </h2>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          Cette fonctionnalité est actuellement en cours de développement. Merci
          de revenir plus tard.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8"
        >
          <Button onClick={() => router.push("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
