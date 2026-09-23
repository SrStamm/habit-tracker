import { api } from "../../lib/api";
import { UserResponseDTO } from "@habits/shared/user";
import { AuthResponseDTO, LoginDTO } from "@habits/shared/auth";

export const login = async (data: LoginDTO): Promise<AuthResponseDTO> => {
  return api<AuthResponseDTO>("/auth/login", { method: "POST", body: data });
};

export const register = async (data: LoginDTO): Promise<UserResponseDTO> => {
  return api<UserResponseDTO>("/auth/register", { method: "POST", body: data });
};
