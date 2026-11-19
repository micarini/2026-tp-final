"use server";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import { combinarRestricciones, revisarReceta } from "@/lib/restricciones";
import { ajustarRecetaIA, preguntarRecetaIA } from "@/lib/ai";
import { obtenerClaveGroq } from "@/lib/claves";
import { consumirPedido } from "@/lib/uso-ia";
import { calcularMacros } from "@/lib/macros";

const ID_VALIDO = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_CARACTERES = 12000;

// Los ajustes son una lista cerrada: la persona elige un botón, no escribe una orden libre.
const AJUSTES = {
  rapida: "Hacela más rápida: que lleve menos de 25 minutos, simplificando pasos.",
  "sin-horno": "Que no necesite horno: usá sartén, olla o microondas.",
  economica: "Hacela más económica: reemplazá los ingredientes caros por opciones baratas y comunes.",
  "para-2": "Recalculá todas las cantidades para 2 porciones.",
  "para-4": "Recalculá todas las cantidades para 4 porciones.",
  "para-6": "Recalculá todas las cantidades para 6 porciones.",
};

function recetaValida(receta) {
  return receta
    && typeof receta.titulo === "string"
    && Array.isArray(receta.ingredientes) && receta.ingredientes.length > 0 && receta.ingredientes.length <= 50
    && Array.isArray(receta.pasos) && receta.pasos.length > 0 && receta.pasos.length <= 100
    && receta.ingredientes.every((i) => i && typeof i.nombre === "string")
    && receta.pasos.every((paso) => typeof paso === "string")
    && JSON.stringify([receta.titulo, receta.ingredientes, receta.pasos]).length <= MAX_CARACTERES
    && (receta.comensalIds ?? []).every((id) => typeof id === "string" && ID_VALIDO.test(id));
}

// Las restricciones se recalculan en el servidor desde el perfil y los comensales: no se confía en las que manda el navegador.
async function restriccionesDe(uid, comensalIds = []) {
  const [perfilSnapshot, comensalesSnapshot] = await Promise.all([
    db().doc(`users/${uid}`).get(),
    db().collection(`users/${uid}/comensales`).get(),
  ]);
  const comensales = comensalesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const elegidos = comensalIds.map((id) => comensales.find((comensal) => comensal.id === id));
  if (elegidos.some((comensal) => !comensal)) return null;
  return combinarRestricciones(perfilSnapshot.data() ?? {}, elegidos);
}

// Con clave propia no cuenta para el límite diario; con la de la app cuenta un pedido.
async function claveParaPedir(uid) {
  let apiKey = await obtenerClaveGroq(uid);
  if (!apiKey) {
    await consumirPedido(uid);
    apiKey = process.env.GROQ_API_KEY ?? null;
  }
  return apiKey;
}

function errorAmable(error, porDefecto) {
  const mensaje = error?.message ?? "";
  if (mensaje.includes("límite de pedidos") || mensaje.includes("minuto")) return mensaje;
  if (mensaje.includes("clave de Groq")) return "La clave de Groq que cargaste no es válida. Revisala en tu perfil.";
  return porDefecto;
}

export async function ajustarReceta(receta, ajuste) {
  const user = await requireUser();
  const instruccion = AJUSTES[ajuste];
  if (!instruccion || !recetaValida(receta)) return { error: "No se puede ajustar esta receta." };

  try {
    const restricciones = await restriccionesDe(user.uid, receta.comensalIds ?? []);
    if (!restricciones) return { error: "Uno de los comensales ya no está disponible." };
    const apiKey = await claveParaPedir(user.uid);
    if (!apiKey) return { error: "Los ajustes no están disponibles ahora." };

    const bruta = await ajustarRecetaIA(apiKey, receta, instruccion, restricciones);
    const ajustada = {
      titulo: String(bruta.titulo).trim() || receta.titulo,
      porQueSirve: String(bruta.porQueSirve).trim() || receta.porQueSirve,
      porciones: Number(bruta.porciones) > 0 ? Number(bruta.porciones) : receta.porciones,
      tiempoMin: Number(bruta.tiempoMin) > 0 ? Number(bruta.tiempoMin) : receta.tiempoMin,
      ingredientes: bruta.ingredientes.map((ingrediente) => {
        const antes = receta.ingredientes.find((i) => i.nombre.toLowerCase() === String(ingrediente.nombre).toLowerCase());
        return {
          nombre: String(ingrediente.nombre),
          cantidad: String(ingrediente.cantidad ?? ""),
          unidad: String(ingrediente.unidad ?? ""),
          gramos: Number(ingrediente.gramos) || null,
          nombreEn: String(ingrediente.nombreEn ?? ""),
          aComprar: Boolean(antes?.aComprar),
        };
      }),
      pasos: bruta.pasos.map(String),
      reemplazos: bruta.reemplazos.map(String),
    };

    // El control de restricciones lo hace el código, también después de un ajuste.
    const control = revisarReceta(ajustada, restricciones);
    if (!control.apta) {
      return { error: "El ajuste dejó un ingrediente que no podés comer. Probá con otro ajuste." };
    }

    return {
      ok: true,
      receta: {
        ...receta,
        ...ajustada,
        restriccionesAplicadas: restricciones,
        advertencias: [...new Set(control.avisos.map((aviso) => aviso.texto))],
        macrosPorPorcion: await calcularMacros(ajustada).catch(() => null),
        sinAdaptar: false,
        sinContexto: receta.sinContexto,
      },
    };
  } catch (error) {
    console.error("ajustarReceta falló:", error?.status ?? error?.message);
    return { error: errorAmable(error, "No pudimos ajustar la receta. Probá de nuevo en un momento.") };
  }
}

export async function preguntarReceta(receta, pregunta) {
  const user = await requireUser();
  const texto = String(pregunta ?? "").trim();
  if (!texto || texto.length > 300 || !recetaValida(receta)) return { error: "Escribí una pregunta de hasta 300 caracteres." };

  try {
    const restricciones = await restriccionesDe(user.uid, receta.comensalIds ?? []);
    if (!restricciones) return { error: "Uno de los comensales ya no está disponible." };
    const apiKey = await claveParaPedir(user.uid);
    if (!apiKey) return { error: "El asistente no está disponible ahora." };

    const { respuesta } = await preguntarRecetaIA(apiKey, receta, texto, restricciones);

    // Revisión del código sobre el texto de la respuesta: si nombra algo prohibido, se avisa.
    const control = revisarReceta({ ingredientes: [{ nombre: respuesta, nombreEn: "" }] }, restricciones);
    return {
      ok: true,
      respuesta: respuesta.trim().slice(0, 1200),
      aviso: control.apta ? null : "Ojo: la respuesta nombra algo que no corresponde con lo que no comés. Revisala antes de usarla.",
    };
  } catch (error) {
    console.error("preguntarReceta falló:", error?.status ?? error?.message);
    return { error: errorAmable(error, "No pudimos responder ahora. Probá de nuevo en un momento.") };
  }
}
