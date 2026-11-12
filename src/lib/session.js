// Capa de acceso a la sesión: el único lugar que lee la cookie y decide quién es el usuario.
// Toda página privada y toda Server Action pasan por acá; el proxy solo hace la redirección rápida.
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const SESSION_COOKIE = "tuppi_session";
export const SESSION_DAYS = 5;

// cache() de React: si varias partes de la misma página piden el usuario,
// Firebase valida la cookie una sola vez por pedido.
export const getCurrentUser = cache(async function getCurrentUser() {
  // connection() le avisa a Next que esto se calcula en cada pedido, nunca al prerenderizar.
  // Hace falta porque Firebase usa la hora actual (Date.now()) para ver si la cookie venció.
  await connection();
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    // true = también rechaza sesiones revocadas (por ejemplo, si se cerró sesión en otro lado).
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    // Cookie vencida, alterada o revocada: se trata como "sin sesión".
    return null;
  }
});

// Para páginas privadas: devuelve el usuario o manda a /login.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
