"use server";

import { requireUser } from "@/lib/session";
import { obtenerClaveGroq } from "@/lib/claves";
import { consumirPedido } from "@/lib/uso-ia";
import { traducirRecetaAlEspanol } from "@/lib/ai";

const MAX_CARACTERES = 12000;

// Traduce al español una receta de TheMealDB sin adaptar. Con clave propia no cuenta para el límite diario;
// con la de la app cuenta un pedido. Los ingredientes conservan su nombre en inglés (nombreEn), que usa el control de restricciones.
export async function traducirReceta(receta) {
  const user = await requireUser();

  const valida = receta
    && receta.sinAdaptar === true
    && typeof receta.titulo === "string"
    && typeof receta.porQueSirve === "string"
    && Array.isArray(receta.ingredientes) && receta.ingredientes.length > 0 && receta.ingredientes.length <= 50
    && Array.isArray(receta.pasos) && receta.pasos.length > 0 && receta.pasos.length <= 100
    && receta.ingredientes.every((i) => i && typeof i.nombre === "string")
    && receta.pasos.every((paso) => typeof paso === "string")
    && JSON.stringify([receta.titulo, receta.ingredientes, receta.pasos]).length <= MAX_CARACTERES;
  if (!valida) return { error: "Esta receta no se puede traducir." };

  try {
    let apiKey = await obtenerClaveGroq(user.uid);
    if (!apiKey) {
      await consumirPedido(user.uid);
      apiKey = process.env.GROQ_API_KEY ?? null;
    }
    if (!apiKey) return { error: "La traducción no está disponible ahora." };

    const traducida = await traducirRecetaAlEspanol(apiKey, receta);
    return {
      ok: true,
      receta: {
        ...receta,
        titulo: traducida.titulo.trim() || receta.titulo,
        porQueSirve: traducida.porQueSirve.trim() || receta.porQueSirve,
        ingredientes: receta.ingredientes.map((original, indice) => ({
          ...original,
          nombre: traducida.ingredientes[indice].nombre.trim() || original.nombre,
          // nombreEn queda como estaba (inglés)
        })),
        pasos: traducida.pasos.map((paso) => paso.trim()).filter(Boolean),
        sinAdaptar: false,
        traducida: true,
      },
    };
  } catch (error) {
    console.error("traducirReceta falló:", error?.message);
    const mensaje = error?.message ?? "";
    if (mensaje.includes("límite de pedidos")) return { error: mensaje };
    if (mensaje.includes("minuto")) return { error: mensaje };
    if (mensaje.includes("clave de Groq")) return { error: "La clave de Groq que cargaste no es válida. Revisala en tu perfil." };
    return { error: "No pudimos traducir la receta. Probá de nuevo en un momento." };
  }
}
