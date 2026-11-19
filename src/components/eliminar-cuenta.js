"use client";

// Eliminar cuenta con doble confirmación: hay que escribir el email y volver a demostrar quién sos
// (contraseña o Google). Recién ahí el servidor borra los datos y el usuario de Firebase.
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase-client";
import { eliminarCuenta } from "@/app/actions/cuenta";
import Campo from "@/components/ui/campo";
import Boton from "@/components/ui/boton";

const MENSAJES = {
  "auth/invalid-credential": "La contraseña no es correcta.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos.",
  "auth/network-request-failed": "No hay conexión. Revisá internet.",
};

export default function EliminarCuenta({ email }) {
  const [abierto, setAbierto] = useState(false);
  const [escrito, setEscrito] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const emailOk = escrito.trim().toLowerCase() === email.toLowerCase();

  async function confirmar(conGoogle) {
    setError(null);
    setCargando(true);
    try {
      const auth = getClientAuth();
      const credencial = conGoogle
        ? await signInWithPopup(auth, new GoogleAuthProvider())
        : await signInWithEmailAndPassword(auth, email, password);
      const resultado = await eliminarCuenta(await credencial.user.getIdToken(true), escrito);
      // Si sale bien, el servidor redirige a la portada y no vuelve acá.
      if (resultado?.error) setError(resultado.error);
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(MENSAJES[err?.code] ?? "No pudimos confirmar tu identidad. Probá de nuevo.");
      }
    }
    setCargando(false);
  }

  if (!abierto) {
    return (
      <Boton type="button" variante="peligro" className="self-start" onClick={() => setAbierto(true)}>
        Eliminar mi cuenta
      </Boton>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-campo border border-tomate bg-tomate-suave p-4 animate-subir">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-tinta">Esto no se puede deshacer</p>
        <p className="text-sm text-tinta-2">
          Se borran tu perfil, tus comensales, tus recetas guardadas y tu clave de Groq, y se elimina tu usuario.
        </p>
      </div>

      <Campo
        label={`Para confirmar, escribí tu email (${email})`}
        name="confirmar-email"
        type="email"
        autoComplete="off"
        value={escrito}
        onChange={(e) => setEscrito(e.target.value)}
        mensaje={escrito && !emailOk ? "Todavía no coincide con tu email." : ""}
        estado={escrito && !emailOk ? "error" : emailOk ? "ok" : "neutro"}
      />
      <Campo
        label="Tu contraseña"
        name="confirmar-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        mensaje="Si entrás con Google, usá el botón de abajo."
      />

      {error && <p role="alert" className="text-sm text-tomate">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Boton type="button" variante="peligro" cargando={cargando} disabled={!emailOk || !password} onClick={() => confirmar(false)}>
          Eliminar para siempre
        </Boton>
        <Boton type="button" variante="secundario" disabled={!emailOk || cargando} onClick={() => confirmar(true)}>
          Confirmar con Google
        </Boton>
        <Boton type="button" variante="texto" onClick={() => { setAbierto(false); setError(null); setPassword(""); }}>
          Cancelar
        </Boton>
      </div>
    </div>
  );
}
