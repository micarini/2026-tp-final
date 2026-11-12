# Tuppi

> Recetario personal con asistente de IA para gente que cocina para 1 o 2, con lo que tiene en casa y respetando las restricciones de cada comensal.

TP final de Programación III (UMAI). Entrega y defensa presencial: 19/11/2026.

**App publicada:** _pendiente (Vercel)_
**Usuario de prueba:** _pendiente_

## Descripción

Tuppi te pregunta qué tenés en casa y para quién cocinás. Con eso propone 2 o 3 recetas, las revisa contra las restricciones y alergias de cada comensal y te deja guardarlas en un recetario propio. Las restricciones las controla el código con listas del catálogo; la IA no es la única barrera.

Producto completo: [docs/prd-v1.md](docs/prd-v1.md).

## Usuario objetivo

Personas de 20 a 40 años que viven solas o en pareja, cocinan para 1 o 2 con lo que les quedó en la heladera, y a veces cocinan con alguien con una restricción (celiaquía, veganismo, alergias). Hoy buscan en redes recetas pensadas para 4 y revisan cada una a mano. Detalle y escenario de uso en [docs/investigacion.md](docs/investigacion.md).

## Benchmark

| | Supercook | Paprika Recipe Manager |
|---|---|---|
| **Enlace** | https://www.supercook.com | https://www.paprikaapp.com |
| **Problema y público** | Reducir el desperdicio: quien no sabe qué cocinar con lo que tiene | Ordenar recetas dispersas: cocineros caseros |
| **Funciones** | Búsqueda por ingredientes, qué falta comprar, filtros de dieta, cuenta para guardar favoritas | Guardar desde la web, categorías y búsqueda, modo cocina, lista de compras, planificador de comidas |
| **Qué tomamos** | Partir de lo que hay en casa | Recetario personal con búsqueda y filtros |
| **Qué nos diferencia** | Restricciones combinadas de varios comensales, revisadas por código, y porciones para 1 o 2 | Además de guardar, Tuppi propone qué cocinar; es una web sin suscripción |

Análisis completo en [docs/investigacion.md](docs/investigacion.md).

## Tecnologías y decisiones

- **Next.js 16** (App Router, JavaScript) y **React 19**, con **Tailwind CSS 4**.
- **Firebase Authentication** (email y contraseña, y Google). El navegador inicia sesión y el servidor la cambia por una cookie httpOnly de 5 días.
- **Cloud Firestore** con **firebase-admin**: todas las escrituras pasan por Server Actions que vuelven a validar la sesión.
- **Groq** (IA), **TheMealDB** (recetas con foto), **Unsplash** (fotos de respaldo) y **USDA FoodData Central** (macros, planificado). Cada servicio tiene su archivo en `src/lib/`, para poder cambiar de proveedor sin tocar el resto.
- **Vercel** para el deploy.
- Server Components por defecto; `"use client"` solo donde hay estado o eventos.
- Límite propio de 20 pedidos a la IA por usuario por día.

## Modelo de datos

```
users/{uid}                          perfil: nombre, restricciones, alergias, porciones
users/{uid}/comensales/{id}          nombre, restricciones, alergias
users/{uid}/recetas/{id}             receta guardada
users/{uid}/usoIA/{AAAA-MM-DD}       contador de pedidos del día
```

Un usuario tiene muchos comensales y muchas recetas; una receta referencia 0 o más comensales. Un usuario nunca puede leer ni modificar datos de otro: todo va bajo `users/{uid}/**` y se valida en el servidor y en las reglas de Firestore ([firestore.rules](firestore.rules)). Detalle de campos en el [PRD](docs/prd-v1.md#5-modelo-de-datos-firestore).

## Mapa de navegación

- **Públicas:** `/`, `/login`, `/registro`.
- **Privadas:** `/cocinar`, `/recetario`, `/recetario/[id]`, `/comensales`, `/perfil`.

Si no hay sesión, las rutas privadas redirigen a `/login`.

## Opcionales implementados

- Búsqueda y filtros en el recetario (texto, origen, tiempo y restricción).
- Accesibilidad cuidada (foco visible, navegación con teclado, `lang="es"`).
- Dashboard de macros: _a decidir según el tiempo_.

## Instalación

Requiere Node 24.

```bash
npm install
cp .env.example .env.local   # completar las variables
npm run dev                  # http://localhost:3000
```

Variables de entorno (todas documentadas en [.env.example](.env.example)): claves de Firebase (cliente y servidor), `GROQ_API_KEY`, `UNSPLASH_ACCESS_KEY`, `USDA_API_KEY`. Las claves de servicios externos solo se usan en el servidor.

Otros comandos: `npm run build`, `npm run start`, `npm run lint`.

## Capturas

_Pendiente: landing, perfil, comensales, "¿Qué cocino hoy?" y recetario._

## Uso de IA

### Consentimiento

Se usó **Claude Code** (Anthropic) como asistente durante el desarrollo: para escribir y revisar código, armar la documentación (PRD, plan, brief de diseño) y revisar cambios contra las reglas del proyecto. La app usa **Groq** en producción para traducir ingredientes, adaptar y proponer recetas. _Completar con otras herramientas si se usaron (por ejemplo, para imágenes o logo)._

### Reflexión

_Pendiente: qué aportó la IA, qué hubo que corregir y qué se aprendió. Escribirla antes del 19/11 con ejemplos reales del proyecto (por ejemplo, los hallazgos de las revisiones sobre restricciones y seguridad)._
