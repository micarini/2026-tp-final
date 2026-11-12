"use client";

// El cajón de "¿Qué cocino hoy?": cada ingrediente que escribís se pega como etiqueta de fruta.
// Por ahora solo arma la lista; la búsqueda de recetas se conecta en el paso 5 del plan.
import { useState } from "react";
import Etiqueta, { COLORES_ETIQUETA } from "@/components/ui/etiqueta";
import Boton from "@/components/ui/boton";

const MAXIMO = 10; // Regla de H4: de 1 a 10 ingredientes

export default function CajonIngredientes() {
  const [texto, setTexto] = useState("");
  const [ingredientes, setIngredientes] = useState([]);
  const [aviso, setAviso] = useState(null);

  function agregar(event) {
    event.preventDefault();
    const nuevo = texto.trim().toLowerCase();
    setAviso(null);
    if (!nuevo) return;
    if (ingredientes.includes(nuevo)) return setAviso(`Ya pusiste ${nuevo}.`);
    if (ingredientes.length >= MAXIMO) return setAviso(`Hasta ${MAXIMO} ingredientes por búsqueda.`);
    setIngredientes([...ingredientes, nuevo]);
    setTexto("");
  }

  function quitar(ingrediente) {
    setIngredientes(ingredientes.filter((i) => i !== ingrediente));
  }

  return (
    <section className="flex flex-col gap-6 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6">
      <form onSubmit={agregar} className="flex flex-col gap-2">
        <label htmlFor="ingrediente" className="font-titulo text-xl font-semibold">
          ¿Qué hay en tu heladera?
        </label>
        <div className="flex gap-2">
          <input
            id="ingrediente"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Por ejemplo, pollo"
            maxLength={40}
            autoComplete="off"
            enterKeyHint="done"
            aria-describedby="ayuda-ingrediente"
            className="min-h-12 w-full rounded-campo border border-borde bg-blanco px-4 text-base placeholder:text-tinta-3 focus:border-hoja-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-hoja-700/30"
          />
          <Boton type="submit" variante="secundario" className="shrink-0">
            Agregar
          </Boton>
        </div>
        <p id="ayuda-ingrediente" className="text-sm text-tinta-2">
          Escribí uno y apretá Enter. Hasta {MAXIMO}.
        </p>
      </form>

      {/* El cajón: borde punteado como el fondo de un cajón de verdulería */}
      <div
        aria-live="polite"
        className="flex min-h-32 flex-wrap content-start gap-2 rounded-campo border-2 border-dashed border-borde bg-papel p-4"
      >
        {ingredientes.length === 0 ? (
          <p className="m-auto text-center text-sm text-tinta-2">El cajón está vacío.</p>
        ) : (
          ingredientes.map((ingrediente, i) => (
            <Etiqueta
              key={ingrediente}
              color={COLORES_ETIQUETA[i % COLORES_ETIQUETA.length]}
              onQuitar={() => quitar(ingrediente)}
            >
              {ingrediente}
            </Etiqueta>
          ))
        )}
      </div>

      {aviso && (
        <p role="alert" className="text-sm text-tomate">
          {aviso}
        </p>
      )}

      {/* Se habilita en el paso 5 del plan, cuando se conecte la búsqueda */}
      <Boton type="button" disabled>
        Buscar recetas
      </Boton>
    </section>
  );
}
