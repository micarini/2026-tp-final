# Plan de implementación — Tuppi v1

Hoy es domingo 08/11. La entrega es el **jueves 19/11**, así que quedan **10 días de desarrollo** (lunes 09/11 a miércoles 18/11). El orden sigue las prioridades del PRD: primero H1 a H5, después H6 y H7, y H8 solo si sobra tiempo.

## Reglas para cada paso

- Cada día es un paso chico que termina andando. No se empieza el siguiente con el anterior roto.
- **Hecho** significa que:
  1. `npm run build` y `npm run lint` pasan sin errores.
  2. Probaste el flujo en el navegador.
  3. El subagente `revisor` revisó el cambio y corregiste los hallazgos Alta y Media.
- Cada feature grande arranca con su spec corta en `docs/` (qué pantallas, qué datos, qué casos borde). El plan de abajo ya trae lo principal de cada una.
- El diseño (logo, tipografía del logo, ilustraciones de Gemini) **no bloquea nada**: el código usa los tokens del brief y las imágenes se reemplazan cuando estén.

## Lo que tenés que hacer vos antes del miércoles 11/11

Algunos servicios tardan en aprobar o piden datos, así que conviene registrarse temprano. Todas las claves van en `.env.local`, nunca en el chat.

| Servicio | Para qué | Dónde | Variable |
|---|---|---|---|
| Groq | La IA (H4, H6, H7) | console.groq.com → API Keys | `GROQ_API_KEY` |
| USDA FoodData Central | Macros (H6) | fdc.nal.usda.gov → API Key Signup | `USDA_API_KEY` |
| Unsplash | Fotos de respaldo (H4) | unsplash.com/developers → New Application | `UNSPLASH_ACCESS_KEY` |
| Vercel | Deploy | vercel.com, con tu cuenta de GitHub | (se cargan las mismas variables en el panel) |

TheMealDB no pide clave: usa la clave pública de prueba `1`.

## Decisiones que necesito de vos

1. **Íconos:** ¿Lucide (`lucide-react`)? Es una dependencia nueva y necesita tu aprobación. La alternativa es copiar a mano los SVG que usamos.
2. **Groq sin librería:** propongo llamarlo con `fetch` a su API, que es compatible con el formato de OpenAI. Así no sumamos ninguna dependencia y el código se explica en pocas líneas.
3. **Capturas en H7:** hay que confirmar con tu clave qué modelo de Groq con visión está disponible gratis. Si no hay ninguno, H7 queda solo con texto pegado.

## Calendario

| Día | Paso | Historia |
|---|---|---|
| Lun 09/11 | 1. Base visual en código + cerrar el login | H1 |
| Mar 10/11 | 2. Catálogo de restricciones + perfil | H2 |
| Mié 11/11 | 3. Comensales | H3 |
| Jue 12/11 | 4. Servicios: TheMealDB, Groq, límite diario | H4 (1/2) |
| Vie 13/11 | 5. Pantalla "¿Qué cocino hoy?" y resultados | H4 (2/2) |
| Sáb 14/11 | 6. Recetario: guardar, listar, detalle, editar, borrar, buscar | H5 |
| Dom 15/11 | 7. Macros con USDA | H6 |
| Lun 16/11 | 8. Importar receta | H7 |
| Mar 17/11 | 9. Deploy, usuario de prueba, estados, accesibilidad, animaciones | Todo |
| Mié 18/11 | 10. Margen, README, ensayo de la defensa (H8 si sobra) | — |
| **Jue 19/11** | **Entrega y defensa** | |

Si un día se atrasa, se recorta en este orden: H8, después las capturas de H7, después los filtros de H5. H1 a H5 no se recortan.

---

## Paso 1 — Base visual en código + cerrar el login (lun 09/11)

**Objetivo:** que todas las pantallas que vengan ya nazcan con el diseño, y que el login esté probado de punta a punta.

- **Tokens:** pasar a `src/app/globals.css` los tokens del brief con `@theme` de Tailwind 4: colores (hoja, papel, tinta, tomate y los de verdura), radios, sombra y espaciado. Sacar el `font-family: Arial`.
- **Tipografías:** Fraunces (títulos) y Figtree (interfaz) con `next/font/google` en `layout.js`, en lugar de Geist.
- **Estructura:** un `src/components/app-shell.js` con navegación inferior en mobile y superior desde `lg` (1024 px). Ítems: Cocinar, Recetario, Comensales, Perfil.
- **Componentes base** en `src/components/ui/`: `Boton`, `Campo`, `Etiqueta` y `Sello`, con sus estados (hover, foco, deshabilitado, cargando).
- **Movimiento base:** las curvas de rebote como variables CSS (`--rebote`, `--resorte`) y la regla `prefers-reduced-motion` en `globals.css`.
- **Login:** rediseñar `/login` y `/registro` con los componentes nuevos. Resolver el "ya hay una cuenta con ese mail": revisar en Firebase → Authentication → Users si el mail ya existe, y mostrar el mensaje con un link a `/login`.
- **Prueba de punta a punta:**
  1. Registro con mail y contraseña.
  2. Revisar que la cookie `tuppi_session` sea HttpOnly.
  3. Revisar que se creó `users/{uid}` en Firestore.
  4. Cerrar sesión.
  5. Entrar con Google.
  6. Entrar a `/cocinar` sin sesión: tiene que redirigir.

**Hecho cuando:** login y registro se ven con el diseño en mobile y desktop, y los 6 pasos de la prueba funcionan.

## Paso 2 — Catálogo de restricciones + perfil (mar 10/11)

**Objetivo:** H2, y la pieza más importante para la defensa: **el control de restricciones lo hace el código**.

- **`src/lib/restricciones.js`** (sin `server-only`: también lo usa el formulario):
  - `RESTRICCIONES`: sin gluten, vegano, vegetariano, sin lactosa.
  - `ALERGIAS`: maní, frutos secos, huevo, pescado, mariscos, soja.
  - Cada opción tiene `id`, `nombre` y `prohibidos`: palabras en español y en inglés, porque las recetas de TheMealDB vienen en inglés.
  - `ESCONDEN_GLUTEN`: salsa de soja, caldos, rebozadores, etc. Llevan el aviso "buscá una que diga sin gluten".
  - `normalizar(texto)`: pasa a minúsculas y saca tildes.
  - `combinarRestricciones(perfil, comensales)`: devuelve la unión de las restricciones sin repetidos.
  - `revisarReceta(receta, restricciones)`: devuelve `{ apta, prohibidos: [{ingrediente, motivo}], avisos: [] }`.
- **Prueba del catálogo:** correr el loop "Catálogo de restricciones" de `docs/loop-charter.md`. Cada opción tiene que tener al menos un caso que demuestre que la receta queda marcada.
- **`/perfil`:**
  - Server Component que lee `users/{uid}` dentro de `<Suspense>`.
  - Formulario cliente con las etiquetas de restricción (con su animación "pop"), las alergias y las porciones (1 a 4).
  - Al guardar llama a la Server Action `actualizarPerfil`, que valida contra el catálogo (rechaza cualquier id que no exista) y escribe.
- **Onboarding:** después del registro, mandar a `/perfil?bienvenida=1` en vez de `/cocinar`.
- **Estados:** `loading.js`, `error.js` y `metadata` en la ruta.

**Hecho cuando:** guardás restricciones, recargás la página y siguen ahí, y el caso de prueba de cada opción del catálogo pasa.

## Paso 3 — Comensales (mié 11/11)

**Objetivo:** H3, el ABM completo de comensales.

- **`src/app/actions/comensales.js`:** `crearComensal`, `editarComensal`, `borrarComensal`.
  - Todas llaman primero a `requireUser()`.
  - Validan el nombre: obligatorio, hasta 40 caracteres.
  - Validan restricciones y alergias contra el catálogo.
  - Escriben en `users/{uid}/comensales`.
- **`/comensales`:** lista con su estado vacío (ilustración `vacio-comensales`), formulario para agregar o editar, y borrar con confirmación.
- Borrar un comensal no toca las recetas. Las recetas guardan una copia de las `restriccionesAplicadas`, así que no dependen del comensal.

**Hecho cuando:** creás, editás y borrás un comensal; con otro usuario no lo ves (probar con dos cuentas).

## Paso 4 — Servicios de recetas e IA (jue 12/11)

**Objetivo:** la mitad de H4 que no se ve. Un archivo por servicio en `src/lib/`, todos con `server-only`.

- **`src/lib/themealdb.js`:**
  - `buscarPorIngrediente(ingrediente)`: una consulta por ingrediente.
  - `intersectar(listas)`: se queda con las recetas que aparecen en todas las listas. Si la intersección queda vacía, se queda con las que aparecen en más listas.
  - `obtenerReceta(id)`: trae el detalle.
  - Las categorías van con `"use cache"`, porque no dependen del usuario.
- **`src/lib/ai.js`:**
  - `pedirJSON({ sistema, usuario })` llama a Groq con `fetch`, pide la respuesta en formato JSON y la valida.
  - Si el formato es inválido, hace un reintento automático. Si vuelve a fallar, tira un error amable.
  - Funciones encima de esa:
    - `traducirIngredientes(lista)`: del español al inglés, para TheMealDB.
    - `adaptarReceta(receta, contexto)`: traduce, ajusta las porciones y propone reemplazos.
    - `proponerReceta(contexto)`: cuando TheMealDB no encuentra nada.
- **`src/lib/unsplash.js`:** `buscarFoto(consulta)` devuelve `{ url, credito, link }`. El crédito del fotógrafo es obligatorio.
- **`src/lib/uso-ia.js`:** `consumirPedido(uid)` usa una transacción de Firestore sobre `users/{uid}/usoIA/{AAAA-MM-DD}`.
  - Si `pedidos` ya está en 20, devuelve "llegaste al límite de hoy".
  - Si no, suma 1.
  - Se llama **antes** de cada llamada a la IA.
- **Reglas de Firestore:** la regla actual ya cubre `usoIA`, porque está bajo `users/{uid}`. No hace falta tocarla.

**Hecho cuando:** un script de prueba (o una ruta provisoria) con "pollo, arroz" devuelve recetas reales traducidas, y el pedido número 21 del día da el mensaje de límite.

## Paso 5 — "¿Qué cocino hoy?" (vie 13/11)

**Objetivo:** el flujo central de la app, con H4 completa.

- **`/cocinar`:**
  1. "Para quién cocino": la opción "solo yo" más los comensales guardados, como etiquetas que se pueden elegir.
  2. Ingredientes:
     - Se escribe uno, Enter, y queda pegado como etiqueta (con la animación de "pegar").
     - De 1 a 10.
     - Una lista aparte para "no consigo".
  3. Botón "Buscar recetas".
- **Server Action `sugerirRecetas`**, que hace en orden:
  1. Valida la sesión.
  2. Valida que haya de 1 a 10 ingredientes.
  3. Consume el pedido diario.
  4. Combina las restricciones.
  5. Traduce los ingredientes.
  6. Busca en TheMealDB.
  7. Adapta con la IA (o le pide una receta propia).
  8. Pasa **cada receta por `revisarReceta`**.
  9. Agrega la foto.
  10. Devuelve de 2 a 3 recetas.
- **Resultados:**
  - Tarjetas que llegan de a una, con el sello cuando la receta es apta.
  - Ingredientes marcados en dos grupos: "tenés" y "a comprar".
  - Advertencias bien visibles cuando el control encontró algo.
- **Carga:** las tres verduritas que saltan mientras busca.
- **Errores:** "Reintentar" sin perder lo que ya cargaste; "probá en un minuto" (cuando Groq responde 429); "llegaste al límite de hoy".

**Hecho cuando:** buscar recetas con "solo yo" y con un comensal celíaco da recetas sin gluten o marcadas, en menos de 10 segundos.

## Paso 6 — Recetario (sáb 14/11)

**Objetivo:** H5, el ABM completo de recetas, con búsqueda.

- **`src/app/actions/recetas.js`:** `guardarReceta`, `editarReceta`, `borrarReceta`.
  - Al editar los ingredientes, se vuelve a correr `revisarReceta`.
- **Guardar** desde los resultados, con la animación del sello "Guardada" y el salto del ícono Recetario.
- **`/recetario`:** lista de tarjetas con su estado vacío (ilustración `vacio-recetario`, con un llamado a "¿Qué cocino hoy?").
  - Búsqueda por texto y filtros por restricción, tiempo y origen.
  - Los filtros viven en `searchParams`, así el link se puede compartir y el botón "atrás" funciona.
  - Se filtra en el código después de leer las recetas del usuario. Son pocas por persona, y así no hacen falta índices de Firestore.
- **`/recetario/[id]`:** el detalle, con editar y borrar (con confirmación).
  - Si la receta no existe o es de otro usuario, muestra `not-found`.

**Hecho cuando:** guardás, editás, buscás y borrás una receta, y entrar con el id de una receta de otro usuario da `not-found`.

## Paso 7 — Macros (dom 15/11)

**Objetivo:** H6, los macros aproximados por porción.

- **`src/lib/usda.js`:** `buscarNutrientes(nombreEn)` devuelve kcal, proteínas, carbohidratos y grasas cada 100 g.
- La IA normaliza cada ingrediente a `gramos` y `nombreEn`. Ese pedido se suma a la misma llamada de `adaptarReceta`, así no gasta un pedido extra.
- **`calcularMacros(ingredientes, porciones)`:** suma, divide por las porciones y marca `parcial: true` si a algún ingrediente le falta el dato.
- Se muestran en el detalle y en los resultados con la etiqueta "aproximado" (y "valores parciales" cuando corresponde).

**Hecho cuando:** una receta guardada muestra sus macros, y una con un ingrediente raro muestra "valores parciales".

## Paso 8 — Importar receta (lun 16/11)

**Objetivo:** H7, guardar una receta vista en otro lado.

- **`/importar`:**
  - Un área de texto para pegar la receta.
  - Para quién es: las mismas etiquetas de "para quién cocino".
  - Opcional: de 1 a 3 capturas JPG o PNG, de hasta 4 MB cada una, validadas en el formulario.
- **Server Action `importarReceta`:**
  1. Consume el pedido diario.
  2. Pide a la IA que arme la receta con el formato de H4.
  3. Pasa la receta por `revisarReceta`.
  4. Calcula los macros.
  5. Muestra el resultado para revisar antes de guardar con `origen: "importada"`.
- Las capturas se mandan a la IA y se descartan: no se guardan en ningún lado.
- Si la IA no encuentra una receta en lo que pegaste, pide pegar el texto.

**Hecho cuando:** pegar la descripción de un reel termina en una receta guardada y adaptada.

## Paso 9 — Deploy y terminaciones (mar 17/11)

- **Deploy en Vercel:** cargar las variables de entorno en el panel y agregar el dominio de Vercel en Firebase → Authentication → Dominios autorizados. Sin eso, el login con Google falla en producción.
- **Usuario de prueba:** cargarle perfil, 2 comensales y 4 recetas guardadas.
- **Loops de `docs/loop-charter.md`:**
  - "Estados y metadata de cada ruta".
  - "Accesibilidad" (Lighthouse ≥ 90).
- **Revisión de animaciones contra la tabla del brief:** que cada una tenga su versión con movimiento reducido.
- **Revisión responsive de cada pantalla** a 375, 768 y 1280 px.
- **Imágenes:** colocar las de Gemini (si ya están) y el logo.

## Paso 10 — Margen y defensa (mié 18/11)

- Lo que se haya atrasado.
- **README:**
  - Qué es Tuppi.
  - Cómo correrlo.
  - Variables de entorno.
  - Servicios usados.
  - Uso de IA declarado: código asistido e ilustraciones de Gemini.
  - Link al deploy.
- **Ensayo de la defensa**, con el recorrido:
  1. Registro.
  2. Perfil.
  3. Comensal celíaco.
  4. "¿Qué cocino hoy?".
  5. Mostrar una receta descartada por el control del código.
  6. Guardar.
  7. Importar.
- **Preguntas que conviene saber contestar:** por qué una cookie httpOnly y no el token en el navegador, por qué el control lo hace el código y no la IA, cómo se aísla cada usuario (reglas + `requireUser`), y qué hace `cacheComponents`.
- H8 solo si todo lo anterior está terminado.
