import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import FormGrupo from "@/components/form-grupo";

export const metadata = {
  title: "Cocinar para muchos",
  description: "Un menú económico para un grupo, con una adaptación para cada restricción.",
};

export default function GrupoPage() {
  return (
    <div className="flex flex-col gap-8">
      <Encabezado titulo="Cocinar para muchos" bajada="Una comida para el grupo entero, barata, y con una adaptación para cada restricción." />
      <Suspense fallback={<Cargando />}>
        <Formulario />
      </Suspense>
    </div>
  );
}

async function Formulario() {
  await requireUser();
  return <FormGrupo />;
}
