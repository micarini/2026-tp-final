import "server-only";

import { revisarReceta } from "@/lib/restricciones";
import { listarPorCategoria, obtenerRecetaCacheada } from "@/lib/themealdb";

// Búsquedas populares: etiqueta en español y categoría de TheMealDB.
export const CATEGORIAS = [
  { id: "Chicken", nombre: "Pollo" },
  { id: "Pasta", nombre: "Pasta" },
  { id: "Vegetarian", nombre: "Vegetariano" },
  { id: "Vegan", nombre: "Vegano" },
  { id: "Seafood", nombre: "Pescados y mariscos" },
  { id: "Beef", nombre: "Carne" },
  { id: "Breakfast", nombre: "Desayuno" },
  { id: "Dessert", nombre: "Postres" },
  { id: "Side", nombre: "Guarniciones" },
];

// Pasa un plato de TheMealDB al formato de receta de Tuppi, sin IA. Ingredientes en inglés, tal cual vienen.
function aRecetaTuppi(detalle) {
  const pasos = detalle.instrucciones
    .split(/\r?\n+/)
    .map((paso) => paso.replace(/^step\s*\d+[:.]?\s*/i, "").trim())
    .filter((paso) => paso.length > 1);

  return {
    titulo: detalle.titulo,
    porQueSirve: `${detalle.categoria ?? "Plato"}${detalle.area ? ` · cocina ${detalle.area}` : ""}. Tiempo y porciones aproximados.`,
    porciones: 2,
    tiempoMin: 30,
    ingredientes: detalle.ingredientes.map((ingrediente) => ({
      nombre: ingrediente.nombre,
      cantidad: ingrediente.cantidad,
      unidad: "",
      gramos: null,
      nombreEn: ingrediente.nombre,
      aComprar: false,
    })),
    pasos: pasos.length > 0 ? pasos : [detalle.instrucciones],
    reemplazos: [],
    advertencias: [],
    sinAdaptar: true,
    // En Descubrir no sabemos qué tenés en casa: los ingredientes se muestran como lista, sin "Tenés" ni "Te falta".
    sinContexto: true,
    origen: "themealdb",
    themealdbId: detalle.id,
    imagen: detalle.imagen
      ? { url: detalle.imagen, fuente: "themealdb", credito: null, link: "https://www.themealdb.com" }
      : null,
  };
}

// Revisa el plato contra las restricciones del usuario: si algo está prohibido se descarta; si hay dudas, queda con aviso.
function revisar(receta, restricciones) {
  const control = revisarReceta(receta, restricciones);
  if (!control.apta) return null;
  return {
    ...receta,
    comensalIds: [],
    restriccionesAplicadas: restricciones,
    advertencias: control.avisos.map((aviso) => aviso.texto),
  };
}

// Hasta 8 platos de una categoría, ya revisados contra las restricciones del usuario.
export async function recetasDeCategoria(categoria, restricciones) {
  const lista = (await listarPorCategoria(categoria)).slice(0, 8);
  const detalles = await Promise.all(lista.map((plato) => obtenerRecetaCacheada(plato.id).catch(() => null)));
  return detalles
    .filter(Boolean)
    .map((detalle) => revisar(aRecetaTuppi(detalle), restricciones))
    .filter(Boolean);
}

// "Para hoy": 3 categorías distintas que rotan con el día, hasta 3 platos de cada una. Así no son todos del mismo tipo.
export async function recetasDeHoy(restricciones, dia) {
  const categorias = [0, 3, 6].map((salto) => CATEGORIAS[(dia + salto) % CATEGORIAS.length].id);
  const grupos = await Promise.all(
    categorias.map(async (categoria, indice) => {
      const lista = await listarPorCategoria(categoria);
      if (lista.length === 0) return [];
      const inicio = (dia * 3 + indice) % lista.length;
      const elegidos = [0, 1, 2, 3].map((paso) => lista[(inicio + paso) % lista.length]);
      const detalles = await Promise.all(elegidos.map((plato) => obtenerRecetaCacheada(plato.id).catch(() => null)));
      return detalles
        .filter(Boolean)
        .map((detalle) => revisar(aRecetaTuppi(detalle), restricciones))
        .filter(Boolean)
        .slice(0, 3);
    }),
  );
  return grupos.flat();
}

// La receta del día: la misma para todos durante el día (la categoría y el plato salen de la fecha).
export async function recetaDelDia(restricciones, dia) {
  const categoria = CATEGORIAS[dia % CATEGORIAS.length].id;
  const lista = await listarPorCategoria(categoria);
  for (let intento = 0; intento < Math.min(lista.length, 6); intento += 1) {
    const plato = lista[(dia + intento) % lista.length];
    const detalle = await obtenerRecetaCacheada(plato.id).catch(() => null);
    const receta = detalle ? revisar(aRecetaTuppi(detalle), restricciones) : null;
    if (receta) return receta;
  }
  return null;
}

// Número de día (días desde 1970): cambia a las 00:00 UTC. Se usa para elegir la receta del día.
export function diaActual() {
  return Math.floor(Date.now() / 86400000);
}
