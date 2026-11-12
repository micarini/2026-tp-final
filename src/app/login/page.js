import AuthForm from "@/components/auth-form";
import AuthMarco from "@/components/auth-marco";

export const metadata = {
  title: "Ingresar",
  description: "Ingresá a Tuppi para ver tu recetario.",
};

export default function LoginPage() {
  return (
    <AuthMarco titulo="Ingresá a Tuppi" bajada="Tu recetario te está esperando.">
      <AuthForm modo="login" />
    </AuthMarco>
  );
}
