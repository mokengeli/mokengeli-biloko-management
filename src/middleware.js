// src/middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  // Utiliser le cookie accessToken pour déterminer l'authentification
  const accessToken = request.cookies.get("accessToken");
  const isAuthenticated = !!accessToken;

  // URL actuelle
  const url = request.nextUrl.clone();
  const isLoginPage = url.pathname === "/auth/login";

  console.log(
    `Middleware: Path=${url.pathname}, isAuthenticated=${isAuthenticated}, isLoginPage=${isLoginPage}`
  );

  // Si l'utilisateur est sur la page de login mais qu'il est déjà authentifié
  if (isLoginPage && isAuthenticated) {
    url.pathname = "/dashboard";
    console.log(`Redirecting authenticated user from login to dashboard`);
    return NextResponse.redirect(url);
  }

  // Si l'utilisateur n'est pas authentifié et qu'il n'est pas sur la page de login
  // IMPORTANT: exclure les appels API du middleware pour éviter les boucles
  if (
    !isAuthenticated &&
    !isLoginPage &&
    !url.pathname.startsWith("/api") &&
    !url.pathname.includes("_next")
  ) {
    url.pathname = "/auth/login";
    console.log(`Redirecting unauthenticated user to login`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure le middleware pour s'exécuter sur toutes les routes sauf certaines
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
