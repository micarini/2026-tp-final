# PRD — Tuppi v1

> Recetario personal con asistente de IA para gente que cocina para 1 o 2, con lo que tiene en casa y respetando las restricciones de cada comensal.

**Stack:** Next.js (App Router, JavaScript) + Tailwind CSS v4 · Firebase Authentication · Cloud Firestore (plan Spark) · Vercel.
**Servicios externos:** Groq (IA), TheMealDB (recetas con foto), USDA FoodData Central (nutrición), Unsplash (fotos de respaldo).
**Entrega:** jueves 19/11/2026, presentación y demo presencial. Desarrollo del 06/11 al 18/11 (13 días).

## 1. Problema

Las personas que viven solas cocinan en porciones chicas, con lo que quedó en la heladera, y muchas veces con restricciones propias o de alguien con quien cocinan (celiaquía, veganismo, alergias). Buscar en Instagram o TikTok da recetas para 4, con ingredientes que no tienen y sin saber si son aptas: cada receta hay que revisarla a mano, y lo guardado queda desordenado.

## 2. Métricas de éxito (v1)

- Una persona nueva se registra, carga su perfil y guarda su primera receta en **menos de 3 minutos**.
- **0 recetas** con un ingrediente prohibido para algún comensal pasan el control del código sin marcarse.
- Las sugerencias aparecen en **menos de 10 s** en el deploy.
- El flujo principal funciona completo en Vercel con el usuario de prueba.
- Lighthouse: accesibilidad ≥ 90 en las pantallas principales.

## 3. Historias de usuario

**H1 — Registro e inicio de sesión.** Como persona nueva quiero crear una cuenta para guardar mis recetas.
- Email y contraseña: mínimo 8 caracteres, con al menos una letra y un número, validado en el formulario antes de enviar.
- Las contraseñas las gestiona solo Firebase Auth; nunca se guardan en Firestore.
- Login con Google como segundo método.
- Las rutas privadas redirigen a `/login` si no hay sesión.

**H2 — Perfil.** Quiero indicar mis restricciones para no tener que repetirlas.
- Se pueden elegir restricciones de un catálogo (sin gluten, vegano, vegetariano, sin lactosa) y alergias de una lista cerrada (maní, frutos secos, huevo, pescado, mariscos, soja), o ninguna. No hay texto libre: cada opción del catálogo tiene su lista de ingredientes prohibidos en el código, para que el control sea confiable.
- Se puede definir la cantidad de porciones habitual (1 por defecto).

**H3 — Comensales.** Quiero guardar a las personas con las que cocino seguido, con sus restricciones.
- ABM de comensales: nombre + restricciones + alergias.
- Borrar un comensal no borra las recetas guardadas con él.

**H4 — ¿Qué cocino hoy?** Quiero decir qué tengo y para quién cocino, y recibir recetas.
- Elijo para quién cocino: "solo yo" o yo + uno o más comensales. Las restricciones se combinan (unión).
- Ingreso de 1 a 10 ingredientes; puedo indicar ingredientes que no consigo.
- Recibo 2 o 3 recetas con: nombre, por qué sirve, ingredientes (marcando cuáles tengo y cuáles hay que comprar), pasos, tiempo, porciones, reemplazos y foto.
- Origen: se buscan coincidencias en TheMealDB (una consulta por ingrediente, intersección en el código) y Groq las traduce y adapta. Si no hay coincidencias, Groq propone una receta propia con foto de Unsplash (con crédito del fotógrafo).
- Máximo 20 pedidos a la IA por usuario por día (límite propio, aparte de los límites del plan gratis de Groq, que son para toda la app).
- El código revisa cada receta contra las restricciones combinadas: si un ingrediente está prohibido, la receta se descarta o se muestra con una advertencia visible. Los productos que suelen tener gluten escondido (salsa de soja, caldos, rebozadores) se marcan con "buscá una que diga sin gluten".

**H5 — Recetario.** Quiero guardar las recetas que me gustan y encontrarlas después.
- ABM completo: guardar desde sugerencias, editar (título, notas, ingredientes, pasos), borrar con confirmación, listar.
- Búsqueda por texto y filtros por restricción, tiempo y origen.
- Detalle en `/recetario/[id]`.

**H6 — Macros.** Quiero saber aproximadamente qué aporta cada porción.
- Groq normaliza los ingredientes a gramos y nombres en inglés; el código consulta USDA, suma y divide por porciones.
- Se muestran calorías, proteínas, carbohidratos y grasas por porción, con la etiqueta "aproximado".
- Si falta el dato de algún ingrediente, se aclara "valores parciales".

**H7 — Importar una receta.** Vi una receta en TikTok, Instagram o un blog y quiero guardarla adaptada.
- Pego el texto de la receta (por ejemplo, la descripción del reel) y, opcionalmente, subo de 1 a 3 capturas de pantalla (JPG o PNG, máximo 4 MB cada una).
- Groq arma la receta con el mismo formato que H4, la adapta a las restricciones elegidas y calcula los macros como en H6.
- Reviso el resultado y lo guardo en el recetario con `origen: "importada"`.
- Las capturas se mandan a la IA y se descartan; no se guardan.
- No se leen links de Instagram ni TikTok automáticamente: esas plataformas no lo permiten.

**H8 — Mis macros de la semana** *(si sobra tiempo)*. Quiero ver qué aporté en la semana.
- Marco una receta del recetario como "cocinada" con fecha.
- Un gráfico simple muestra calorías y proteínas por día de los últimos 7 días.

## 4. Alcance

**Entra en v1, en orden de prioridad:**
1. H1 a H5: login, perfil, comensales, "¿Qué cocino hoy?" y recetario.
2. H6: macros por porción.
3. H7: importar receta.
4. H8: dashboard de macros, solo si sobra tiempo.

Más: landing pública, diseño responsive, estados de carga, error y vacío, metadata por página, deploy con datos y usuario de prueba.

**Opcionales de la consigna cubiertos:** búsqueda y filtros (H5), accesibilidad cuidada o dark mode, y dashboard con gráficos si llega H8.

**Queda fuera de v1 (hoja de ruta):** plan de meal prep semanal, precios reales, compartir recetas con link público, app móvil.

## 5. Modelo de datos (Firestore)

```
users/{uid}
  nombre, restricciones[], alergias[], porcionesHabituales, creadoEn

users/{uid}/comensales/{comensalId}
  nombre, restricciones[], alergias[], creadoEn

users/{uid}/recetas/{recetaId}
  titulo, porQueSirve, porciones, tiempoMin
  ingredientes[{ nombre, cantidad, unidad, gramos, nombreEn, aComprar }]
  pasos[], reemplazos[], notas
  imagen { url, fuente, credito }
  origen: "themealdb" | "ia" | "importada"
  cocinadaEn[]             // fechas, para H8
  themealdbId?             // referencia, si vino de TheMealDB
  comensalIds[]            // para quién se pensó
  restriccionesAplicadas[]
  advertencias[]
  macrosPorPorcion { kcal, proteinas, carbohidratos, grasas, parcial }
  creadoEn, actualizadoEn

users/{uid}/usoIA/{AAAA-MM-DD}
  pedidos                  // máximo 20 por día
```

- **Relaciones:** un usuario tiene muchos comensales y muchas recetas; una receta referencia 0..n comensales.
- **Seguridad:** las reglas de Firestore permiten leer y escribir en `users/{uid}/**` solo si `request.auth.uid == uid`. Las escrituras pasan por Server Actions que vuelven a validar la sesión.
- **Claves de API** (Groq, USDA, Unsplash) solo en variables de entorno del servidor; nunca con prefijo `NEXT_PUBLIC_`.

## 6. Casos borde y estados de error

| Caso | Comportamiento |
|---|---|
| Sin ingredientes o más de 10 | Validación en el formulario; no se envía |
| Ingrediente desconocido o mal escrito | Groq lo normaliza; si no puede, se avisa "no reconocimos X" |
| TheMealDB sin coincidencias | Se usa la receta propuesta por Groq |
| TheMealDB, Groq o USDA no responden | Estado de error con "Reintentar"; lo ya cargado no se pierde |
| Groq devuelve un formato inválido | Un reintento automático; si vuelve a fallar, error amable |
| Límite de Groq (429) o límite diario propio | Mensaje "probá en un minuto" o "llegaste al límite de hoy" |
| Restricciones que dejan muy pocas opciones | La IA lo explica y propone lo más cercano |
| Receta con un ingrediente prohibido | Descartada o marcada por el control del código |
| Recetario vacío | Estado vacío con llamado a "¿Qué cocino hoy?" |
| Receta inexistente o de otro usuario en `/recetario/[id]` | `not-found` |
| Sesión vencida durante una acción | Redirige a `/login` y vuelve a la pantalla |
| Captura muy pesada, formato inválido o sin texto legible (H7) | Validación antes de enviar; si la IA no encuentra una receta, se pide pegar el texto |

## 7. Decisiones tomadas

- Firestore en plan Spark, sin Storage.
- Login: email/contraseña + Google.
- Alergias y restricciones solo de una lista cerrada.
- Fotos de respaldo: Unsplash, por calidad y estética.
- Límite propio de 20 pedidos a la IA por usuario por día.
- Importar recetas (H7) entra en v1; el dashboard de macros (H8), si sobra tiempo.

## 8. Preguntas abiertas

1. **Capturas en H7:** hay que confirmar qué modelo de Groq con visión está disponible en el plan gratis. Si ninguno sirve, H7 queda solo con texto pegado.
2. **Opcional "upload de imágenes":** como las capturas no se guardan, puede que no cuente. ¿Guardamos una copia en Vercel Blob (plan gratis) para que cuente, o alcanza con búsqueda/filtros + accesibilidad + dashboard?
3. **Unsplash:** su modo de prueba tiene un límite de pedidos por hora. Guardando la URL de la foto en cada receta debería alcanzar; hay que confirmarlo al registrarse.
