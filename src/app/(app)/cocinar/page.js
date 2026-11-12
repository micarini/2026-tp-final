import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import Cocinador from "@/components/cocinador";

export const metadata = {
  title: "¿Qué cocino hoy?",
  description: "Contá qué tenés en casa y para quién cocinás.",
};

// El título es estático y sale al instante; lo que depende de la sesión entra por el Suspense
// (con cacheComponents, leer cookies fuera de un Suspense marca la ruta como bloqueante).
export default function CocinarPage() {
  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[440px_1fr] lg:items-start lg:gap-12">
      <div className="flex flex-col gap-8 lg:col-span-2">
        <Encabezado titulo="¿Qué cocino hoy?" bajada="Contanos qué tenés y te decimos qué cocinar." />
        <Suspense fallback={<Cargando />}>
          <Cajon />
        </Suspense>
      </div>
    </div>
  );
}

async function Cajon() {
  const user = await requireUser();
  const snapshot = await db().collection(`users/${user.uid}/comensales`).orderBy("creadoEn").get();
  const comensales = snapshot.docs.map((doc) => ({
    id: doc.id,
    nombre: doc.data().nombre ?? "",
  }));
  return <Cocinador comensales={comensales} />;
}
