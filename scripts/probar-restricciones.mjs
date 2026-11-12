// Prueba del catálogo de restricciones: node scripts/probar-restricciones.mjs
// Para cada opción hay casos que tienen que quedar marcados y casos que tienen que pasar.
// (Node avisa "MODULE_TYPELESS_PACKAGE_JSON" al importar: es solo un aviso, se puede ignorar.)
// Sirve para mostrar en la defensa que el control lo hace el código, no la IA.
import { revisarReceta, RESTRICCIONES, ALERGIAS } from "../src/lib/restricciones.js";

const CASOS = {
  "sin-gluten": { marca: ["Fideos secos", "Pan rallado", "Plain flour"], marca2: ["Tapas de empanada"], pasa: ["Arroz", "Harina de arroz", "Panceta", "Pasta de tomate", "Harina de garbanzo"] },
  vegano: { marca: ["Huevos", "Queso rallado", "Miel", "Chicken breast"], pasa: ["Leche de coco", "Tofu", "Papa", "Cream of tartar"] },
  vegetariano: { marca: ["Pechuga de pollo", "Atún en lata", "Beef mince", "Lard", "Pesto"], pasa: ["Huevo", "Queso", "Lentejas"] },
  "sin-lactosa": { marca: ["Leche entera", "Manteca", "Parmesan cheese", "Nata", "Requesón"], pasa: ["Leche de almendras", "Peanut butter", "Aceite"] },
  mani: { marca: ["Maní tostado", "Peanut butter"], pasa: ["Almendras"] },
  "frutos-secos": { marca: ["Nueces", "Almendras", "Cashew nuts"], pasa: ["Maní", "Nuez moscada"] },
  huevo: { marca: ["Huevo", "Mayonesa", "Egg yolk"], pasa: ["Leche"] },
  pescado: { marca: ["Filet de merluza", "Salmón", "Tuna"], pasa: ["Pollo"] },
  mariscos: { marca: ["Langostinos", "Calamares", "Shrimp", "Gambas", "Seafood mix"], pasa: ["Pescado blanco"] },
  soja: { marca: ["Salsa de soja", "Tofu", "Soy milk"], pasa: ["Arroz"] },
};

let fallas = 0;
for (const opcion of [...RESTRICCIONES, ...ALERGIAS]) {
  const casos = CASOS[opcion.id];
  if (!casos) {
    console.log(`FALTA CASO  ${opcion.nombre}`);
    fallas++;
    continue;
  }
  for (const [esperado, lista] of [["marca", [...casos.marca, ...(casos.marca2 ?? [])]], ["pasa", casos.pasa]]) {
    for (const nombre of lista) {
      const { apta } = revisarReceta({ ingredientes: [{ nombre }] }, [opcion.id]);
      const ok = esperado === "marca" ? !apta : apta;
      if (!ok) fallas++;
      console.log(`${ok ? "ok   " : "FALLA"}  ${opcion.nombre.padEnd(13)} ${esperado.padEnd(5)} ${nombre}`);
    }
  }
}

const aviso = revisarReceta({ ingredientes: [{ nombre: "Salsa de soja" }] }, ["sin-gluten"]);
const conAviso = aviso.avisos.length === 1;
if (!conAviso) fallas++;
console.log(`${conAviso ? "ok   " : "FALLA"}  Sin gluten    aviso Salsa de soja → "${aviso.avisos[0]?.texto}"`);

console.log(fallas === 0 ? "\nTodo pasa." : `\n${fallas} casos fallan.`);
process.exit(fallas === 0 ? 0 : 1);
