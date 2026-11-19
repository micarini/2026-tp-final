import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/firebase-admin";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import FormImportar from "@/components/form-importar";

export const metadata = {
  title: "Importar receta",
  description: "Pasá una receta de Instagram, TikTok o un blog al formato de Tuppi, adaptada a lo que no comés.",
};

export default function ImportarPage() {
  return (
    <div className="flex flex-col gap-8">
      <Encabezado titulo="Importar receta" bajada="Pegá el texto o subí capturas y la dejamos en orden, adaptada a vos." />
      <Suspense fallback={<Cargando />}>
        <Formulario />
      </Suspense>
    </div>
  );
}

async function Formulario() {
  const user = await requireUser();
  const snapshot = await db().collection(`users/${user.uid}/comensales`).orderBy("creadoEn").get();
  const comensales = snapshot.docs.map((doc) => ({ id: doc.id, nombre: doc.data().nombre ?? "" }));
  return <FormImportar comensales={comensales} />;
}
