import "server-only";

// Macros por ingrediente desde USDA FoodData Central. Devuelve valores por 100 g, o null si no encuentra.
const API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
// Números de nutriente de FoodData Central.
const NUTRIENTES = { kcal: 1008, proteinas: 1003, carbohidratos: 1005, grasas: 1004 };

export async function macrosPor100g(nombreEn) {
  const termino = String(nombreEn ?? "").trim();
  if (!termino || !process.env.USDA_API_KEY) return null;

  const url = `${API_URL}?query=${encodeURIComponent(termino)}&pageSize=1&dataType=Foundation,SR%20Legacy&api_key=${process.env.USDA_API_KEY}`;
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!respuesta.ok) throw new Error(`USDA respondió con ${respuesta.status}.`);

  const alimento = (await respuesta.json()).foods?.[0];
  if (!alimento) return null;

  const valor = (id) => alimento.foodNutrients?.find((n) => n.nutrientId === id)?.value;
  const resultado = {};
  for (const [clave, id] of Object.entries(NUTRIENTES)) {
    const cantidad = valor(id);
    if (typeof cantidad !== "number") return null;
    resultado[clave] = cantidad;
  }
  return resultado;
}
