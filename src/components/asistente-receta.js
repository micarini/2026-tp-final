"use client";

// Ajustes rápidos y preguntas sobre una receta abierta. Cada ajuste devuelve la receta completa, ya revisada por el código.
import { useState, useTransition } from "react";
import { ajustarReceta, preguntarReceta } from "@/app/actions/asistente";
import Boton from "@/components/ui/boton";

const AJUSTES = [
  { id: "rapida", texto: "Más rápida" },
  { id: "sin-horno", texto: "Sin horno" },
  { id: "economica", texto: "Más económica" },
  { id: "para-2", texto: "Para 2" },
  { id: "para-4", texto: "Para 4" },
  { id: "para-6", texto: "Para 6" },
];

export default function AsistenteReceta({ receta, onCambiada }) {
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState(null);
  const [trabajando, setTrabajando] = useState(null); // qué ajuste se está haciendo
  const [pensando, startTransition] = useTransition();

  function ajustar(ajuste) {
    setError(null);
    setTrabajando(ajuste);
    startTransition(async () => {
      const resultado = await ajustarReceta(receta, ajuste);
      if (resultado?.error) setError(resultado.error);
      else onCambiada(resultado.receta);
      setTrabajando(null);
    });
  }

  function preguntar(evento) {
    evento.preventDefault();
    setError(null);
    setRespuesta(null);
    setTrabajando("pregunta");
    startTransition(async () => {
      const resultado = await preguntarReceta(receta, pregunta);
      if (resultado?.error) setError(resultado.error);
      else setRespuesta(resultado);
      setTrabajando(null);
    });
  }

  return (
    <section aria-label="Ajustar y preguntar" className="flex flex-col gap-4 rounded-campo border border-borde p-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-titulo text-lg font-semibold">Ajustala</h3>
        <div className="flex flex-wrap gap-2">
          {AJUSTES.map((ajuste) => (
            <button
              key={ajuste.id}
              type="button"
              onClick={() => ajustar(ajuste.id)}
              disabled={pensando}
              className="min-h-10 rounded-full border border-borde bg-blanco px-4 text-sm font-medium transition-colors hover:border-hoja-700 disabled:opacity-50"
            >
              {trabajando === ajuste.id ? "Ajustando…" : ajuste.texto}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={preguntar} className="flex flex-col gap-2">
        <label htmlFor="pregunta-receta" className="font-titulo text-lg font-semibold">Preguntale a Tuppi</label>
        <div className="flex gap-2">
          <input
            id="pregunta-receta"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            maxLength={300}
            placeholder="¿Con qué reemplazo la crema?"
            className="min-h-11 min-w-0 flex-1 rounded-campo border border-borde bg-blanco px-3"
          />
          <Boton type="submit" variante="secundario" cargando={trabajando === "pregunta"} disabled={!pregunta.trim() || pensando}>
            Preguntar
          </Boton>
        </div>
      </form>

      {error && <p role="alert" className="text-sm text-tomate">{error}</p>}
      {respuesta && (
        <div aria-live="polite" className="flex flex-col gap-2 rounded-campo bg-hoja-100 p-3 text-sm animate-subir">
          <p>{respuesta.respuesta}</p>
          {respuesta.aviso && <p role="note" className="font-medium text-tomate">{respuesta.aviso}</p>}
        </div>
      )}
    </section>
  );
}
