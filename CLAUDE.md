# Tuppi

Recetario personal con asistente de IA para gente que cocina para 1 o 2, con lo que tiene en casa y respetando las restricciones de cada comensal. TP final de Programación III (UMAI); entrega y defensa presencial el 19/11/2026.

La fuente de verdad del producto es `docs/prd-v1.md`. Leelo antes de cualquier feature.

## Stack

- Next.js **16.4.5** (App Router, **JavaScript**, sin TypeScript) + React **19.3.0**
- Tailwind CSS **4.3.4**, fijado con `--save-exact`: la 4.3.5 salió rota en npm. No actualizar sin probar `npm install`.
- Tailwind se carga con el loader `@tailwindcss/turbopack` en `next.config.mjs`, no con PostCSS. No hay `postcss.config`.
- Instalado: `firebase` (cliente, solo para iniciar sesión), `firebase-admin` (servidor: sesión y Firestore), `server-only`.
- Planificado: Groq, TheMealDB, USDA FoodData Central, Unsplash. Deploy en Vercel.
- Node 24.

## Comandos

- `npm run dev`: servidor de desarrollo en http://localhost:3000
- `npm run build`: build de producción. Correrlo antes de cada push que toque rutas o datos.
- `npm run start`: sirve el build
- `npm run lint`: ESLint (config `eslint-config-next/core-web-vitals`)
- Tests: todavía no hay. No inventes un comando de test.

## Arquitectura

- `src/app/`: rutas del App Router. Hoy: `/` (landing provisoria), `/login`, `/registro`, `/cocinar` (provisoria, para probar la sesión).
- Auth: el navegador inicia sesión con Firebase y manda el token a la Server Action `createSession` (`src/app/actions/auth.js`), que lo cambia por la cookie httpOnly `tuppi_session` (5 días). `src/lib/session.js` (`getCurrentUser`, `requireUser`) es el único lugar que valida la sesión: usalo en cada página privada y en cada Server Action. `src/proxy.js` solo redirige si falta la cookie.
- `src/lib/firebase-admin.js` exporta funciones (`adminAuth()`, `db()`), no constantes, para que el build no falle sin variables de entorno. Igual `getClientAuth()` en `src/lib/firebase-client.js`.
- `firestore.rules`: reglas a pegar en la consola de Firebase.
- Alias `@/*` → `src/*` (en `jsconfig.json`). Importá con `@/`, no con rutas relativas largas.
- `docs/`: PRD y specs. Cada feature grande tiene su documento acá antes de programarse.
- Rutas previstas (PRD): públicas `/`, `/login`, `/registro`; privadas `/cocinar`, `/recetario`, `/recetario/[id]`, `/importar`, `/perfil`, `/comensales`.
- Llamadas a servicios externos: un archivo por servicio en `src/lib/` (por ejemplo `src/lib/ai.js`, `src/lib/themealdb.js`), para poder cambiar de proveedor sin tocar el resto.

## Convenciones

- Textos de la interfaz en español rioplatense (vos, cociná, guardá). El código (variables, funciones, archivos) puede ir en inglés o español, pero consistente dentro de cada archivo.
- Server Components por defecto. `"use client"` solo cuando hace falta estado, efectos o eventos, y lo más abajo posible en el árbol.
- Escrituras a la base de datos solo con Server Actions o Route Handlers, nunca desde el cliente directo.
- Cada ruta con datos tiene su estado de carga, error y vacío (`loading.js`, `error.js`, `not-found.js` o equivalente) y su `metadata`.
- Sin emojis en la interfaz. Íconos de una sola librería (Lucide o Phosphor, a definir en el brief de diseño).

## Reglas duras

- `.claude/settings.json` bloquea leer `.env*` y los JSON de cuentas de servicio, y pide confirmación para commit, push e instalar paquetes. No lo debilites.
- Nunca subas secretos. Las claves van en `.env.local` (ignorado por `.gitignore`) y se documentan sin valores en `.env.example`.
- Las claves de Groq, USDA y Unsplash solo se usan en el servidor. Nunca con prefijo `NEXT_PUBLIC_`.
- Nunca guardes ni loguees contraseñas: las maneja solo Firebase Auth.
- Toda lectura y escritura de datos de usuario va bajo `users/{uid}/**` y se valida en el servidor y en las reglas de Firestore. Un usuario nunca puede ver ni tocar datos de otro.
- El control de restricciones y alergias lo hace el código con las listas del catálogo, no solo la IA. No lo saques ni lo debilites.
- Respetá el límite de 20 pedidos a la IA por usuario por día.
- Preguntá antes de: tocar auth o las reglas de Firestore, agregar una dependencia nueva, cambiar el modelo de datos del PRD o actualizar Next o Tailwind.
- Todo el código tiene que poder explicarse en la defensa: preferí soluciones simples y legibles antes que ingeniosas.
- No hagas commits ni push sin que te lo pidan.

## Revisión y loops

- Después de cada paso que toque rutas, datos, auth o la IA, pedile al subagente `revisor` (`.claude/agents/revisor.md`) que revise el cambio antes de darlo por terminado. Corregí los hallazgos Alta y Media.
- Loops (`/goal`, `/loop`) solo para tareas con resultado medible, con la plantilla de `docs/loop-charter.md`. El avance se anota en `LOOP-STATE.md`, que se lee al empezar cada corrida. Las features nuevas no se hacen con loops.

## Trampas

- **`cacheComponents: true`** está activado en `next.config.mjs`. Cualquier lectura de datos sin caché o de APIs de runtime (`cookies()`, `headers()`, `searchParams`, Firestore) tiene que ir dentro de un `<Suspense>`; si no, el dev overlay marca la ruta como bloqueante (*blocking-route*). Usá `"use cache"` solo para datos que no dependen del usuario (por ejemplo, categorías de TheMealDB).
- **En Next 16, `middleware` se llama `proxy`**: el archivo es `src/proxy.js`. Sirve para redirecciones optimistas (sin sesión → `/login`), pero la autorización real se valida en el servidor, no solo ahí.
- Esta versión de Next es más nueva que mucho material online. Ante la duda, consultá la documentación incluida en `node_modules/next/dist/docs/`.
- `globals.css` pisa la fuente con `font-family: Arial` en `body`; se reemplaza cuando se definan las tipografías.
- TheMealDB busca ingredientes en inglés y de a uno por consulta: la intersección de resultados se hace en el código.
