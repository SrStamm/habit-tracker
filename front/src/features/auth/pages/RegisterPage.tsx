import { Link } from "react-router";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Button } from "../../../components/ui/Button";
import { useRegister } from "../hooks/useRegister";
import { useState } from "react";

function RegisterPage() {
  const [nome, setNome] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const { error, isPending, mutate } = useRegister();

  const handleRegister = async () => {
    await mutate({ nome, password: senha });
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-text mb-6 text-center">
          Registo
        </h1>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <Label htmlFor="nome">Nome:</Label>
          <Input
            id="nome"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <Label htmlFor="senha">Senha:</Label>
          <Input
            id="senha"
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <Button disabled={isPending}>
            {isPending ? "Enviando" : "Enviar"}
          </Button>

          <p className="font-medium text-text text-center">
            Já tem uma conta?{" "}
            <Link to={"/login"} className="text-primary hover:underline">
              Logue-se aquí
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default RegisterPage;
