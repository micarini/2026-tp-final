"use client";

// Navegación de la app. Es Client Component solo para saber en qué sección estás (usePathname).
// Mobile: barra fija abajo. Desktop (lg): barra arriba con la marca.
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/logo";
import {
  IconoCocinar,
  IconoRecetario,
  IconoComensales,
  IconoPerfil,
} from "@/components/iconos";

const DESTINOS = [
  { href: "/cocinar", texto: "Cocinar", Icono: IconoCocinar },
  { href: "/recetario", texto: "Recetario", Icono: IconoRecetario },
  { href: "/comensales", texto: "Comensales", Icono: IconoComensales },
  { href: "/perfil", texto: "Perfil", Icono: IconoPerfil },
];

function Item({ href, texto, Icono, activo }) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={
        "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-full px-3 text-xs font-medium " +
        "transition-colors duration-200 lg:min-h-11 lg:flex-none lg:flex-row lg:gap-2 lg:px-5 lg:text-base " +
        (activo
          ? "bg-hoja-100 text-hoja-900 lg:bg-hoja-700 lg:text-blanco"
          : "text-hoja-100 hover:bg-hoja-700 hover:text-blanco")
      }
    >
      {/* La key cambia al activarse: el ícono se vuelve a montar y da su saltito */}
      <span key={activo ? "activo" : "inactivo"} className={activo ? "animate-salto" : ""}>
        <Icono />
      </span>
      {texto}
    </Link>
  );
}

export default function Navegacion() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className={
        "fixed inset-x-0 bottom-0 z-10 bg-hoja-900 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] " +
        "lg:sticky lg:top-0 lg:bottom-auto lg:px-24 lg:py-3"
      }
    >
      <div className="mx-auto flex max-w-[1248px] items-center gap-1">
        <Logo href="/cocinar" claro className="mr-auto hidden lg:block" />
        {DESTINOS.map((destino) => (
          <Item
            key={destino.href}
            {...destino}
            activo={pathname.startsWith(destino.href)}
          />
        ))}
      </div>
    </nav>
  );
}
