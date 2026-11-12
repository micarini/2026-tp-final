"use client";

import { useState, useTransition } from "react";
import { borrarReceta } from "@/app/actions/recetas";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/boton";

export default function BorrarReceta({ id }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState(null);
  const [borrando, startTransition] = useTransition();

  function borrar() {
    startTransition(async () => {
      const resultado = await borrarReceta(id);
      if (resultado?.error) setError(resultado.error);
      else router.push("/recetario");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {confirmando ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-tinta-2">¿Borrar esta receta?</span>
          <Boton type="button" variante="peligro" onClick={borrar} cargando={borrando}>Borrar</Boton>
          <Boton type="button" variante="texto" onClick={() => setConfirmando(false)}>Cancelar</Boton>
        </div>
      ) : (
        <Boton type="button" variante="peligro" onClick={() => setConfirmando(true)}>Borrar receta</Boton>
      )}
      {error && <p role="alert" className="text-sm text-tomate">{error}</p>}
    </div>
  );
}
