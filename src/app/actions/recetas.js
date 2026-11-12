"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import { combinarRestricciones, revisarReceta } from "@/lib/restricciones";

const ID_VALIDO = /^[A-Za-z0-9_-]{1,64}$/;
const ORIGENES = ["themealdb", "ia", "importada"];

function texto(valor, maximo = 2000) {
  const resultado = String(valor ?? "").trim();
  return resultado.length <= maximo ? resultado : resultado.slice(0, maximo);
}

function lista(valor, maximo = 100) {
  if (!Array.isArray(valor) || valor.length > maximo) return null;
  return valor.map((item) => texto(item, 500)).filter(Boolean);
}

function ingredientesValidos(valor) {
  if (!Array.isArray(valor) || valor.length < 1 || valor.length > 50) return false;
  return valor.every((ingrediente) => (
    ingrediente
    && typeof ingrediente === "object"
    && texto(ingrediente.nombre, 100)
    && texto(ingrediente.nombreEn, 100)
  ));
}

function recetaValida(receta) {
  return receta
    && typeof receta === "object"
    && texto(receta.titulo, 160)
    && texto(receta.porQueSirve, 1000)
    && Number.isFinite(Number(receta.porciones))
    && Number(receta.porciones) > 0
    && Number(receta.porciones) <= 50
    && Number.isFinite(Number(receta.tiempoMin))
    && Number(receta.tiempoMin) > 0
    && Number(receta.tiempoMin) <= 1440
    && ingredientesValidos(receta.ingredientes)
    && lista(receta.pasos)
    && lista(receta.pasos).length > 0
    && lista(receta.reemplazos ?? [])
    && lista(receta.advertencias ?? [])
    && ORIGENES.includes(receta.origen);
}

function comensalesValidos(valor) {
  return Array.isArray(valor)
    && valor.every((id) => typeof id === "string" && ID_VALIDO.test(id));
}

// Solo se aceptan fotos https de los dos servicios que usamos.
const HOSTS_IMAGEN = ["images.unsplash.com", "www.themealdb.com"];
function urlImagenValida(valor) {
  try {
    const url = new URL(String(valor));
    return url.protocol === "https:" && HOSTS_IMAGEN.includes(url.hostname);
  } catch {
    return false;
  }
}

function recetaLimpia(receta) {
  return {
    titulo: texto(receta.titulo, 160),
    porQueSirve: texto(receta.porQueSirve, 1000),
    notas: texto(receta.notas, 2000),
    porciones: Number(receta.porciones),
    tiempoMin: Number(receta.tiempoMin),
    ingredientes: receta.ingredientes.map((ingrediente) => ({
      nombre: texto(ingrediente.nombre, 100),
      cantidad: texto(ingrediente.cantidad, 100),
      unidad: texto(ingrediente.unidad, 40),
      gramos: Number.isFinite(Number(ingrediente.gramos)) ? Number(ingrediente.gramos) : null,
      nombreEn: texto(ingrediente.nombreEn, 100),
      aComprar: Boolean(ingrediente.aComprar),
    })),
    pasos: lista(receta.pasos),
    reemplazos: lista(receta.reemplazos ?? []),
    advertencias: lista(receta.advertencias ?? []),
    imagen: urlImagenValida(receta.imagen?.url)
      ? {
        url: texto(receta.imagen.url, 1000),
        fuente: texto(receta.imagen.fuente, 40),
        credito: texto(receta.imagen.credito, 200),
        link: texto(receta.imagen.link, 1000),
      }
      : null,
    origen: receta.origen,
    themealdbId: receta.themealdbId ? texto(receta.themealdbId, 40) : null,
    comensalIds: Array.isArray(receta.comensalIds) ? receta.comensalIds.filter((id) => ID_VALIDO.test(id)) : [],
  };
}

async function contextoUsuario(uid, comensalIds = []) {
  const [perfilSnapshot, comensalesSnapshot] = await Promise.all([
    db().doc(`users/${uid}`).get(),
    db().collection(`users/${uid}/comensales`).get(),
  ]);
  const perfil = perfilSnapshot.data() ?? {};
  const comensales = comensalesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const elegidos = comensalIds.map((id) => comensales.find((comensal) => comensal.id === id));
  if (elegidos.some((comensal) => !comensal)) return null;
  return combinarRestricciones(perfil, elegidos);
}

function rutaReceta(uid, id) {
  return db().doc(`users/${uid}/recetas/${id}`);
}

export async function guardarReceta(receta) {
  const user = await requireUser();
  if (!recetaValida(receta)) return { error: "La receta no tiene un formato válido." };

  const limpia = recetaLimpia(receta);
  if (!comensalesValidos(receta.comensalIds ?? [])) {
    return { error: "La selección de comensales no es válida." };
  }
  const comensalIds = [...new Set(receta.comensalIds ?? [])];
  const restriccionesAplicadas = await contextoUsuario(user.uid, comensalIds);
  if (!restriccionesAplicadas) return { error: "Uno de los comensales ya no está disponible." };
  const control = revisarReceta(limpia, restriccionesAplicadas);
  if (!control.apta) return { error: "No se puede guardar una receta con ingredientes prohibidos." };

  try {
    const referencia = db().collection(`users/${user.uid}/recetas`).doc();
    await referencia.set({
      ...limpia,
      restriccionesAplicadas,
      advertencias: [...new Set([...limpia.advertencias, ...control.avisos.map((aviso) => aviso.texto)])],
      cocinadaEn: [],
      creadoEn: FieldValue.serverTimestamp(),
      actualizadoEn: FieldValue.serverTimestamp(),
    });
    revalidatePath("/recetario");
    return { ok: true, id: referencia.id };
  } catch (error) {
    console.error("guardarReceta falló:", error?.code ?? error?.message);
    return { error: "No pudimos guardar la receta. Probá de nuevo." };
  }
}

export async function editarReceta(id, receta) {
  const user = await requireUser();
  if (!ID_VALIDO.test(id) || !recetaValida(receta)) return { error: "La receta no tiene un formato válido." };

  const referencia = rutaReceta(user.uid, id);
  const existente = await referencia.get();
  if (!existente.exists) return { error: "No encontramos esa receta." };

  const limpia = recetaLimpia(receta);
  if (!comensalesValidos(receta.comensalIds ?? [])) {
    return { error: "La selección de comensales no es válida." };
  }
  const comensalIds = [...new Set(receta.comensalIds ?? [])];
  const restriccionesAplicadas = await contextoUsuario(user.uid, comensalIds);
  if (!restriccionesAplicadas) return { error: "Uno de los comensales ya no está disponible." };
  const control = revisarReceta(limpia, restriccionesAplicadas);
  if (!control.apta) return { error: "La receta tiene ingredientes prohibidos para tu perfil." };

  try {
    const original = existente.data();
    await referencia.update({
      ...limpia,
      // El origen y la foto no se editan: se conservan los guardados.
      origen: original.origen,
      themealdbId: original.themealdbId ?? null,
      imagen: original.imagen ?? null,
      restriccionesAplicadas,
      advertencias: [...new Set([...limpia.advertencias, ...control.avisos.map((aviso) => aviso.texto)])],
      actualizadoEn: FieldValue.serverTimestamp(),
    });
    revalidatePath("/recetario");
    revalidatePath(`/recetario/${id}`);
    return { ok: true };
  } catch (error) {
    console.error("editarReceta falló:", error?.code ?? error?.message);
    return { error: "No pudimos editar la receta. Probá de nuevo." };
  }
}

export async function borrarReceta(id) {
  const user = await requireUser();
  if (!ID_VALIDO.test(id)) return { error: "No encontramos esa receta." };

  try {
    const referencia = rutaReceta(user.uid, id);
    if (!(await referencia.get()).exists) return { error: "No encontramos esa receta." };
    await referencia.delete();
    revalidatePath("/recetario");
    revalidatePath(`/recetario/${id}`);
    return { ok: true };
  } catch (error) {
    console.error("borrarReceta falló:", error?.code ?? error?.message);
    return { error: "No pudimos borrar la receta. Probá de nuevo." };
  }
}
