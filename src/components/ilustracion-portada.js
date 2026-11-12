// Ilustración de la portada: verduras de papel recortado en SVG, igual que en el Figma (D1 Landing).
// Se reemplaza por la de Gemini (public/ilustraciones/portada-*.webp) cuando esté.
// Cada verdura cae una vez al cargar (animate-caer), una detrás de la otra.

// transform-box: fill-box hace que cada verdura caiga y gire sobre su propio centro.
function Pieza({ demora, children }) {
  return (
    <g
      className="animate-caer"
      style={{
        animationDelay: `${demora}ms`,
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
    >
      {children}
    </g>
  );
}

export default function IlustracionPortada({ className = "" }) {
  return (
    <svg
      viewBox="0 0 864 1020"
      preserveAspectRatio="xMinYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect width="864" height="1020" fill="#123828" />

      {/* Lechuga: una hoja enorme que entra por arriba a la derecha */}
      <Pieza demora={0}>
        <path d="M465 -10C540 90 640 160 740 156C800 154 840 138 880 118L880 -10Z" fill="#8DC26F" />
      </Pieza>

      {/* Fondo verde oscuro que sube desde abajo a la izquierda */}
      <Pieza demora={80}>
        <path d="M-20 560C60 520 180 500 290 560C380 610 430 760 450 1030L-20 1030Z" fill="#2E5A43" />
      </Pieza>

      {/* Morrón amarillo con su cabito */}
      <Pieza demora={160}>
        <path
          d="M140 225C200 200 270 205 320 240C380 285 390 370 370 450C350 540 300 620 230 650C170 672 100 640 60 570C20 500 5 410 25 340C45 275 90 240 140 225Z"
          fill="#F2B731"
        />
        <path
          d="M240 225C238 170 270 120 330 105"
          fill="none"
          stroke="#2E5A43"
          strokeWidth="26"
          strokeLinecap="round"
        />
      </Pieza>

      {/* Tomate gigante, cortado por el borde derecho, con su estrella */}
      <Pieza demora={260}>
        <circle cx="672" cy="770" r="330" fill="#E0452B" />
        <path d="M672 282L692 392L752 358L712 430L752 465L690 450L672 560L654 450L592 465L632 430L592 358L652 392Z" fill="#2E5A43" />
      </Pieza>

      {/* Rabanito rosa con sus dos hojas */}
      <Pieza demora={360}>
        <path d="M340 770C300 720 250 690 198 680C230 730 280 765 340 775Z" fill="#8DC26F" />
        <path d="M340 770C365 720 400 690 458 676C430 728 392 762 340 775Z" fill="#8DC26F" />
        <circle cx="340" cy="866" r="100" fill="#E46AA0" />
      </Pieza>
    </svg>
  );
}
