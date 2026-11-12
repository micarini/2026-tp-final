import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import Cargando from "@/components/cargando";
import Encabezado from "@/components/encabezado";
import EditarReceta from "@/components/editar-receta";
import BorrarReceta from "@/components/borrar-receta";

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

  return (
    <div className="flex flex-col gap-8">
      <Encabezado titulo={receta.titulo} bajada={receta.porQueSirve} />
      {receta.notas && <p className="rounded-campo bg-papel p-4 text-tinta-2"><strong>Notas:</strong> {receta.notas}</p>}
      {receta.imagen?.url && <img src={receta.imagen.url} alt="" className="aspect-[16/9] w-full rounded-tarjeta object-cover" />}
      <div className="flex flex-wrap gap-3">
        <EditarReceta receta={receta} />
        <BorrarReceta id={id} />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-titulo text-xl font-semibold">Ingredientes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {receta.ingredientes.map((ingrediente) => <li key={ingrediente.nombre}>{ingrediente.cantidad} {ingrediente.unidad} {ingrediente.nombre}</li>)}
          </ul>
        </section>
        <section>
          <h2 className="font-titulo text-xl font-semibold">Pasos</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">{receta.pasos.map((paso) => <li key={paso}>{paso}</li>)}</ol>
        </section>
      </div>
      {receta.reemplazos?.length > 0 && <p className="text-tinta-2"><strong>Reemplazos:</strong> {receta.reemplazos.join(" ")}</p>}
      {receta.advertencias?.length > 0 && (
        <div className="rounded-campo bg-zanahoria/20 p-4 text-tinta" role="note">
          <strong>Ojo:</strong> {receta.advertencias.join(" ")}
        </div>
      )}
      {receta.imagen?.credito && <a href={receta.imagen.link} target="_blank" rel="noreferrer" className="text-sm text-tinta-2 underline">Foto de {receta.imagen.credito}</a>}
    </div>
  );
}
