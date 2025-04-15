// src/app/api/auth/logout/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Supprimer le cookie accessToken
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");

  // Répondre avec un succès
  return NextResponse.json({ success: true });
}
