import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { logout } from "@/app/actions/auth";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import Boton from "@/components/ui/boton";
import EliminarCuenta from "@/components/eliminar-cuenta";

export const metadata = {
  title: "Configuración",
  description: "Tu cuenta: email, cerrar sesión y eliminar la cuenta.",
};

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col gap-8">
      <Encabezado titulo="Configuración" bajada="Todo lo que tiene que ver con tu cuenta." />
      <Suspense fallback={<Cargando />}>
        <Contenido />
      </Suspense>
    </div>
  );
}

async function Contenido() {
  const user = await requireUser();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6">
        <h2 className="font-titulo text-xl font-semibold">Tu cuenta</h2>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-tinta-2">Ingresaste con</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <form action={logout}>
          <Boton type="submit" variante="secundario">Cerrar sesión</Boton>
        </form>
      </section>

      <section className="flex flex-col gap-4 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6">
        <h2 className="font-titulo text-xl font-semibold">Eliminar cuenta</h2>
        <p className="text-tinta-2">Borra tu usuario y todo lo que guardaste. Te vamos a pedir que confirmes quién sos.</p>
        <EliminarCuenta email={user.email ?? ""} />
      </section>

      <Link href="/perfil" className="self-start text-sm font-medium text-hoja-700 underline underline-offset-4">
        Volver al perfil
      </Link>
    </div>
  );
}
