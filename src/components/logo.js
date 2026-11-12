import Link from "next/link";

// Marca provisoria: "tuppi" en Fraunces. Se reemplaza por el SVG del logo cuando esté.
export default function Logo({ href = "/", claro = false, className = "" }) {
  return (
    <Link
      href={href}
      className={
        "font-titulo text-[1.75rem] leading-none font-bold tracking-tight " +
        (claro ? "text-papel " : "text-hoja-900 ") +
        className
      }
      style={{ fontVariationSettings: '"SOFT" 100' }}
    >
      tuppi
      <span className="sr-only">, ir al inicio</span>
    </Link>
  );
}
