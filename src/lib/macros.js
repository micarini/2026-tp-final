import "server-only";

import { macrosPor100g } from "@/lib/usda";

// Suma los macros de todos los ingredientes y los divide por las porciones.
// Si a un ingrediente le falta el peso o USDA no lo encuentra, se salta y el resultado queda como "parcial".
export async function calcularMacros(receta) {
  const porciones = Number(receta.porciones) > 0 ? Number(receta.porciones) : 1;
  const total = { kcal: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };
  let parcial = false;
  let alguno = false;

  const datos = await Promise.all(
    receta.ingredientes.map(async (ingrediente) => {
      const gramos = Number(ingrediente.gramos);
      if (!(gramos > 0)) return null;
      try {
        return { gramos, por100: await macrosPor100g(ingrediente.nombreEn) };
      } catch {
        return { gramos, por100: null };
      }
    }),
  );

  for (const dato of datos) {
    if (!dato || !dato.por100) {
      parcial = true;
      continue;
    }
    alguno = true;
    for (const clave of Object.keys(total)) total[clave] += (dato.por100[clave] * dato.gramos) / 100;
  }

  if (!alguno) return null;
  const redondear = (n) => Math.round((n / porciones) * 10) / 10;
  return {
    kcal: Math.round(total.kcal / porciones),
    proteinas: redondear(total.proteinas),
    carbohidratos: redondear(total.carbohidratos),
    grasas: redondear(total.grasas),
    parcial,
  };
}
