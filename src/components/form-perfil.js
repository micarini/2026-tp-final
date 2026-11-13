"use client";

// Formulario del perfil (H2). Es Client Component por el estado de las etiquetas
// (cuál está prendida y la animación "pop") y por useActionState, que muestra el resultado.
import { useActionState, useState } from "react";
import { actualizarPerfil } from "@/app/actions/perfil";
import { RESTRICCIONES, ALERGIAS } from "@/lib/restricciones";
import Campo from "@/components/ui/campo";
import Boton from "@/components/ui/boton";
import Sello from "@/components/ui/sello";
import { GrupoOpciones } from "@/components/grupo-opciones";

export default function FormPerfil({ perfil, bienvenida }) {
  const [estado, accion, guardando] = useActionState(actualizarPerfil, null);
  const [nombre, setNombre] = useState(perfil.nombre ?? "");
  const [restricciones, setRestricciones] = useState(perfil.restricciones ?? []);
  const [alergias, setAlergias] = useState(perfil.alergias ?? []);
  const [alimentosEvitados, setAlimentosEvitados] = useState((perfil.alimentosEvitados ?? []).join(", "));
  const [porciones, setPorciones] = useState(perfil.porcionesHabituales ?? 1);

  const ninguna = restricciones.length === 0 && alergias.length === 0;

  return (
    <form action={accion} className="flex flex-col gap-8 lg:max-w-2xl">
      {bienvenida && <input type="hidden" name="bienvenida" value="1" />}

      <section className="flex flex-col gap-8 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6">
        <GrupoOpciones
          titulo="Restricciones"
          ayuda="Tuppi revisa cada ingrediente de cada receta contra lo que marques."
          name="restricciones"
          opciones={RESTRICCIONES}
          marcadas={restricciones}
          setMarcadas={setRestricciones}
        />
        <GrupoOpciones
          titulo="Alergias"
          ayuda="Las recetas con alguno de estos ingredientes no te van a aparecer como aptas."
          name="alergias"
          opciones={ALERGIAS}
          marcadas={alergias}
          setMarcadas={setAlergias}
        />
        <Campo
          label="Otros alimentos que evitás"
          name="alimentosEvitados"
          value={alimentosEvitados}
          onChange={(e) => setAlimentosEvitados(e.target.value)}
          placeholder="Ej.: palta, cilantro, cebolla cruda"
          maxLength={650}
          mensaje="Separalos con comas. No hace falta indicar condiciones médicas."
        />
        <p aria-live="polite" className="text-sm text-tinta-2">
          {ninguna && !alimentosEvitados.trim() ? "No marcaste nada: como de todo." : null}
        </p>
      </section>

      <section className="flex flex-col gap-6 rounded-tarjeta bg-blanco p-5 shadow-tarjeta sm:p-6">
        <Campo
          label="Tu nombre"
          name="nombre"
          autoComplete="given-name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={60}
          required
        />

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium">¿Para cuántas porciones cocinás?</legend>
          <div className="flex items-center gap-4">
            <Boton
              type="button"
              variante="secundario"
              className="size-12 px-0"
              onClick={() => setPorciones(Math.max(1, porciones - 1))}
              disabled={porciones <= 1}
              aria-label="Una porción menos"
            >
              −
            </Boton>
            <output
              key={porciones}
              aria-live="polite"
              className="min-w-8 text-center font-titulo text-3xl font-semibold tabular-nums animate-pop"
            >
              {porciones}
            </output>
            <Boton
              type="button"
              variante="secundario"
              className="size-12 px-0"
              onClick={() => setPorciones(Math.min(4, porciones + 1))}
              disabled={porciones >= 4}
              aria-label="Una porción más"
            >
              +
            </Boton>
          </div>
          <input type="hidden" name="porcionesHabituales" value={porciones} />
        </fieldset>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Boton type="submit" cargando={guardando} className="min-w-40">
          {bienvenida ? "Listo" : "Guardar"}
        </Boton>
        {estado?.ok && !guardando && <Sello className="size-16 text-xs">Guardado</Sello>}
        {estado?.error && (
          <p role="alert" className="text-sm text-tomate">
            {estado.error}
          </p>
        )}
      </div>
    </form>
  );
}
