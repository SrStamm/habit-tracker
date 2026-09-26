import { useState } from "react";
import { LoginDTO } from "@habits/shared/auth";
import { useAuth } from "../context/AuthContext";

export function useRegister() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { register } = useAuth();

  const mutate = async (input: LoginDTO) => {
    if (isPending) return false;
    setIsPending(true);
    setError(null);
    try {
      await register(input);
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
