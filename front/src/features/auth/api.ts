import { api } from "../../lib/api";
import {
  AuthResponseDTO,
  LoginDTO,
  RegisterResponseDTO,
} from "@habits/shared/auth";

export const login = async (data: LoginDTO): Promise<AuthResponseDTO> => {
  return api<AuthResponseDTO>("/auth/login", { method: "POST", body: data });
};

export const register = async (
  data: LoginDTO,
): Promise<RegisterResponseDTO> => {
  return api<RegisterResponseDTO>("/auth/register", {
    method: "POST",
    body: data,
  });
};
