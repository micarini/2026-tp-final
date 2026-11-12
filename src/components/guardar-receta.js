"use client";

import { useState, useTransition } from "react";
import { guardarReceta } from "@/app/actions/recetas";
import Boton from "@/components/ui/boton";

export default function GuardarReceta({ receta }) {
  const [guardada, setGuardada] = useState(false);
  const [error, setError] = useState(null);
  const [guardando, startTransition] = useTransition();

  function guardar() {
    setError(null);
    startTransition(async () => {
      const resultado = await guardarReceta(receta);
      if (resultado?.error) setError(resultado.error);
      else setGuardada(true);
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Boton type="button" variante={guardada ? "secundario" : "principal"} onClick={guardar} disabled={guardada} cargando={guardando}>
        {guardada ? "Guardada" : "Guardar en recetario"}
      </Boton>
      {error && <p role="alert" className="text-sm text-tomate">{error}</p>}
    </div>
  );
}
