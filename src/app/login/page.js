import AuthForm from "@/components/auth-form";

export const metadata = {
  title: "Ingresar",
  description: "Ingresá a Tuppi para ver tu recetario.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Ingresar</h1>
      <AuthForm modo="login" />
    </main>
  );
}
