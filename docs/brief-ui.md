# Brief de UI/UX — Tuppi v1

> Borrador para aprobar. Fuente de producto: `docs/prd-v1.md`. Inspiración: tablero de Pinterest "Tuppi recipe app" (5 pines) + identidad de Savr como referencia, sin copiar.

- **Pantalla o flujo:** la app completa v1, con foco en el flujo principal: landing → registro → perfil → ¿Qué cocino hoy? → receta → recetario.
- **Audiencia:** gente que vive sola o en pareja, cocina para 1 o 2 con lo que quedó en la heladera, y a veces con restricciones propias o de alguien con quien cocina (celiaquía, veganismo, alergias). Usa la app con el celular en la mano, en la cocina.
- **Marca:** verde hoja profundo dominante, colores de verdura saturados solo en el contenido, ilustración plana de papel recortado, etiquetas de fruta como recurso propio. Tipografía serif con carácter para títulos + sans para la interfaz.
- **Productos que estudiamos:** Savr, Deglaze, Frigo Magic (ver sección 9).

---

## 1. Dirección

| | |
|---|---|
| **Producto** | Un recetario personal que te dice qué cocinar para 1 o 2 con lo que tenés, y que controla las restricciones de cada comensal. |
| **Carácter** | generosa, directa, de barrio |
| **Mundo** | La verdulería de la esquina y la mesa de casa: cajones de verdura, etiquetas autoadhesivas de fruta, mantel de cuadrillé, papel recortado. |
| **Momento** | La heladera: cada ingrediente que escribís se convierte en una etiqueta de fruta que se pega en el cajón. En la receta, lo que tenés aparece etiquetado y lo que falta, como etiqueta vacía (contorno). |
| **Firma** | La etiqueta redonda de fruta. Se usa siempre para lo mismo: ingredientes, restricciones aplicadas ("sin gluten") y comensales. Nunca como decoración suelta. |

**Concepto:** *cada receta llega como un cajón de verdulería armado para vos: lo que ya tenés viene etiquetado.*

- **¿Sobrevive a los estados?** Vacío: el cajón sin etiquetas y la pregunta "¿Qué hay en tu heladera?". En uso: las etiquetas se van pegando. Hecho: la receta trae las mismas etiquetas, y las que faltan quedan en contorno como lista de compras.
- **¿Qué descarta?** El hero con foto de comida y saludo ("Buenos días, Mia"), las grillas de tarjetas iguales, los íconos de chispitas para la IA y los gradientes. La IA se explica con lo que hace ("adaptada a sin gluten"), no con brillos.

## 2. Qué tomamos del tablero (y qué no)

| Pin | Tomamos | No tomamos |
|---|---|---|
| Fondo de cuadrillé azul, tarjeta "Tastes of the week" | El cuadrillé como textura de un solo lugar (la landing y el estado vacío del recetario), en el azul del mantel | Usarlo de fondo en toda la app |
| Verduras de papel recortado sobre verde | El estilo de ilustración: formas planas, sin contorno, colores saturados sobre verde profundo | — |
| Cartel "Okra" en la calle | Verde profundo + formas grandes que se salen del cuadro, para la landing | El cartel como mockup |
| Pantalla de app "Good morning, Devin" | Serif grande para títulos, foto del plato protagonista, barra de acción verde abajo | El saludo como título: no dice nada y es una señal de IA |
| Etiquetas de fruta sobre limón, manzana, naranja | La firma: etiqueta redonda con borde, texto chico, a veces con número | El código de barras y los stickers decorativos sin función |

## 3. Recorrido del flujo principal

1. **Landing (`/`)**:
   - La ilustración de papel recortado ocupa más de la mitad de la pantalla y las verduras se salen del cuadro.
   - Sin etiquetas ni sellos encima: la ilustración sola.
   - Abajo, el texto mínimo: el título "Abrí la heladera.", la línea "Tuppi hace el resto.", el botón "Empezar" y el link "Ya tengo cuenta".
   - En desktop: texto a la izquierda e ilustración a la derecha, como un cartel con esquinas redondeadas.
2. **Registro (`/registro`)**: nombre, email y contraseña, o Google. Al terminar, va directo al perfil.
3. **Perfil, primera vez (`/perfil`)**: "¿Hay algo que no comés?". Restricciones y alergias como etiquetas que se tocan para activarse, más las porciones habituales (1 o 2). Botón "Listo".
4. **¿Qué cocino hoy? (`/cocinar`)**:
   - **Para quién:** "Solo yo" o yo + comensales, con etiquetas de nombre.
   - **Qué hay en la heladera:** campo de texto; cada Enter pega una etiqueta (de 1 a 10). Las etiquetas se pueden sacar.
   - **"Buscar recetas":** muestra un estado de carga en pasos ("Buscando recetas con pollo y hongos…", "Adaptando a sin gluten…", "Revisando cada ingrediente…").
   - **Resultado:** 2 o 3 recetas. Cada una con foto, título, tiempo, porciones, etiquetas de lo que tenés y lo que falta, y una advertencia si corresponde.
5. **Receta (`/recetario/[id]` o vista previa)**: foto grande, "por qué sirve", ingredientes con etiquetas, pasos numerados, reemplazos, macros por porción ("aproximado") y botón "Guardar en mi recetario".
6. **Recetario (`/recetario`)**: buscador, filtros (restricción, tiempo, origen) y lista. Estado vacío con llamado a "¿Qué cocino hoy?".
7. **Secundarias:** comensales (`/comensales`, ABM), importar (`/importar`).

## 4. Layout

- **Mobile primero** (360–430 px): una columna con márgenes de 16 px. Navegación con barra inferior de 4 destinos: Cocinar, Recetario, Comensales, Perfil. La acción principal de cada pantalla va fija abajo, encima de la barra.
- **Tablet** (≥ 640 px): una columna centrada de 560 px como máximo.
- **Desktop** (≥ 1024 px): navegación arriba (componente "Navegación superior"), con márgenes de 96 px y contenido de hasta 1248 px.
  - **Landing:** dos columnas, texto e ilustración.
  - **`/cocinar`:** el cajón (entrada) en una columna fija de 440 px a la izquierda y las recetas a la derecha, en tarjetas que se acomodan solas.
  - **Recetario:** grilla de 2 o 3 columnas.
  - **Receta:** foto y datos a la izquierda, pasos a la derecha.
- **Todo es responsive:** cada pantalla se construye mobile primero y se adapta con los breakpoints de Tailwind (`sm` 640, `lg` 1024). No hay pantallas solo para mobile. En Figma están las mobile y, como referencia, desktop para Landing y ¿Qué cocino hoy? + resultados. Las demás siguen la misma regla.
- **Ritmo:** grilla de 4 px. Dentro de un grupo, 8 o 12 px; entre grupos, 24 o 32 px. Sin divisores: agrupa la proximidad.
- **Jerarquía por pantalla:** un título en serif, una acción principal, como mucho una secundaria.

## 5. Tokens

### Color

| Token | Valor | Uso |
|---|---|---|
| `hoja-900` | `#123828` | Marca, barra de navegación, botón principal, fondos de la landing |
| `hoja-700` | `#1F5A3F` | Hover del botón principal, links |
| `hoja-100` | `#E3EEE6` | Superficies de apoyo, etiqueta seleccionada |
| `papel` | `#F5F7F3` | Fondo de la app (blanco apenas verde, no crema) |
| `blanco` | `#FFFFFF` | Tarjetas y campos (el campo es lo más claro de la pantalla) |
| `tinta` | `#10231B` | Texto principal |
| `tinta-2` | `#4A5D53` | Texto secundario |
| `tinta-3` | `#73847A` | Ayudas, placeholders (solo texto grande o no esencial) |
| `tomate` | `#C63B22` | El único acento de la interfaz: advertencias de restricción, "falta comprar", contador del límite de IA |
| `morron` | `#F2B731` | Solo en ilustraciones y etiquetas de contenido |
| `rabanito` | `#E46AA0` | Solo en ilustraciones y etiquetas de contenido |
| `zanahoria` | `#F07C2A` | Solo en ilustraciones y etiquetas de contenido |
| `mantel` | `#5B7FE0` | Cuadrillé de la landing y del recetario vacío |

- La interfaz es verde y neutra. Los colores de verdura viven en el contenido: ilustraciones, etiquetas de ingredientes y fotos.
- El error usa `tomate`, el éxito usa `hoja-700`. Siempre con texto o ícono, nunca solo color.
- **Contraste medido en Figma** (página Fundamentos, fórmula WCAG):
  - Pasan 4,5:1:
    - blanco sobre `hoja-900`: 12,9:1
    - `tinta` sobre `papel`: 15,2:1
    - `tinta-2` sobre blanco: 7,0:1
    - blanco sobre `tomate`: 5,2:1
    - `tomate` sobre `papel`: 4,8:1
    - `tinta` sobre las etiquetas de verdura: `rabanito` 5,4 · `zanahoria` 6,0 · `lechuga` 7,9 · `morron` 9,1
  - **No pasa:** `tinta-3` (3,9:1 sobre blanco, 3,7:1 sobre `papel`). Queda solo para el placeholder de los campos, que no es información esencial. Para texto de ayuda se usa `tinta-2`.
  - `tomate` sobre `tomate-suave` (4,4:1) sirve para íconos, que piden 3:1, pero no para texto. En el aviso, el texto va en `tinta`.
- `tomate-suave` (`#FAEAE6`) es el fondo del aviso de restricción.

### Tipografía

- **Títulos:** Fraunces (Google Fonts, variable), peso 500–600, una vez por pantalla. Le da el tono de recetario de papel.
- **Interfaz:** Figtree (Google Fonts), 400 y 500, 600 solo para énfasis.
- Se cargan con `next/font/google`, sin dependencia nueva.

| Rol | Tamaño / interlineado |
|---|---|
| Display (landing, título de receta) | 40 / 44, tracking −0,02em |
| Título de pantalla | 28 / 34, tracking −0,01em |
| Título de sección | 20 / 26 |
| Cuerpo | 16 / 24 |
| Chico (etiquetas, ayudas) | 14 / 20 |

- Mayúscula solo al principio de la oración. Números con `tabular-nums` en macros, tiempos y porciones.

### Forma

- **Radios:** etiquetas redondas (la firma) y botones como píldora, porque el carácter es blando y de mano. Tarjetas de 16 px, campos de 12 px. Radio interno = externo − padding.
- **Profundidad:** las tarjetas llevan una sombra suave teñida de verde y no llevan borde. Los campos llevan borde de 1 px y no llevan sombra.

## 6. Componentes y estados

| Componente | Estados |
|---|---|
| **Botón** (principal verde, secundario contorno, texto) | reposo, hover, foco (anillo neutro de 2 px), presionado (`scale(.96)`), deshabilitado, cargando (texto "Un momento…", mismo ancho) |
| **Campo de texto** | vacío, foco, con valor, error (mensaje abajo, conserva lo escrito), deshabilitado |
| **Etiqueta de ingrediente** (la firma) | "tengo" (relleno con color de verdura), "falta" (contorno `tomate` + "comprar"), recién agregada (se pega), para quitar (con ×) |
| **Etiqueta de restricción / alergia** | apagada, encendida (`hoja-900`), foco |
| **Etiqueta de comensal** | apagada, elegida |
| **Tarjeta de receta** | cargando (esqueleto con la forma exacta), lista, sin foto (Unsplash con crédito), con advertencia, guardada |
| **Aviso de restricción** | advertencia (`tomate`: "Tiene salsa de soja: buscá una que diga sin gluten"), bloqueada (descartada por el control) |
| **Carga de la IA** | pasos con texto que cambian. Nada de puntitos que rebotan. |
| **Límite de IA** | normal (oculto), quedan 3 o menos ("Te quedan 2 búsquedas hoy"), agotado (botón deshabilitado + "Volvé mañana") |
| **Estado vacío** | recetario (cuadrillé + "Todavía no guardaste recetas" + "¿Qué cocino hoy?"), comensales, resultados sin coincidencias |
| **Error de página** | mensaje claro + "Reintentar". Lo ya cargado no se pierde. |
| **Macros** | completo ("aproximado"), parcial ("valores parciales: no encontramos el dato de X") |
| **Navegación inferior** | destino actual, hover, foco |

## 7. Movimiento

**Principio:** Tuppi se siente viva y juguetona porque las cosas se comportan como objetos de verdad: las etiquetas se pegan, los sellos se estampan y las verduras rebotan. El rebote se usa en lo que se toca o se celebra, nunca en lo que se lee. Cada animación responde a algo que hiciste.

| Momento | Qué pasa | Cómo (CSS) |
|---|---|---|
| **Pegar una etiqueta** (agregar ingrediente) | Aparece un poco grande, rebota y queda pegada con un giro chiquito distinto en cada una (entre −4° y 4°) | `scale(.6)` → `1.08` → `1`, 360 ms, resorte con rebote (`linear()` con overshoot ~0,25) |
| **Despegar una etiqueta** (quitar) | Se achica y cae 8 px | 160 ms, `ease-in`, más rápido que la entrada |
| **Tocar una restricción o un comensal** | La etiqueta hace un "pop" y el check entra dibujándose | `scale(1)` → `1.12` → `1`, 280 ms, resorte |
| **Presionar un botón** | Se hunde y vuelve con un rebote suave | `scale(.96)` al presionar, resorte al soltar (220 ms) |
| **Buscar recetas** (cargando) | Tres verduras chiquitas saltan en fila dentro del cajón mientras cambian los textos de los pasos | Salto `translateY(-10px)` en bucle, 600 ms, desfasado 120 ms entre verduras. Se detiene apenas llegan las recetas |
| **Llegan las recetas** | Las tarjetas suben de a una y el sello "sin gluten" se estampa encima | Tarjetas: opacidad + 16 px, 320 ms, resorte, 80 ms entre cada una. Sello: `scale(1.6) rotate(-20°)` → `1 rotate(8°)`, 300 ms, con un leve rebote al "golpear" |
| **Guardar una receta** (el pico del flujo) | Aparece el sello "Guardada" sobre la tarjeta y el ícono de Recetario en la navegación da un salto | Sello: igual que arriba. Ícono: `translateY(-6px)` y vuelta con rebote, 400 ms |
| **Cambiar de sección** (navegación) | El ícono del destino nuevo da un saltito y el fondo verde se desliza hasta él | Ícono 300 ms con resorte; fondo con `transform`, 250 ms, ease-out |
| **Hover en tarjetas** (desktop) | La tarjeta se levanta 3 px y se inclina −1°, como un papel sobre la mesa | 200 ms, `ease`, solo con `(hover: hover)` |
| **Estados vacíos** | La nota del mantel se balancea apenas al pasar el mouse | `rotate(-2°)` → `rotate(1°)`, 400 ms, resorte |
| **Landing** | Al cargar, las verduras de la ilustración caen y se acomodan, una detrás de la otra | Una sola vez, 700 ms por pieza con resorte, 110 ms de desfasaje |

**Reglas:**
- Solo se animan `transform` y `opacity`. Nunca `transition: all`, nunca propiedades de layout.
- Lo que el usuario dispara se puede interrumpir: si quitás una etiqueta mientras entra, sale desde donde está.
- Nada se mueve en bucle salvo la carga, que se detiene sola.
- Sin parallax, sin fades al hacer scroll y sin pulsos en cosas que no están "vivas".
- **`prefers-reduced-motion`:** misma información, sin rebotes ni saltos. Solo cambios de opacidad de 150 ms.
- **Implementación:** con CSS (`@keyframes` y la función de easing `linear()` para los resortes) y clases de Tailwind, sin librerías. Si algún resorte necesita física real (arrastrar, interrumpir a mitad de camino), se evalúa agregar la librería `motion`, con tu aprobación porque es una dependencia nueva.

## 8. Accesibilidad

- Contraste mínimo de 4,5:1 en texto y 3:1 en íconos y texto grande, medido sobre el fondo real.
- Áreas táctiles de 44 × 44 px como mínimo. La etiqueta entera es el objetivo, no solo la ×.
- Campos con `<label>` real, `autocomplete`, 16 px (así iOS no hace zoom) y Enter para enviar.
- Resultados y errores anunciados con `aria-live="polite"`. Errores de formulario con `role="alert"`.
- "Tengo" y "falta" se distinguen por texto e ícono, no solo por color.
- Fotos con `alt` descriptivo y crédito de Unsplash visible.
- Foco visible en todo, navegación completa con teclado, `lang="es"`.
- Meta: Lighthouse accesibilidad ≥ 90 (métrica del PRD).

## 9. Productos que estudiamos (para el benchmark del README)

| Producto | Qué hace bien | Qué no copiamos |
|---|---|---|
| **Savr** | Identidad fuerte con verde dominante y un solo acento. Pasos de receta claros, uno por pantalla. | Su paleta exacta, su wordmark y sus íconos |
| **Deglaze** | Importar una receta de un video y dejarla ordenada en un formato único | La importación automática de links: no está permitida en IG ni TikTok |
| **Frigo Magic** | Buscar por lo que tenés en la heladera | La interfaz recargada de listas y publicidad |

## 10. Señales de "hecho por IA" que evitamos

Gradientes violetas, texto con gradiente, glassmorphism, emojis, chispitas para la IA, títulos que saludan, tres tarjetas iguales, grillas tipo bento, etiquetas en mayúscula con tracking, divisores donde alcanza el espacio, testimonios inventados, nombres genéricos de prueba (Maya, Alex, Acme).

## 11. Pendientes para cerrar el brief

1. **Logo:** falta el archivo que mandaste antes; hay que adaptarlo a la paleta.
2. **Íconos:** Lucide o Phosphor (dependencia nueva, hay que aprobarla).
3. **Fotos de ejemplo** para el Figma: TheMealDB y Unsplash con crédito.
