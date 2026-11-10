import { LoginDTO } from "@habits/shared/auth";
import { useAuth } from "../context/AuthContext";
import { useApiMutation } from "../../../lib/useApiMutation";

export function useLogin() {
  const { login } = useAuth();

  const { error, isPending, mutate } = useApiMutation(
    async (input: LoginDTO): Promise<boolean> => {
      await login(input);
      return true;
    },
  );

  return { error, isPending, mutate };
}
