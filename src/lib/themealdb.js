import "server-only";

const API_BASE = "https://www.themealdb.com/api/json/v1";
const API_KEY = process.env.THEMEALDB_API_KEY || "1";

async function pedir(endpoint) {
  const respuesta = await fetch(`${API_BASE}/${API_KEY}/${endpoint}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });

  if (!respuesta.ok) {
    throw new Error(`TheMealDB respondió con ${respuesta.status}.`);
  }

  return respuesta.json();
}

export async function buscarPorIngrediente(ingrediente) {
  const nombre = String(ingrediente ?? "").trim();
  if (!nombre) throw new Error("Falta el ingrediente para buscar en TheMealDB.");

  const datos = await pedir(`filter.php?i=${encodeURIComponent(nombre)}`);
  return (datos.meals ?? []).map((comida) => ({
    id: comida.idMeal,
    titulo: comida.strMeal,
    imagen: comida.strMealThumb,
  }));
}

// Devuelve los platos que aparecen en al menos "minimo" de las listas (una lista por ingrediente), los que cubren más ingredientes primero.
// Si ninguno llega al mínimo, devuelve vacío: mejor no sugerir nada que sugerir un plato que no usa lo que hay en casa.
export function intersectar(listas, minimo = listas.length) {
  const validas = listas.filter((lista) => lista.length > 0);
  if (validas.length === 0) return [];

  const cantidades = new Map();
  for (const lista of validas) {
    for (const receta of lista) {
      cantidades.set(receta.id, (cantidades.get(receta.id) ?? 0) + 1);
    }
  }

  const porId = new Map(validas.flat().map((receta) => [receta.id, receta]));
  return [...cantidades.entries()]
    .filter(([, cantidad]) => cantidad >= minimo)
    .sort(([, cantidadA], [, cantidadB]) => cantidadB - cantidadA)
    .map(([id]) => porId.get(id));
}

export async function obtenerReceta(id) {
  if (!id) throw new Error("Falta el id de la receta de TheMealDB.");

  const datos = await pedir(`lookup.php?i=${encodeURIComponent(id)}`);
  const comida = datos.meals?.[0];
  if (!comida) return null;

  const ingredientes = [];
  for (let indice = 1; indice <= 20; indice += 1) {
    const nombre = comida[`strIngredient${indice}`]?.trim();
    const cantidad = comida[`strMeasure${indice}`]?.trim();
    if (nombre) ingredientes.push({ nombre, cantidad: cantidad || "" });
  }

  return {
    id: comida.idMeal,
    titulo: comida.strMeal,
    categoria: comida.strCategory || null,
    area: comida.strArea || null,
    instrucciones: comida.strInstructions || "",
    ingredientes,
    imagen: comida.strMealThumb || null,
    video: comida.strYoutube || null,
  };
}

export async function obtenerCategorias() {
  "use cache";
  const datos = await pedir("list.php?c=list");
  return (datos.meals ?? []).map((categoria) => categoria.strCategory).filter(Boolean);
}

// Recetas de una categoría de TheMealDB (por ejemplo "Chicken"). No dependen del usuario: se cachean.
export async function listarPorCategoria(categoria) {
  "use cache";
  const datos = await pedir(`filter.php?c=${encodeURIComponent(categoria)}`);
  return (datos.meals ?? []).map((comida) => ({ id: comida.idMeal, titulo: comida.strMeal, imagen: comida.strMealThumb }));
}

// Igual que obtenerReceta, pero cacheada: el mismo plato lo piden muchas personas.
export async function obtenerRecetaCacheada(id) {
  "use cache";
  return obtenerReceta(id);
}
