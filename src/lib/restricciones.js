// Catálogo de restricciones y alergias de Tuppi (PRD, H2 y H4).
// Es la pieza que hace confiable el control: la IA propone recetas, pero el que decide si
// una receta es apta es este código, revisando cada ingrediente contra estas listas.
// No tiene "server-only" porque el formulario del perfil también usa las opciones.

// Cada opción tiene palabras prohibidas en español y en inglés (TheMealDB viene en inglés).
// Se comparan como palabras enteras, aceptando el plural: "huevo" encuentra "huevos",
// pero "pan" no encuentra "panceta".
// "excepciones" son frases que se sacan antes de comparar: "leche de coco" no es lácteo.

const CARNES = [
  "carne", "pollo", "cerdo", "jamon", "panceta", "tocino", "chorizo", "salchicha", "morcilla",
  "cordero", "pavo", "pato", "bondiola", "lomo", "vacio", "matambre", "milanesa", "salame",
  "beef", "chicken", "pork", "ham", "bacon", "sausage", "lamb", "turkey", "duck", "veal",
  "steak", "mince", "lard", "grasa", "pesto", "prosciutto", "salami", "chorizo", "pepperoni", "gelatina", "gelatin",
];
const PESCADOS = [
  "pescado", "atun", "salmon", "merluza", "anchoa", "sardina", "bacalao", "trucha", "caballa",
  "salsa de pescado", "anchoveta", "fish", "tuna", "cod", "anchovy", "anchovies", "sardine", "trout",
  "mackerel", "haddock", "fish sauce",
];
const MARISCOS = [
  "camaron", "gamba", "langostino", "calamar", "mejillon", "almeja", "pulpo", "cangrejo", "langosta",
  "vieira", "shrimp", "prawn", "squid", "mussel", "clam", "octopus", "crab", "lobster",
  "scallop", "oyster", "seafood",
];
const LACTEOS = [
  "leche", "queso", "manteca", "mantequilla", "crema", "yogur", "yogurt", "ricota", "muzzarella",
  "mozzarella", "parmesano", "dulce de leche", "queso crema", "nata", "requeson", "pesto", "milk", "cheese", "butter", "cream",
  "yoghurt", "ricotta", "parmesan", "cheddar", "feta", "ghee", "buttermilk", "creme fraiche",
];
const SIN_LACTEOS_PERO_PARECEN = [
  "leche de coco", "leche de almendra", "leche de avena", "leche de soja", "leche vegetal",
  "crema de coco", "manteca de mani", "manteca de cacao", "coconut milk", "coconut cream",
  "almond milk", "oat milk", "soy milk", "peanut butter", "cocoa butter", "cream of tartar",
];
const HUEVO = ["huevo", "clara", "yema", "mayonesa", "egg", "eggs", "mayonnaise", "meringue", "merengue"];

export const RESTRICCIONES = [
  {
    id: "sin-gluten",
    nombre: "Sin gluten",
    prohibidos: [
      "harina", "trigo", "pan", "pan rallado", "fideos", "pasta", "cebada", "centeno", "semola",
      "cuscus", "galletita", "rebozador", "cerveza", "seitan", "malta", "tapa de empanada",
      "flour", "wheat", "bread", "breadcrumbs", "noodles", "spaghetti", "macaroni", "penne",
      "lasagne", "barley", "rye", "couscous", "semolina", "beer", "seitan", "malt", "pastry",
      "biscuit",
    ],
    excepciones: [
      "harina de arroz", "harina de maiz", "harina de garbanzo", "fideos de arroz", "pasta de mani",
      "pasta de tomate", "rice flour", "corn flour", "chickpea flour", "rice noodles", "tomato paste",
    ],
  },
  {
    id: "vegano",
    nombre: "Vegano",
    prohibidos: [...CARNES, ...PESCADOS, ...MARISCOS, ...LACTEOS, ...HUEVO, "miel", "honey"],
    excepciones: SIN_LACTEOS_PERO_PARECEN,
  },
  {
    id: "vegetariano",
    nombre: "Vegetariano",
    prohibidos: [...CARNES, ...PESCADOS, ...MARISCOS],
    excepciones: [],
  },
  {
    id: "sin-lactosa",
    nombre: "Sin lactosa",
    prohibidos: LACTEOS,
    excepciones: SIN_LACTEOS_PERO_PARECEN,
  },
];

export const ALERGIAS = [
  {
    id: "mani",
    nombre: "Maní",
    prohibidos: ["mani", "cacahuate", "manteca de mani", "peanut", "peanuts", "peanut butter"],
    excepciones: [],
  },
  {
    id: "frutos-secos",
    nombre: "Frutos secos",
    prohibidos: [
      "nuez", "nueces", "almendra", "avellana", "castana de caju", "caju", "pistacho", "pecan",
      "walnut", "almond", "hazelnut", "cashew", "pistachio", "pecan", "macadamia",
    ],
    excepciones: ["nuez moscada", "nutmeg"],
  },
  { id: "huevo", nombre: "Huevo", prohibidos: HUEVO, excepciones: [] },
  { id: "pescado", nombre: "Pescado", prohibidos: PESCADOS, excepciones: [] },
  { id: "mariscos", nombre: "Mariscos", prohibidos: MARISCOS, excepciones: [] },
  {
    id: "soja",
    nombre: "Soja",
    prohibidos: ["soja", "tofu", "salsa de soja", "edamame", "miso", "tempeh", "soy", "soya", "soy sauce"],
    excepciones: [],
  },
];

// Productos que suelen tener gluten escondido: no se descartan, se avisan (PRD, H4).
const ESCONDEN_GLUTEN = [
  "salsa de soja", "caldo", "cubito", "avena", "salsa inglesa", "mostaza", "soy sauce", "stock",
  "bouillon", "oats", "worcestershire", "mustard",
];

const TODAS = [...RESTRICCIONES, ...ALERGIAS];
export const IDS_RESTRICCIONES = RESTRICCIONES.map((r) => r.id);
export const IDS_ALERGIAS = ALERGIAS.map((a) => a.id);

// "Jamón Cocido" → "jamon cocido": minúsculas y sin tildes, para comparar sin sorpresas.
export function normalizar(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ¿Aparece la palabra (o su plural) como palabra entera dentro del texto?
function contiene(texto, palabra) {
  // Cada palabra de la frase acepta su plural: "tapa de empanada" encuentra "tapas de empanadas".
  const patron = normalizar(palabra)
    .split(" ")
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(s|es)?")
    .join(" ");
  return new RegExp(`(^|[^a-z])${patron}([^a-z]|$)`).test(texto);
}

// La unión de las restricciones de todos los que comen, sin repetidos.
// perfil y cada comensal traen { restricciones: [], alergias: [] }.
export function combinarRestricciones(perfil, comensales = []) {
  const ids = new Set();
  for (const persona of [perfil, ...comensales]) {
    for (const id of persona?.restricciones ?? []) ids.add(id);
    for (const id of persona?.alergias ?? []) ids.add(id);
  }
  return [...ids].filter((id) => TODAS.some((o) => o.id === id));
}

// Revisa una receta contra una lista de ids del catálogo.
// receta.ingredientes: [{ nombre, nombreEn? }]. Se revisan los dos nombres.
// Devuelve { apta, prohibidos: [{ ingrediente, motivo }], avisos: [{ ingrediente, texto }] }.
export function revisarReceta(receta, ids) {
  const opciones = TODAS.filter((o) => ids.includes(o.id));
  const prohibidos = [];
  const avisos = [];

  for (const ingrediente of receta?.ingredientes ?? []) {
    const original = normalizar(`${ingrediente.nombre ?? ""} | ${ingrediente.nombreEn ?? ""}`);

    for (const opcion of opciones) {
      let texto = original;
      for (const excepcion of opcion.excepciones) {
        texto = texto.replaceAll(normalizar(excepcion), " ");
      }
      const palabra = opcion.prohibidos.find((p) => contiene(texto, p));
      if (palabra) {
        prohibidos.push({ ingrediente: ingrediente.nombre, motivo: opcion.nombre });
      }
    }

    if (ids.includes("sin-gluten") && ESCONDEN_GLUTEN.some((p) => contiene(original, p))) {
      avisos.push({
        ingrediente: ingrediente.nombre,
        texto: `${ingrediente.nombre}: buscá una versión que diga "sin gluten".`,
      });
    }
  }

  return { apta: prohibidos.length === 0, prohibidos, avisos };
}
