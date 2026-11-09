import Link from "next/link";

// Landing provisoria: el diseño final llega con el brief de UI/UX (prompt 05).
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold">Tuppi</h1>
      <p className="text-zinc-600">
        Cociná para 1 o 2 con lo que tenés en casa, respetando las restricciones
        de cada comensal.
      </p>
      <div className="flex gap-4">
        <Link href="/registro" className="underline">
          Crear cuenta
        </Link>
        <Link href="/login" className="underline">
          Ingresar
        </Link>
      </div>
    </main>
  );
}
