# Tuppi

> Recetario personal con asistente de IA para gente que cocina para 1 o 2, con lo que tiene en casa y respetando las restricciones de cada comensal.

TP final de Programación III (UMAI). Entrega y defensa presencial: 19/11/2026.

**App publicada:** https://tuppirecipes.vercel.app
**Usuario de prueba:** ver la sección [Usuario de prueba](#usuario-de-prueba)

## Descripción

Tuppi te pregunta qué tenés en casa y para quién cocinás. Con eso propone 2 o 3 recetas, las revisa contra las restricciones y alergias de cada comensal y te deja guardarlas en un recetario propio. Las restricciones las controla el código con listas del catálogo; la IA no es la única barrera.

Funciones principales:

- **¿Qué cocino hoy?** Recetas a partir de tus ingredientes, con cantidades exactas, macros por porción y un sticker que indica la restricción aplicada. Se pueden ajustar ("más rápida", "sin horno", "para 4"), preguntarle a Tuppi dudas sobre la receta y traducirla al español.
- **Cocinar para muchos.** Un menú económico para un grupo (hasta 30 personas) con una adaptación por cada restricción, por ejemplo para vegetarianos o celíacos.
- **Descubrir.** Receta del día y búsquedas populares con recetas de TheMealDB revisadas contra tus restricciones.
- **Importar receta.** Pegás el texto de una receta (o subís capturas) y Tuppi la deja en su formato, adaptada. Los links de Instagram y TikTok no se pueden leer: hay que pegar el texto.
- **Recetario** propio con búsqueda y filtros, edición por filas de ingredientes y detalle por receta.
- **Comensales, perfil y despensa**, con avatares de comida, y **configuración** con eliminación de cuenta con doble confirmación.

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

- **Next.js 16** (App Router, JavaScript) y **React 19**, con **Tailwind CSS 4**. Server Components por defecto; `"use client"` solo donde hay estado o eventos. `cacheComponents` activado: toda lectura de datos del usuario va dentro de `<Suspense>`.
- **Firebase Authentication** (email y contraseña, y Google). El navegador inicia sesión y el servidor cambia el token por una cookie `httpOnly` de 5 días. `src/lib/session.js` es el único lugar que valida la sesión.
- **Cloud Firestore** con **firebase-admin**. Todas las escrituras pasan por Server Actions que vuelven a validar la sesión y lo que manda el navegador.
- **Groq** (IA), **TheMealDB** (recetas con foto), **USDA FoodData Central** (macros) y **Unsplash** (fotos de respaldo). Cada servicio tiene su archivo en `src/lib/`.
- **Vercel** para el deploy.

Decisiones principales:

- **El control de restricciones lo hace el código, no la IA.** Cada opción del catálogo (`src/lib/restricciones.js`) tiene su lista de ingredientes prohibidos y excepciones. Todo lo que sale de la IA o de TheMealDB (sugerencias, ajustes, importaciones, adaptaciones de grupo) se revisa con esa lista antes de mostrarse o guardarse. Hay pruebas en `scripts/probar-restricciones.mjs`.
- **Los macros se calculan con datos, no con la IA.** La IA normaliza los ingredientes a gramos y nombres en inglés; el código consulta USDA, elige el alimento crudo y entero (descarta procesados) y suma por porción.
- **Clave propia de Groq.** Con la clave de la app hay un límite de 30 pedidos de IA por usuario por día (cada búsqueda cuenta uno). Quien carga su propia clave no tiene límite. La clave se prueba contra Groq, se cifra con AES-256-GCM en el servidor (`SECRETS_ENCRYPTION_KEY`) y nunca vuelve al navegador.
- **Respaldo sin IA.** Si Groq está limitado, la búsqueda sigue con recetas de TheMealDB sin adaptar y avisa al usuario. Las respuestas 429 se reintentan con espera.
- **Eliminar cuenta** exige escribir el email y volver a autenticarse (contraseña o Google); el servidor además verifica que la confirmación sea reciente y de la misma persona antes de borrar los datos y el usuario.
- **Sin Context API.** El estado de sesión vive en el servidor (cookie validada en cada pedido) y el resto del estado es local a cada pantalla, así que no hizo falta un contexto global.

## Modelo de datos

```
users/{uid}                          nombre, restricciones[], alergias[], alimentosEvitados[], porcionesHabituales,
                                     avatar, despensa[], creadoEn
users/{uid}/comensales/{id}          nombre, restricciones[], alergias[], creadoEn
users/{uid}/recetas/{id}             titulo, porQueSirve, porciones, tiempoMin, ingredientes[{nombre, cantidad, unidad, gramos, nombreEn, aComprar}],
                                     pasos[], reemplazos[], notas, imagen, origen ("themealdb" | "ia" | "importada"),
                                     comensalIds[], restriccionesAplicadas[], advertencias[], macrosPorPorcion, creadoEn, actualizadoEn
users/{uid}/usoIA/{AAAA-MM-DD}       pedidos (contador diario)
users/{uid}/secretos/groq            clave de Groq cifrada (iv, datos, etiqueta, ultimos4)
```

Un usuario tiene muchos comensales y muchas recetas; una receta referencia 0 o más comensales. Un usuario nunca puede leer ni modificar datos de otro: todo va bajo `users/{uid}/**` y se valida en el servidor y en las reglas de Firestore ([firestore.rules](firestore.rules)). Detalle de campos en el [PRD](docs/prd-v1.md#5-modelo-de-datos-firestore).

## Mapa de navegación

- **Públicas:** `/`, `/login`, `/registro`.
- **Privadas:** `/cocinar`, `/grupo` (cocinar para muchos), `/descubrir`, `/recetario`, `/recetario/[id]`, `/importar`, `/comensales`, `/perfil`, `/configuracion`.

Si no hay sesión, las rutas privadas redirigen a `/login`. La barra de navegación tiene Cocinar, Recetario, Descubrir y Perfil; Comensales, Configuración, Importar y Grupo se acceden desde el perfil, el recetario y "¿Qué cocino hoy?".

```mermaid
flowchart LR
    A[Landing /] --> B[Registro /registro]
    A --> C[Login /login]
    B --> P[Perfil /perfil]
    C --> D[Qué cocino hoy /cocinar]
    P --> D
    D --> R[Receta abierta]
    D --> G[Cocinar para muchos /grupo]
    R --> S[Guardar en recetario]
    S --> L[Recetario /recetario]
    L --> M[Detalle /recetario/id]
    L --> I[Importar /importar]
    I --> S
    X[Descubrir /descubrir] --> R
    P --> CO[Comensales /comensales]
    P --> CF[Configuración /configuracion]
```

## Opcionales implementados

1. **Búsqueda, filtros y ordenamiento** en el recetario (texto, origen, tiempo y restricción) y búsquedas populares en Descubrir.
2. **Accesibilidad cuidada:** foco visible, navegación con teclado, `lang="es"`, etiquetas y `aria-*` en formularios, `prefers-reduced-motion` respetado en todas las animaciones.
3. **SEO:** metadata específica por página, Open Graph y Twitter Card con imagen propia.

## Instalación

Requiere Node 24.

```bash
npm install
cp .env.example .env.local   # completar las variables
npm run dev                  # http://localhost:3000
```

Variables de entorno (documentadas en [.env.example](.env.example)): claves de Firebase (cliente y servidor), `GROQ_API_KEY`, `UNSPLASH_ACCESS_KEY`, `USDA_API_KEY`, `THEMEALDB_API_KEY` y `SECRETS_ENCRYPTION_KEY` (`openssl rand -base64 32`). Las claves de servicios externos solo se usan en el servidor.

Otros comandos: `npm run build`, `npm run start`, `npm run lint`. Pruebas sin red: `node scripts/probar-restricciones.mjs`, `node --conditions=react-server scripts/probar-ia.mjs` y `node --conditions=react-server scripts/probar-usda.mjs`.

## Usuario de prueba

- **Email:** prueba.tuppi@gmail.com
- **Contraseña:** prueba123

Es una cuenta creada solo para la corrección: el email no se usa para nada más y la contraseña no se usa en ningún otro servicio.

## Capturas

Capturas en pantalla de computadora, con el usuario de prueba.

**Landing**

![Landing](docs/capturas/landing.png)

**¿Qué cocino hoy?**: ingredientes, para quién se cocina y sugerencias con el sticker de la restricción aplicada.

![Qué cocino hoy](docs/capturas/cocinar.png)

**Receta abierta**: macros por porción, ingredientes separados en "Tenés", "Te falta" y "De la despensa", pasos, y ajustes rápidos con preguntas a Tuppi. En la segunda captura, el control del código avisa que la respuesta nombra un alimento que el usuario evita (batata).

![Receta abierta](docs/capturas/receta.png)
![Ajustes y preguntas](docs/capturas/receta-ajustes.png)

**Cocinar para muchos**: formulario del grupo, menú con lista de compras tildable y adaptaciones por restricción.

![Cocinar para muchos, formulario](docs/capturas/grupo-formulario.png)
![Cocinar para muchos, menú](docs/capturas/grupo-menu.png)
![Cocinar para muchos, adaptaciones](docs/capturas/grupo-adaptaciones.png)

**Recetario**: búsqueda, filtros y recetas guardadas.

![Recetario](docs/capturas/recetario.png)

**Comensales**: personas con las que se cocina y lo que no comen.

![Comensales](docs/capturas/comensales.png)

**Descubrir**: recetas del día y búsquedas populares, revisadas contra las restricciones.

![Descubrir](docs/capturas/descubrir.png)
![Descubrir, vegetariano](docs/capturas/descubrir-vegetariano.png)

**Importar receta**: se pega el texto de una receta (acá, en inglés) y Tuppi la deja en español, adaptada y con macros por porción.

![Importar receta, formulario](docs/capturas/importar.png)
![Importar receta, resultado](docs/capturas/importar-resultado.png)

**Perfil**: restricciones, alergias, porciones y avatar de comida.

![Perfil](docs/capturas/perfil.png)
![Elegir avatar](docs/capturas/perfil-avatares.png)

**Despensa y clave propia de Groq**: guía animada paso a paso para cargar la clave y buscar sin límite.

![Despensa y guía de la clave de Groq](docs/capturas/perfil-despensa-groq.png)

**Configuración**: cuenta, cerrar sesión y eliminación de cuenta con doble confirmación.

![Configuración](docs/capturas/configuracion.png)
![Eliminar cuenta](docs/capturas/configuracion-eliminar.png)

**Versión celular**

| Landing | Ingreso | Registro |
|---|---|---|
| ![Landing en celular](docs/capturas/movil-landing.png) | ![Ingreso en celular](docs/capturas/movil-login.png) | ![Registro en celular](docs/capturas/movil-registro.png) |

| Receta guardada | Ingredientes y pasos |
|---|---|
| ![Receta en celular](docs/capturas/movil-receta.png) | ![Ingredientes y pasos en celular](docs/capturas/movil-ingredientes.png) |

## Uso de IA

### Consentimiento

Declaro que usé herramientas de IA durante el desarrollo:

- **Claude Code** (Anthropic): para escribir y revisar código, armar la documentación (PRD, plan, brief de diseño y este README), escribir pruebas y revisar cambios contra las reglas del proyecto.
- **GitHub Copilot**: un poco, para hacer cambios mínimos de estructura y flujo de la app cuando se me acabaron los créditos de Claude.
- **IA de Figma**: como ayuda con el diseño de la app.
- **Gemini**: para generar las ilustraciones de la landing, los estados vacíos y las fotos de respaldo de las recetas.
- **Groq** (modelos de lenguaje abiertos): forma parte del producto. Traduce ingredientes, adapta y propone recetas, ajusta recetas, responde preguntas, importa recetas desde texto o capturas y arma menús para grupos.

Todo el código puede ser explicado por quien lo entrega.

### Reflexión

_Borrador para reescribir con tus palabras, con tu experiencia:_

La IA aceleró mucho el trabajo, pero casi nada salió bien a la primera. Hubo que corregir cosas concretas: el cálculo de macros tomaba el primer resultado de USDA, que a veces era un producto procesado (con eso, 120 g de carne daban 64 g de proteína), y hubo que elegir el alimento crudo y entero. La IA inventaba advertencias genéricas (como "no agregues salsa de soja" en una receta sin soja), así que las advertencias pasaron a salir solo del código. Un despliegue en Vercel falló por una incompatibilidad entre `firebase-admin` y la versión de `jose`, y la solución fue fijar la versión de una dependencia. Las listas de restricciones marcaban como prohibida una "harina de mijo (sin gluten)", un falso positivo que se corrigió con excepciones.

Aprendí que la IA es buena para proponer y para hacer el trabajo repetitivo, pero que lo importante (restricciones, seguridad, límites, validación de lo que llega del navegador) tiene que controlarlo el código y verificarse con pruebas y a mano. También aprendí a desconfiar de lo que la IA afirma haber hecho: hay que probarlo.
