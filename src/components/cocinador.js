"use client";

import { useState, useTransition } from "react";
import { sugerirRecetas } from "@/app/actions/cocinar";
import GuardarReceta from "@/components/guardar-receta";
import Etiqueta, { COLORES_ETIQUETA } from "@/components/ui/etiqueta";
import Boton from "@/components/ui/boton";
import Image from "next/image";
import { fotoRespaldo } from "@/lib/respaldo";
import { RESTRICCIONES, ALERGIAS } from "@/lib/restricciones";
import { IconoCheck, IconoMas } from "@/components/iconos";

const MAXIMO = 10;

function SelectorPersonas({ comensales, seleccionados, setSeleccionados }) {
  function alternar(id) {
    setSeleccionados(
      seleccionados.includes(id)
        ? seleccionados.filter((seleccionado) => seleccionado !== id)
        : [...seleccionados, id],
    );
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-titulo text-xl font-semibold">¿Para quién cocinás?</legend>
      <p className="text-sm text-tinta-2">Tuppi combina las restricciones de todas las personas elegidas.</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSeleccionados([])}
          aria-pressed={seleccionados.length === 0}
          className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
            seleccionados.length === 0
              ? "border-hoja-900 bg-hoja-900 text-blanco"
              : "border-borde bg-blanco text-tinta hover:border-hoja-700"
          }`}
        >
          Solo yo
        </button>
        {comensales.map((comensal) => (
          <button
            type="button"
            key={comensal.id}
            onClick={() => alternar(comensal.id)}
            aria-pressed={seleccionados.includes(comensal.id)}
            className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
              seleccionados.includes(comensal.id)
                ? "border-hoja-900 bg-hoja-900 text-blanco"
                : "border-borde bg-blanco text-tinta hover:border-hoja-700"
            }`}
          >
            {comensal.nombre}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ListaIngredientes({ titulo, placeholder, lista, setLista, colorInicial, maximo = MAXIMO }) {
  const [texto, setTexto] = useState("");

  function agregar(event) {
    event.preventDefault();
    const nuevo = texto.trim().toLowerCase();
    if (!nuevo || lista.includes(nuevo) || lista.length >= maximo) return;
    setLista([...lista, nuevo]);
    setTexto("");
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={agregar} className="flex flex-col gap-2">
        <label htmlFor={`ingrediente-${colorInicial}`} className="font-titulo text-xl font-semibold">
          {titulo}
        </label>
        <div className="flex gap-2">
          <input
            id={`ingrediente-${colorInicial}`}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder={placeholder}
            maxLength={40}
            autoComplete="off"
            className="min-h-12 w-full rounded-campo border border-borde bg-blanco px-4 text-base placeholder:text-tinta-3 focus:border-hoja-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-hoja-700/30"
          />
          <Boton type="submit" variante="secundario" className="shrink-0">Agregar</Boton>
        </div>
      </form>
      <div className="flex min-h-20 flex-wrap content-start gap-2 rounded-campo border-2 border-dashed border-borde bg-papel p-3">
        {lista.length === 0 ? (
          <p className="m-auto text-center text-sm text-tinta-2">Todavía no agregaste ninguno.</p>
        ) : (
          lista.map((ingrediente, indice) => (
            <Etiqueta
              key={ingrediente}
              color={colorInicial === "tengo" ? COLORES_ETIQUETA[indice % COLORES_ETIQUETA.length] : "tomate"}
              falta={colorInicial !== "tengo"}
              onQuitar={() => setLista(lista.filter((item) => item !== ingrediente))}
            >
              {ingrediente}
            </Etiqueta>
          ))
        )}
      </div>
    </div>
  );
}

// Textos de los stickers: "sin gluten", "vegano", "sin maní"... Solo los del catálogo (no los alimentos evitados).
function nombresSticker(receta) {
  const ids = receta.restriccionesAplicadas ?? [];
  const nombres = [];
  for (const id of ids) {
    const restriccion = RESTRICCIONES.find((opcion) => opcion.id === id);
    const alergia = ALERGIAS.find((opcion) => opcion.id === id);
    if (restriccion) nombres.push(restriccion.nombre.toLowerCase());
    else if (alergia) nombres.push(`sin ${alergia.nombre.toLowerCase()}`);
  }
  return nombres.slice(0, 2);
}

// Foto de la receta con el sticker encima. El * avisa que la receta hubo que adaptarla.
function FotoReceta({ receta, clase }) {
  const nombres = nombresSticker(receta);
  const adaptada = receta.advertencias.length > 0;
  return (
    <div className="relative">
      {receta.imagen?.url ? (
        <img src={receta.imagen.url} alt="" className={clase} />
      ) : (
        <Image src={fotoRespaldo(receta.titulo)} alt="" width={1280} height={720} className={clase} />
      )}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        {nombres.map((nombre, indice) => (
          <span
            key={nombre}
            className="grid size-16 place-items-center rounded-full border-2 border-blanco bg-lechuga p-1 text-center text-[0.7rem] leading-tight font-semibold text-tinta shadow-tarjeta animate-pegar"
            style={{ "--giro": `${indice === 0 ? -8 : 6}deg` }}
          >
            {nombre}{adaptada && "*"}
          </span>
        ))}
      </div>
    </div>
  );
}

function TarjetaReceta({ receta, compacta = false, onAbrir, onVolver }) {
  const propios = receta.ingredientes.filter((ingrediente) => !ingrediente.aComprar);
  const comprar = receta.ingredientes.filter((ingrediente) => ingrediente.aComprar);

  if (compacta) {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-tarjeta border border-borde bg-blanco text-left shadow-tarjeta transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg">
        <FotoReceta receta={receta} clase="aspect-[16/10] w-full object-cover" />
        <span className="flex flex-1 flex-col gap-3 p-4">
          <span className="flex items-start justify-between gap-3">
            <span className="font-titulo text-xl font-semibold">{receta.titulo}</span>
            <span className="shrink-0 rounded-full bg-hoja-100 px-2.5 py-1 text-xs font-medium text-hoja-900">Apta</span>
          </span>
          <span className="line-clamp-2 text-sm text-tinta-2">{receta.porQueSirve}</span>
          <span className="mt-auto rounded-campo bg-hoja-100 px-3 py-2 text-sm text-tinta-2">
            {receta.tiempoMin} min · {receta.porciones} {receta.porciones === 1 ? "porción" : "porciones"}
          </span>
          <Boton type="button" onClick={onAbrir} aria-label={`Ver receta de ${receta.titulo}`}>
            Ver receta
          </Boton>
        </span>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-6 rounded-tarjeta bg-blanco p-5 shadow-tarjeta animate-subir sm:p-6 lg:grid lg:grid-cols-[300px_1fr] lg:items-start lg:gap-x-10">
      <div className="flex flex-col gap-4">
        <FotoReceta receta={receta} clase="aspect-[4/3] w-full rounded-campo object-cover" />
        {receta.imagen?.credito && (
          <a href={receta.imagen.link} target="_blank" rel="noreferrer" className="-mt-2 text-xs text-tinta-2 underline">
            Foto de {receta.imagen.credito}
          </a>
        )}
        <div className="flex flex-col gap-2">
          <span className="self-start rounded-full bg-hoja-100 px-3 py-1 text-sm font-medium text-hoja-900">Apta</span>
          <h2 className="font-titulo text-2xl font-semibold">{receta.titulo}</h2>
          <p className="text-tinta-2">{receta.porQueSirve}</p>
          <p className="rounded-campo bg-hoja-100 px-3 py-2 text-sm text-tinta-2">
            {receta.tiempoMin} min · {receta.porciones} {receta.porciones === 1 ? "porción" : "porciones"}
          </p>
        </div>
        {receta.advertencias.length > 0 && (
          <div className="rounded-campo bg-zanahoria/20 p-3 text-sm text-tinta" role="note">
            <strong>*Ojo:</strong> {receta.advertencias.join(" ")}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <GuardarReceta receta={receta} />
          <Boton type="button" variante="secundario" onClick={onVolver}>Volver a ideas</Boton>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className="font-titulo text-xl font-semibold">Los ingredientes</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-campo bg-hoja-100 p-4">
              <h4 className="text-sm font-semibold text-hoja-900">Tenés</h4>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                {propios.map((item, indice) => (
                  <li key={`${item.nombre}-${indice}`} className="flex items-center gap-2">
                    <IconoCheck className="size-4 shrink-0 text-hoja-700" />
                    {item.nombre}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-campo border border-borde p-4">
              <h4 className="flex justify-between text-sm font-semibold text-hoja-900">
                A comprar <span className="font-normal text-tinta-2">{comprar.length}</span>
              </h4>
              {comprar.length === 0 ? (
                <p className="mt-2 text-sm text-tinta-2">Nada por ahora.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                  {comprar.map((item, indice) => (
                    <li key={`${item.nombre}-${indice}`} className="flex items-center gap-2">
                      <IconoMas className="size-4 shrink-0 text-tomate" />
                      {item.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-titulo text-xl font-semibold">Cómo se hace</h3>
          <ol className="flex flex-col gap-3">
            {receta.pasos.map((paso, indice) => (
              <li key={indice} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-hoja-900 text-sm font-medium text-blanco">{indice + 1}</span>
                <span className="pt-0.5">{paso}</span>
              </li>
            ))}
          </ol>
          {receta.reemplazos.length > 0 && (
            <p className="text-sm text-tinta-2"><strong>Reemplazos:</strong> {receta.reemplazos.join(" ")}</p>
          )}
        </section>
      </div>
    </article>
  );
}

export default function Cocinador({ comensales }) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [noConsigue, setNoConsigue] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [recetaAbierta, setRecetaAbierta] = useState(null);
  const [buscando, startTransition] = useTransition();

  function buscar() {
    if (ingredientes.length < 1) {
      setResultado({ error: "Sumá al menos un ingrediente para buscar." });
      return;
    }
    setResultado(null);
    startTransition(async () => {
      const respuesta = await sugerirRecetas({
        ingredientes,
        noConsigue,
        comensalIds: seleccionados,
      });
      setResultado(respuesta);
      setRecetaAbierta(null);
    });
  }

  // Al abrir una receta se muestra aparte, en lugar del formulario, con un botón para volver a las ideas.
  if (recetaAbierta !== null && resultado?.recetas?.[recetaAbierta]) {
    return (
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setRecetaAbierta(null)}
          className="self-start text-sm font-medium text-hoja-700 underline underline-offset-4"
        >
          Volver a las ideas
        </button>
        <div className="mx-auto w-full max-w-4xl">
          <TarjetaReceta receta={resultado.recetas[recetaAbierta]} onVolver={() => setRecetaAbierta(null)} />
        </div>
      </div>
    );
  }

  // Mobile: formulario arriba y recetas abajo. Desktop: formulario a la izquierda y recetas a la derecha.
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <section className="flex flex-col gap-6 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6">
        <SelectorPersonas
          comensales={comensales}
          seleccionados={seleccionados}
          setSeleccionados={setSeleccionados}
        />
        <ListaIngredientes
          titulo="¿Qué hay en tu heladera?"
          placeholder="Por ejemplo, pollo"
          lista={ingredientes}
          setLista={setIngredientes}
          colorInicial="tengo"
        />
        <ListaIngredientes
          titulo="¿Qué no conseguís?"
          placeholder="Por ejemplo, crema"
          lista={noConsigue}
          setLista={setNoConsigue}
          colorInicial="falta"
        />
        <Boton type="button" onClick={buscar} cargando={buscando} disabled={ingredientes.length === 0}>
          Buscar recetas
        </Boton>
        {resultado?.error && <p role="alert" className="text-sm text-tomate">{resultado.error}</p>}
        {resultado?.error && (
          <Boton type="button" variante="secundario" onClick={buscar} cargando={buscando}>
            Reintentar
          </Boton>
        )}
      </section>

      {!(resultado?.recetas?.length > 0) && (
        <section className="flex flex-col overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta">
          <Image
            src="/receta-respaldo-2.png"
            alt=""
            width={1280}
            height={720}
            priority
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="flex flex-col gap-1 p-5 sm:p-6">
            <h2 className="font-titulo text-xl font-semibold">Tus recetas van a aparecer acá</h2>
            <p className="text-tinta-2">Sumá lo que tenés en la heladera y tocá Buscar recetas.</p>
          </div>
        </section>
      )}

      {resultado?.recetas?.length > 0 && (
        <section className="flex flex-col gap-5" aria-live="polite">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-titulo text-2xl font-semibold">Ideas para cocinar</h2>
              <p className="mt-1 text-sm text-tinta-2">Elegí una para ver la receta completa.</p>
            </div>
            <span className="text-sm text-tinta-2">{resultado.recetas.length} sugerencias</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {resultado.recetas.map((receta, indice) => (
              <TarjetaReceta
                key={`${receta.titulo}-${receta.origen}`}
                receta={receta}
                compacta
                onAbrir={() => {
                  setRecetaAbierta(indice);
                  window.scrollTo({ top: 0 });
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
