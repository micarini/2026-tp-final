# Investigación: usuario objetivo y benchmark

Material base para el README. Datos de los sitios consultados el 12/11/2026.

## Usuario objetivo

**Quién es.** Una persona de 20 a 40 años que vive sola o en pareja y cocina para 1 o 2. Trabaja o estudia, cocina entre semana con lo que le quedó en la heladera y no quiere comprar para 4.

**Qué le pasa.**
- Busca recetas en Instagram, TikTok o blogs, y casi todas rinden para 4 y piden ingredientes que no tiene.
- Cocina con alguien que tiene una restricción (celiaquía, veganismo, intolerancia a la lactosa, alergias) y cada receta hay que revisarla a mano.
- Lo que guarda queda desordenado: capturas, links, favoritos de redes que después no encuentra.

**Qué necesita.**
1. Decir qué tiene y para quién cocina, y recibir 2 o 3 opciones realistas.
2. Tener la seguridad de que el control de restricciones y alergias lo hace el código, no solo la IA.
3. Un lugar propio donde guardar, editar y volver a encontrar sus recetas.

**Escenario de uso.** Martes a la noche: tiene arroz, un zapallito y huevos, y cocina para ella y para su pareja celíaca. Abre Tuppi, elige a las dos personas, carga los tres ingredientes y recibe recetas ya revisadas contra "sin gluten". Guarda una en su recetario.

Nota: esta descripción sale del problema que plantea el PRD, no de entrevistas. Si hay tiempo antes del 19/11, conviene validarla hablando con 3 o 4 personas que encajen con este perfil.

## Benchmark

### 1. Supercook

- **Enlace:** https://www.supercook.com
- **Qué problema resuelve y para quién:** reducir el desperdicio de comida. Es para quien abre la heladera y no sabe qué cocinar con lo que tiene.
- **Funciones principales:** se marcan los ingredientes disponibles y muestra solo las recetas que se pueden hacer ya. Indica qué falta comprar. Tiene filtros de dieta (vegetariano, vegano, sin gluten, entre otros) y permite crear una cuenta para guardar ingredientes, restricciones y recetas favoritas.
- **Qué tomamos como referencia:** el flujo de partir de lo que hay en casa y no de una receta elegida de antemano.
- **Qué nos diferencia:**
  - Las restricciones se combinan entre varios comensales y se revisan ingrediente por ingrediente, incluidos los que esconden gluten, como la salsa de soja o los caldos.
  - Las recetas se adaptan a 1 o 2 porciones y se proponen en español.
  - Hay recetario propio con edición, y las propuestas de IA se guardan como recetas propias.

Fuentes consultadas: la página de Supercook y reseñas de terceros. Las cifras de recetas y la profundidad de los filtros varían de una fuente a otra, así que no las usamos.

### 2. Paprika Recipe Manager

- **Enlace:** https://www.paprikaapp.com
- **Qué problema resuelve y para quién:** ordenar recetas dispersas. Es para cocineros caseros que juntan recetas de la web y quieren tenerlas organizadas.
- **Funciones principales:** guarda recetas desde sitios web, las organiza con categorías y búsqueda, tiene un modo de cocina paso a paso, genera listas de compras y planifica comidas. En la versión paga suma importar desde redes sociales o fotos, calcular nutrición con datos de USDA y una despensa con vencimientos. La descarga es gratis y tiene un plan Premium por suscripción.
- **Qué tomamos como referencia:** la idea del recetario personal con búsqueda y filtros, y el detalle de receta con pasos claros.
- **Qué nos diferencia:**
  - Paprika organiza lo que el usuario ya encontró. Tuppi además propone qué cocinar con lo que hay en casa.
  - No pensamos en restricciones por comensal.
  - Tuppi es una web, sin suscripción.

### Descartado: Mealime

Mealime planifica una semana de comidas con preferencias, alergias y porciones, y arma la lista de compras. Su propio sitio anuncia que cierra el 21/10/2026, por eso no lo usamos como referencia.

## Qué hace único a Tuppi

La combinación: partir de lo que hay en casa (como Supercook), con recetario propio (como Paprika), pero con restricciones de varias personas controladas por código y una IA que adapta las porciones.
