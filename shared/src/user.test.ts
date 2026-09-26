import { describe, it } from "vitest";
import { UserResponseSchema } from "./user";

// Este schema existe por una sola razon: que el hash de la password nunca
// cruce al cliente. auth.service.ts hoy lo hace a mano con destructuring
// (const { password: _, ...userWithoutPassword } = saved.toObject()), o sea
// que este schema hoy es la red de seguridad, no la proteccion.
//
// OJO: no hay schema equivalente para la ENTRADA del user. El back valida
// el body de register con LoginSchema (auth.routes.ts), que solo exige
// nome y password. El _id y el createdAt de la request no tienen schema.
describe("UserResponseSchema", () => {
  it.todo("acepta nome y _id");
  it.todo("rechaza user sin _id");
  it.todo("rechaza user sin nome");
  it.todo("rechaza nome no string");
  it.todo("rechaza _id no string");

  // El strip de la password es el comportamiento que hay que fijar con un
  // test. Si Zod cambia de strip a passthrough, o si alguien cambia el
  // schema, el hash se filtra en la respuesta y el test es lo unico que
  // lo detecta antes que un cliente.
  it.todo("descarta password del resultado en vez de propagarla");
});
