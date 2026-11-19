// Avatares de comida dibujados en SVG: un personaje simple con carita, sobre un fondo de color.
// Reemplazan a la foto de perfil. Cada uno es una función que dibuja el cuerpo; la cara es común.
import { AVATAR_INICIAL } from "@/lib/avatares";

const TINTA = "#10231b";

function Cara({ y = 52 }) {
  return (
    <g fill={TINTA} stroke={TINTA} strokeLinecap="round">
      <circle cx="40" cy={y} r="2.6" stroke="none" />
      <circle cx="60" cy={y} r="2.6" stroke="none" />
      <path d={`M43 ${y + 9} q7 7 14 0`} fill="none" strokeWidth="2.4" />
    </g>
  );
}

const DIBUJOS = {
  tomate: { fondo: "#fbd9cf", cuerpo: (
    <>
      <circle cx="50" cy="56" r="30" fill="#e0452b" />
      <path d="M50 24l5 9 9-3-4 9 8 5-10 2-8 6-8-6-10-2 8-5-4-9 9 3z" fill="#1f5a3f" />
      <Cara y={56} />
    </>
  ) },
  brocoli: { fondo: "#e8dcf5", cuerpo: (
    <>
      <rect x="41" y="58" width="18" height="30" rx="7" fill="#8dc26f" />
      <circle cx="34" cy="46" r="15" fill="#5f9a45" />
      <circle cx="66" cy="46" r="15" fill="#5f9a45" />
      <circle cx="50" cy="38" r="17" fill="#6fae52" />
      <circle cx="50" cy="52" r="14" fill="#6fae52" />
      <Cara y={48} />
    </>
  ) },
  huevo: { fondo: "#fff3c4", cuerpo: (
    <>
      <ellipse cx="50" cy="55" rx="27" ry="33" fill="#fff" stroke="#e6dcc0" strokeWidth="2" />
      <circle cx="50" cy="75" r="9" fill="#f2b731" />
      <Cara y={46} />
    </>
  ) },
  palta: { fondo: "#e3eee6", cuerpo: (
    <>
      <path d="M50 16c14 0 28 22 28 42 0 16-12 28-28 28S22 74 22 58c0-20 14-42 28-42z" fill="#2f6b3f" />
      <path d="M50 24c10 0 21 18 21 34 0 12-9 22-21 22S29 70 29 58c0-16 11-34 21-34z" fill="#c9e08a" />
      <circle cx="50" cy="68" r="9" fill="#8a5a3b" />
      <Cara y={48} />
    </>
  ) },
  zanahoria: { fondo: "#fde3c8", cuerpo: (
    <>
      <ellipse cx="40" cy="22" rx="6" ry="12" fill="#6fae52" transform="rotate(-20 40 22)" />
      <ellipse cx="50" cy="19" rx="6" ry="13" fill="#5f9a45" />
      <ellipse cx="60" cy="22" rx="6" ry="12" fill="#6fae52" transform="rotate(20 60 22)" />
      <path d="M28 34q22-12 44 0L55 88q-5 7-10 0z" fill="#f07c2a" />
      <Cara y={50} />
    </>
  ) },
  hongo: { fondo: "#f9d6e4", cuerpo: (
    <>
      <rect x="37" y="50" width="26" height="36" rx="11" fill="#fff7ea" />
      <path d="M14 54a36 32 0 0 1 72 0z" fill="#e46aa0" />
      <circle cx="32" cy="42" r="5" fill="#fff" />
      <circle cx="52" cy="34" r="6" fill="#fff" />
      <circle cx="70" cy="45" r="4.5" fill="#fff" />
      <Cara y={66} />
    </>
  ) },
  limon: { fondo: "#fff0b8", cuerpo: (
    <>
      <ellipse cx="50" cy="55" rx="34" ry="27" fill="#f2b731" />
      <path d="M14 55l-5-2 6-3zM86 55l5 2-6 3z" fill="#f2b731" />
      <path d="M62 30q8-8 16-4-4 8-12 8z" fill="#6fae52" />
      <Cara y={52} />
    </>
  ) },
  berenjena: { fondo: "#e9e4f5", cuerpo: (
    <>
      <path d="M50 28c18 0 26 16 22 36-3 14-12 24-22 24s-19-10-22-24c-4-20 4-36 22-36z" fill="#6b4a9e" />
      <path d="M36 30q14-12 28 0l-4 6H40z" fill="#4c8a52" />
      <rect x="47" y="14" width="6" height="14" rx="3" fill="#4c8a52" />
      <Cara y={56} />
    </>
  ) },
};

export default function Avatar({ id, className = "size-16" }) {
  const dibujo = DIBUJOS[id] ?? DIBUJOS[AVATAR_INICIAL];
  return (
    <svg viewBox="0 0 100 100" className={`${className} shrink-0 rounded-full`} aria-hidden="true">
      <rect width="100" height="100" fill={dibujo.fondo} />
      {dibujo.cuerpo}
    </svg>
  );
}
