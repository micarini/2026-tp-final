// Prueba el cliente de Groq (src/lib/ai.js) con respuestas simuladas, sin gastar cuota.
// Correr con: node --conditions=react-server scripts/probar-ia.mjs
import assert from "node:assert/strict";
import { pedirJSON, traducirIngredientes } from "../src/lib/ai.js";

const realFetch = globalThis.fetch;
function simular(respuestas) {
  let llamadas = 0;
  globalThis.fetch = async () => {
    const r = respuestas[Math.min(llamadas++, respuestas.length - 1)];
    return { ok: r.status === 200, status: r.status, headers: { get: () => "0.01" }, json: async () => r.cuerpo };
  };
  return () => llamadas;
}
const contenido = (obj) => ({ choices: [{ message: { content: JSON.stringify(obj) } }] });

// 1. Límite de Groq (429): se reintenta 2 veces y recién después el error lleva status 429, que activa el respaldo con TheMealDB.
const llamadas429 = simular([{ status: 429 }]);
await assert.rejects(() => traducirIngredientes("gsk_x", ["pollo"]), (e) => e.status === 429);
assert.equal(llamadas429(), 3);

// 1b. Si el segundo intento anda, no hay error.
simular([{ status: 429 }, { status: 200, cuerpo: contenido({ ingredientes: [{ nombre: "pollo", nombreEn: "chicken" }] }) }]);
assert.equal((await traducirIngredientes("gsk_x", ["pollo"])).length, 1);

// 2. Clave inválida (401): mensaje propio y sin reintento.
const llamadas401 = simular([{ status: 401 }]);
await assert.rejects(() => traducirIngredientes("gsk_x", ["pollo"]), (e) => e.status === 401 && e.message.includes("clave de Groq"));
assert.equal(llamadas401(), 1);

// 3. Formato inválido: un reintento y después error.
const llamadasFormato = simular([{ status: 200, cuerpo: contenido({ nada: 1 }) }]);
await assert.rejects(() => traducirIngredientes("gsk_x", ["pollo"]));
assert.equal(llamadasFormato(), 2);

// 4. Respuesta correcta.
simular([{ status: 200, cuerpo: contenido({ ingredientes: [{ nombre: "pollo", nombreEn: "chicken" }] }) }]);
assert.deepEqual(await traducirIngredientes("gsk_x", ["pollo"]), [{ nombre: "pollo", nombreEn: "chicken" }]);

// 5. Sin clave no se llama a Groq.
simular([{ status: 200, cuerpo: contenido({}) }]);
await assert.rejects(() => pedirJSON({ apiKey: "", sistema: "s", usuario: "u" }));

globalThis.fetch = realFetch;
console.log("Todo pasa.");
