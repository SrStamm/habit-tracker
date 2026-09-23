import { AuthResponseDTO, LoginDTO } from "@habits/shared/auth";
import { useState } from "react";
import { login } from "../api";

export function useLogin() {
  const [data, setData] = useState<AuthResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (input: LoginDTO) => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await login(input);
      setData(result);
      localStorage.setItem("token", result.token);
      return result;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { data, error, isPending, mutate };
}
