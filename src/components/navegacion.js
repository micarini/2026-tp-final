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
        "flex min-h-[4.75rem] flex-1 flex-col items-center justify-center gap-1 px-1 text-[0.95rem] font-medium " +
        "text-hoja-900 transition-colors duration-200 lg:min-h-11 lg:flex-none lg:flex-row lg:gap-2 lg:rounded-full lg:px-5 lg:text-base " +
        (activo
          ? "lg:bg-hoja-700 lg:text-blanco"
          : "hover:bg-hoja-100 lg:text-hoja-100 lg:hover:bg-hoja-700 lg:hover:text-blanco")
      }
    >
      {/* La key cambia al activarse: el ícono se vuelve a montar y da su saltito */}
      <span
        key={activo ? "activo" : "inactivo"}
        className={
          "grid size-14 place-items-center rounded-full " +
          (activo ? "bg-hoja-100 text-hoja-900 lg:size-auto lg:rounded-none lg:bg-transparent lg:text-inherit" : "") +
          (activo ? " animate-salto" : "")
        }
      >
        <Icono />
      </span>
      <span>{texto}</span>
    </Link>
  );
}

export default function Navegacion() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className={
        "fixed inset-x-0 bottom-0 z-10 border-t border-borde bg-blanco px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(18_56_40_/_0.06)] " +
        "lg:border-0 lg:bg-hoja-900 lg:shadow-none " +
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
