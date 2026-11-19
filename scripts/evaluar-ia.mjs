// Evalúa la calidad de lo que devuelve la IA con casos fijos: ¿formato válido?, ¿cantidades?, ¿en español?, ¿respeta las restricciones?
// Gasta pedidos reales de Groq (unos pocos). Correr con:
//   node --env-file=.env.local --conditions=react-server scripts/evaluar-ia.mjs
import { proponerRecetas } from "../src/lib/ai.js";
import { revisarReceta } from "../src/lib/restricciones.js";

const CASOS = [
  { nombre: "arroz, tomate y huevo, sin restricciones", ingredientes: ["arroz", "tomate", "huevo"], restricciones: [] },
  { nombre: "pollo y papa, celíaca", ingredientes: ["pollo", "papa"], restricciones: ["sin-gluten"] },
  { nombre: "lentejas y zanahoria, vegana", ingredientes: ["lentejas", "zanahoria"], restricciones: ["vegano"] },
  { nombre: "pasta y queso, sin lactosa", ingredientes: ["pasta", "queso"], restricciones: ["sin-lactosa"] },
];

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("Falta GROQ_API_KEY (usá --env-file=.env.local).");
  process.exit(1);
}

const ingles = /\b(the|and|with|until|minutes|chicken|onion|garlic)\b/i;
let total = 0, conCantidades = 0, enEspanol = 0, aptas = 0;

for (const caso of CASOS) {
  try {
    const recetas = await proponerRecetas(apiKey, { ingredientes: caso.ingredientes, restricciones: caso.restricciones, porciones: 2 });
    for (const receta of recetas) {
      total += 1;
      if (receta.ingredientes.every((i) => String(i.cantidad ?? "").trim() && Number(i.gramos) > 0)) conCantidades += 1;
      if (!ingles.test(`${receta.titulo} ${receta.pasos.join(" ")}`)) enEspanol += 1;
      if (revisarReceta(receta, caso.restricciones).apta) aptas += 1;
    }
    console.log(`ok   ${caso.nombre}: ${recetas.length} recetas`);
  } catch (error) {
    console.log(`FALLA ${caso.nombre}: ${error.message}`);
  }
}
const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
console.log(`\nRecetas evaluadas: ${total}`);
console.log(`Con cantidad y gramos en todos los ingredientes: ${pct(conCantidades)}%`);
console.log(`En español: ${pct(enEspanol)}%`);
console.log(`Aptas según el control del código: ${pct(aptas)}%`);
