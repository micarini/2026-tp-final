"use client";

// Navegación de la app. Es Client Component solo para saber en qué sección estás (usePathname).
// Mobile: barra fija abajo. Desktop (lg): barra superior con las secciones.
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
        "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 px-1 font-medium " +
        "text-hoja-900 transition-colors duration-200 lg:min-h-9 lg:flex-none lg:flex-row lg:gap-2 lg:rounded-full lg:px-4 lg:text-sm " +
        (activo
          ? "lg:bg-hoja-100 lg:text-hoja-900"
          : "hover:bg-hoja-100 lg:text-tinta-2")
      }
    >
      {/* La key cambia al activarse: el ícono se vuelve a montar y da su saltito */}
      <span
        key={activo ? "activo" : "inactivo"}
        className={
          "grid size-14 place-items-center rounded-full lg:size-auto lg:rounded-none lg:[&>svg]:size-5 " +
          (activo ? "bg-hoja-100 text-hoja-900 lg:bg-transparent lg:text-inherit" : "") +
          (activo ? " animate-salto" : "")
        }
      >
        <Icono />
      </span>
      {/* En el celular el ícono va solo; el texto queda para lectores de pantalla */}
      <span className="max-lg:sr-only">{texto}</span>
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
        "lg:static lg:border-t-0 lg:border-b lg:px-8 lg:py-2.5 lg:shadow-none"
      }
    >
      <div className="mx-auto flex max-w-[1248px] items-center gap-1">
        <div className="mr-auto hidden lg:block">
          <Logo href="/cocinar" palabra />
        </div>
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
