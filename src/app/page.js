"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuthStatus, loading } = useAuth();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuthStatus();
        router.push("/dashboard");
      } catch (error) {
        router.push("/auth/login");
      }
    };

    initAuth();
  }, [checkAuthStatus, router, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
