import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import ListaComensales from "@/components/lista-comensales";

export const metadata = {
  title: "Comensales",
  description: "Las personas con las que cocinás seguido y lo que no comen.",
};

// Comensales (H3). La lista se lee en el servidor, dentro del Suspense.
export default function ComensalesPage() {
  return (
    <div className="flex flex-col gap-8">
      <Encabezado
        titulo="Comensales"
        bajada="Las personas con las que cocinás seguido, con lo que no comen."
      />
      <Suspense fallback={<Cargando />}>
        <Lista />
      </Suspense>
    </div>
  );
}

async function Lista() {
  const user = await requireUser();
  const snapshot = await db().collection(`users/${user.uid}/comensales`).orderBy("creadoEn").get();

  // Al cliente le pasamos objetos simples (sin Timestamps de Firestore).
  const comensales = snapshot.docs.map((doc) => ({
    id: doc.id,
    nombre: doc.data().nombre ?? "",
    restricciones: doc.data().restricciones ?? [],
    alergias: doc.data().alergias ?? [],
  }));

  return <ListaComensales comensales={comensales} />;
}
