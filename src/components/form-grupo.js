"use client";

// Cocinar para muchos: cuántos son, presupuesto y quiénes tienen restricciones. Devuelve un menú base y una adaptación por grupo.
import { useState, useTransition } from "react";
import { armarMenuGrupo } from "@/app/actions/grupo";
import { RESTRICCIONES, ALERGIAS } from "@/lib/restricciones";
import Boton from "@/components/ui/boton";
import GuardarReceta from "@/components/guardar-receta";
import Image from "next/image";
import { fotoRespaldo } from "@/lib/respaldo";
import { IconoFlecha, IconoCheck } from "@/components/iconos";

const CAMBIOS = ["Más veraniego y fresco", "Sin horno", "Más barato", "Con más verduras", "Otra idea"];

const PRESUPUESTOS = ["económico", "medio", "sin límite"];
const OPCIONES = [...RESTRICCIONES, ...ALERGIAS];

function Contador({ valor, setValor, minimo, maximo, etiqueta }) {
  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => setValor(Math.max(minimo, valor - 1))} disabled={valor <= minimo} aria-label={`${etiqueta}: uno menos`}
        className="grid size-10 place-items-center rounded-full border border-borde bg-blanco transition-transform active:scale-90 disabled:opacity-40">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
      </button>
      <output aria-live="polite" className="min-w-8 text-center font-titulo text-3xl font-semibold tabular-nums">{valor}</output>
      <button type="button" onClick={() => setValor(Math.min(maximo, valor + 1))} disabled={valor >= maximo} aria-label={`${etiqueta}: uno más`}
        className="grid size-10 place-items-center rounded-full bg-hoja-900 text-blanco transition-transform active:scale-90 disabled:opacity-40">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
      </button>
    </div>
  );
}

// Un menú de grupo se guarda en el recetario como una receta más: las adaptaciones quedan como pasos al final.
function recetaDeMenu(menu) {
  return {
    titulo: menu.titulo,
    porQueSirve: menu.porQueSirve,
    notas: `Menú para ${menu.personas} personas · ${menu.presupuesto}`,
    porciones: menu.personas,
    tiempoMin: menu.tiempoMin,
    ingredientes: menu.ingredientes.map((i) => ({ ...i, nombreEn: i.nombreEn || i.nombre, gramos: i.gramos ?? null, aComprar: false })),
    pasos: [
      ...menu.pasos,
      ...menu.adaptaciones.map((a) => `Para ${a.personas} ${a.personas === 1 ? "persona" : "personas"} (${a.nombre.toLowerCase()}): ${a.cambios}${a.ingredientesExtra.length ? ` Sumar: ${a.ingredientesExtra.map((i) => [i.cantidad, i.unidad, i.nombre].filter(Boolean).join(" ")).join(", ")}.` : ""}`),
    ],
    reemplazos: [],
    advertencias: [],
    imagen: menu.imagen ? { url: menu.imagen.url, fuente: "unsplash", credito: menu.imagen.credito, link: menu.imagen.link } : null,
    origen: "ia",
    comensalIds: [],
  };
}

function Menu({ menu, onVolver, onCambiar, cambiando }) {
  const [pedido, setPedido] = useState("");
  const [comprados, setComprados] = useState({});
  const celiacoOAlergia = menu.adaptaciones.some((a) => a.id === "sin-gluten" || ALERGIAS.some((x) => x.id === a.id));
  return (
    <div className="flex flex-col gap-5">
      <button type="button" onClick={onVolver}
        className="inline-flex min-h-12 items-center gap-2 self-start rounded-full border border-hoja-900 bg-blanco px-5 font-medium text-hoja-900 hover:bg-hoja-100">
        <IconoFlecha className="size-5" /> Armar otro menú
      </button>

      <article className="flex flex-col gap-8 rounded-tarjeta bg-blanco p-5 shadow-tarjeta animate-subir sm:p-6 lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-x-10">
        {/* Desktop: foto chica y datos a la izquierda; compras, pasos y adaptaciones a la derecha */}
        <aside className="flex flex-col gap-4">
        {menu.imagen?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={menu.imagen.url} alt="" className="aspect-[4/3] w-full rounded-campo object-cover" />
        ) : (
          <Image src={fotoRespaldo(menu.titulo)} alt="" width={1280} height={720} className="aspect-[4/3] w-full rounded-campo object-cover" />
        )}
        {menu.imagen?.credito && (
          <a href={menu.imagen.link} target="_blank" rel="noreferrer" className="text-xs text-tinta-2 underline">Foto de {menu.imagen.credito}</a>
        )}
        <header className="flex flex-col gap-2">
          <span className="self-start rounded-full bg-morron px-3 py-1 text-xs font-semibold">Para {menu.personas} personas · {menu.presupuesto}</span>
          <h2 className="font-titulo text-2xl font-semibold lg:text-3xl">{menu.titulo}</h2>
          <p className="text-tinta-2">{menu.porQueSirve}</p>
          <p className="rounded-campo bg-hoja-100 px-3 py-2 text-sm text-tinta-2 sm:self-start">{menu.tiempoMin} min</p>
        </header>

        <GuardarReceta receta={recetaDeMenu(menu)} />

        <section className="flex flex-col gap-3 rounded-campo border border-borde p-4" aria-label="Cambiar el menú">
          <h3 className="font-titulo text-lg font-semibold">¿Lo cambiamos?</h3>
          <div className="flex flex-wrap gap-2">
            {CAMBIOS.map((cambio) => (
              <button key={cambio} type="button" disabled={cambiando} onClick={() => onCambiar(cambio === "Otra idea" ? "Proponé un menú totalmente distinto." : cambio)}
                className="min-h-10 rounded-full border border-borde bg-blanco px-4 text-sm font-medium hover:border-hoja-700 disabled:opacity-50">
                {cambio}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (pedido.trim()) onCambiar(pedido); }} className="flex flex-col gap-2">
            <input value={pedido} onChange={(e) => setPedido(e.target.value)} maxLength={200} aria-label="Pedido para cambiar el menú"
              placeholder="Hace calor, algo más liviano…" className="min-h-11 w-full rounded-campo border border-borde bg-blanco px-3" />
            <Boton type="submit" variante="secundario" cargando={cambiando} disabled={!pedido.trim()} className="self-start">Cambiar</Boton>
          </form>
        </section>

        </aside>

        <div className="flex flex-col gap-8">
          <div className="grid gap-8 xl:grid-cols-2 xl:items-start">
          <section className="flex flex-col gap-3">
            <h3 className="font-titulo text-xl font-semibold">Qué comprar, para todos</h3>
            {/* Lista de compras: una sola columna, cada ingrediente se tilda (y se tacha) al comprarlo */}
            <ul className="flex flex-col rounded-campo bg-hoja-100 p-2 text-sm">
              {menu.ingredientes.map((i, indice) => {
                const marcado = Boolean(comprados[indice]);
                return (
                  <li key={`${i.nombre}-${indice}`}>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-campo px-2 hover:bg-blanco/60">
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => setComprados({ ...comprados, [indice]: !marcado })}
                        className="peer sr-only"
                      />
                      <span className="grid size-5 shrink-0 place-items-center rounded-md border-2 border-hoja-700 bg-blanco text-blanco transition-colors peer-checked:bg-hoja-900 peer-checked:border-hoja-900 peer-focus-visible:ring-2 peer-focus-visible:ring-hoja-700 peer-focus-visible:ring-offset-2">
                        {marcado && <IconoCheck className="size-3.5" />}
                      </span>
                      <span className={marcado ? "text-tinta-2 line-through" : ""}>
                        {[i.cantidad, i.unidad, i.nombre].filter(Boolean).join(" ")}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {menu.consejosAhorro.length > 0 && (
              <div className="rounded-campo border border-borde p-4 text-sm">
                <p className="font-semibold">Para gastar menos</p>
                <ul className="mt-1 list-disc pl-5 text-tinta-2">{menu.consejosAhorro.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-titulo text-xl font-semibold">Cómo se hace</h3>
            <ol className="flex flex-col gap-3">
              {menu.pasos.map((paso, indice) => (
                <li key={indice} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-hoja-900 text-sm font-medium text-blanco">{indice + 1}</span>
                  <span className="pt-0.5">{paso}</span>
                </li>
              ))}
            </ol>
          </section>
          </div>

        {menu.adaptaciones.length > 0 && (
          <section className="flex flex-col gap-3 border-t border-borde pt-6">
            <h3 className="font-titulo text-xl font-semibold">Adaptaciones</h3>
            {celiacoOAlergia && (
              <p role="note" className="rounded-campo bg-zanahoria/20 p-3 text-sm">
                <strong>Ojo con la contaminación cruzada:</strong> para celíacos y alergias, usá utensilios, tablas y ollas separados.
              </p>
            )}
            {/* auto-fit: con una sola adaptación la tarjeta ocupa todo el ancho; con varias se reparten en columnas */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-4">
              {menu.adaptaciones.map((a) => (
                <div key={a.id} className="flex flex-col gap-2 rounded-campo border border-borde p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{a.personas} {a.personas === 1 ? "persona" : "personas"}: {a.nombre.toLowerCase()}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${a.apta ? "bg-hoja-100 text-hoja-900" : "bg-tomate-suave text-tomate"}`}>
                      {a.apta ? "Revisada" : "Revisar"}
                    </span>
                  </div>
                  <p className="text-sm text-tinta-2">{a.cambios}</p>
                  {a.ingredientesExtra.length > 0 && (
                    <p className="text-sm"><strong>Sumar:</strong> {a.ingredientesExtra.map((i) => [i.cantidad, i.unidad, i.nombre].filter(Boolean).join(" ")).join(" · ")}</p>
                  )}
                  {!a.apta && a.prohibidos.length > 0 && <p role="alert" className="text-sm text-tomate">Ojo: {a.prohibidos.join(", ")} no corresponde para este grupo.</p>}
                  {a.avisos.map((aviso) => <p key={aviso} className="text-sm text-tinta-2">{aviso}</p>)}
                </div>
              ))}
            </div>
          </section>
        )}
        </div>
      </article>
    </div>
  );
}

export default function FormGrupo() {
  const [personas, setPersonas] = useState(8);
  const [presupuesto, setPresupuesto] = useState("económico");
  const [texto, setTexto] = useState("");
  const [ingredientes, setIngredientes] = useState([]);
  const [grupos, setGrupos] = useState({}); // { "vegetariano": 2 }
  const [idea, setIdea] = useState("");
  const [historial, setHistorial] = useState([]);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);
  const [armando, startTransition] = useTransition();

  function agregarIngrediente(evento) {
    evento.preventDefault();
    const nuevo = texto.trim().toLowerCase();
    if (!nuevo || ingredientes.includes(nuevo) || ingredientes.length >= 10) return;
    setIngredientes([...ingredientes, nuevo]);
    setTexto("");
  }

  function alternarGrupo(id) {
    const copia = { ...grupos };
    if (copia[id]) delete copia[id];
    else copia[id] = 1;
    setGrupos(copia);
  }

  // pedidoExtra viene de "¿Lo cambiamos?": se suma a lo que ya pediste y se evitan los menús anteriores.
  function generar(pedidoExtra = "") {
    setError(null);
    startTransition(async () => {
      const respuesta = await armarMenuGrupo({
        personas,
        presupuesto,
        ingredientes,
        grupos: Object.entries(grupos).map(([id, cantidad]) => ({ id, cantidad })),
        pedido: [idea, pedidoExtra].filter(Boolean).join(". "),
        yaPropuestos: historial,
      });
      if (respuesta?.error) setError(respuesta.error);
      else {
        setMenu(respuesta.menu);
        setHistorial((previos) => [...previos, respuesta.menu.titulo].slice(-5));
        window.scrollTo({ top: 0 });
      }
    });
  }

  function armar(evento) {
    evento.preventDefault();
    generar();
  }

  if (menu) {
    return (
      <div className="flex flex-col gap-3">
        {error && <p role="alert" className="text-sm text-tomate">{error}</p>}
        <Menu menu={menu} onVolver={() => { setMenu(null); setHistorial([]); }} onCambiar={generar} cambiando={armando} />
      </div>
    );
  }

  return (
    <form onSubmit={armar} className="flex flex-col gap-8 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6 lg:p-8">
      {/* Desktop: dos columnas. A la izquierda lo básico, a la derecha las restricciones del grupo */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-14">
        <div className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-titulo text-xl font-semibold">¿Cuántos son?</legend>
        <Contador valor={personas} setValor={(n) => { setPersonas(n); setGrupos(Object.fromEntries(Object.entries(grupos).map(([id, c]) => [id, Math.min(c, n)]))); }} minimo={2} maximo={30} etiqueta="Personas" />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-titulo text-xl font-semibold">Presupuesto</legend>
        <div className="flex flex-wrap gap-2">
          {PRESUPUESTOS.map((opcion) => (
            <button key={opcion} type="button" aria-pressed={presupuesto === opcion} onClick={() => setPresupuesto(opcion)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium capitalize ${presupuesto === opcion ? "border-hoja-900 bg-hoja-900 text-blanco" : "border-borde bg-blanco hover:border-hoja-700"}`}>
              {opcion}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-titulo text-xl font-semibold">¿Alguna idea o antojo?</legend>
        <p className="text-sm text-tinta-2">Opcional. Por ejemplo: hace calor y quiero algo fresco, o que no use horno.</p>
        <input value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={150} aria-label="Idea o antojo"
          placeholder="Algo veraniego…" className="min-h-12 rounded-campo border border-borde bg-blanco px-4" />
      </fieldset>

        </div>
        <div className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="font-titulo text-xl font-semibold">¿Alguien no come algo?</legend>
        <p className="text-sm text-tinta-2">Marcá las restricciones que hay en el grupo y cuántas personas las tienen. No hace falta cargarlos como comensales.</p>
        <div className="flex flex-wrap gap-2">
          {OPCIONES.map((opcion) => (
            <button key={opcion.id} type="button" aria-pressed={Boolean(grupos[opcion.id])} onClick={() => alternarGrupo(opcion.id)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium ${grupos[opcion.id] ? "border-hoja-900 bg-hoja-900 text-blanco" : "border-borde bg-blanco hover:border-hoja-700"}`}>
              {opcion.nombre}
            </button>
          ))}
        </div>
        {Object.entries(grupos).map(([id, cantidad]) => (
          <div key={id} className="flex items-center justify-between gap-4 rounded-campo bg-hoja-100 px-4 py-3">
            <span className="text-sm font-medium">{OPCIONES.find((o) => o.id === id)?.nombre}: cuántas personas</span>
            <Contador valor={cantidad} setValor={(n) => setGrupos({ ...grupos, [id]: n })} minimo={1} maximo={personas} etiqueta={id} />
          </div>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-titulo text-xl font-semibold">¿Querés usar algo en particular?</legend>
        <p className="text-sm text-tinta-2">Opcional. Escribí un ingrediente y apretá Enter.</p>
        <div className="flex flex-wrap items-center gap-2">
          {ingredientes.map((item) => (
            <span key={item} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-lechuga px-4 text-sm font-medium">
              {item}
              <button type="button" aria-label={`Quitar ${item}`} onClick={() => setIngredientes(ingredientes.filter((otro) => otro !== item))}>×</button>
            </span>
          ))}
        </div>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => e.key === "Enter" && agregarIngrediente(e)}
          placeholder="Por ejemplo, arroz" maxLength={40} aria-label="Ingrediente" className="min-h-12 rounded-campo border border-borde bg-blanco px-4" />
      </fieldset>

        </div>
      </div>

      {error && <p role="alert" className="text-sm text-tomate">{error}</p>}
      <Boton type="submit" cargando={armando} className="self-start">Armar menú</Boton>
    </form>
  );
}
