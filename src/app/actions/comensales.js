"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import {
  IDS_RESTRICCIONES,
  IDS_ALERGIAS,
  validarAlimentosEvitados,
} from "@/lib/restricciones";

// ABM de comensales (H3). Cada acción valida la sesión y escribe solo bajo users/{uid}/comensales,
// así nadie puede tocar los comensales de otra persona aunque mande otro id.

// Lee y valida lo que llega del formulario. Devuelve { datos } o { error }.
function leerFormulario(formData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const restricciones = [...new Set(formData.getAll("restricciones").map(String))];
  const alergias = [...new Set(formData.getAll("alergias").map(String))];
  const validacionAlimentos = validarAlimentosEvitados(formData.get("alimentosEvitados"));
  if (validacionAlimentos.error) return { error: validacionAlimentos.error };

  if (!nombre) return { error: "Ponele un nombre." };
  if (nombre.length > 40) return { error: "El nombre puede tener hasta 40 caracteres." };
  if (!restricciones.every((id) => IDS_RESTRICCIONES.includes(id))) {
    return { error: "Hay una restricción que no conocemos." };
  }
  if (!alergias.every((id) => IDS_ALERGIAS.includes(id))) {
    return { error: "Hay una alergia que no conocemos." };
  }
  return { datos: { nombre, restricciones, alergias, alimentosEvitados: validacionAlimentos.alimentos } };
}

function coleccion(uid) {
  return db().collection(`users/${uid}/comensales`);
}

// Un id de Firestore válido: sin barras (no puede salirse de la colección) y de largo razonable.
function idValido(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id);
}

export async function guardarComensal(_estadoAnterior, formData) {
  const user = await requireUser();
  const { datos, error } = leerFormulario(formData);
  if (error) return { error };

  const id = formData.get("id");
  try {
    if (id) {
      if (!idValido(id)) return { error: "No encontramos ese comensal." };
      const ref = coleccion(user.uid).doc(id);
      if (!(await ref.get()).exists) return { error: "No encontramos ese comensal." };
      await ref.update(datos);
    } else {
      await coleccion(user.uid).add({ ...datos, creadoEn: FieldValue.serverTimestamp() });
    }
  } catch (err) {
    console.error("guardarComensal falló:", err?.code ?? err?.message);
    return { error: "No pudimos guardar. Probá de nuevo." };
  }

  revalidatePath("/comensales");
  return { ok: true };
}

// Borrar un comensal no toca las recetas: cada receta guarda su propia copia
// de las restricciones con las que se pensó (PRD, H3).
export async function borrarComensal(id) {
  const user = await requireUser();
  if (!idValido(id)) return { error: "No encontramos ese comensal." };
  try {
    await coleccion(user.uid).doc(id).delete();
  } catch (err) {
    console.error("borrarComensal falló:", err?.code ?? err?.message);
    return { error: "No pudimos borrarlo. Probá de nuevo." };
  }
  revalidatePath("/comensales");
  return { ok: true };
}
