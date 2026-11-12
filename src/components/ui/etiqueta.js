// La firma de Tuppi: la etiqueta de fruta. Se usa para ingredientes.
// Cada una entra "pegándose" (animate-pegar) con un giro chiquito propio, como un sticker de verdad.
const COLORES = {
  tomate: "bg-tomate-ilus",
  morron: "bg-morron",
  rabanito: "bg-rabanito",
  zanahoria: "bg-zanahoria",
  lechuga: "bg-lechuga",
};

export const COLORES_ETIQUETA = Object.keys(COLORES);

// Giro entre -4° y 4° que sale del texto: la misma etiqueta siempre queda igual de torcida.
function giroPara(texto) {
  let suma = 0;
  for (const letra of texto) suma += letra.charCodeAt(0);
  return (suma % 9) - 4;
}

export default function Etiqueta({ children, color = "lechuga", onQuitar, falta = false }) {
  const texto = String(children);
  const estilo = { "--giro": `${giroPara(texto)}deg` };

  const clases =
    "inline-flex min-h-11 items-center gap-1 rounded-full px-4 text-sm font-medium text-tinta animate-pegar " +
    (falta ? "border-2 border-dashed border-tomate bg-blanco" : COLORES[color]);

  if (!onQuitar) {
    return (
      <span className={clases} style={estilo}>
        {texto}
        {falta && <span className="text-tomate">· comprar</span>}
      </span>
    );
  }

  // Toda la etiqueta es el botón (área táctil grande), no solo la ×.
  return (
    <button
      type="button"
      onClick={onQuitar}
      className={`${clases} transition-transform duration-150 hover:scale-105`}
      style={estilo}
      aria-label={`Quitar ${texto}`}
    >
      {texto}
      <span aria-hidden="true" className="text-lg leading-none">
        ×
      </span>
    </button>
  );
}
