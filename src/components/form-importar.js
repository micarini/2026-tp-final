"use client";

// Importar receta: texto y/o capturas. Las capturas se achican en el navegador antes de enviarlas (más rápido y entran en el límite del servidor).
import { useState, useTransition } from "react";
import { importarReceta } from "@/app/actions/importar";
import { TarjetaReceta } from "@/components/cocinador";
import Boton from "@/components/ui/boton";
import { IconoFlecha } from "@/components/iconos";

const MAX_CAPTURAS = 3;

// Achica una imagen a 1400 px de lado máximo y la pasa a JPG.
async function achicar(archivo) {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, 1400 / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d").drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  const blob = await new Promise((resolve) => lienzo.toBlob(resolve, "image/jpeg", 0.82));
  return new File([blob], `captura-${archivo.name.replace(/\.\w+$/, "")}.jpg`, { type: "image/jpeg" });
}

export default function FormImportar({ comensales }) {
  const [texto, setTexto] = useState("");
  const [capturas, setCapturas] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [importando, startTransition] = useTransition();

  function elegirCapturas(evento) {
    const nuevas = [...evento.target.files].filter((archivo) => ["image/jpeg", "image/png"].includes(archivo.type));
    setCapturas([...capturas, ...nuevas].slice(0, MAX_CAPTURAS));
    evento.target.value = "";
  }

  function importar(evento) {
    evento.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const datos = new FormData();
        datos.set("texto", texto);
        for (const captura of capturas) datos.append("capturas", await achicar(captura));
        for (const id of seleccionados) datos.append("comensalIds", id);
        const respuesta = await importarReceta(datos);
        if (respuesta?.error) setError(respuesta.error);
        else setResultado(respuesta.receta);
      } catch {
        setError("No pudimos importar la receta. Probá de nuevo.");
      }
    });
  }

  if (resultado) {
    return (
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setResultado(null)}
          className="inline-flex min-h-12 items-center gap-2 self-start rounded-full border border-hoja-900 bg-blanco px-5 font-medium text-hoja-900 hover:bg-hoja-100"
        >
          <IconoFlecha className="size-5" />
          Importar otra
        </button>
        <div className="mx-auto w-full max-w-4xl">
          <TarjetaReceta receta={resultado} onVolver={() => setResultado(null)} onTraducida={setResultado} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={importar} className="flex flex-col gap-8 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6 lg:p-8">
      {/* Desktop: el texto de la receta a la izquierda; capturas y comensales a la derecha */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-14">
      <div className="flex flex-col gap-2 lg:h-full">
        <label htmlFor="texto-receta" className="font-titulo text-xl font-semibold">Pegá la receta</label>
        <p className="text-sm text-tinta-2">Copiá la descripción del reel de Instagram o TikTok, o el texto de un blog. Los links no se pueden abrir: tiene que ser el texto.</p>
        <textarea
          id="texto-receta"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={8000}
          rows={14}
          className="min-h-72 w-full flex-1 rounded-campo border border-borde bg-blanco p-4 text-base focus:border-hoja-700 lg:min-h-96"
          placeholder="Ingredientes, pasos…"
        />
      </div>

        <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="font-titulo text-xl font-semibold">O subí capturas</h2>
        <p className="text-sm text-tinta-2">Hasta 3, JPG o PNG. Se mandan a la IA para leerlas y no se guardan.</p>
        <div className="flex flex-wrap items-center gap-3">
          {capturas.map((captura, indice) => (
            <span key={`${captura.name}-${indice}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-hoja-100 px-4 text-sm">
              {captura.name.length > 22 ? `${captura.name.slice(0, 20)}…` : captura.name}
              <button
                type="button"
                aria-label={`Quitar ${captura.name}`}
                onClick={() => setCapturas(capturas.filter((_, i) => i !== indice))}
                className="text-tinta-2 hover:text-tomate"
              >
                ×
              </button>
            </span>
          ))}
          {capturas.length < MAX_CAPTURAS && (
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-dashed border-hoja-700 px-4 text-sm font-medium text-hoja-700 hover:bg-hoja-100">
              + Agregar captura
              <input type="file" accept="image/jpeg,image/png" multiple onChange={elegirCapturas} className="sr-only" />
            </label>
          )}
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-titulo text-xl font-semibold">¿Para quién la adaptamos?</legend>
        <p className="text-sm text-tinta-2">Siempre se tiene en cuenta tu perfil. Sumá a quien cocina con vos.</p>
        <div className="flex flex-wrap gap-2">
          {comensales.map((comensal) => {
            const activo = seleccionados.includes(comensal.id);
            return (
              <button
                key={comensal.id}
                type="button"
                aria-pressed={activo}
                onClick={() => setSeleccionados(activo ? seleccionados.filter((id) => id !== comensal.id) : [...seleccionados, comensal.id])}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium ${activo ? "border-hoja-900 bg-hoja-900 text-blanco" : "border-borde bg-blanco text-tinta hover:border-hoja-700"}`}
              >
                {comensal.nombre}
              </button>
            );
          })}
        </div>
      </fieldset>

        </div>
      </div>

      {error && <p role="alert" className="text-sm text-tomate">{error}</p>}

      <Boton type="submit" cargando={importando} disabled={!texto.trim() && capturas.length === 0} className="self-start">
        Importar receta
      </Boton>
    </form>
  );
}
