"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, db } from "@/lib/firebase-admin";
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/session";

const MAX_LOGIN_AGE_MS = 5 * 60 * 1000;

// Recibe el token que Firebase le dio al navegador al iniciar sesión,
// lo valida y lo cambia por una cookie de sesión httpOnly (el JavaScript del navegador no la puede leer).
export async function createSession(idToken, nombre) {
  if (typeof idToken !== "string" || !idToken) {
    return { error: "No pudimos iniciar sesión. Probá de nuevo." };
  }

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken);
  } catch {
    return { error: "No pudimos iniciar sesión. Probá de nuevo." };
  }

  // Solo aceptamos un inicio de sesión recién hecho (recomendación de Firebase).
  if (Date.now() - decoded.auth_time * 1000 > MAX_LOGIN_AGE_MS) {
    return { error: "Tu sesión tardó demasiado. Volvé a ingresar." };
  }

  const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sessionCookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn,
  });

  (await cookies()).set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });

  await createUserDocIfMissing(decoded, nombre);
  return { ok: true };
}

// Primer ingreso: crea users/{uid} con los valores por defecto del PRD.
async function createUserDocIfMissing(decoded, nombre) {
  const ref = db().doc(`users/${decoded.uid}`);
  const snapshot = await ref.get();
  if (snapshot.exists) return;

  const nombreLimpio =
    typeof nombre === "string" && nombre.trim()
      ? nombre.trim().slice(0, 60)
      : decoded.name || decoded.email?.split("@")[0] || "";

  await ref.set({
    nombre: nombreLimpio,
    restricciones: [],
    alergias: [],
    porcionesHabituales: 1,
    creadoEn: FieldValue.serverTimestamp(),
  });
}

export async function logout() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;

  if (cookie) {
    try {
      // Revoca la sesión en Firebase, así la cookie deja de servir aunque alguien la haya copiado.
      const decoded = await adminAuth().verifySessionCookie(cookie);
      await adminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      // Si ya estaba vencida, alcanza con borrarla.
    }
  }

  store.delete(SESSION_COOKIE);
  redirect("/login");
}
