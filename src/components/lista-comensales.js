"use client";

// Lista de comensales con alta, edición y borrado (H3).
// Es Client Component porque maneja qué tarjeta se está editando y la confirmación de borrar.
// Los datos llegan del servidor; cada cambio pasa por una Server Action y la página se recarga sola
// (revalidatePath), así la lista siempre muestra lo que hay en Firestore.
import { useActionState, useEffect, useState, useTransition } from "react";
import { guardarComensal, borrarComensal } from "@/app/actions/comensales";
import { RESTRICCIONES, ALERGIAS } from "@/lib/restricciones";
import { GrupoOpciones } from "@/components/grupo-opciones";
import Campo from "@/components/ui/campo";
import Boton from "@/components/ui/boton";
import EstadoVacio from "@/components/estado-vacio";
import { IconoEditar, IconoBorrar } from "@/components/iconos";

const NOMBRES = Object.fromEntries([...RESTRICCIONES, ...ALERGIAS].map((o) => [o.id, o.nombre]));

function FormComensal({ comensal, alTerminar }) {
  const [estado, accion, guardando] = useActionState(guardarComensal, null);
  const [nombre, setNombre] = useState(comensal?.nombre ?? "");
  const [restricciones, setRestricciones] = useState(comensal?.restricciones ?? []);
  const [alergias, setAlergias] = useState(comensal?.alergias ?? []);

  // Cuando la Server Action responde ok, cerramos el formulario
  useEffect(() => {
    if (estado?.ok) alTerminar();
  }, [estado, alTerminar]);

  return (
    <form
      action={accion}
      className="flex flex-col gap-6 rounded-tarjeta bg-blanco p-5 shadow-tarjeta animate-subir sm:p-6"
    >
      {comensal && <input type="hidden" name="id" value={comensal.id} />}
      <Campo
        label="Nombre"
        name="nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        maxLength={40}
        autoComplete="off"
        autoFocus
        required
      />
      <GrupoOpciones
        titulo="Restricciones"
        ayuda="Lo que no come por elección o por salud."
        name="restricciones"
        opciones={RESTRICCIONES}
        marcadas={restricciones}
        setMarcadas={setRestricciones}
      />
      <GrupoOpciones
        titulo="Alergias"
        ayuda="Tuppi descarta las recetas que tengan alguno de estos."
        name="alergias"
        opciones={ALERGIAS}
        marcadas={alergias}
        setMarcadas={setAlergias}
      />
      {estado?.error && (
        <p role="alert" className="text-sm text-tomate">
          {estado.error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Boton type="submit" cargando={guardando}>
          {comensal ? "Guardar cambios" : "Agregar"}
        </Boton>
        <Boton type="button" variante="texto" onClick={alTerminar}>
          Cancelar
        </Boton>
      </div>
    </form>
  );
}

function TarjetaComensal({ comensal, alEditar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState(null);
  const [borrando, startTransition] = useTransition();
  const etiquetas = [...comensal.restricciones, ...comensal.alergias];

  function borrar() {
    startTransition(async () => {
      const resultado = await borrarComensal(comensal.id);
      if (resultado?.error) setError(resultado.error);
    });
  }

  return (
    <li className="flex flex-col gap-4 rounded-tarjeta bg-blanco p-5 shadow-tarjeta animate-subir sm:p-6">
      <div className="flex flex-col gap-3">
        <h2 className="font-titulo text-xl font-semibold">{comensal.nombre}</h2>
        {etiquetas.length === 0 ? (
          <p className="text-sm text-tinta-2">Come de todo.</p>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label={`Lo que no come ${comensal.nombre}`}>
            {etiquetas.map((id) => (
              <li key={id} className="rounded-full bg-hoja-100 px-3 py-1 text-sm font-medium text-hoja-900">
                {NOMBRES[id] ?? id}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Borrar pide confirmación en la misma tarjeta: no hay ventanas emergentes */}
      <div aria-live="polite" className="flex min-h-10 items-center gap-2 text-sm">
        {confirmando ? (
          <>
            <span className="mr-auto text-tinta">¿Borrar a {comensal.nombre}?</span>
            <button
              type="button"
              onClick={borrar}
              disabled={borrando}
              className="min-h-10 rounded-full bg-tomate px-4 font-medium text-blanco transition-transform active:scale-[.96] disabled:opacity-50"
            >
              {borrando ? "Borrando…" : "Borrar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="min-h-10 rounded-full px-3 font-medium text-tinta-2 hover:text-tinta"
            >
              Cancelar
            </button>
          </>
        ) : (
          <div className="ml-auto flex gap-1">
            {/* Botones de ícono: el nombre accesible va en aria-label */}
            <button
              type="button"
              onClick={alEditar}
              aria-label={`Editar a ${comensal.nombre}`}
              className="grid size-11 place-items-center rounded-full text-hoja-700 transition-[transform,background-color] hover:bg-hoja-100 active:scale-[.92]"
            >
              <IconoEditar className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              aria-label={`Borrar a ${comensal.nombre}`}
              className="grid size-11 place-items-center rounded-full text-tinta-2 transition-[transform,background-color] hover:bg-tomate-suave hover:text-tomate active:scale-[.92]"
            >
              <IconoBorrar className="size-5" />
            </button>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-tomate">
          {error}
        </p>
      )}
    </li>
  );
}

export default function ListaComensales({ comensales }) {
  // null = nada abierto, "nuevo" = formulario de alta, o el id del comensal que se edita
  const [editando, setEditando] = useState(null);
  const cerrar = () => setEditando(null);

  return (
    <div className="flex flex-col gap-6">
      {editando === "nuevo" ? (
        <FormComensal alTerminar={cerrar} />
      ) : (
        comensales.length > 0 && (
          <Boton type="button" className="self-start" onClick={() => setEditando("nuevo")}>
            Agregar comensal
          </Boton>
        )
      )}

      {comensales.length === 0 && editando !== "nuevo" ? (
        <EstadoVacio
          titulo="Todavía no agregaste a nadie"
          texto="Sumá a quien cocina con vos seguido y Tuppi va a respetar lo que no come."
        >
          <Boton type="button" onClick={() => setEditando("nuevo")}>
            Agregar comensal
          </Boton>
        </EstadoVacio>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {comensales.map((comensal) =>
            editando === comensal.id ? (
              <li key={comensal.id}>
                <FormComensal comensal={comensal} alTerminar={cerrar} />
              </li>
            ) : (
              <TarjetaComensal
                key={comensal.id}
                comensal={comensal}
                alEditar={() => setEditando(comensal.id)}
              />
            ),
          )}
        </ul>
      )}
    </div>
  );
}
