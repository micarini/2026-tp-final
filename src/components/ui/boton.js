import Link from "next/link";

// Botón de Tuppi. Con href se dibuja como link (navegar); sin href, como <button> (hacer algo).
// Al presionarlo se hunde (scale .96) y vuelve con el resorte.
const BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-medium " +
  "transition-[transform,background-color,color] duration-200 ease-resorte active:scale-[.96] " +
  "disabled:pointer-events-none disabled:opacity-50 select-none";

const VARIANTES = {
  principal: "bg-hoja-900 text-blanco hover:bg-hoja-700",
  secundario: "border border-hoja-900 text-hoja-900 hover:bg-hoja-100",
  // Para usar sobre fondo verde (landing)
  claro: "bg-papel text-hoja-900 hover:bg-blanco",
  contornoClaro: "border border-papel/70 text-papel hover:bg-hoja-700",
  peligro: "border border-tomate text-tomate hover:bg-tomate-suave",
  texto: "px-3 text-hoja-700 underline-offset-4 hover:underline",
  textoClaro: "px-3 text-papel underline-offset-4 hover:underline",
};

export default function Boton({
  href,
  variante = "principal",
  cargando = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const clases = `${BASE} ${VARIANTES[variante]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={clases} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      {...props}
      className={clases}
      disabled={cargando || disabled}
      aria-busy={cargando || undefined}
    >
      {cargando ? "Un momento…" : children}
    </button>
  );
}
