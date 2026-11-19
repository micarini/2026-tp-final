import "server-only";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

function validarObjeto(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

function validarIngredientes(valor) {
  return validarObjeto(valor)
    && Array.isArray(valor.ingredientes)
    && valor.ingredientes.every((ingrediente) => (
      validarObjeto(ingrediente)
      && typeof ingrediente.nombre === "string"
      && typeof ingrediente.nombreEn === "string"
    ));
}

function validarReceta(valor) {
  return validarObjeto(valor)
    && typeof valor.titulo === "string"
    && typeof valor.porQueSirve === "string"
    && typeof valor.porciones === "number"
    && typeof valor.tiempoMin === "number"
    && Array.isArray(valor.ingredientes)
    && Array.isArray(valor.pasos)
    && Array.isArray(valor.reemplazos)
    && Array.isArray(valor.advertencias)
    && valor.pasos.every((paso) => typeof paso === "string")
    && valor.reemplazos.every((reemplazo) => typeof reemplazo === "string")
    && valor.advertencias.every((advertencia) => typeof advertencia === "string")
    && valor.ingredientes.every((ingrediente) => (
      validarObjeto(ingrediente)
      && typeof ingrediente.nombre === "string"
      && typeof ingrediente.nombreEn === "string"
      && typeof ingrediente.aComprar === "boolean"
      // Cada ingrediente tiene que traer cuánto usar: cantidad con unidad y gramos aproximados.
      && String(ingrediente.cantidad ?? "").trim() !== ""
      && Number(ingrediente.gramos) > 0
    ));
}

function validarListaRecetas(valor) {
  return validarObjeto(valor)
    && Array.isArray(valor.recetas)
    && valor.recetas.length >= 2
    && valor.recetas.length <= 3
    && valor.recetas.every(validarReceta);
}

// La clave la elige quien llama: la propia del usuario o la de la app (el límite diario se cuenta afuera, una vez por búsqueda).
async function pedirUnaVez({ apiKey, sistema, usuario, validar }) {
  if (!apiKey) {
    throw new Error("Falta configurar GROQ_API_KEY en las variables del servidor.");
  }

  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${sistema}\nLa respuesta debe ser JSON válido (json), sin texto adicional.` },
        { role: "user", content: usuario },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (respuesta.status === 429) {
    const error = new Error("Groq está momentáneamente limitado. Probá en un minuto.");
    error.status = 429;
    throw error;
  }
  if (respuesta.status === 401) {
    const error = new Error("La clave de Groq no es válida.");
    error.status = 401;
    throw error;
  }
  if (!respuesta.ok) {
    const error = new Error(`Groq respondió con ${respuesta.status}.`);
    error.status = respuesta.status;
    throw error;
  }

  const datos = await respuesta.json();
  const contenido = datos.choices?.[0]?.message?.content;
  if (typeof contenido !== "string") {
    throw new Error("Groq no devolvió contenido.");
  }

  try {
    const resultado = JSON.parse(contenido);
    if (!validar(resultado)) throw new Error("El resultado no tiene el formato esperado.");
    return resultado;
  } catch {
    throw new Error("Groq devolvió un formato inválido.");
  }
}

export async function pedirJSON({ apiKey, sistema, usuario, validar = validarObjeto }) {
  if (!apiKey || !sistema || !usuario) throw new Error("Faltan datos para pedirle algo a Groq.");

  try {
    return await pedirUnaVez({ apiKey, sistema, usuario, validar });
  } catch (error) {
    if (!error.message.includes("formato inválido") && !error.message.includes("formato esperado")) {
      throw error;
    }
    try {
      return await pedirUnaVez({
        apiKey,
        sistema: `${sistema}\nDevolvé únicamente un objeto JSON válido, sin markdown.`,
        usuario,
        validar,
      });
    } catch (segundoError) {
      const errorFinal = new Error(`No pudimos interpretar la respuesta de la IA: ${segundoError.message}`);
      errorFinal.status = segundoError.status;
      throw errorFinal;
    }
  }
}

const FORMATO_RECETA = `
Devolvé un objeto JSON con estas claves:
titulo (string), porQueSirve (string), porciones (number), tiempoMin (number),
ingredientes (array de objetos con nombre, cantidad, unidad, gramos, nombreEn, aComprar),
pasos (array de strings), reemplazos (array de strings), advertencias (array de strings, dejala vacía: las advertencias las calcula el sistema).
OBLIGATORIO: cada ingrediente lleva la cantidad exacta para las porciones indicadas (cantidad numérica y unidad: g, ml, unidad, cucharada, taza)
y gramos (número, peso aproximado en gramos). Nunca dejes un ingrediente sin cantidad. En los pasos mencioná las cantidades cuando importen.
`;

export async function traducirIngredientes(apiKey, lista) {
  const resultado = await pedirJSON({
    apiKey,
    sistema: `Traducí ingredientes del español al inglés para buscar recetas. ${JSON.stringify({
      ingredientes: [{ nombre: "pollo", nombreEn: "chicken" }],
    })}`,
    usuario: JSON.stringify({ ingredientes: lista }),
    validar: validarIngredientes,
  });
  return resultado.ingredientes ?? [];
}

export async function adaptarReceta(apiKey, receta, contexto = {}) {
  return pedirJSON({
    apiKey,
    sistema: `Sos una asistente de cocina. Adaptá recetas con claridad y sin inventar restricciones.
${FORMATO_RECETA}
Respondé SIEMPRE en español rioplatense: título, descripción, ingredientes (nombre), pasos, reemplazos y advertencias.
Normalizá cada ingrediente en nombreEn (inglés) y gramos cuando sea posible.
Marcá aComprar según los ingredientes que la persona tiene. Las restricciones se controlan fuera de la IA.`,
    usuario: JSON.stringify({ receta, contexto }),
    validar: validarReceta,
  });
}

export async function proponerReceta(apiKey, contexto) {
  return pedirJSON({
    apiKey,
    sistema: `Sos una asistente de cocina. Proponé una receta realista usando los ingredientes disponibles.
${FORMATO_RECETA}
Respondé SIEMPRE en español rioplatense. Usá sobre todo los ingredientes que la persona tiene; agregá pocos extras y que sean comunes.
Respetá el contexto recibido y no agregues ingredientes prohibidos.`,
    usuario: JSON.stringify(contexto),
    validar: validarReceta,
  });
}

export async function proponerRecetas(apiKey, contexto) {
  const resultado = await pedirJSON({
    apiKey,
    sistema: `Sos una asistente de cocina. Proponé entre 2 y 3 recetas distintas y realistas usando los ingredientes disponibles.
Devolvé un objeto con la clave recetas, que debe ser un array de 2 o 3 objetos.
Cada objeto debe tener estas claves:
titulo (string), porQueSirve (string), porciones (number), tiempoMin (number),
ingredientes (array de objetos con nombre, cantidad, unidad, gramos, nombreEn, aComprar),
pasos (array de strings), reemplazos (array de strings), advertencias (array de strings, dejala vacía: las advertencias las calcula el sistema).
OBLIGATORIO: cada ingrediente lleva la cantidad exacta para las porciones indicadas (cantidad numérica y unidad: g, ml, unidad, cucharada, taza)
y gramos (número, peso aproximado en gramos). Nunca dejes un ingrediente sin cantidad.
Respondé SIEMPRE en español rioplatense. Cada receta tiene que usar sobre todo los ingredientes que la persona tiene; agregá pocos extras y que sean comunes.
Respetá el contexto recibido y no agregues ingredientes prohibidos.`,
    usuario: JSON.stringify(contexto),
    validar: validarListaRecetas,
  });
  return resultado.recetas;
}

// Traduce al español una receta que vino en inglés (de TheMealDB), sin cambiar su estructura.
function validarTraduccion(valor) {
  return validarObjeto(valor)
    && typeof valor.titulo === "string"
    && typeof valor.porQueSirve === "string"
    && Array.isArray(valor.ingredientes)
    && valor.ingredientes.every((i) => validarObjeto(i) && typeof i.nombre === "string")
    && Array.isArray(valor.pasos)
    && valor.pasos.length > 0
    && valor.pasos.every((paso) => typeof paso === "string");
}

export async function traducirRecetaAlEspanol(apiKey, receta) {
  const resultado = await pedirJSON({
    apiKey,
    sistema: `Traducí esta receta del inglés al español rioplatense. Mantené el mismo orden y la misma cantidad de ingredientes.
Devolvé un objeto JSON con: titulo (string), porQueSirve (string), ingredientes (array de objetos con nombre, en el mismo orden que el original) y pasos (array de strings, un paso por elemento).
No cambies cantidades ni inventes pasos o ingredientes.`,
    usuario: JSON.stringify({
      titulo: receta.titulo,
      porQueSirve: receta.porQueSirve,
      ingredientes: receta.ingredientes.map((i) => ({ nombre: i.nombre })),
      pasos: receta.pasos,
    }),
    validar: validarTraduccion,
  });
  if (resultado.ingredientes.length !== receta.ingredientes.length) {
    throw new Error("La IA devolvió un formato inválido.");
  }
  return resultado;
}
