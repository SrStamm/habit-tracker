import { SignJWT, jwtVerify } from "jose";
import User from "../../models/User";
import bcrypt from "bcrypt";

export const createUser = async (nome: string, password: string) => {
  // Valida que o usuario não exista
  const existing = await User.findOne({ nome });
  if (existing) throw new Error("Usuario ja existe");

  // Hashea o password e cria o novo User
  const hashedPassword = await bcrypt.hash(password, 10);
  const novoUser = new User({ nome, password: hashedPassword });
  const saved = await novoUser.save();

  // Desestructura o objeto para não retornar o password
  const { password: _, ...userWithoutPassword } = saved.toObject();
  return userWithoutPassword;
};

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ??
    (() => {
      throw new Error("JWT_SECRET não definido");
    })(),
);

export const firmarToken = async (userId: string) => {
  const token = await new SignJWT({ userId: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  return token;
};

export const verificarToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    throw new Error("Token inválido ou expirado");
  }
};

export const validarUsuario = async (nome: string, password: string) => {
  // Valida que o usuario existe
  const existing = await User.findOne({ nome });
  if (!existing) throw new Error("Usuario não existe");

  const isMatch = await bcrypt.compare(password, existing.password);
  if (!isMatch) throw new Error("Credenciais inválidas");

  const { password: _, ...usuarioSinPassword } = existing.toObject();
  return usuarioSinPassword;
};
