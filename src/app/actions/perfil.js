"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import { IDS_RESTRICCIONES, IDS_ALERGIAS } from "@/lib/restricciones";

// Guarda el perfil (H2). Se usa con useActionState: recibe el estado anterior y el FormData.
// Todo se vuelve a validar acá: lo que llega del navegador puede venir modificado.
export async function actualizarPerfil(_estadoAnterior, formData) {
  const user = await requireUser();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const restricciones = formData.getAll("restricciones").map(String);
  const alergias = formData.getAll("alergias").map(String);
  const porciones = Number(formData.get("porcionesHabituales"));

  if (!nombre || nombre.length > 60) {
    return { error: "El nombre tiene que tener entre 1 y 60 caracteres." };
  }
  // Solo se aceptan ids del catálogo: así el control de restricciones siempre sabe qué revisar.
  if (!restricciones.every((id) => IDS_RESTRICCIONES.includes(id))) {
    return { error: "Hay una restricción que no conocemos." };
  }
  if (!alergias.every((id) => IDS_ALERGIAS.includes(id))) {
    return { error: "Hay una alergia que no conocemos." };
  }
  if (!Number.isInteger(porciones) || porciones < 1 || porciones > 4) {
    return { error: "Las porciones van de 1 a 4." };
  }

  try {
    await db()
      .doc(`users/${user.uid}`)
      .set(
        {
          nombre,
          restricciones: [...new Set(restricciones)],
          alergias: [...new Set(alergias)],
          porcionesHabituales: porciones,
        },
        { merge: true },
      );
  } catch (error) {
    console.error("actualizarPerfil falló:", error?.code ?? error?.message);
    return { error: "No pudimos guardar. Probá de nuevo." };
  }

  // Primera vez (viene del registro): después de guardar, a cocinar.
  if (formData.get("bienvenida") === "1") redirect("/cocinar");
  return { ok: true };
}
