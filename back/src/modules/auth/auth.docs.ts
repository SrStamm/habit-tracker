import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  LoginSchema,
  AuthResponseSchema,
  RegisterResponseSchema,
} from "@habits/shared/auth";

export function registerAuthDocs(r: OpenAPIRegistry) {
  r.registerPath({
    method: "post",
    path: "/auth/login",
    request: {
      body: { content: { "application/json": { schema: LoginSchema } } },
    },
    responses: {
      200: {
        description: "Login exitoso",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
    },
  });

  r.registerPath({
    method: "post",
    path: "/auth/register",
    request: {
      body: { content: { "application/json": { schema: LoginSchema } } },
    },
    responses: {
      201: {
        description: "Login exitoso",
        content: { "application/json": { schema: RegisterResponseSchema } },
      },
    },
  });
}
