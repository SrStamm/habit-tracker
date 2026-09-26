import { LoginDTO } from "@habits/shared/auth";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { login } = useAuth();

  const mutate = async (input: LoginDTO) => {
    if (isPending) return false;
    setIsPending(true);
    setError(null);
    try {
      await login(input);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { error, isPending, mutate };
}
