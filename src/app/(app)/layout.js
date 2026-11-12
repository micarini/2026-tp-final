import { Suspense } from "react";
import Navegacion from "@/components/navegacion";

// Layout de las pantallas privadas. "(app)" es un grupo de rutas: agrupa sin cambiar la URL.
// Acá solo va lo visual; cada página valida la sesión con requireUser().
// En mobile la navegación queda fija abajo, por eso el contenido deja 8rem de aire al final.
export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<div className="h-16 bg-hoja-900" aria-hidden="true" />}>
        <Navegacion />
      </Suspense>
      <main className="mx-auto w-full max-w-[560px] flex-1 px-4 pt-8 pb-32 lg:max-w-[1248px] lg:px-24 lg:pt-12 lg:pb-16">
        {children}
      </main>
    </div>
  );
}
