"use client";

// Descubrir: la receta del día, destacada, y una grilla de platos. Al abrir uno se ve aparte, como en "¿Qué cocino hoy?".
import { useState } from "react";
import Image from "next/image";
import { TarjetaReceta } from "@/components/cocinador";
import { fotoRespaldo } from "@/lib/respaldo";
import Boton from "@/components/ui/boton";
import EstadoVacio from "@/components/estado-vacio";

export default function ListaDescubrir({ destacada, recetas, titulo }) {
  const [abierta, setAbierta] = useState(null);

  if (abierta) {
    return (
      <div className="flex flex-col gap-5">
        <button type="button" onClick={() => setAbierta(null)} className="self-start text-sm font-medium text-hoja-700 underline underline-offset-4">
          Volver a descubrir
        </button>
        <div className="mx-auto w-full max-w-4xl">
          <TarjetaReceta receta={abierta} onVolver={() => setAbierta(null)} />
        </div>
      </div>
    );
  }

  function abrir(receta) {
    setAbierta(receta);
    window.scrollTo({ top: 0 });
  }

  const resto = destacada ? recetas.filter((receta) => receta.themealdbId !== destacada.themealdbId) : recetas;

  return (
    <div className="flex flex-col gap-8">
      {destacada && (
        <section aria-label="Receta del día" className="grid overflow-hidden rounded-tarjeta bg-blanco shadow-tarjeta md:grid-cols-2">
          {destacada.imagen?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={destacada.imagen.url} alt="" className="aspect-[16/10] size-full object-cover md:aspect-auto" />
          ) : (
            <Image src={fotoRespaldo(destacada.titulo)} alt="" width={1280} height={720} className="aspect-[16/10] size-full object-cover md:aspect-auto" />
          )}
          <div className="flex flex-col justify-center gap-3 p-5 sm:p-8">
            <span className="self-start rounded-full bg-morron px-3 py-1 text-xs font-semibold text-tinta">Receta del día</span>
            <h2 className="font-titulo text-2xl font-semibold lg:text-3xl">{destacada.titulo}</h2>
            <p className="text-tinta-2">{destacada.porQueSirve}</p>
            <Boton type="button" className="self-start" onClick={() => abrir(destacada)}>Ver receta</Boton>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-titulo text-xl font-semibold">{titulo}</h2>
        {resto.length === 0 ? (
          <EstadoVacio
            imagen="/sin-resultados.png"
            titulo="No hay recetas aptas acá"
            texto="Ninguna de estas ideas respeta lo que marcaste en tu perfil. Probá con otra búsqueda."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resto.map((receta) => (
              <TarjetaReceta key={receta.themealdbId} receta={receta} compacta onAbrir={() => abrir(receta)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
