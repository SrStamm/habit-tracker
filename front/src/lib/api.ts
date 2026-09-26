import { clearToken, getToken } from "./authToken";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export const api = async <T>(
  path: string,
  { method = "GET", body }: ApiOptions = {},
): Promise<T> => {
  const headers: Record<string, string> = {};

  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    if (res.status === 401) clearToken();

    const error = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(error.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
};
