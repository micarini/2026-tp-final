import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import { combinarRestricciones } from "@/lib/restricciones";
import { CATEGORIAS, recetasDeCategoria, recetaDelDia, diaActual } from "@/lib/descubrir";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import ListaDescubrir from "@/components/lista-descubrir";

export const metadata = {
  title: "Descubrir",
  description: "Recetas del día y búsquedas populares, revisadas para vos.",
};

export default function DescubrirPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-8">
      <Encabezado titulo="Descubrir" bajada="Ideas para hoy, revisadas con lo que vos no comés." />
      <Suspense fallback={<Cargando />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Contenido({ searchParams }) {
  const user = await requireUser();
  const { cat } = await searchParams;
  const categoria = CATEGORIAS.find((opcion) => opcion.id === cat) ?? null;

  const perfil = (await db().doc(`users/${user.uid}`).get()).data() ?? {};
  const restricciones = combinarRestricciones(perfil, []);
  const dia = diaActual();

  let destacada = null;
  let recetas = [];
  let fallo = false;
  try {
    [destacada, recetas] = await Promise.all([
      categoria ? null : recetaDelDia(restricciones, dia),
      categoria ? recetasDeCategoria(categoria.id, restricciones) : recetasDeCategoria(CATEGORIAS[dia % CATEGORIAS.length].id, restricciones),
    ]);
  } catch (error) {
    console.error("descubrir falló:", error?.message);
    fallo = true;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Búsquedas populares: cada una es un enlace, así se puede compartir y funciona sin JavaScript */}
      <nav aria-label="Búsquedas populares" className="flex flex-wrap gap-2">
        <Chip href="/descubrir" activo={!categoria}>Para hoy</Chip>
        {CATEGORIAS.map((opcion) => (
          <Chip key={opcion.id} href={`/descubrir?cat=${opcion.id}`} activo={categoria?.id === opcion.id}>
            {opcion.nombre}
          </Chip>
        ))}
      </nav>

      {fallo ? (
        <p role="alert" className="text-tomate">No pudimos cargar las recetas. Probá de nuevo en un momento.</p>
      ) : (
        <ListaDescubrir destacada={destacada} recetas={recetas} titulo={categoria?.nombre ?? "Más ideas para hoy"} />
      )}
    </div>
  );
}

function Chip({ href, activo, children }) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={
        "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors " +
        (activo ? "border-hoja-900 bg-hoja-900 text-blanco" : "border-borde bg-blanco text-tinta hover:border-hoja-700")
      }
    >
      {children}
    </Link>
  );
}
