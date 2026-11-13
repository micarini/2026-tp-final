// Foto de respaldo para las recetas que no tienen imagen.
// Elige una de las tres según el título, así la misma receta siempre muestra la misma.
export function fotoRespaldo(titulo = "") {
  let suma = 0;
  for (const letra of String(titulo)) suma += letra.charCodeAt(0);
  return `/receta-respaldo-${(suma % 3) + 1}.png`;
}
