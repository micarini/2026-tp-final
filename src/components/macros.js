// Macros por porción, en grande y con una barra que muestra de dónde vienen las calorías.
// Proteínas y carbohidratos aportan 4 kcal por gramo; las grasas, 9.
const FILAS = [
  { clave: "proteinas", nombre: "Proteínas", kcalPorGramo: 4, color: "bg-lechuga" },
  { clave: "carbohidratos", nombre: "Carbohidratos", kcalPorGramo: 4, color: "bg-morron" },
  { clave: "grasas", nombre: "Grasas", kcalPorGramo: 9, color: "bg-rabanito" },
];

export default function Macros({ macros }) {
  if (!macros) return null;

  const partes = FILAS.map((fila) => ({ ...fila, gramos: macros[fila.clave], kcal: macros[fila.clave] * fila.kcalPorGramo }));
  const total = partes.reduce((suma, parte) => suma + parte.kcal, 0) || 1;

  return (
    <section aria-label="Macros por porción" className="flex flex-col gap-4 rounded-campo border border-borde p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-titulo text-xl font-semibold">Por porción</h3>
        <span className="text-xs text-tinta-2">{macros.parcial ? "aproximado · valores parciales" : "aproximado"}</span>
      </div>

      <p className="font-titulo text-4xl font-semibold">
        {macros.kcal} <span className="font-sans text-base font-medium text-tinta-2">kcal</span>
      </p>

      {/* Una sola barra dividida en tres: el ancho de cada tramo es su parte de las calorías */}
      <div className="flex h-4 overflow-hidden rounded-full bg-hoja-100" role="img" aria-label="De dónde vienen las calorías">
        {partes.map((parte) => (
          <span
            key={parte.clave}
            className={`crecer ${parte.color} border-r-2 border-blanco last:border-r-0`}
            style={{ width: `${(parte.kcal / total) * 100}%` }}
          />
        ))}
      </div>

      <ul className="grid grid-cols-3 gap-2 text-sm">
        {partes.map((parte) => (
          <li key={parte.clave} className="flex flex-col">
            <span className="flex items-center gap-1.5 text-tinta-2">
              <span className={`size-2.5 rounded-full ${parte.color}`} />
              {parte.nombre}
            </span>
            <span className="font-semibold">{parte.gramos} g</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
