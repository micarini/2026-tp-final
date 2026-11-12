// Campo de texto con su etiqueta y una sola línea de mensaje debajo.
// La línea cambia de estado en el lugar: "neutro" (ayuda), "error" (lo que falta) u "ok".
// El id sale del name, así el <label> y el mensaje quedan conectados para los lectores de pantalla.
const COLOR_MENSAJE = {
  neutro: "text-tinta-2",
  error: "text-tomate",
  ok: "text-hoja-700",
};

const BORDE = {
  neutro: "border-borde focus:border-hoja-700",
  error: "border-tomate",
  ok: "border-hoja-700",
};

export default function Campo({
  label,
  name,
  mensaje,
  estado = "neutro",
  className = "",
  children,
  ...props
}) {
  const id = `campo-${name}`;
  const idMensaje = `${id}-mensaje`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-tinta">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={estado === "error" ? true : undefined}
        aria-describedby={mensaje ? idMensaje : undefined}
        className={
          "min-h-12 w-full rounded-campo border bg-blanco px-4 text-base text-tinta " +
          "placeholder:text-tinta-3 transition-colors duration-150 " +
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-hoja-700/30 disabled:opacity-60 " +
          BORDE[estado]
        }
        {...props}
      />
      {/* aria-live: el lector de pantalla lee el mensaje nuevo cada vez que cambia */}
      <p id={idMensaje} aria-live="polite" className={`min-h-5 text-sm ${COLOR_MENSAJE[estado]}`}>
        {mensaje}
        {children}
      </p>
    </div>
  );
}
