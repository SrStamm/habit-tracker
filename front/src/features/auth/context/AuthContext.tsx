import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  clearToken,
  getToken,
  subscribeAuth,
  setToken as persistToken,
} from "../../../lib/authToken";
import { LoginDTO } from "@habits/shared/auth";
import { login as loginRequest, register as registerRequest } from "../api";

type ContextValue = {
  isAuthenticated: boolean;
  login: (input: LoginDTO) => Promise<void>;
  register: (input: LoginDTO) => Promise<void>;
  logout: () => void;
};

// Cria o Context
const AuthContext = createContext<ContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getToken);

  // Cada vez que é criado o componente ou é modificado o token, obtem o novo token
  useEffect(() => subscribeAuth(() => setToken(getToken())), []);

  const isAuthenticated = token !== null;

  const login = async (input: LoginDTO) => {
    const result = await loginRequest(input);
    persistToken(result.token);
  };

  const register = async (input: LoginDTO) => {
    const result = await registerRequest(input);
    persistToken(result.token);
  };

  const logout = () => clearToken();

  return (
    <AuthContext value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  // Se não se monta o provider, lança um erro
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
