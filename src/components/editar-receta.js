"use client";

import { useState, useTransition } from "react";
import { editarReceta } from "@/app/actions/recetas";
import Boton from "@/components/ui/boton";

export default function EditarReceta({ receta }) {
  const [editando, setEditando] = useState(false);
  const [estado, setEstado] = useState(null);
  const [guardando, startTransition] = useTransition();
  const [titulo, setTitulo] = useState(receta.titulo);
  const [notas, setNotas] = useState(receta.porQueSirve);
  const [notasPersonales, setNotasPersonales] = useState(receta.notas ?? "");
  const [pasos, setPasos] = useState(receta.pasos.join("\n"));
  // Cada ingrediente es una fila con su cantidad, unidad y nombre. Así, borrar o agregar una fila no corre las cantidades de las demás.
  const [filas, setFilas] = useState(
    receta.ingredientes.map((ingrediente, indice) => ({ ...ingrediente, clave: indice, original: ingrediente.nombre })),
  );

  function cambiarFila(clave, campo, valor) {
    setFilas(filas.map((fila) => (fila.clave === clave ? { ...fila, [campo]: valor } : fila)));
  }

  function agregarFila() {
    setFilas([...filas, { clave: Math.max(-1, ...filas.map((fila) => fila.clave)) + 1, nombre: "", cantidad: "", unidad: "", nombreEn: "", gramos: null, aComprar: false, original: null }]);
  }

  function guardar(event) {
    event.preventDefault();
    setEstado(null);
    startTransition(async () => {
      const resultado = await editarReceta(receta.id, {
        ...receta,
        titulo,
        porQueSirve: notas,
        notas: notasPersonales,
        ingredientes: filas
          .filter((fila) => fila.nombre.trim())
          .map((fila) => ({
            nombre: fila.nombre.trim(),
            cantidad: String(fila.cantidad ?? "").trim(),
            unidad: String(fila.unidad ?? "").trim(),
            gramos: fila.gramos ?? null,
            // Si no cambió el nombre se conserva el nombre en inglés; si cambió, el nuevo nombre es lo que revisa el control de restricciones.
            nombreEn: fila.original === fila.nombre.trim() && fila.nombreEn ? fila.nombreEn : fila.nombre.trim(),
            aComprar: Boolean(fila.aComprar),
          })),
        pasos: pasos.split("\n").map((paso) => paso.trim()).filter(Boolean),
      });
      if (resultado?.error) setEstado(resultado);
      else setEditando(false);
    });
  }

  if (!editando) {
    return <Boton type="button" variante="secundario" onClick={() => setEditando(true)}>Editar</Boton>;
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4 rounded-campo border border-borde bg-papel p-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Título
        <input value={titulo} onChange={(event) => setTitulo(event.target.value)} maxLength={160} className="min-h-11 rounded-campo border border-borde bg-blanco px-3" required />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Por qué sirve
        <textarea value={notas} onChange={(event) => setNotas(event.target.value)} maxLength={1000} className="min-h-20 rounded-campo border border-borde bg-blanco p-3" required />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Notas personales
        <textarea value={notasPersonales} onChange={(event) => setNotasPersonales(event.target.value)} maxLength={2000} className="min-h-20 rounded-campo border border-borde bg-blanco p-3" />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Ingredientes</legend>
        {filas.map((fila) => (
          <div key={fila.clave} className="grid grid-cols-[4rem_5rem_1fr_auto] items-center gap-2">
            <input
              value={fila.cantidad ?? ""}
              onChange={(e) => cambiarFila(fila.clave, "cantidad", e.target.value)}
              aria-label="Cantidad"
              placeholder="200"
              maxLength={20}
              className="min-h-11 rounded-campo border border-borde bg-blanco px-2 text-center"
            />
            <input
              value={fila.unidad ?? ""}
              onChange={(e) => cambiarFila(fila.clave, "unidad", e.target.value)}
              aria-label="Unidad"
              placeholder="g"
              maxLength={20}
              className="min-h-11 rounded-campo border border-borde bg-blanco px-2 text-center"
            />
            <input
              value={fila.nombre}
              onChange={(e) => cambiarFila(fila.clave, "nombre", e.target.value)}
              aria-label="Ingrediente"
              placeholder="Ingrediente"
              maxLength={100}
              className="min-h-11 rounded-campo border border-borde bg-blanco px-3"
            />
            <button
              type="button"
              onClick={() => setFilas(filas.filter((otra) => otra.clave !== fila.clave))}
              aria-label={`Quitar ${fila.nombre || "ingrediente"}`}
              className="grid size-10 place-items-center rounded-full text-tinta-2 hover:bg-tomate-suave hover:text-tomate"
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={agregarFila} className="self-start text-sm font-medium text-hoja-700 underline underline-offset-4">
          + Agregar ingrediente
        </button>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Pasos, uno por línea
        <textarea value={pasos} onChange={(event) => setPasos(event.target.value)} className="min-h-32 rounded-campo border border-borde bg-blanco p-3" required />
      </label>
      {estado?.error && <p role="alert" className="text-sm text-tomate">{estado.error}</p>}
      <div className="flex gap-2">
        <Boton type="submit" cargando={guardando}>Guardar cambios</Boton>
        <Boton type="button" variante="texto" onClick={() => setEditando(false)}>Cancelar</Boton>
      </div>
    </form>
  );
}
