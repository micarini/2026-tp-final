"use client";

// Perfil: guía para cargar la clave propia de Groq. Con clave propia no hay límite diario de búsquedas.
// La clave viaja una sola vez al servidor, que la prueba, la cifra y la guarda: el navegador nunca la vuelve a recibir.
import { useActionState, useTransition } from "react";
import { guardarClave, quitarClave } from "@/app/actions/clave-groq";
import Campo from "@/components/ui/campo";
import Boton from "@/components/ui/boton";
import OnboardingGroq from "@/components/onboarding-groq";


export default function ClaveGroq({ cargada, ultimos4 }) {
  const [estado, accion, guardando] = useActionState(guardarClave, null);
  const [quitando, startTransition] = useTransition();

  return (
    <section className="flex flex-col gap-5 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-titulo text-xl font-semibold">Buscá sin límite</h2>
        <p className="text-tinta-2">
          Sin clave propia podés hacer 20 búsquedas por día. Con tu clave de Groq, las que quieras: la consulta se hace con tu cuenta.
        </p>
      </div>

      {cargada ? (
        <div className="flex flex-col gap-3 rounded-campo bg-hoja-100 p-4">
          <p className="font-medium text-hoja-900">Clave cargada: gsk_…{ultimos4}</p>
          <p className="text-sm text-tinta-2">Tus búsquedas usan tu clave y no tienen límite diario.</p>
          <Boton
            type="button"
            variante="secundario"
            className="self-start"
            cargando={quitando}
            onClick={() => startTransition(async () => { await quitarClave(); })}
          >
            Quitar mi clave
          </Boton>
        </div>
      ) : (
        <>
          <OnboardingGroq />

          <form action={accion} className="flex flex-col gap-4">
            <Campo
              label="Tu clave de Groq"
              name="clave"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="gsk_..."
              estado={estado?.error ? "error" : estado?.ok ? "ok" : "neutro"}
              mensaje={estado?.error ?? (estado?.ok ? "Clave guardada." : "Solo la ve el servidor.")}
            />
            <Boton type="submit" cargando={guardando} className="self-start">
              Probar y guardar
            </Boton>
          </form>
        </>
      )}
    </section>
  );
}
