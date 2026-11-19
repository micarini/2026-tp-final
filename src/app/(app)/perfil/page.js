import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import FormPerfil from "@/components/form-perfil";
import ClaveGroq from "@/components/clave-groq";
import DespensaPerfil from "@/components/despensa-perfil";
import SelectorAvatar from "@/components/selector-avatar";
import Link from "next/link";
import { IconoEngranaje, IconoComensales } from "@/components/iconos";
import { AVATAR_INICIAL } from "@/lib/avatares";
import { estadoClaveGroq } from "@/lib/claves";

export const metadata = {
  title: "Perfil",
  description: "Tus restricciones, alergias y porciones habituales.",
};

// Perfil (H2). La primera vez llega del registro con ?bienvenida=1 y cambia el título.
// searchParams y la sesión se leen dentro del Suspense (regla de cacheComponents).
export default function PerfilPage({ searchParams }) {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<Cargando />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Contenido({ searchParams }) {
  const user = await requireUser();
  const { bienvenida } = await searchParams;
  const esBienvenida = bienvenida === "1";
  const [documento, clave] = await Promise.all([
    db().doc(`users/${user.uid}`).get(),
    estadoClaveGroq(user.uid),
  ]);
  const datos = documento.data() ?? {};

  // Solo pasamos al cliente lo que el formulario necesita (no el documento entero).
  const perfil = {
    nombre: datos.nombre ?? "",
    restricciones: datos.restricciones ?? [],
    alergias: datos.alergias ?? [],
    alimentosEvitados: datos.alimentosEvitados ?? [],
    porcionesHabituales: datos.porcionesHabituales ?? 1,
  };
  const avatar = datos.avatar ?? AVATAR_INICIAL;

  return (
    <>
      {esBienvenida ? (
        <Encabezado
          titulo="¿Hay algo que no comés?"
          bajada="Marcalo una vez y Tuppi lo tiene en cuenta en cada receta."
        />
      ) : (
        <div className="flex items-center gap-4">
          <SelectorAvatar actual={avatar} />
          <div className="min-w-0 flex-1">
            <Encabezado titulo={perfil.nombre || "Perfil"} bajada={user.email} />
          </div>
          <Link
            href="/configuracion"
            aria-label="Configuración"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-borde bg-blanco text-hoja-900 transition-transform hover:bg-hoja-100 active:scale-90"
          >
            <IconoEngranaje className="size-5" />
          </Link>
        </div>
      )}
      {!esBienvenida && (
        <Link
          href="/comensales"
          className="flex items-center gap-3 rounded-tarjeta bg-blanco p-4 shadow-tarjeta transition-transform hover:-translate-y-0.5"
        >
          <span className="grid size-11 place-items-center rounded-full bg-hoja-100 text-hoja-900"><IconoComensales className="size-5" /></span>
          <span className="flex flex-col">
            <span className="font-medium">Tus comensales</span>
            <span className="text-sm text-tinta-2">Las personas con las que cocinás y lo que no comen.</span>
          </span>
        </Link>
      )}
      <FormPerfil perfil={perfil} bienvenida={esBienvenida} />
      {!esBienvenida && <DespensaPerfil inicial={datos.despensa ?? []} />}
      {!esBienvenida && <ClaveGroq cargada={clave.cargada} ultimos4={clave.ultimos4} />}
    </>
  );
}
