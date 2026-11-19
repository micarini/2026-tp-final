"use client";

// Guía paso a paso para conseguir la clave de Groq. Cada paso muestra una maqueta dibujada en código
// de la pantalla de Groq (no son capturas), con el botón a tocar latiendo y un cursor que lo toca.
import { useState } from "react";

const SOMBRA = "rgb(255 255 255 / 0.12)";

// Cursor de mouse que aparece sobre el botón objetivo y lo "toca".
function Cursor() {
  return (
    <svg viewBox="0 0 24 24" className="cursor-toque pointer-events-none absolute -right-2 -bottom-3 size-6 drop-shadow" aria-hidden="true">
      <path d="M5 3l14 7-6 2-2 6z" fill="#fff" stroke="#10231b" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// Un botón de la maqueta. Si es el objetivo, late y lleva el cursor.
function Boton({ children, objetivo = false, className = "" }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className={
          "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-white " +
          (objetivo ? "objetivo border-zanahoria bg-white/10" : "border-white/20")
        }
      >
        {children}
      </span>
      {objetivo && <Cursor />}
    </span>
  );
}

function Maqueta({ children }) {
  return (
    <div
      className="mx-auto flex min-h-60 w-full max-w-xs flex-col justify-center gap-3 rounded-tarjeta bg-[#14161a] p-5 text-white"
      style={{ boxShadow: `inset 0 0 0 1px ${SOMBRA}` }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

const PASOS = [
  {
    titulo: "Creá tu cuenta en Groq",
    texto: (
      <>
        Entrá a <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="font-medium text-hoja-700 underline underline-offset-4">console.groq.com</a> y elegí <strong>Continue with Google</strong> (o con tu email). Es gratis.
      </>
    ),
    maqueta: (
      <Maqueta>
        <p className="text-center text-sm font-semibold">Create Account or Login</p>
        <Boton objetivo>Continue with Google</Boton>
        <Boton>Continue with GitHub</Boton>
        <p className="text-center text-[0.65rem] text-white/50">or</p>
        <span className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white/40">example@email.com</span>
      </Maqueta>
    ),
  },
  {
    titulo: "Abrí el menú y elegí API Keys",
    texto: (
      <>
        Tocá el menú de arriba a la derecha y después <strong>API Keys</strong>.
      </>
    ),
    maqueta: (
      <Maqueta>
        <p className="text-lg font-bold">groq</p>
        {["Playground", "API Keys", "Dashboard", "Docs", "Settings"].map((item) => (
          <span key={item} className="relative inline-flex">
            <span className={"rounded-md px-2 py-1.5 text-xs " + (item === "API Keys" ? "objetivo border border-zanahoria font-semibold text-zanahoria" : "text-white/70")}>{item}</span>
            {item === "API Keys" && <Cursor />}
          </span>
        ))}
      </Maqueta>
    ),
  },
  {
    titulo: "Tocá Create API Key",
    texto: <>En la pantalla de <strong>API Keys</strong>, apretá el botón <strong>+ Create API Key</strong>.</>,
    maqueta: (
      <Maqueta>
        <p className="text-sm font-semibold">API Keys</p>
        <p className="text-[0.7rem] text-white/60">Manage your project API keys. Remember to keep your API keys safe.</p>
        <Boton objetivo className="self-start">+ Create API Key</Boton>
        <p className="mt-2 text-xs text-white/50">(No keys)</p>
      </Maqueta>
    ),
  },
  {
    titulo: "Ponele un nombre y confirmá",
    texto: (
      <>
        Escribí un nombre (por ejemplo <strong>tuppi</strong>), tildá <strong>Verify you are human</strong> y apretá <strong>Submit</strong>.
      </>
    ),
    maqueta: (
      <Maqueta>
        <p className="text-sm font-semibold">Create API Key</p>
        <span className="relative overflow-hidden rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-xs">
          <span className="escribiendo inline-block">tuppi</span>
        </span>
        <span className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs text-white/80">
          <span className="grid size-4 place-items-center rounded-sm bg-white text-[#14161a]">
            <svg viewBox="0 0 24 24" className="tildando size-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          Verify you are human
        </span>
        <Boton objetivo className="self-end">Submit</Boton>
      </Maqueta>
    ),
  },
  {
    titulo: "Copiá la clave ahora",
    texto: (
      <>
        Groq te muestra la clave <strong>una sola vez</strong>. Apretá el botón de copiar y guardala hasta pegarla acá.
      </>
    ),
    maqueta: (
      <Maqueta>
        <p className="text-sm font-semibold">Your API Key</p>
        <span className="flex items-center justify-between gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs">
          <span className="truncate font-mono text-white/70">gsk_••••••••••••••••</span>
          <span className="relative inline-flex">
            <span className="objetivo grid size-7 place-items-center rounded-md border border-zanahoria">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </span>
            <Cursor />
          </span>
        </span>
        <p className="text-[0.7rem] text-white/50">Copy the key now: you won&apos;t see it again.</p>
      </Maqueta>
    ),
  },
  {
    titulo: "Pegala en Tuppi",
    texto: <>Volvé acá, pegá la clave en el campo de abajo y tocá <strong>Probar y guardar</strong>. Tuppi la prueba y la guarda cifrada.</>,
    maqueta: (
      <div
        className="mx-auto flex min-h-60 w-full max-w-xs flex-col justify-center gap-3 rounded-tarjeta bg-hoja-100 p-5"
        aria-hidden="true"
      >
        <span className="text-sm font-medium">Tu clave de Groq</span>
        <span className="escribiendo rounded-campo border border-hoja-700 bg-blanco px-3 py-2.5 font-mono text-sm text-tinta-2">gsk_••••••••••••</span>
        <span className="relative inline-flex self-start">
          <span className="objetivo rounded-full bg-hoja-900 px-5 py-2.5 text-sm font-medium text-blanco">Probar y guardar</span>
          <Cursor />
        </span>
      </div>
    ),
  },
];

export default function OnboardingGroq() {
  const [paso, setPaso] = useState(0);
  const actual = PASOS[paso];

  return (
    <div className="flex flex-col gap-4" role="group" aria-label="Cómo conseguir tu clave de Groq, en 6 pasos">
      {/* La key reinicia la animación de entrada y las del paso cada vez que cambia */}
      <div key={paso} className="animate-subir">{actual.maqueta}</div>

      <div aria-live="polite" className="flex flex-col gap-1">
        <p className="text-xs font-medium text-tinta-2">Paso {paso + 1} de {PASOS.length}</p>
        <h3 className="font-titulo text-lg font-semibold">{actual.titulo}</h3>
        <p className="text-tinta-2">{actual.texto}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setPaso(paso - 1)}
          disabled={paso === 0}
          className="min-h-11 rounded-full px-4 text-sm font-medium text-hoja-700 disabled:opacity-40"
        >
          Anterior
        </button>
        <div className="flex gap-1.5" aria-hidden="true">
          {PASOS.map((_, indice) => (
            <span key={indice} className={"size-2 rounded-full transition-colors " + (indice === paso ? "bg-hoja-900" : "bg-borde")} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPaso(paso + 1)}
          disabled={paso === PASOS.length - 1}
          className="min-h-11 rounded-full bg-hoja-900 px-5 text-sm font-medium text-blanco disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
