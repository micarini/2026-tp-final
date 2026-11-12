// Título de pantalla en Fraunces + una bajada opcional. Uno por pantalla.
export default function Encabezado({ titulo, bajada }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="font-titulo text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.01em] lg:text-[2.5rem] lg:leading-[1.1]">
        {titulo}
      </h1>
      {bajada && <p className="text-tinta-2">{bajada}</p>}
    </header>
  );
}
