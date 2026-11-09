// Proxy (en Next 16 reemplaza a "middleware"): corre antes de cada pedido a una ruta privada.
// Es solo una redirección rápida: mira si existe la cookie, no si es válida.
// La validación real la hace el servidor en cada página y acción (src/lib/session.js).
import { NextResponse } from "next/server";

const SESSION_COOKIE = "tuppi_session";

export function proxy(request) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  // Guardamos a dónde quería ir, para volver ahí después de ingresar.
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// Rutas privadas del PRD.
export const config = {
  matcher: [
    "/cocinar/:path*",
    "/recetario/:path*",
    "/importar/:path*",
    "/perfil/:path*",
    "/comensales/:path*",
  ],
};
