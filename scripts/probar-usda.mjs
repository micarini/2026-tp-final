// Prueba la elección de alimentos de USDA con la clave pública DEMO_KEY (limitada, sirve para probar).
// Correr con: USDA_API_KEY=DEMO_KEY node --conditions=react-server scripts/probar-usda.mjs
import { macrosPor100g, ordenarAlimentos, nutrientesDe } from "../src/lib/usda.js";
import assert from "node:assert/strict";

// Prueba sin red: lo que devolvía USDA para "beef" y "olive oil" (el primer resultado era un producto procesado o no tenía datos).
const nut = (kcal, p, c, g) => [{ nutrientId: 1008, value: kcal }, { nutrientId: 1003, value: p }, { nutrientId: 1005, value: c }, { nutrientId: 1004, value: g }];
const carne = ordenarAlimentos([
  { description: "Beef, cured, corned beef, canned", foodNutrients: nut(250, 27, 0, 16) },
  { description: "Beef, ground, raw", dataType: "SR Legacy", foodNutrients: nut(143, 21, 0.2, 6.5) },
], "beef");
assert.equal(carne[0].description, "Beef, ground, raw");
const aceite = ordenarAlimentos([
  { description: "Oil, olive, extra virgin", foodNutrients: [] },
  { description: "Oil, olive, salad or cooking", foodNutrients: nut(884, 0, 0, 100) },
], "olive oil");
assert.equal(aceite.map(nutrientesDe).find(Boolean).kcal, 884);
console.log("ok  elección sin red");

if (!process.env.USDA_API_KEY) process.exit(0);

const ESPERADOS = {
  beef: { proteinas: [15, 26] },
  potato: { proteinas: [1, 3] },
  "olive oil": { grasas: [90, 101] },
  rice: { carbohidratos: [70, 86] },
  egg: { proteinas: [11, 14] },
  tomato: { kcal: [12, 25] },
  chicken: { proteinas: [17, 24] },
};
let fallos = 0;
for (const [nombre, rangos] of Object.entries(ESPERADOS)) {
  const m = await macrosPor100g(nombre);
  const bien = m && Object.entries(rangos).every(([k, [min, max]]) => m[k] >= min && m[k] <= max);
  console.log(bien ? "ok " : "MAL", nombre, m ? JSON.stringify(m) : "sin datos");
  if (!bien) fallos += 1;
  await new Promise((r) => setTimeout(r, 800));
}
console.log(fallos ? `${fallos} fallos` : "Todo pasa.");
