const TOKEN_KEY = "token";

const listeners = new Set<() => void>();
export const subscribeAuth = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const emit = () => listeners.forEach((fn) => fn());

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (t: string) => {
  localStorage.setItem(TOKEN_KEY, t);
  emit();
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  emit();
};
