"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { guardarClaveGroq, quitarClaveGroq } from "@/lib/claves";

const FORMATO = /^gsk_[A-Za-z0-9]{20,100}$/;

// Antes de guardar, se prueba la clave contra Groq (pide la lista de modelos, que no gasta cuota).
async function claveFunciona(clave) {
  const respuesta = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${clave}` },
    signal: AbortSignal.timeout(8000),
  });
  return respuesta.ok;
}

export async function guardarClave(_estado, formData) {
  const user = await requireUser();
  const clave = String(formData.get("clave") ?? "").trim();

  if (!FORMATO.test(clave)) {
    return { error: "Esa no parece una clave de Groq. Empieza con gsk_ y la copiás completa." };
  }

  try {
    if (!(await claveFunciona(clave))) {
      return { error: "Groq no aceptó esa clave. Revisá que la hayas copiado completa y que siga activa." };
    }
    await guardarClaveGroq(user.uid, clave);
  } catch (error) {
    // Nunca se loguea la clave: solo el motivo.
    console.error("guardarClave falló:", error?.code ?? error?.message);
    return { error: "No pudimos guardar la clave. Probá de nuevo en un momento." };
  }

  revalidatePath("/perfil");
  return { ok: true };
}

export async function quitarClave() {
  const user = await requireUser();
  try {
    await quitarClaveGroq(user.uid);
  } catch (error) {
    console.error("quitarClave falló:", error?.code ?? error?.message);
    return { error: "No pudimos quitar la clave. Probá de nuevo." };
  }
  revalidatePath("/perfil");
  return { ok: true };
}
