import { describe, it } from "vitest";
import {
  LoginSchema,
  AuthResponseSchema,
  RegisterResponseSchema,
} from "./auth";

// LoginSchema es el unico schema de auth que el back consume de verdad:
// auth.routes.ts lo pasa a validate({ body: LoginSchema }) en /login Y en
// /register. O sea, el mismo schema valida las dos operaciones.
//
// OJO: /register comparte LoginSchema, asi que la password de registro
// tiene el mismo min(8) que la de login. No hay schema aparte para register.
describe("LoginSchema", () => {
  it.todo("acepta nome y password de 8 caracteres o mas");
  it.todo("rechaza password de 7 caracteres, por el min(8)");
  it.todo("rechaza nome vacio, por el min(1)");
  it.todo("rechaza body vacio");
  it.todo("rechaza password ausente");
  it.todo("rechaza nome no string");
});

// Los tres schemas siguientes NO los usa nadie: ni back ni front los
// importan. AuthResponseSchema, RegisterResponseSchema y UserResponseSchema
// existen pero el back arma la respuesta a mano en el controller. Probalos
// igual, son el contrato documentado de lo que el back deberia devolver,
// pero anotalo: hoy un cambio en la forma de la respuesta no rompe ningun test.
describe("AuthResponseSchema", () => {
  it.todo("acepta un token no vacio");
  it.todo("rechaza token vacio, por el min(1)");
  it.todo("rechaza token ausente");
});

describe("RegisterResponseSchema", () => {
  it.todo("acepta user y token");
  it.todo("rechaza respuesta sin token");
  it.todo("rechaza respuesta sin user");
  it.todo("descarta la password que venga anidada en user");
});
