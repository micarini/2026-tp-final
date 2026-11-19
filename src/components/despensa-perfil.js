"use client";

// Perfil: la despensa. Cada cambio se guarda al instante.
import { useState, useTransition } from "react";
import { guardarDespensa } from "@/app/actions/perfil";

export default function DespensaPerfil({ inicial }) {
  const [lista, setLista] = useState(inicial);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState(null);
  const [, startTransition] = useTransition();

  function guardar(nueva) {
    const anterior = lista;
    setLista(nueva);
    setError(null);
    startTransition(async () => {
      const resultado = await guardarDespensa(nueva);
      if (resultado?.error) {
        setLista(anterior);
        setError(resultado.error);
      }
    });
  }

  function agregar(evento) {
    evento.preventDefault();
    const nuevo = texto.trim().toLowerCase();
    if (!nuevo || lista.includes(nuevo) || lista.length >= 30) return;
    guardar([...lista, nuevo]);
    setTexto("");
  }

  return (
    <section className="flex flex-col gap-4 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-titulo text-xl font-semibold">Tu despensa</h2>
        <p className="text-tinta-2">Lo que casi siempre tenés en casa (arroz, aceite, huevos…). En ¿Qué cocino hoy? lo sumás de un toque y no te lo mostramos como faltante.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {lista.length === 0 && <p className="text-sm text-tinta-2">Todavía no cargaste nada.</p>}
        {lista.map((item) => (
          <span key={item} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-hoja-100 px-4 text-sm font-medium">
            {item}
            <button type="button" aria-label={`Quitar ${item}`} onClick={() => guardar(lista.filter((otro) => otro !== item))} className="text-tinta-2 hover:text-tomate">×</button>
          </span>
        ))}
      </div>
      <form onSubmit={agregar} className="flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={40}
          aria-label="Agregar a la despensa"
          placeholder="Por ejemplo, arroz"
          className="min-h-11 min-w-0 flex-1 rounded-campo border border-borde bg-blanco px-3"
        />
        <button type="submit" className="min-h-11 rounded-full bg-hoja-900 px-5 text-sm font-medium text-blanco">Agregar</button>
      </form>
      {error && <p role="alert" className="text-sm text-tomate">{error}</p>}
    </section>
  );
}
