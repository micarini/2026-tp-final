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
  } catch (error) {
    console.error("verifyIdToken falló:", error?.code ?? error?.message);
    return { error: "No pudimos iniciar sesión. Probá de nuevo." };
  }

  // Solo aceptamos un inicio de sesión recién hecho (recomendación de Firebase).
  if (Date.now() - decoded.auth_time * 1000 > MAX_LOGIN_AGE_MS) {
    return { error: "Tu sesión tardó demasiado. Volvé a ingresar." };
  }

  const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;
  try {
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
  } catch (error) {
    // Si falla acá, la cuenta de Firebase ya existe pero no hay sesión.
    // Logueamos solo el código (nunca tokens ni datos personales) para poder diagnosticarlo.
    console.error("createSession falló:", error?.code ?? error?.message);
    (await cookies()).delete(SESSION_COOKIE);
    return { error: "No pudimos iniciar sesión. Probá ingresar de nuevo." };
  }
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

// Registro: avisa si el email ya tiene cuenta antes de que la persona escriba la contraseña.
// Ojo para la defensa: esto deja averiguar si un email está registrado (enumeración).
// Lo aceptamos porque ayuda mucho al registro y no expone ningún otro dato de la cuenta.
// Devuelve true (ya existe), false (está libre) o null (no se pudo saber: no bloqueamos).
export async function emailRegistrado(email) {
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }
  try {
    await adminAuth().getUserByEmail(email.trim().toLowerCase());
    return true;
  } catch (error) {
    if (error?.code === "auth/user-not-found") return false;
    console.error("emailRegistrado falló:", error?.code ?? error?.message);
    return null;
  }
}
