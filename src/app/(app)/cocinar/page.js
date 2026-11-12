import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import CajonIngredientes from "@/components/cajon-ingredientes";

export const metadata = {
  title: "¿Qué cocino hoy?",
  description: "Contá qué tenés en casa y para quién cocinás.",
};

// El título es estático y sale al instante; lo que depende de la sesión entra por el Suspense
// (con cacheComponents, leer cookies fuera de un Suspense marca la ruta como bloqueante).
export default function CocinarPage() {
  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[440px_1fr] lg:items-start lg:gap-12">
      <div className="flex flex-col gap-8">
        <Encabezado titulo="¿Qué cocino hoy?" bajada="Contanos qué tenés y te decimos qué cocinar." />
        <Suspense fallback={<Cargando />}>
          <Cajon />
        </Suspense>
      </div>

      {/* Desktop: acá van a aparecer las recetas (paso 5) */}
      <div className="hidden min-h-80 items-center justify-center rounded-tarjeta border-2 border-dashed border-borde p-8 text-center text-tinta-2 lg:flex">
        Acá van a aparecer tus recetas.
      </div>
    </div>
  );
}

async function Cajon() {
  await requireUser();
  return <CajonIngredientes />;
}
