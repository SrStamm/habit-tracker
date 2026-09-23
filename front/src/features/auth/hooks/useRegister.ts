import { useState } from "react";
import { register } from "../api";
import { LoginDTO } from "@habits/shared/auth";
import { UserResponseDTO } from "@habits/shared/user";

export function useRegister() {
  const [data, setData] = useState<UserResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = async (input: LoginDTO) => {
    if (isPending) return;

    setData(null);
    setIsPending(true);
    setError(null);

    try {
      const result = await register(input);
      setData(result);
      return result;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return { data, error, isPending, mutate };
}
