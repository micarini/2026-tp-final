"use client";

import Boton from "@/components/ui/boton";

export default function RecetarioError({ reset }) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-tarjeta bg-papel p-8 text-center">
      <h1 className="font-titulo text-2xl font-semibold">No pudimos cargar tu recetario</h1>
      <p className="text-tinta-2">Tus recetas siguen guardadas. Probá de nuevo.</p>
      <Boton type="button" onClick={reset}>Reintentar</Boton>
    </section>
  );
}
