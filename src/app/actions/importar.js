"use server";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import { combinarRestricciones, revisarReceta } from "@/lib/restricciones";
import { importarRecetaIA } from "@/lib/ai";
import { obtenerClaveGroq } from "@/lib/claves";
import { consumirPedido } from "@/lib/uso-ia";
import { calcularMacros } from "@/lib/macros";

const ID_VALIDO = /^[A-Za-z0-9_-]{1,64}$/;
const TIPOS = ["image/jpeg", "image/png"];
const MAX_IMAGEN = 1.5 * 1024 * 1024; // el navegador las achica antes de mandarlas
const MAX_TEXTO = 8000;

// Importar receta (H7): texto pegado y/o hasta 3 capturas -> receta con el formato de Tuppi, adaptada a las restricciones.
// No se guarda nada acá: la persona la revisa y recién ahí la guarda. Las capturas se mandan a la IA y se descartan.
export async function importarReceta(formData) {
  const user = await requireUser();

  const texto = String(formData.get("texto") ?? "").trim().slice(0, MAX_TEXTO);
  const archivos = formData.getAll("capturas").filter((archivo) => archivo instanceof File && archivo.size > 0);
  const comensalIds = [...new Set(formData.getAll("comensalIds").map(String))];

  if (!texto && archivos.length === 0) return { error: "Pegá el texto de la receta o subí una captura." };
  // Instagram y TikTok no dejan leer sus links desde un servidor: hay que pegar el texto o subir una captura.
  if (archivos.length === 0 && /^https?:\/\/\S+$/i.test(texto)) {
    return { error: "No podemos abrir links de Instagram, TikTok ni de otras páginas. Copiá la descripción de la receta y pegala acá, o subí una captura." };
  }
  if (archivos.length > 3) return { error: "Podés subir hasta 3 capturas." };
  if (comensalIds.some((id) => !ID_VALIDO.test(id))) return { error: "Hay un dato inválido en el formulario." };

  const imagenes = [];
  for (const archivo of archivos) {
    if (!TIPOS.includes(archivo.type)) return { error: "Las capturas tienen que ser JPG o PNG." };
    if (archivo.size > MAX_IMAGEN) return { error: "Una captura es demasiado pesada. Probá con otra." };
    imagenes.push(`data:${archivo.type};base64,${Buffer.from(await archivo.arrayBuffer()).toString("base64")}`);
  }

  try {
    const [perfilSnapshot, comensalesSnapshot] = await Promise.all([
      db().doc(`users/${user.uid}`).get(),
      db().collection(`users/${user.uid}/comensales`).get(),
    ]);
    const perfil = perfilSnapshot.data() ?? {};
    const todos = comensalesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const elegidos = comensalIds.map((id) => todos.find((comensal) => comensal.id === id));
    if (elegidos.some((comensal) => !comensal)) return { error: "Uno de los comensales ya no está disponible." };
    const restricciones = combinarRestricciones(perfil, elegidos);

    let apiKey = await obtenerClaveGroq(user.uid);
    if (!apiKey) {
      await consumirPedido(user.uid);
      apiKey = process.env.GROQ_API_KEY ?? null;
    }
    if (!apiKey) return { error: "La importación no está disponible ahora." };

    const bruta = await importarRecetaIA(apiKey, { texto, imagenes, restricciones });
    if (!String(bruta.titulo).trim()) return { error: "No encontramos una receta en ese contenido." };

    const receta = {
      titulo: String(bruta.titulo).trim(),
      porQueSirve: String(bruta.porQueSirve).trim(),
      // El rinde es el de la receta original: los macros por porción se calculan con ese número.
      porciones: Number(bruta.porciones) > 0 ? Number(bruta.porciones) : 4,
      tiempoMin: Number(bruta.tiempoMin) > 0 ? Number(bruta.tiempoMin) : 30,
      ingredientes: bruta.ingredientes.map((ingrediente) => ({
        nombre: String(ingrediente.nombre ?? ""),
        cantidad: String(ingrediente.cantidad ?? ""),
        unidad: String(ingrediente.unidad ?? ""),
        gramos: Number(ingrediente.gramos) || null,
        nombreEn: String(ingrediente.nombreEn ?? ""),
        aComprar: false,
      })),
      pasos: bruta.pasos.map(String),
      reemplazos: bruta.reemplazos.map(String),
    };

    // El control de restricciones lo hace el código, como en el resto de la app.
    const control = revisarReceta(receta, restricciones);
    if (!control.apta) {
      const lista = control.prohibidos.map((p) => `${p.ingrediente} (${p.motivo})`).join(", ");
      return { error: `Esta receta lleva ${lista} y no pudimos adaptarla a lo que no comés.` };
    }

    return {
      ok: true,
      receta: {
        ...receta,
        origen: "importada",
        imagen: null,
        comensalIds,
        restriccionesAplicadas: restricciones,
        advertencias: [...new Set(control.avisos.map((aviso) => aviso.texto))],
        macrosPorPorcion: await calcularMacros(receta).catch(() => null),
        sinAdaptar: false,
        // No sabemos qué tenés en casa: los ingredientes se muestran como lista, sin "Tenés" ni "Te falta".
        sinContexto: true,
      },
    };
  } catch (error) {
    console.error("importarReceta falló:", error?.status ?? error?.message);
    const mensaje = error?.message ?? "";
    if (mensaje.includes("límite de pedidos") || mensaje.includes("minuto")) return { error: mensaje };
    if (mensaje.includes("clave de Groq")) return { error: "La clave de Groq que cargaste no es válida. Revisala en tu perfil." };
    if (error?.status === 400 || error?.status === 404) {
      return { error: "No pudimos leer las capturas con el modelo de imágenes. Probá pegando el texto de la receta." };
    }
    return { error: "No pudimos importar la receta. Probá de nuevo en un momento." };
  }
}
