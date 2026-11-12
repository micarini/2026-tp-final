// Sello redondo que se "estampa" (animate-sello): marca lo que la receta respeta, por ejemplo "sin gluten".
export default function Sello({ children, className = "" }) {
  return (
    <span
      className={
        "inline-flex size-20 items-center justify-center rounded-full border-2 border-dashed border-hoja-900 " +
        "bg-papel p-2 text-center font-titulo text-sm leading-tight font-semibold text-hoja-900 animate-sello " +
        className
      }
    >
      {children}
    </span>
  );
}
