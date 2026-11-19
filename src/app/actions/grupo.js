"use server";

import { requireUser } from "@/lib/session";
import { RESTRICCIONES, ALERGIAS, revisarReceta } from "@/lib/restricciones";
import { proponerMenuGrupo } from "@/lib/ai";
import { obtenerClaveGroq } from "@/lib/claves";
import { consumirPedido } from "@/lib/uso-ia";
import { buscarFoto } from "@/lib/unsplash";

const PRESUPUESTOS = ["económico", "medio", "sin límite"];
const CATALOGO = [...RESTRICCIONES, ...ALERGIAS];

// Cocinar para muchos: un menú base para todo el grupo y una adaptación por cada restricción.
// Las restricciones sueltas ("uno es vegetariano") no se guardan como comensales: se usan solo para este menú.
export async function armarMenuGrupo(datos) {
  const user = await requireUser();

  const personas = Number(datos?.personas);
  const presupuesto = String(datos?.presupuesto ?? "");
  const ingredientes = Array.isArray(datos?.ingredientes)
    ? [...new Set(datos.ingredientes.map((item) => String(item).trim().toLowerCase()).filter(Boolean))]
    : null;
  const grupos = Array.isArray(datos?.grupos) ? datos.grupos : null;
  // Pedido libre ("algo veraniego, que no use horno") y menús que ya se mostraron, para no repetirlos.
  const pedido = String(datos?.pedido ?? "").trim().slice(0, 200);
  const yaPropuestos = Array.isArray(datos?.yaPropuestos)
    ? datos.yaPropuestos.slice(0, 5).map((titulo) => String(titulo).slice(0, 100))
    : [];

  if (!Number.isInteger(personas) || personas < 2 || personas > 30) return { error: "Elegí entre 2 y 30 personas." };
  if (!PRESUPUESTOS.includes(presupuesto)) return { error: "Elegí un presupuesto." };
  if (!ingredientes || ingredientes.length > 10 || ingredientes.some((item) => item.length > 40)) {
    return { error: "Podés sumar hasta 10 ingredientes." };
  }
  if (!grupos || grupos.length > 8) return { error: "Hay un dato inválido en las restricciones." };

  const restricciones = [];
  for (const grupo of grupos) {
    const opcion = CATALOGO.find((item) => item.id === grupo?.id);
    const cantidad = Number(grupo?.cantidad);
    if (!opcion || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > personas || restricciones.some((r) => r.id === opcion.id)) {
      return { error: "Hay un dato inválido en las restricciones." };
    }
    restricciones.push({ id: opcion.id, nombre: opcion.nombre, cantidad });
  }

  try {
    let apiKey = await obtenerClaveGroq(user.uid);
    if (!apiKey) {
      await consumirPedido(user.uid);
      apiKey = process.env.GROQ_API_KEY ?? null;
    }
    if (!apiKey) return { error: "El armado de menús no está disponible ahora." };

    const bruto = await proponerMenuGrupo(apiKey, {
      personas,
      presupuesto,
      ingredientesQueQuierenUsar: ingredientes,
      pedido,
      yaPropuestos,
      grupos: restricciones.map((r) => ({ id: r.id, restriccion: r.nombre, personas: r.cantidad })),
    });

    // Una adaptación por grupo pedido. Cada una se revisa con el control del código contra la restricción de su grupo.
    const adaptaciones = restricciones.map((grupo) => {
      const propuesta = bruto.adaptaciones.find((a) => a.restriccionId === grupo.id);
      const extra = (propuesta?.ingredientesExtra ?? []).map((i) => ({
        nombre: String(i.nombre),
        nombreEn: String(i.nombreEn),
        cantidad: String(i.cantidad ?? ""),
        unidad: String(i.unidad ?? ""),
      }));
      const control = revisarReceta({ ingredientes: extra }, [grupo.id]);
      return {
        id: grupo.id,
        nombre: grupo.nombre,
        personas: grupo.cantidad,
        cambios: propuesta ? String(propuesta.cambios) : "No pudimos armar una adaptación para este grupo. Revisalo a mano.",
        ingredientesExtra: extra,
        apta: Boolean(propuesta) && control.apta,
        prohibidos: control.prohibidos.map((p) => p.ingrediente),
        avisos: control.avisos.map((aviso) => aviso.texto),
      };
    });

    // La foto es opcional: si Unsplash falla, el menú se muestra igual.
    const foto = await buscarFoto(`${String(bruto.titulo)} food`).catch(() => null);

    return {
      ok: true,
      menu: {
        imagen: foto?.url ? { url: foto.url, credito: foto.credito, link: foto.link } : null,
        titulo: String(bruto.titulo),
        porQueSirve: String(bruto.porQueSirve),
        tiempoMin: Number(bruto.tiempoMin) || 60,
        personas,
        presupuesto,
        ingredientes: bruto.ingredientes.map((i) => ({
          nombre: String(i.nombre),
          cantidad: String(i.cantidad ?? ""),
          unidad: String(i.unidad ?? ""),
          nombreEn: String(i.nombreEn ?? i.nombre),
          gramos: Number(i.gramos) || null,
        })),
        pasos: bruto.pasos.map(String),
        consejosAhorro: bruto.consejosAhorro.map(String),
        adaptaciones,
      },
    };
  } catch (error) {
    console.error("armarMenuGrupo falló:", error?.status ?? error?.message);
    const mensaje = error?.message ?? "";
    if (mensaje.includes("límite de pedidos") || mensaje.includes("minuto")) return { error: mensaje };
    if (mensaje.includes("clave de Groq")) return { error: "La clave de Groq que cargaste no es válida. Revisala en tu perfil." };
    return { error: "No pudimos armar el menú. Probá de nuevo en un momento." };
  }
}
