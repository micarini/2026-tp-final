"use client";

// El avatar del perfil. Al tocarlo se despliegan las opciones ("Cambiar avatar"); al elegir una se guarda y se cierra.
import { useEffect, useState, useTransition } from "react";
import Avatar from "@/components/avatar";
import { AVATARES } from "@/lib/avatares";
import { elegirAvatar } from "@/app/actions/perfil";

export default function SelectorAvatar({ actual }) {
  const [elegido, setElegido] = useState(actual);
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState(null);
  const [, startTransition] = useTransition();

  // Escape cierra el panel (teclado)
  useEffect(() => {
    if (!abierto) return;
    const alTocarTecla = (evento) => evento.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alTocarTecla);
    return () => window.removeEventListener("keydown", alTocarTecla);
  }, [abierto]);

  function elegir(id) {
    const anterior = elegido;
    setElegido(id);
    setAbierto(false);
    setError(null);
    startTransition(async () => {
      const resultado = await elegirAvatar(id);
      if (resultado?.error) {
        setElegido(anterior);
        setError(resultado.error);
      }
    });
  }

  return (
    <div className="relative flex shrink-0 flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-label="Cambiar avatar"
        className="rounded-full transition-transform active:scale-95"
      >
        <Avatar id={elegido} className="size-16 lg:size-20" />
      </button>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="text-xs font-medium text-hoja-700 underline underline-offset-4"
      >
        Cambiar avatar
      </button>

      {abierto && (
        <div className="absolute top-full left-0 z-20 mt-2 w-72 rounded-tarjeta bg-blanco p-4 shadow-tarjeta animate-subir">
          <p className="mb-3 text-sm font-medium">Elegí tu avatar</p>
          <div className="grid grid-cols-4 gap-3">
            {AVATARES.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => elegir(avatar.id)}
                aria-pressed={elegido === avatar.id}
                aria-label={avatar.nombre}
                className={
                  "rounded-full p-0.5 transition-transform active:scale-90 " +
                  (elegido === avatar.id ? "ring-2 ring-hoja-900 ring-offset-2" : "hover:scale-105")
                }
              >
                <Avatar id={avatar.id} className="size-12" />
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p role="alert" className="absolute top-full mt-1 w-40 text-xs text-tomate">{error}</p>}
    </div>
  );
}
