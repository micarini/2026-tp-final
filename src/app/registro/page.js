import AuthForm from "@/components/auth-form";
import AuthMarco from "@/components/auth-marco";

export const metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta de Tuppi y guardá tus recetas.",
};

export default function RegistroPage() {
  return (
    <AuthMarco titulo="Creá tu cuenta" bajada="Para guardar tus recetas y lo que no comés.">
      <AuthForm modo="registro" />
    </AuthMarco>
  );
}
