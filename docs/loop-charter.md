# Loop Charter de Tuppi

Plantilla para tareas repetitivas con un resultado que se puede medir. Se copia en Claude Code completando los corchetes, o se usa la condición de "Cuándo terminar" con `/goal`.

**Usalo para:** chequeos que se repiten en muchos archivos o pantallas (estados de carga y error, metadata, accesibilidad, casos de prueba del catálogo).
**No lo uses para:** escribir features nuevas. Esas van con plan, aprobación y pasos chicos, para que puedas explicar cada línea en la defensa.

---

```text
OBJETIVO
[Estado final concreto y medible. Ej.: cada ruta de src/app con datos tiene
loading.js, error.js y metadata.]

DÓNDE ESTÁ EL TRABAJO
[Ej.: listá las carpetas de src/app; cada ruta que lea Firestore o cookies es un ítem.]

CÓMO HACERLO
- De a un ítem por vez, siguiendo CLAUDE.md y el código que ya existe.
- No agregues dependencias, no toques auth, reglas de Firestore, el modelo
  de datos ni versiones de Next o Tailwind. Si un ítem lo necesita, anotalo
  en "Necesita a Mia" en LOOP-STATE.md y pasá al siguiente.
- No hagas commits ni push.

CÓMO VERIFICAR
- [Ej.: npm run build sin errores ni avisos de blocking-route; el archivo existe.]
- Imprimí la evidencia (salida del comando, archivo:línea).
- Al terminar cada ítem, pedile al subagente "revisor" que lo revise y
  corregí los hallazgos de gravedad Alta y Media.
- Máximo 3 intentos por ítem. Si no pasa, marcalo "bloqueado" con el motivo.

CÓMO RECORDAR
- Leé LOOP-STATE.md al empezar cada corrida.
- Después de cada ítem, actualizalo: ítem, estado (hecho / bloqueado /
  necesita a Mia), qué cambió y una nota para la próxima corrida.

CUÁNDO TERMINAR
[Ej.: todos los ítems hechos o bloqueados, o 5 ítems en esta corrida.]
Al terminar, un reporte corto: hechos, bloqueados, qué necesita mi decisión.
```

---

## Loops listos para Tuppi

**Estados y metadata de cada ruta** (cuando haya varias rutas con datos):

```text
/goal Cada page.js de src/app que lea Firestore, cookies o searchParams tiene
loading.js (o un <Suspense> con fallback), error.js y export const metadata;
npm run build termina sin errores ni avisos de blocking-route. Imprimí la
lista de rutas con lo que tiene cada una y la salida del build. Registrá el
avance en LOOP-STATE.md y hacé revisar cada ruta al subagente revisor.
```

**Catálogo de restricciones** (cuando exista `src/lib/restricciones.js`):

```text
/goal Cada una de las 10 opciones del catálogo (sin gluten, vegano, vegetariano,
sin lactosa, maní, frutos secos, huevo, pescado, mariscos, soja) tiene su lista
de ingredientes prohibidos y al menos un caso que demuestre que una receta con
uno de esos ingredientes queda marcada. Imprimí cada opción con su caso y el
resultado del control. Registrá el avance en LOOP-STATE.md.
```

**Accesibilidad** (cuando estén las pantallas principales):

```text
/goal Lighthouse da accesibilidad >= 90 en /, /login, /registro, /cocinar y
/recetario, medido sobre npm run build + npm run start. Imprimí el puntaje de
cada pantalla y cada problema corregido. Máximo 3 intentos por pantalla.
Registrá el avance en LOOP-STATE.md.
```

**Sitio en línea** (solo la semana de la entrega, con el deploy hecho):

```text
/loop 30m Revisá que [URL de Vercel] y /login respondan 200 y que el título
diga Tuppi. Si algo falla, avisame con el código de estado.
```
