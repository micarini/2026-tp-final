import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import Encabezado from "@/components/encabezado";
import Cargando from "@/components/cargando";
import EstadoVacio from "@/components/estado-vacio";
import Boton from "@/components/ui/boton";

export const metadata = {
  title: "Recetario",
  description: "Las recetas que guardaste en Tuppi.",
};

// Por ahora solo el estado vacío: guardar y listar recetas es el paso 6 del plan (H5).
export default function RecetarioPage() {
  return (
    <div className="flex flex-col gap-8">
      <Encabezado titulo="Tu recetario" />
      <Suspense fallback={<Cargando />}>
        <Recetas />
      </Suspense>
    </div>
  );
}

async function Recetas() {
  await requireUser();
  return (
    <EstadoVacio
      titulo="Todavía no guardaste recetas"
      texto="Cuando una receta te guste, guardala y la vas a encontrar acá."
    >
      <Boton href="/cocinar">¿Qué cocino hoy?</Boton>
    </EstadoVacio>
  );
}
