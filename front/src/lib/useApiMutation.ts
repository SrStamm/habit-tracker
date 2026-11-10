import { useCallback, useEffect, useRef, useState } from "react";

export function useApiMutation<TInput, TResult>(
  fn: (input: TInput) => Promise<TResult>,
) {
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const lock = useRef(false);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const mutate = useCallback(
    async (input: TInput): Promise<TResult | undefined> => {
      if (lock.current) return;

      lock.current = true;

      setIsPending(true);
      setError(null);

      try {
        const result = await fnRef.current(input);
        setData(result);
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsPending(false);
        lock.current = false;
      }
    },
    [],
  );

  return { data, setData, error, isPending, mutate };
}
