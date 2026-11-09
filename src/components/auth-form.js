"use client";

// Formulario de login y registro. Es Client Component porque necesita estado
// (lo que escribís, errores, cargando) y hablar con Firebase desde el navegador.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase-client";
import { createSession } from "@/app/actions/auth";

// Regla de H1: mínimo 8 caracteres, con al menos una letra y un número.
export function validarPassword(password) {
  if (password.length < 8) return "La contraseña tiene que tener al menos 8 caracteres.";
  if (!/[A-Za-zÀ-ÿ]/.test(password)) return "La contraseña tiene que tener al menos una letra.";
  if (!/[0-9]/.test(password)) return "La contraseña tiene que tener al menos un número.";
  return null;
}

const MENSAJES_FIREBASE = {
  "auth/invalid-credential": "El email o la contraseña no coinciden.",
  "auth/invalid-email": "Ese email no es válido.",
  "auth/email-already-in-use": "Ya hay una cuenta con ese email. Probá ingresar.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos y probá de nuevo.",
  "auth/network-request-failed": "No hay conexión. Revisá internet y probá de nuevo.",
  "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permitila y probá de nuevo.",
};

function mensajeDeError(error) {
  return MENSAJES_FIREBASE[error?.code] ?? "Algo salió mal. Probá de nuevo.";
}

// Solo aceptamos destinos internos, para que nadie arme un link que te mande a otro sitio.
function destinoSeguro() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/cocinar";
}

export default function AuthForm({ modo }) {
  const esRegistro = modo === "registro";
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Paso común a email y Google: cambia el token de Firebase por nuestra cookie de sesión.
  async function terminarIngreso(credencial) {
    const idToken = await credencial.user.getIdToken();
    const resultado = await createSession(idToken, nombre);
    // La sesión vive en la cookie del servidor; el navegador no necesita guardar otra.
    await signOut(getClientAuth());

    if (resultado?.error) {
      setError(resultado.error);
      setCargando(false);
      return;
    }
    router.replace(destinoSeguro());
    router.refresh();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (esRegistro) {
      if (!nombre.trim()) return setError("Contanos cómo te llamás.");
      const errorPassword = validarPassword(password);
      if (errorPassword) return setError(errorPassword);
    }

    setCargando(true);
    try {
      const credencial = esRegistro
        ? await createUserWithEmailAndPassword(getClientAuth(), email, password)
        : await signInWithEmailAndPassword(getClientAuth(), email, password);
      await terminarIngreso(credencial);
    } catch (err) {
      setError(mensajeDeError(err));
      setCargando(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setCargando(true);
    try {
      const credencial = await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
      await terminarIngreso(credencial);
    } catch (err) {
      // Cerrar la ventana de Google no es un error: solo volvemos al formulario.
      if (err?.code !== "auth/popup-closed-by-user") setError(mensajeDeError(err));
      setCargando(false);
    }
  }

  const campo = "w-full rounded border border-zinc-300 px-3 py-2 text-base";

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {esRegistro && (
          <label className="flex flex-col gap-1">
            <span>Nombre</span>
            <input
              className={campo}
              name="nombre"
              autoComplete="given-name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={60}
              required
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span>Email</span>
          <input
            className={campo}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>Contraseña</span>
          <input
            className={campo}
            type="password"
            name="password"
            autoComplete={esRegistro ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={esRegistro ? "reglas-password" : undefined}
            required
          />
          {esRegistro && (
            <span id="reglas-password" className="text-sm text-zinc-600">
              Al menos 8 caracteres, con una letra y un número.
            </span>
          )}
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {cargando ? "Un momento…" : esRegistro ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={cargando}
        className="rounded border border-zinc-300 px-4 py-2 disabled:opacity-60"
      >
        Continuar con Google
      </button>

      <p className="text-sm">
        {esRegistro ? "¿Ya tenés cuenta? " : "¿Todavía no tenés cuenta? "}
        <Link href={esRegistro ? "/login" : "/registro"} className="underline">
          {esRegistro ? "Ingresá" : "Creá una"}
        </Link>
      </p>
    </div>
  );
}
