import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import Cargando from "@/components/cargando";
import Encabezado from "@/components/encabezado";
import EditarReceta from "@/components/editar-receta";
import BorrarReceta from "@/components/borrar-receta";
import Image from "next/image";
import { fotoRespaldo } from "@/lib/respaldo";
import { IconoCheck } from "@/components/iconos";

export const metadata = {
  title: "Detalle de receta",
  description: "Una receta guardada en tu recetario.",
};

export default function DetalleRecetaPage({ params }) {
  return (
    <Suspense fallback={<Cargando />}>
      <Detalle params={params} />
    </Suspense>
  );
}

async function Detalle({ params }) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) notFound();
  const snapshot = await db().doc(`users/${user.uid}/recetas/${id}`).get();
  if (!snapshot.exists) notFound();
  const datos = snapshot.data();
  const receta = {
    id: snapshot.id,
    titulo: datos.titulo ?? "",
    porQueSirve: datos.porQueSirve ?? "",
    notas: datos.notas ?? "",
    porciones: datos.porciones ?? 1,
    tiempoMin: datos.tiempoMin ?? 0,
    ingredientes: datos.ingredientes ?? [],
    pasos: datos.pasos ?? [],
    reemplazos: datos.reemplazos ?? [],
    advertencias: datos.advertencias ?? [],
    imagen: datos.imagen ?? null,
    origen: datos.origen ?? "ia",
    themealdbId: datos.themealdbId ?? null,
    comensalIds: datos.comensalIds ?? [],
  };

  const plural = receta.porciones === 1 ? "porción" : "porciones";

  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={receta.titulo} bajada={receta.porQueSirve} />
      {/* Desktop: foto chica y datos a la izquierda; ingredientes y pasos a la derecha */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[300px_1fr] lg:items-start lg:gap-12">
        <aside className="flex flex-col gap-4">
          {receta.imagen?.url ? (
            <img src={receta.imagen.url} alt="" className="aspect-[4/3] w-full rounded-tarjeta object-cover" />
          ) : (
            <Image src={fotoRespaldo(receta.titulo)} alt="" width={1280} height={720} className="aspect-[4/3] w-full rounded-tarjeta object-cover" />
          )}
          {receta.imagen?.credito && (
            <a href={receta.imagen.link} target="_blank" rel="noreferrer" className="-mt-2 text-xs text-tinta-2 underline">
              Foto de {receta.imagen.credito}
            </a>
          )}
          <p className="rounded-campo bg-hoja-100 px-3 py-2 text-sm text-tinta-2">
            {receta.tiempoMin} min · {receta.porciones} {plural}
          </p>
          {receta.notas && <p className="rounded-campo bg-papel p-3 text-sm text-tinta-2"><strong>Notas:</strong> {receta.notas}</p>}
          {receta.advertencias.length > 0 && (
            <div className="rounded-campo bg-zanahoria/20 p-3 text-sm text-tinta" role="note">
              <strong>Ojo:</strong> {receta.advertencias.join(" ")}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <EditarReceta receta={receta} />
            <BorrarReceta id={id} />
          </div>
        </aside>

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="font-titulo text-xl font-semibold">Ingredientes</h2>
            <ul className="grid gap-x-6 gap-y-2 rounded-campo bg-hoja-100 p-4 text-sm sm:grid-cols-2">
              {receta.ingredientes.map((ingrediente, indice) => (
                <li key={`${ingrediente.nombre}-${indice}`} className="flex items-start gap-2">
                  <IconoCheck className="mt-0.5 size-4 shrink-0 text-hoja-700" />
                  <span>{[ingrediente.cantidad, ingrediente.unidad, ingrediente.nombre].filter(Boolean).join(" ")}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-titulo text-xl font-semibold">Cómo se hace</h2>
            <ol className="flex flex-col gap-3">
              {receta.pasos.map((paso, indice) => (
                <li key={indice} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-hoja-900 text-sm font-medium text-blanco">{indice + 1}</span>
                  <span className="pt-0.5">{paso}</span>
                </li>
              ))}
            </ol>
            {receta.reemplazos?.length > 0 && (
              <p className="text-sm text-tinta-2"><strong>Reemplazos:</strong> {receta.reemplazos.join(" ")}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
