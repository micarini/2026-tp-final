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
  const [ingredientes, setIngredientes] = useState(
    receta.ingredientes.map((ingrediente) => ingrediente.nombre).join("\n"),
  );

  function guardar(event) {
    event.preventDefault();
    setEstado(null);
    startTransition(async () => {
      const resultado = await editarReceta(receta.id, {
        ...receta,
        titulo,
        porQueSirve: notas,
        notas: notasPersonales,
        ingredientes: ingredientes.split("\n").map((nombre, indice) => ({
          ...(receta.ingredientes[indice] ?? {}),
          nombre: nombre.trim(),
          nombreEn: nombre.trim(),
        })).filter((ingrediente) => ingrediente.nombre),
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
      <label className="flex flex-col gap-1 text-sm font-medium">
        Ingredientes, uno por línea
        <textarea value={ingredientes} onChange={(event) => setIngredientes(event.target.value)} className="min-h-28 rounded-campo border border-borde bg-blanco p-3" required />
      </label>
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
