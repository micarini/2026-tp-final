import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import { logout } from "@/app/actions/auth";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import Boton from "@/components/ui/boton";
import FormPerfil from "@/components/form-perfil";

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
  const datos = (await db().doc(`users/${user.uid}`).get()).data() ?? {};

  // Solo pasamos al cliente lo que el formulario necesita (no el documento entero).
  const perfil = {
    nombre: datos.nombre ?? "",
    restricciones: datos.restricciones ?? [],
    alergias: datos.alergias ?? [],
    alimentosEvitados: datos.alimentosEvitados ?? [],
    porcionesHabituales: datos.porcionesHabituales ?? 1,
  };

  return (
    <>
      <Encabezado
        titulo={esBienvenida ? "¿Hay algo que no comés?" : "Perfil"}
        bajada={
          esBienvenida
            ? "Marcalo una vez y Tuppi lo tiene en cuenta en cada receta."
            : user.email
        }
      />
      <FormPerfil perfil={perfil} bienvenida={esBienvenida} />
      {!esBienvenida && (
        <form action={logout}>
          <Boton type="submit" variante="texto" className="px-0">
            Cerrar sesión
          </Boton>
        </form>
      )}
    </>
  );
}
