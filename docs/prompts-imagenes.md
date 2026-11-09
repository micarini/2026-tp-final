# Prompts de imágenes para Gemini — Tuppi

Ilustraciones de papel recortado para reemplazar las provisorias del Figma. Las fotos de las recetas no se generan: vienen de TheMealDB o Unsplash. Esto es solo para la marca y los estados.

## Cómo usarlos

1. Generá **primero la portada mobile (1)**. Cuando te guste, usala como **imagen de referencia** en todos los demás pedidos: adjuntala y agregá *"Match the exact style, palette and paper texture of the attached image."* Así todas las ilustraciones quedan de la misma familia.
2. Los prompts están en inglés porque los modelos de imagen responden mejor así. Debajo de cada uno va qué es y dónde se usa.
3. Si sale texto o letras dentro de la imagen, regenerala: nunca tiene que haber texto (los textos van en la interfaz).
4. Exportá en PNG, pasalas a WebP de menos de 300 KB (por ejemplo con squoosh.app) y guardalas en `public/ilustraciones/` con el nombre indicado.
5. En el README, en la sección de consentimiento de IA, aclará que las ilustraciones se generaron con Gemini.

## Bloque de estilo (va al final de cada prompt)

```
Style: flat cut-paper collage illustration, like Matisse gouache cut-outs. Bold organic shapes with slightly irregular hand-cut edges, no outlines, no gradients, no 3D, no shading except a very subtle paper grain texture. Limited palette only: deep leaf green #123828 (background), dark green #1F5A3F, lettuce green #8DC26F, tomato red #E0452B, pepper yellow #F2B731, radish pink #E46AA0, carrot orange #F07C2A. Big shapes that bleed off the edges of the frame. Playful, generous, neighborhood greengrocer feeling. No text, no letters, no numbers, no logos, no people, no hands, no faces.
```

## 1. Portada mobile — `portada-mobile.webp` (3:4, vertical)

```
A vertical composition of oversized vegetables cut from colored paper, filling the frame and bleeding off every edge: a huge ripe tomato with a star-shaped green calyx on the right, a big yellow bell pepper with a curved stem on the upper left, a round pink radish with two leaves at the bottom, and large lettuce leaves in the corners. Leave a calmer area of plain deep green in the top-left corner (for the logo) and keep the lower 20% simpler (it sits above the headline). [BLOQUE DE ESTILO]
```

Se usa en: landing mobile, arriba (375 × 470 en el diseño). Pedila al doble o más (1200 × 1600).

## 2. Portada desktop — `portada-desktop.webp` (4:5, vertical)

```
Same scene and style as the attached image, recomposed for a tall right-hand panel: the giant tomato low on the right, cut by the frame edge; the yellow pepper upper-left; the pink radish at the bottom center; lettuce leaves entering from the top-right corner. Leave an empty deep green area in the middle-left where small UI stickers will be placed on top. [BLOQUE DE ESTILO]
```

Se usa en: la mitad derecha de la landing desktop (760 × 900).

## 3. Respaldo de receta sin foto — `receta-respaldo-1.webp`, `-2`, `-3` (16:9)

Cuando una receta generada por la IA no tiene foto y Unsplash no devuelve una buena, se usa una de estas.

```
1) A horizontal paper-cut still life seen from above: leafy greens, a halved tomato, mushrooms and a few cherry tomatoes scattered on a deep green background, shapes cropped by the frame edges. [BLOQUE DE ESTILO]

2) A horizontal paper-cut still life seen from above: a bowl shape with grains, a lemon half, a sprig of herbs and a carrot, on a deep green background, cropped by the frame edges. [BLOQUE DE ESTILO]

3) A horizontal paper-cut still life seen from above: a bell pepper, an onion cut in half, garlic cloves and a radish, on a deep green background, cropped by the frame edges. [BLOQUE DE ESTILO]
```

Se usan en: la tarjeta de receta (343 × 180 en mobile).

## 4. Recetario vacío — `vacio-recetario.webp` (1:1)

```
A single empty wooden produce crate made of cut paper, seen slightly from the front, with one small green leaf left inside, centered on a plain off-white background #F5F7F3. Calm and a bit funny, lots of empty space around it. [BLOQUE DE ESTILO, but background off-white #F5F7F3 instead of deep green]
```

Se usa en: el estado vacío del recetario, sobre el mantel de cuadrillé.

## 5. Sin comensales — `vacio-comensales.webp` (1:1)

```
Two empty round plates and two forks cut from paper, side by side on a small table shape, with one plate holding a single cherry tomato, centered on a plain off-white background #F5F7F3. [BLOQUE DE ESTILO, but background off-white #F5F7F3 instead of deep green]
```

Se usa en: `/comensales` cuando todavía no cargaste a nadie.

## 6. Sin resultados — `sin-resultados.webp` (1:1)

```
A lonely paper-cut onion sitting in the middle of a big empty space, slightly tilted as if shrugging, with a single small leaf next to it, plain off-white background #F5F7F3. [BLOQUE DE ESTILO, but background off-white #F5F7F3 instead of deep green]
```

Se usa en: cuando ninguna receta pasa el control de restricciones.

## 7. Error — `error.webp` (1:1)

```
A paper-cut tomato that has rolled off the edge of a green table shape, caught mid-fall, with a tiny motion arc behind it, plain off-white background #F5F7F3. Playful, not dramatic. [BLOQUE DE ESTILO, but background off-white #F5F7F3 instead of deep green]
```

Se usa en: `error.js` (página de error) con el botón "Reintentar".

## 8. Imagen para compartir — `og.webp` (1200 × 630, horizontal)

```
A wide horizontal banner version of the attached scene: oversized paper-cut tomato, yellow pepper, pink radish and lettuce leaves bleeding off the right half of the frame, with the left half kept as plain deep green #123828 for a title to be added later. [BLOQUE DE ESTILO]
```

Se usa en: la `metadata` de Next (`openGraph.images`), para cuando alguien comparte el link de Tuppi. El título se agrega después, no en la imagen.

## Lo que no hace falta generar

- **Etiquetas, sellos, íconos y mantel de cuadrillé:** son componentes de la interfaz (CSS o SVG), no imágenes.
- **Las tres verduritas que saltan al cargar:** las dibujo en SVG en el código para poder animarlas.
- **El logo:** lo armamos con la tipografía que elijas.
