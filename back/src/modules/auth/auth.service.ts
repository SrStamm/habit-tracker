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
