import { useRegister } from "../hooks/useRegister";
import AuthForm from "./AuthForm";

function RegisterPage() {
  const { error, isPending, mutate } = useRegister();

  const handleRegister = async (nome: string, password: string) => {
    await mutate({ nome, password });
  };

  return (
    <AuthForm
      title="Registo"
      isPending={isPending}
      error={error}
      onSubmit={({ nome, senha }) => handleRegister(nome, senha)}
      footer={{
        text: "Já tem uma conta?",
        linkLabel: "Logue-se aquí",
        to: "/login",
      }}
    />
  );
}

export default RegisterPage;
