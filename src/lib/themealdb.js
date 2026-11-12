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

export function intersectar(listas) {
  if (listas.some((lista) => lista.length === 0)) return [];
  const validas = listas.filter((lista) => lista.length > 0);
  if (validas.length === 0) return [];
  if (validas.length === 1) return validas[0];

  const cantidades = new Map();
  for (const lista of validas) {
    for (const receta of lista) {
      cantidades.set(receta.id, (cantidades.get(receta.id) ?? 0) + 1);
    }
  }

  const ids = [...cantidades.entries()]
    .filter(([, cantidad]) => cantidad === validas.length)
    .map(([id]) => id);
  const idsFinales = ids.length > 0
    ? ids
    : [...cantidades.entries()]
      .sort(([, cantidadA], [, cantidadB]) => cantidadB - cantidadA)
      .map(([id]) => id);
  const porId = new Map(validas.flat().map((receta) => [receta.id, receta]));

  return idsFinales.map((id) => porId.get(id)).filter(Boolean);
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
