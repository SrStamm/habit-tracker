import { LoginDTO } from "@habits/shared/auth";
import { useAuth } from "../context/AuthContext";
import { useApiMutation } from "../../../lib/useApiMutation";

export function useRegister() {
  const { register } = useAuth();

  const { error, isPending, mutate } = useApiMutation(
    async (input: LoginDTO): Promise<boolean> => {
      await register(input);
      return true;
    },
  );

  return { error, isPending, mutate };
}
