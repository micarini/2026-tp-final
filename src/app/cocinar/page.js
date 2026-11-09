import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import { logout } from "@/app/actions/auth";

export const metadata = {
  title: "¿Qué cocino hoy?",
  description: "Contá qué tenés en casa y para quién cocinás.",
};

// Página provisoria para probar la sesión. La feature real es H4.
// El título es estático y sale al instante; lo que depende del usuario entra por el Suspense
// (con cacheComponents, leer cookies fuera de un Suspense marca la ruta como bloqueante).
export default function CocinarPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">¿Qué cocino hoy?</h1>
      <Suspense fallback={<p className="text-zinc-600">Cargando…</p>}>
        <Saludo />
      </Suspense>
    </main>
  );
}

async function Saludo() {
  const user = await requireUser();
  const perfil = await db().doc(`users/${user.uid}`).get();
  const nombre = perfil.data()?.nombre || user.email;

  return (
    <div className="flex flex-col gap-4">
      <p>Hola, {nombre}.</p>
      <form action={logout}>
        <button type="submit" className="underline">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
