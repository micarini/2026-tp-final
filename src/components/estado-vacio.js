// Estado vacío: una nota de papel sobre el mantel de cuadrillé.
// Al pasar el mouse la nota se balancea apenas (brief, sección 7).
export default function EstadoVacio({ titulo, texto, children }) {
  return (
    <section className="mantel flex justify-center rounded-tarjeta px-4 py-12 sm:py-16">
      <div className="flex max-w-sm -rotate-2 flex-col items-center gap-4 rounded-tarjeta bg-papel px-6 py-8 text-center shadow-tarjeta transition-transform duration-400 ease-resorte hover:rotate-1 animate-subir">
        <h2 className="font-titulo text-xl font-semibold">{titulo}</h2>
        <p className="text-tinta-2">{texto}</p>
        {children}
      </div>
    </section>
  );
}
