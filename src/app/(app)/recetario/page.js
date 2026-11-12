import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import EstadoVacio from "@/components/estado-vacio";
import Boton from "@/components/ui/boton";
import TarjetaReceta from "@/components/tarjeta-receta";
import { RESTRICCIONES, ALERGIAS } from "@/lib/restricciones";

export const metadata = {
  title: "Recetario",
  description: "Las recetas que guardaste en Tuppi.",
};

export default function RecetarioPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-8">
      <Encabezado titulo="Tu recetario" bajada="Tus recetas guardadas, ordenadas para volver a cocinar." />
      <Suspense fallback={<Cargando />}>
        <Recetas searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Recetas({ searchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const texto = String(params?.q ?? "").trim().toLowerCase();
  const origen = String(params?.origen ?? "").trim();
  const restriccion = String(params?.restriccion ?? "").trim();
  const tiempoTexto = String(params?.tiempo ?? "").trim();
  const tiempo = tiempoTexto ? Number(tiempoTexto) : null;
  const tiempoValido = !tiempoTexto || /^\d+$/.test(tiempoTexto) && tiempo > 0 && tiempo <= 1440;
  if (!tiempoValido) {
    return <p role="alert" className="text-sm text-tomate">El tiempo máximo tiene que ser un número entre 1 y 1440.</p>;
  }
  const snapshot = await db().collection(`users/${user.uid}/recetas`).orderBy("creadoEn", "desc").get();
  const recetas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((receta) => {
    const contenido = `${receta.titulo} ${receta.porQueSirve} ${(receta.ingredientes ?? []).map((item) => item.nombre).join(" ")}`.toLowerCase();
    return (!texto || contenido.includes(texto))
      && (!origen || receta.origen === origen)
      && (!restriccion || (receta.restriccionesAplicadas ?? []).includes(restriccion))
      && (!Number.isFinite(tiempo) || Number(receta.tiempoMin) <= tiempo);
  });

  return (
    <div className="flex flex-col gap-6">
      <form className="grid gap-3 rounded-tarjeta bg-blanco p-4 shadow-tarjeta sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="sr-only" htmlFor="busqueda">Buscar receta</label>
        <input id="busqueda" name="q" defaultValue={params?.q ?? ""} placeholder="Buscar por nombre o ingrediente" className="min-h-11 rounded-campo border border-borde px-3" />
        <select name="origen" defaultValue={origen} className="min-h-11 rounded-campo border border-borde px-3">
          <option value="">Cualquier origen</option>
          <option value="themealdb">TheMealDB</option>
          <option value="ia">Propuesta de Tuppi</option>
          <option value="importada">Importada</option>
        </select>
        <input name="tiempo" type="number" min="1" placeholder="Máx. minutos" defaultValue={params?.tiempo ?? ""} className="min-h-11 rounded-campo border border-borde px-3" />
        <select name="restriccion" defaultValue={restriccion} className="min-h-11 rounded-campo border border-borde px-3">
          <option value="">Cualquier restricción</option>
          <optgroup label="Restricciones">
            {RESTRICCIONES.map((opcion) => <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>)}
          </optgroup>
          <optgroup label="Alergias">
            {ALERGIAS.map((opcion) => <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>)}
          </optgroup>
        </select>
        <Boton type="submit">Filtrar</Boton>
      </form>
      {recetas.length === 0 ? (
        <EstadoVacio
          titulo={snapshot.empty ? "Todavía no guardaste recetas" : "No encontramos recetas"}
          texto={snapshot.empty ? "Cuando una receta te guste, guardala y la vas a encontrar acá." : "Probá cambiar la búsqueda o los filtros."}
        >
          <Boton href="/cocinar">¿Qué cocino hoy?</Boton>
        </EstadoVacio>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {recetas.map((receta) => <TarjetaReceta key={receta.id} receta={receta} />)}
        </div>
      )}
    </div>
  );
}
