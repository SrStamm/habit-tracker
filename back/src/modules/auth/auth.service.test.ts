import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// NOTA: auth.service.ts cria o `secret` NO IMPORT e lanca se
// JWT_SECRET faltar — mesmo gotcha documentado em middleware/auth.test.ts:
// sem o env, este arquivo morre antes de rodar um teste.
// O vi.hoisted corre ANTES dos imports, por isso o env ja existe quando
// ./auth.service e avaliado. Isto e configuracao de ambiente, nao mock.
// (Alternativa: meter JWT_SECRET en vitest.config > test.env.)
// ============================================================

const m = vi.hoisted(() => {
  process.env.JWT_SECRET ??= "segredo-de-teste";
  const save = vi.fn();
  const ctor = vi.fn().mockImplementation(function (data) {
    return { ...data, save: save }; // save en la instancia
  });
  return {
    save,
    findOne: vi.fn(),
    ctor,
  };
});

vi.mock("../../models/User", () => {
  return {
    default: Object.assign(m.ctor, { findOne: m.findOne }),
  };
});

// Importa as funcoes DEPOIS do env (e, cando mockeas, DESPOIS do vi.mock)
import {
  createUser,
  validarUsuario,
  firmarToken,
  verificarToken,
} from "./auth.service";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

// ============================================================
// auth.service: o registo hasha a palavra-passe; o login rejeita a errada
// ============================================================
describe("createUser e validarUsuario", () => {
  it("o registo hasha a palavra-passe", async () => {
    // Nao existe o usuario
    m.findOne.mockResolvedValue(null);
    m.save.mockResolvedValue({
      _id: "u1",
      nome: "ana",
      password: "x",
      toObject() {
        return { _id: this._id, nome: this.nome, password: this.password };
      },
    });

    await createUser("ana", "secreta");

    // O que se salvou
    const data = m.ctor.mock.calls[0][0];
    // O password não é o mesmo que o input
    expect(data.password).not.toBe("secreta");
    expect(data.password).toMatch(/^\$2[aby]\$10\$/);
    expect(m.save).toHaveBeenCalledTimes(1);
  });

  it("o login rejeita a errada", async () => {
    const input = {
      _id: "u1",
      nome: "ana",
      password: await bcrypt.hash("correcta", 10),
    };
    m.findOne.mockResolvedValue(input);

    // Espera que a funcao seja rejeitada com o erro esperado
    await expect(validarUsuario("ana", "errada")).rejects.toThrow(
      "Credenciais inválidas",
    );
  });
});

// ============================================================
// auth.service: ida e volta do token — assinar e depois verificar
// ============================================================
describe("ida e volta do token — assinar e depois verificar", async () => {
  it("recupera o userId", async () => {
    const token = await firmarToken("u1");
    const payload = await verificarToken(token);
    expect(payload.userId).toBe("u1");
  });

  it("um token adulterado/expirado lança erro", async () => {
    // --- adulterado: assinatura real, assinatura corrupta ---
    const token = await firmarToken("u1");
    const adulterado = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    await expect(verificarToken(adulterado)).rejects.toThrow(
      "Token inválido ou expirado",
    );

    // --- expirado ---
    const expirado = await new SignJWT({ userId: "u1" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("-10 seconds") // relativo: ahora - 10s
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
    await expect(verificarToken(expirado)).rejects.toThrow(
      "Token inválido ou expirado",
    );
  });
});
