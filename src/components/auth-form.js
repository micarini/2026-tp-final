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
import { createSession, emailRegistrado } from "@/app/actions/auth";
import Campo from "@/components/ui/campo";
import Boton from "@/components/ui/boton";

const MINIMO = 8;
const AYUDA_PASSWORD = `Al menos ${MINIMO} caracteres, con una letra y un número.`;
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regla de H1: mínimo 8 caracteres, con al menos una letra y un número.
// Devuelve la lista de lo que falta (vacía = la contraseña sirve).
export function faltantesPassword(password) {
  const faltan = [];
  const restantes = MINIMO - password.length;
  if (restantes > 0) faltan.push(restantes === 1 ? "1 carácter" : `${restantes} caracteres`);
  if (!/[A-Za-zÀ-ÿ]/.test(password)) faltan.push("una letra");
  if (!/[0-9]/.test(password)) faltan.push("un número");
  return faltan;
}

// ["3 caracteres", "un número"] → "Te faltan 3 caracteres y un número."
function fraseFaltantes(faltan) {
  const lista =
    faltan.length === 1 ? faltan[0] : `${faltan.slice(0, -1).join(", ")} y ${faltan.at(-1)}`;
  const verbo = faltan.length === 1 && !faltan[0].includes("caracteres") ? "Te falta" : "Te faltan";
  return `${verbo} ${lista}.`;
}

const MENSAJES_FIREBASE = {
  // Si la cuenta se creó con Google, no tiene contraseña: por eso la pista.
  "auth/invalid-credential":
    "El email o la contraseña no coinciden. Si te registraste con Google, usá Continuar con Google.",
  "auth/invalid-email": "Ese email no es válido.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos y probá de nuevo.",
  "auth/network-request-failed": "No hay conexión. Revisá internet y probá de nuevo.",
  "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permitila y probá de nuevo.",
};

function mensajeDeError(error) {
  if (MENSAJES_FIREBASE[error?.code]) return MENSAJES_FIREBASE[error.code];
  // Un código auth/... que no conocemos viene de Firebase; si no tiene código, falló nuestro servidor.
  if (String(error?.code ?? "").startsWith("auth/")) return "No pudimos iniciar sesión. Probá de nuevo.";
  return "El servidor no respondió. Esperá un momento y probá de nuevo.";
}

// Solo aceptamos destinos de nuestro propio sitio, para que nadie arme un link
// que después de ingresar te mande a otra página (por ejemplo ?next=/\otro-sitio.com).
// new URL resuelve el destino igual que el navegador; si cambia el origen, lo descartamos.
function destinoSeguro(porDefecto) {
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next) return porDefecto;
  try {
    const url = new URL(next, window.location.origin);
    if (url.origin !== window.location.origin) return porDefecto;
    return url.pathname + url.search;
  } catch {
    return porDefecto;
  }
}

export default function AuthForm({ modo }) {
  const esRegistro = modo === "registro";
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Estado del email: "neutro", "revisando", "invalido", "existe" o "libre"
  const [estadoEmail, setEstadoEmail] = useState("neutro");
  const [errorNombre, setErrorNombre] = useState(false);

  // La contraseña se evalúa en vivo, mientras escribís (solo en registro)
  const faltan = faltantesPassword(password);
  const cuentaExistente = estadoEmail === "existe";

  async function revisarEmail() {
    const limpio = email.trim();
    if (!limpio) return setEstadoEmail("neutro");
    if (!FORMATO_EMAIL.test(limpio)) return setEstadoEmail("invalido");
    if (!esRegistro) return setEstadoEmail("neutro");

    setEstadoEmail("revisando");
    const existe = await emailRegistrado(limpio);
    setEstadoEmail(existe ? "existe" : "libre");
  }

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
    // Después de registrarte vas al perfil a contar qué no comés; después de ingresar, a cocinar.
    router.replace(destinoSeguro(esRegistro ? "/perfil?bienvenida=1" : "/cocinar"));
    router.refresh();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!FORMATO_EMAIL.test(email.trim())) {
      setEstadoEmail("invalido");
      return document.getElementById("campo-email")?.focus();
    }
    if (esRegistro) {
      if (!nombre.trim()) {
        setErrorNombre(true);
        return document.getElementById("campo-nombre")?.focus();
      }
      if (cuentaExistente) return;
      if (faltan.length > 0) return document.getElementById("campo-password")?.focus();
    }

    setCargando(true);
    try {
      const credencial = esRegistro
        ? await createUserWithEmailAndPassword(getClientAuth(), email.trim(), password)
        : await signInWithEmailAndPassword(getClientAuth(), email.trim(), password);
      await terminarIngreso(credencial);
    } catch (err) {
      if (err?.code === "auth/email-already-in-use") setEstadoEmail("existe");
      else setError(mensajeDeError(err));
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

  // Una sola línea bajo cada campo, que cambia de estado en el lugar
  const lineaEmail = {
    neutro: { estado: "neutro", mensaje: "" },
    revisando: { estado: "neutro", mensaje: "Revisando…" },
    invalido: { estado: "error", mensaje: "Revisá el email: le falta algo (por ejemplo, la @)." },
    existe: { estado: "error", mensaje: "Ya hay una cuenta con este email. " },
    libre: { estado: "ok", mensaje: "" },
  }[estadoEmail];

  const lineaPassword = !esRegistro
    ? { estado: "neutro", mensaje: "" }
    : password === ""
      ? { estado: "neutro", mensaje: AYUDA_PASSWORD }
      : faltan.length > 0
        ? { estado: "error", mensaje: fraseFaltantes(faltan) }
        : { estado: "ok", mensaje: "Lista." };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        {esRegistro && (
          <Campo
            label="Nombre"
            name="nombre"
            autoComplete="given-name"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrorNombre(false);
            }}
            maxLength={60}
            required
            estado={errorNombre ? "error" : "neutro"}
            mensaje={errorNombre ? "Contanos cómo te llamás." : ""}
          />
        )}

        <Campo
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            // Si cambiás el email, el aviso anterior deja de valer
            if (estadoEmail !== "neutro") setEstadoEmail("neutro");
          }}
          onBlur={revisarEmail}
          required
          estado={lineaEmail.estado}
          mensaje={lineaEmail.mensaje}
        >
          {cuentaExistente && (
            <Link href="/login" className="font-medium text-hoja-700 underline underline-offset-4">
              Ingresá
            </Link>
          )}
        </Campo>

        <Campo
          label="Contraseña"
          type="password"
          name="password"
          autoComplete={esRegistro ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={cuentaExistente}
          required
          estado={lineaPassword.estado}
          mensaje={lineaPassword.mensaje}
        />

        {error && (
          <div
            role="alert"
            className="rounded-campo bg-tomate-suave px-4 py-3 text-sm text-tinta animate-subir"
          >
            {error}
          </div>
        )}

        <Boton type="submit" cargando={cargando} disabled={cuentaExistente} className="mt-2 w-full">
          {esRegistro ? "Crear cuenta" : "Ingresar"}
        </Boton>
      </form>

      <div className="flex items-center gap-3 text-sm text-tinta-2" aria-hidden="true">
        <span className="h-px flex-1 bg-borde" />o<span className="h-px flex-1 bg-borde" />
      </div>

      <Boton
        type="button"
        variante="secundario"
        onClick={handleGoogle}
        disabled={cargando}
        className="w-full"
      >
        Continuar con Google
      </Boton>

      <p className="text-center text-sm text-tinta-2">
        {esRegistro ? "¿Ya tenés cuenta? " : "¿Todavía no tenés cuenta? "}
        <Link
          href={esRegistro ? "/login" : "/registro"}
          className="font-medium text-hoja-700 underline underline-offset-4"
        >
          {esRegistro ? "Ingresá" : "Creá una"}
        </Link>
      </p>
    </div>
  );
}
