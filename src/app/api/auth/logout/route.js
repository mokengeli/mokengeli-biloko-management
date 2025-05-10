// src/app/api/auth/logout/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Supprimer le cookie accessToken avec des options explicites
  const cookieStore = await cookies();
  cookieStore.delete("accessToken", {
    path: "/",
    secure: process.env.NODE_ENV === 'production',
    sameSite: "strict"
  });

  // Répondre avec un succès
  return NextResponse.json({ success: true });
}