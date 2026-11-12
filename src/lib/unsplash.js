import "server-only";

const API_URL = "https://api.unsplash.com/search/photos";

export async function buscarFoto(consulta) {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    throw new Error("Falta configurar UNSPLASH_ACCESS_KEY en las variables del servidor.");
  }
  const termino = String(consulta ?? "").trim();
  if (!termino) throw new Error("Falta una consulta para buscar la foto.");

  const respuesta = await fetch(`${API_URL}?query=${encodeURIComponent(termino)}&per_page=1`, {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!respuesta.ok) throw new Error(`Unsplash respondió con ${respuesta.status}.`);

  const datos = await respuesta.json();
  const foto = datos.results?.[0];
  if (!foto) return null;

  return {
    url: foto.urls?.regular ?? foto.urls?.small ?? null,
    credito: foto.user?.name ?? "Fotógrafo de Unsplash",
    link: foto.user?.links?.html ?? foto.links?.html ?? "https://unsplash.com",
  };
}
