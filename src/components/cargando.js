// Fallback de los <Suspense>: un bloque con la forma del contenido que va a llegar.
export default function Cargando() {
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">Cargando…</span>
      <div className="h-6 w-2/3 animate-pulse rounded-full bg-hoja-100" />
      <div className="h-40 animate-pulse rounded-tarjeta bg-hoja-100" />
    </div>
  );
}
