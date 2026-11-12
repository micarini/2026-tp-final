import Logo from "@/components/logo";
import Boton from "@/components/ui/boton";
import IlustracionPortada from "@/components/ilustracion-portada";

export const metadata = {
  title: { absolute: "Tuppi · Abrí la heladera" },
  description: "Contale a Tuppi qué tenés en casa y para quién cocinás: te dice qué cocinar.",
};

// Landing pública (Figma: 01 Landing y D1 Landing).
// Mobile: ilustración arriba, texto corto abajo.
// Desktop (lg): texto más largo a la izquierda, ilustración a sangre en la mitad derecha.
export default function Home() {
  return (
    <main className="flex min-h-svh flex-col bg-hoja-900 text-papel lg:grid lg:grid-cols-2">
      <div className="relative h-[56svh] overflow-hidden lg:order-2 lg:h-auto">
        <IlustracionPortada className="absolute inset-0 size-full" />
        <Logo claro className="absolute top-6 left-6 lg:hidden" />
      </div>

      <div className="flex flex-1 flex-col justify-end px-6 pt-8 pb-10 sm:px-10 lg:justify-between lg:px-28 lg:py-24">
        <Logo claro className="hidden self-start lg:block" />

        <div className="flex flex-col gap-8 lg:gap-10">
          <div className="flex flex-col gap-3 animate-subir lg:gap-6">
            <h1 className="font-titulo text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.02em] lg:text-[4.5rem] lg:leading-[1.05]">
              Abrí la heladera.
            </h1>
            {/* En el celular alcanza con la frase corta; en la compu hay lugar para explicar más */}
            <p className="text-xl text-hoja-100 lg:hidden">Tuppi hace el resto.</p>
            <p className="hidden max-w-[34ch] text-lg leading-relaxed text-hoja-100 lg:block">
              Contale qué tenés en casa y Tuppi te dice qué cocinar.
            </p>
          </div>

          <div
            className="flex flex-col gap-3 animate-subir sm:flex-row"
            style={{ animationDelay: "80ms" }}
          >
            <Boton href="/registro" variante="claro">
              Empezar
            </Boton>
            <Boton href="/login" variante="contornoClaro">
              Ya tengo cuenta
            </Boton>
          </div>
        </div>
      </div>
    </main>
  );
}
