import Link from "next/link";
import GuardarReceta from "@/components/guardar-receta";

export default function TarjetaReceta({ receta, guardable = false }) {
  return (
    <article className="flex flex-col gap-4 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6">
      {receta.imagen?.url && (
        <img src={receta.imagen.url} alt="" className="aspect-[16/9] w-full rounded-campo object-cover" />
      )}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-titulo text-2xl font-semibold">{receta.titulo}</h2>
          <span className="rounded-full bg-hoja-100 px-3 py-1 text-sm font-medium text-hoja-900">Apta</span>
        </div>
        <p className="text-tinta-2">{receta.porQueSirve}</p>
        <p className="text-sm text-tinta-2">{receta.tiempoMin} min · {receta.porciones} porciones</p>
      </div>
      <ul className="flex flex-wrap gap-2 text-sm text-tinta-2">
        {receta.ingredientes.slice(0, 5).map((ingrediente) => <li key={ingrediente.nombre}>{ingrediente.nombre}</li>)}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/recetario/${receta.id ?? ""}`} className="font-medium text-hoja-700 underline underline-offset-4">
          Ver detalle
        </Link>
        {guardable && <GuardarReceta receta={receta} />}
      </div>
    </article>
  );
}
