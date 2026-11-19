"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { adminAuth, db } from "@/lib/firebase-admin";
import { SESSION_COOKIE } from "@/lib/session";

const MAX_CONFIRMACION_MS = 5 * 60 * 1000;

// Elimina la cuenta para siempre. Antes de borrar, el servidor exige TRES cosas:
//  1. que haya sesión,
//  2. que el email escrito sea el de la cuenta,
//  3. un token de Firebase RECIÉN emitido (el navegador vuelve a pedir la contraseña o Google), de esta misma persona.
export async function eliminarCuenta(idToken, emailEscrito) {
  const user = await requireUser();

  if (typeof idToken !== "string" || typeof emailEscrito !== "string" || !user.email) {
    return { error: "No pudimos confirmar tu identidad. Probá de nuevo." };
  }
  if (emailEscrito.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { error: "El email no coincide con el de tu cuenta." };
  }

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken, true);
  } catch (error) {
    console.error("eliminarCuenta: token inválido:", error?.code ?? error?.message);
    return { error: "No pudimos confirmar tu identidad. Probá de nuevo." };
  }
  if (decoded.uid !== user.uid) return { error: "Esa cuenta no es la que tiene la sesión abierta." };
  if (Date.now() - decoded.auth_time * 1000 > MAX_CONFIRMACION_MS) {
    return { error: "La confirmación venció. Volvé a intentarlo." };
  }

  try {
    // recursiveDelete borra el perfil y todo lo que cuelga: comensales, recetas, uso de IA y la clave de Groq.
    await db().recursiveDelete(db().doc(`users/${user.uid}`));
    await adminAuth().deleteUser(user.uid);
  } catch (error) {
    console.error("eliminarCuenta falló:", error?.code ?? error?.message);
    return { error: "No pudimos eliminar la cuenta. Probá de nuevo en un momento." };
  }

  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
