"use client";

// Etiquetas de restricciones y alergias que se prenden y se apagan.
// Se usan en el perfil y en cada comensal.
import { useState } from "react";
import { IconoCheck } from "@/components/iconos";

// Etiqueta que se prende y se apaga. Por dentro es un checkbox de verdad,
// así el formulario lo manda solo y funciona con teclado (espacio para marcar).
function Opcion({ name, opcion, marcada, alCambiar }) {
  // true mientras dura el "pop"; al terminar la animación se apaga sola
  const [pop, setPop] = useState(false);

  return (
    <label
      onAnimationEnd={() => setPop(false)}
      className={
        "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium " +
        "transition-colors duration-150 select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-hoja-700 " +
        (pop ? "animate-pop " : "") +
        (marcada
          ? "border-hoja-900 bg-hoja-900 text-blanco"
          : "border-borde bg-blanco text-tinta hover:border-hoja-700")
      }
    >
      <input
        type="checkbox"
        name={name}
        value={opcion.id}
        checked={marcada}
        onChange={() => {
          alCambiar(opcion.id);
          setPop(true);
        }}
        className="sr-only"
      />
      {/* El check aparece solo cuando está marcada: no depende solo del color */}
      {marcada && <IconoCheck className="size-4" />}
      {opcion.nombre}
    </label>
  );
}

export function GrupoOpciones({ titulo, ayuda, name, opciones, marcadas, setMarcadas }) {
  function alternar(id) {
    setMarcadas(marcadas.includes(id) ? marcadas.filter((m) => m !== id) : [...marcadas, id]);
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-titulo text-xl font-semibold">{titulo}</legend>
      <p className="text-sm text-tinta-2">{ayuda}</p>
      <div className="flex flex-wrap gap-2">
        {opciones.map((opcion) => (
          <Opcion
            key={opcion.id}
            name={name}
            opcion={opcion}
            marcada={marcadas.includes(opcion.id)}
            alCambiar={alternar}
          />
        ))}
      </div>
    </fieldset>
  );
}

