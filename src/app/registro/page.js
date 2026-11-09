import AuthForm from "@/components/auth-form";

export const metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta de Tuppi y guardá tus recetas.",
};

export default function RegistroPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <AuthForm modo="registro" />
    </main>
  );
}
