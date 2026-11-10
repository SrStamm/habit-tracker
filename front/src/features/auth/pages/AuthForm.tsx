import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Link } from "react-router";

type Props = {
  title: string;
  error: string | null;
  isPending: boolean;
  onSubmit: (values: { nome: string; senha: string }) => void;
  footer?: { text: string; linkLabel: string; to: string };
};

function AuthForm({ title, error, isPending, onSubmit, footer }: Props) {
  const [nome, setNome] = useState<string>("");
  const [senha, setSenha] = useState<string>("");

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-text mb-6 text-center">
          {title}
        </h1>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ nome, senha });
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
            autoComplete="off"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <Label htmlFor="senha">Senha:</Label>
          <Input
            id="senha"
            type="password"
            autoComplete="off"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <Button disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar"}
          </Button>

          {footer ? (
            <p className="font-medium text-text text-center">
              {footer.text}{" "}
              <Link to={footer.to} className="text-primary hover:underline">
                {footer.linkLabel}
              </Link>
            </p>
          ) : (
            ""
          )}
        </form>
      </div>
    </main>
  );
}

export default AuthForm;
