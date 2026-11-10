import { useNavigate } from "react-router";
import { useLogin } from "../hooks/useLogin";
import AuthForm from "./AuthForm";

function LoginPage() {
  const { error, isPending, mutate } = useLogin();

  const navigate = useNavigate();

  const handleLogin = async (nome: string, password: string) => {
    const result = await mutate({ nome, password });
    if (result) navigate("/");
  };

  return (
    <AuthForm
      title="Login"
      isPending={isPending}
      error={error}
      onSubmit={({ nome, senha }) => handleLogin(nome, senha)}
      footer={{
        text: "Não tem uma conta?",
        linkLabel: "Registe-se aquí",
        to: "/register",
      }}
    />
  );
}

export default LoginPage;
