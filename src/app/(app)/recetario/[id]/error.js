"use client";

import Boton from "@/components/ui/boton";

export default function DetalleRecetaError({ reset }) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-tarjeta bg-papel p-8 text-center">
      <h1 className="font-titulo text-2xl font-semibold">No pudimos cargar esta receta</h1>
      <p className="text-tinta-2">Probá de nuevo o volvé al recetario.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Boton type="button" onClick={reset}>Reintentar</Boton>
        <Boton href="/recetario" variante="secundario">Volver al recetario</Boton>
      </div>
    </section>
  );
}
