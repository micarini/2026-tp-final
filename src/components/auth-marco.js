import Logo from "@/components/logo";
import IlustracionPortada from "@/components/ilustracion-portada";

// Marco común de /login y /registro.
// Mobile: una franja de la ilustración arriba y el formulario abajo.
// Desktop (lg): ilustración a la izquierda y formulario a la derecha.
export default function AuthMarco({ titulo, bajada, children }) {
  return (
    <main className="flex min-h-svh flex-col lg:grid lg:grid-cols-2">
      <div className="relative h-48 overflow-hidden bg-hoja-900 lg:h-auto">
        <IlustracionPortada className="absolute inset-0 size-full" />
        <Logo claro className="absolute top-6 left-6" />
      </div>

      <div className="flex flex-1 justify-center px-4 py-10 sm:px-10 lg:items-center lg:py-16">
        <div className="flex w-full max-w-sm flex-col gap-8 animate-subir">
          <div className="flex flex-col gap-2">
            <h1 className="font-titulo text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.01em]">
              {titulo}
            </h1>
            {bajada && <p className="text-tinta-2">{bajada}</p>}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
