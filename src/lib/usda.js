import "server-only";

// Macros por ingrediente desde USDA FoodData Central. Devuelve valores por 100 g, o null si no encuentra.
const API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
// Números de nutriente de FoodData Central.
const NUTRIENTES = { kcal: 1008, proteinas: 1003, carbohidratos: 1005, grasas: 1004 };

// Palabras que delatan un producto procesado. El primer resultado de USDA suele ser uno
// (por ejemplo "corned beef" para "beef"), y eso arruina los macros: se descartan salvo que
// la persona haya escrito justo esa palabra.
const PROCESADOS = /\b(powder|flour|dried|dehydrated|canned|cured|bread|snacks?|crackers?|cakes?|pancakes?|sauce|babyfood|juice|chips|sticks|substitute|mix|bologna|fried|pickled|smoked|frozen|prepared|soup|candies|cereals?|bars?|pie|sausage|bacon|jerky)\b/;

function limpiar(nombre) {
  return String(nombre ?? "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Ordena los alimentos: primero los "crudos y enteros" que mejor representan al ingrediente.
export function ordenarAlimentos(alimentos, termino) {
  const palabra = limpiar(termino).split(" ").filter(Boolean).pop() ?? "";
  const raiz = palabra.replace(/(es|s)$/, "");
  const puntuados = alimentos
    .map((alimento) => {
      const descripcion = limpiar(alimento.description);
      const procesado = descripcion.match(PROCESADOS)?.[0];
      if (procesado && !limpiar(termino).includes(procesado)) return null;
      let puntos = 0;
      if (raiz && descripcion.split(" ")[0].startsWith(raiz)) puntos += 3;
      if (/\braw\b/.test(descripcion)) puntos += 2;
      if (alimento.dataType === "Foundation") puntos += 1;
      return { alimento, puntos };
    })
    .filter(Boolean)
    .sort((a, b) => b.puntos - a.puntos);
  return puntuados.map((item) => item.alimento);
}

// Pasa los nutrientes de un alimento a { kcal, proteinas, carbohidratos, grasas } por 100 g.
export function nutrientesDe(alimento) {
  const valor = (id) => {
    const dato = alimento.foodNutrients?.find((n) => n.nutrientId === id);
    return typeof dato?.value === "number" ? dato.value : 0;
  };
  const resultado = {};
  for (const [clave, id] of Object.entries(NUTRIENTES)) resultado[clave] = valor(id);
  // USDA omite los ceros y a veces las kcal: si faltan, salen de 4/4/9 kcal por gramo.
  if (!resultado.kcal) resultado.kcal = 4 * resultado.proteinas + 4 * resultado.carbohidratos + 9 * resultado.grasas;
  return resultado.kcal > 0 ? resultado : null;
}

export async function macrosPor100g(nombreEn) {
  const termino = limpiar(nombreEn);
  if (!termino || !process.env.USDA_API_KEY) return null;

  const url = `${API_URL}?query=${encodeURIComponent(termino)}&pageSize=25&dataType=Foundation,SR%20Legacy&api_key=${process.env.USDA_API_KEY}`;
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!respuesta.ok) throw new Error(`USDA respondió con ${respuesta.status}.`);

  // Algunos alimentos vienen sin nutrientes cargados: se usa el primero que sí los tenga.
  for (const alimento of ordenarAlimentos((await respuesta.json()).foods ?? [], termino)) {
    const nutrientes = nutrientesDe(alimento);
    if (nutrientes) return nutrientes;
  }
  return null;
}
