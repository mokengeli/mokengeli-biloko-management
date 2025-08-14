// src/middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const accessToken = request.cookies.get("accessToken");
  const isAuthenticated = !!accessToken;
  const url = request.nextUrl.clone();
  const isLoginPage = url.pathname === "/auth/login";
  const isLogoutPage = url.pathname === "/auth/logout";

  // Si l'utilisateur est sur la page de login mais qu'il est déjà authentifié
  if (isLoginPage && isAuthenticated) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // MODIFICATION IMPORTANTE : Ne PAS rediriger si pas de cookie
  // Laisser l'intercepteur axios et les composants gérer les 401
  // Cela évite les conflits entre middleware et API

  // On protège seulement contre l'accès direct sans cookie ET sans être sur login/logout
  if (
    !isAuthenticated &&
    !isLoginPage &&
    !isLogoutPage &&
    !url.pathname.startsWith("/api") &&
    !url.pathname.includes("_next") &&
    url.pathname !== "/"
  ) {
    // Au lieu de rediriger immédiatement, on laisse passer
    // et c'est l'API qui décidera si 401 ou pas
    // Cela évite la boucle quand le cookie existe mais n'est plus valide

    // Option 1: Laisser passer complètement
    return NextResponse.next();

    // OU Option 2: Rediriger seulement si vraiment pas de cookie
    // url.pathname = "/auth/login";
    // return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
