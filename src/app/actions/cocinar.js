"use server";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import { combinarRestricciones, revisarReceta } from "@/lib/restricciones";
import { traducirIngredientes, adaptarReceta, proponerRecetas } from "@/lib/ai";
import { buscarPorIngrediente, intersectar, obtenerReceta } from "@/lib/themealdb";
import { buscarFoto } from "@/lib/unsplash";

const ID_VALIDO = /^[A-Za-z0-9_-]{1,64}$/;
const TRADUCCIONES_BASICAS = {
  ajo: "garlic",
  arroz: "rice",
  cebolla: "onion",
  cilantro: "coriander",
  esparragos: "asparagus",
  espinaca: "spinach",
  hongos: "mushrooms",
  huevo: "egg",
  lentejas: "lentils",
  papa: "potato",
  papas: "potatoes",
  pescado: "fish",
  pollo: "chicken",
  tomate: "tomato",
  zanahoria: "carrot",
};

function leerLista(valor, maximo) {
  if (!Array.isArray(valor) || valor.length > maximo) return null;
  const lista = [...new Set(valor.map((item) => String(item).trim().toLowerCase()))];
  if (lista.some((item) => !item || item.length > 40)) return null;
  return lista;
}

function errorDeServicio(error) {
  const mensaje = error?.message ?? "";
  if (mensaje.includes("límite de pedidos")) return mensaje;
  if (mensaje.includes("minuto")) return mensaje;
  if (mensaje.includes("Groq respondió")) return "Groq rechazó la consulta. Revisá que la clave y el modelo estén habilitados.";
  if (mensaje.includes("TheMealDB respondió")) return "TheMealDB no respondió. Probá de nuevo en un momento.";
  if (mensaje.includes("Unsplash respondió")) return "Unsplash no respondió. Probá de nuevo en un momento.";
  if (mensaje.includes("GROQ_API_KEY") || mensaje.includes("UNSPLASH_ACCESS_KEY")) {
    return "Falta configurar un servicio externo en el servidor.";
  }
  return "No pudimos buscar recetas. Probá de nuevo en un momento.";
}

function groqLimitado(error) {
  return error?.status === 429;
}

function normalizarReceta(receta, origen, imagen) {
  return {
    ...receta,
    origen,
    imagen,
    ingredientes: receta.ingredientes.map((ingrediente) => ({
      nombre: String(ingrediente.nombre ?? ""),
      cantidad: String(ingrediente.cantidad ?? ""),
      unidad: String(ingrediente.unidad ?? ""),
      gramos: Number(ingrediente.gramos) || null,
      nombreEn: String(ingrediente.nombreEn ?? ""),
      aComprar: Boolean(ingrediente.aComprar),
    })),
    pasos: receta.pasos.map(String),
    reemplazos: receta.reemplazos.map(String),
    advertencias: receta.advertencias.map(String),
  };
}

function revisarSugerencias(recetas, restricciones, comensalIds) {
  return recetas
    .map((receta) => {
      const control = revisarReceta(receta, restricciones);
      return {
        ...receta,
        comensalIds,
        restriccionesAplicadas: restricciones,
        apta: control.apta,
        prohibidos: control.prohibidos,
        advertencias: [...new Set([...receta.advertencias, ...control.avisos.map((aviso) => aviso.texto)])],
      };
    })
    .filter((receta) => receta.apta);
}

// La foto es opcional: si Unsplash falla, la receta se muestra igual, sin imagen.
async function fotoOpcional(titulo) {
  try {
    return await buscarFoto(titulo);
  } catch {
    return null;
  }
}

function traducirSinIA(ingredientes) {
  return ingredientes.map((nombre) => ({
    nombre,
    nombreEn: TRADUCCIONES_BASICAS[nombre] ?? nombre,
  }));
}

function recetaSinIA(detalle, ingredientesDisponibles, comensalIds) {
  const disponibles = new Set(ingredientesDisponibles);
  return {
    titulo: detalle.titulo,
    porQueSirve: "Una opción de TheMealDB para aprovechar lo que tenés.",
    porciones: 1,
    tiempoMin: 30,
    ingredientes: detalle.ingredientes.map((ingrediente) => ({
      nombre: ingrediente.nombre,
      cantidad: ingrediente.cantidad,
      unidad: "",
      gramos: null,
      nombreEn: ingrediente.nombre,
      aComprar: ![...disponibles].some((disponible) => ingrediente.nombre.toLowerCase().includes(disponible)),
    })),
    pasos: [detalle.instrucciones],
    reemplazos: [],
    advertencias: [],
    origen: "themealdb",
    themealdbId: detalle.id,
    comensalIds,
    imagen: detalle.imagen
      ? {
        url: detalle.imagen,
        fuente: "themealdb",
        credito: null,
        link: "https://www.themealdb.com",
      }
      : null,
  };
}

export async function sugerirRecetas(datos) {
  const user = await requireUser();
  const ingredientes = leerLista(datos?.ingredientes, 10);
  const noConsigue = leerLista(datos?.noConsigue ?? [], 10);
  const comensalIds = Array.isArray(datos?.comensalIds)
    ? [...new Set(datos.comensalIds.map(String))]
    : [];

  if (!ingredientes || ingredientes.length < 1) {
    return { error: "Sumá al menos un ingrediente." };
  }
  if (!noConsigue || comensalIds.some((id) => !ID_VALIDO.test(id))) {
    return { error: "Hay un dato inválido en la búsqueda." };
  }

  try {
    const [perfilSnapshot, comensalesSnapshot] = await Promise.all([
      db().doc(`users/${user.uid}`).get(),
      db().collection(`users/${user.uid}/comensales`).get(),
    ]);
    const perfil = perfilSnapshot.data() ?? {};
    const comensales = comensalesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const elegidos = comensalIds.map((id) => comensales.find((comensal) => comensal.id === id));

    if (elegidos.some((comensal) => !comensal)) {
      return { error: "Uno de los comensales ya no está disponible." };
    }

    const restricciones = combinarRestricciones(perfil, elegidos);
    let traducidos;
    let groqDisponible = true;
    try {
      traducidos = await traducirIngredientes(user.uid, ingredientes);
    } catch (error) {
      if (!groqLimitado(error)) throw error;
      groqDisponible = false;
      traducidos = traducirSinIA(ingredientes);
    }
    const consultas = traducidos
      .map((ingrediente) => ingrediente.nombreEn)
      .filter(Boolean);
    const listas = await Promise.all(consultas.map(buscarPorIngrediente));
    const coincidencias = intersectar(listas);
    const contexto = {
      ingredientes,
      noConsigue,
      restricciones,
      porciones: Number(perfil.porcionesHabituales) || 1,
    };

    let recetas;
    if (coincidencias.length > 0) {
      const detalles = await Promise.all(
        coincidencias.slice(0, 3).map((coincidencia) => obtenerReceta(coincidencia.id)),
      );
      recetas = [];
      // Se revisan los ingredientes originales: la IA podría "adaptar" sacando uno prohibido de la lista.
      const aptos = detalles.filter(Boolean).filter((detalle) => revisarReceta({
        ingredientes: detalle.ingredientes.map((item) => ({ nombre: item.nombre, nombreEn: item.nombre })),
      }, restricciones).apta);
      for (const detalle of aptos) {
        if (!groqDisponible) {
          recetas.push(recetaSinIA(detalle, ingredientes, comensalIds));
          continue;
        }
        try {
          recetas.push({
              ...(await adaptarReceta(user.uid, detalle, contexto)),
              origen: "themealdb",
              themealdbId: detalle.id,
              imagen: detalle.imagen
                ? {
                  url: detalle.imagen,
                  fuente: "themealdb",
                  credito: null,
                  link: "https://www.themealdb.com",
                }
                : null,
          });
        } catch (error) {
          if (!groqLimitado(error)) throw error;
          groqDisponible = false;
          recetas.push(recetaSinIA(detalle, ingredientes, comensalIds));
        }
      }
    } else {
      if (!groqDisponible) {
        recetas = [];
      } else {
        const propuestas = await proponerRecetas(user.uid, contexto);
        recetas = await Promise.all(propuestas.map(async (propuesta) => ({
          ...normalizarReceta(propuesta, "ia", await fotoOpcional(propuesta.titulo)),
          comensalIds,
        })));
      }
    }

    let revisadas = revisarSugerencias(recetas, restricciones, comensalIds);

    if (groqDisponible && revisadas.length < 2 && coincidencias.length > 0) {
      const complementarias = await proponerRecetas(user.uid, contexto);
      const normalizadas = await Promise.all(complementarias.map(async (propuesta) => ({
        ...normalizarReceta(propuesta, "ia", await fotoOpcional(propuesta.titulo)),
        comensalIds,
      })));
      revisadas = [...revisadas, ...revisarSugerencias(normalizadas, restricciones, comensalIds)];
    }
    revisadas = revisadas.slice(0, 3);

    if (revisadas.length === 0) {
      return { error: "No encontramos una receta que respete todas las restricciones elegidas." };
    }
    return { ok: true, recetas: revisadas };
  } catch (error) {
    console.error("sugerirRecetas falló:", error?.code ?? error?.message);
    return { error: errorDeServicio(error) };
  }
}
