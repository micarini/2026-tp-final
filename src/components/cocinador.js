"use client";

import { useState, useTransition } from "react";
import { sugerirRecetas } from "@/app/actions/cocinar";
import GuardarReceta from "@/components/guardar-receta";
import Etiqueta, { COLORES_ETIQUETA } from "@/components/ui/etiqueta";
import Boton from "@/components/ui/boton";

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

function TarjetaReceta({ receta, compacta = false, onAbrir }) {
  const propios = receta.ingredientes.filter((ingrediente) => !ingrediente.aComprar);
  const comprar = receta.ingredientes.filter((ingrediente) => ingrediente.aComprar);

  if (compacta) {
    return (
      <button
        type="button"
        onClick={onAbrir}
        className="group flex h-full flex-col overflow-hidden rounded-tarjeta border border-borde bg-blanco text-left shadow-tarjeta transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
        aria-label={`Ver detalles de ${receta.titulo}`}
      >
        {receta.imagen?.url ? (
          <img src={receta.imagen.url} alt="" className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-hoja-100 font-titulo text-3xl text-hoja-700">Tuppi</div>
        )}
        <span className="flex flex-1 flex-col gap-3 p-4">
          <span className="flex items-start justify-between gap-3">
            <span className="font-titulo text-xl font-semibold">{receta.titulo}</span>
            <span className="shrink-0 rounded-full bg-hoja-100 px-2.5 py-1 text-xs font-medium text-hoja-900">Apta</span>
          </span>
          <span className="line-clamp-2 text-sm text-tinta-2">{receta.porQueSirve}</span>
          <span className="mt-auto flex items-center justify-between text-sm text-tinta-2">
            <span>{receta.tiempoMin} min · {receta.porciones} porciones</span>
            <span className="font-medium text-hoja-700">Ver más</span>
          </span>
        </span>
      </button>
    );
  }

  return (
    <article className="flex scroll-mt-6 flex-col gap-5 rounded-tarjeta bg-blanco p-5 shadow-tarjeta animate-subir sm:p-6" id="receta-abierta">
      {receta.imagen?.url && (
        <img src={receta.imagen.url} alt="" className="aspect-[16/9] w-full rounded-campo object-cover" />
      )}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-titulo text-2xl font-semibold">{receta.titulo}</h2>
          <span className="rounded-full bg-hoja-100 px-3 py-1 text-sm font-medium text-hoja-900">Apta</span>
        </div>
        <p className="text-tinta-2">{receta.porQueSirve}</p>
        <p className="text-sm text-tinta-2">
          {receta.tiempoMin} min · {receta.porciones} porciones
        </p>
      </div>

      {receta.advertencias.length > 0 && (
        <div className="rounded-campo bg-zanahoria/20 p-3 text-sm text-tinta" role="note">
          <strong>Ojo:</strong> {receta.advertencias.join(" ")}
        </div>
      )}

      <div className="grid gap-4 border-t border-borde pt-4 sm:grid-cols-2">
        <div>
          <h3 className="font-medium">Tenés</h3>
          <ul className="mt-2 list-disc pl-5 text-sm">{propios.map((item) => <li key={item.nombre}>{item.nombre}</li>)}</ul>
        </div>
        <div>
          <h3 className="font-medium">A comprar</h3>
          {comprar.length === 0 ? (
            <p className="mt-2 text-sm text-tinta-2">Nada por ahora.</p>
          ) : (
            <ul className="mt-2 list-disc pl-5 text-sm">{comprar.map((item) => <li key={item.nombre}>{item.nombre}</li>)}</ul>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-borde pt-4">
        <h3 className="font-titulo text-xl font-semibold">Cómo se hace</h3>
        <ol className="list-decimal space-y-2 pl-5">{receta.pasos.map((paso) => <li key={paso}>{paso}</li>)}</ol>
        {receta.reemplazos.length > 0 && (
          <p className="text-sm text-tinta-2"><strong>Reemplazos:</strong> {receta.reemplazos.join(" ")}</p>
        )}
      </div>
      {receta.imagen?.credito && (
        <a href={receta.imagen.link} target="_blank" rel="noreferrer" className="text-xs text-tinta-2 underline">
          Foto de {receta.imagen.credito}
        </a>
      )}
      <GuardarReceta receta={receta} />
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

  return (
    <div className="flex flex-col gap-6">
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

      {resultado?.recetas?.length > 0 && (
        <section className="flex flex-col gap-5" aria-live="polite">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-titulo text-2xl font-semibold">Ideas para cocinar</h2>
              <p className="mt-1 text-sm text-tinta-2">Elegí una para ver la receta completa.</p>
            </div>
            <span className="text-sm text-tinta-2">{resultado.recetas.length} sugerencias</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultado.recetas.map((receta, indice) => (
              <TarjetaReceta
                key={`${receta.titulo}-${receta.origen}`}
                receta={receta}
                compacta
                onAbrir={() => {
                  setRecetaAbierta(indice);
                  requestAnimationFrame(() => document.getElementById("receta-abierta")?.scrollIntoView({ behavior: "smooth", block: "start" }));
                }}
              />
            ))}
          </div>
          {recetaAbierta !== null && resultado.recetas[recetaAbierta] && (
            <TarjetaReceta receta={resultado.recetas[recetaAbierta]} />
          )}
        </section>
      )}
    </div>
  );
}
