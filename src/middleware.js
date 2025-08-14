// src/middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const accessToken = request.cookies.get("accessToken");
  const isAuthenticated = !!accessToken;
  const url = request.nextUrl.clone();
  const isLoginPage = url.pathname === "/auth/login";
  const isLogoutPage = url.pathname === "/auth/logout";

  // PROTECTION EXPLICITE : Ne jamais interférer avec le processus de déconnexion
  if (isLogoutPage) {
    return NextResponse.next();
  }

  // Si l'utilisateur est sur la page de login mais qu'il est déjà authentifié
  if (isLoginPage && isAuthenticated) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // On protège seulement contre l'accès direct sans cookie ET sans être sur login
  if (
    !isAuthenticated &&
    !isLoginPage &&
    !url.pathname.startsWith("/api") &&
    !url.pathname.includes("_next") &&
    url.pathname !== "/"
  ) {
    // Laisser passer - l'API décidera si 401 ou pas
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
