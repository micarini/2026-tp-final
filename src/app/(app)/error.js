"use client";

// Error de cualquier pantalla privada. Tiene que ser Client Component (regla de Next)
// porque "Reintentar" vuelve a renderizar la parte que falló sin recargar la página.
import Image from "next/image";
import Boton from "@/components/ui/boton";

export default function Error({ reset }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4 animate-subir">
      <Image src="/error.png" alt="" width={160} height={160} className="size-32 object-contain" />
      <h1 className="font-titulo text-[1.75rem] font-semibold">Algo se nos cayó</h1>
      <p className="text-tinta-2">No pudimos cargar esta pantalla. Probá de nuevo en un momento.</p>
      <Boton onClick={() => reset()}>Reintentar</Boton>
    </div>
  );
}
