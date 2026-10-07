import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  CreateHabitSchema,
  HabitUpdateSchema,
  QueryGetHabits,
  HabitParamsSchema,
  HabitResponseSchema,
} from "@habits/shared/habit";
import z from "zod";

export function registerHabitDocs(r: OpenAPIRegistry) {
  r.registerPath({
    method: "get",
    path: "/habits",
    request: {
      query: QueryGetHabits,
    },
    responses: {
      200: {
        description: "Obter habits de forma exitosa",
        content: {
          "application/json": {
            schema: z.object({ allHabits: z.array(HabitResponseSchema) }),
          },
        },
      },
    },
  });

  r.registerPath({
    method: "post",
    path: "/habits",
    request: {
      body: { content: { "application/json": { schema: CreateHabitSchema } } },
    },
    responses: {
      201: {
        description: "Criado de forma exitosa",
        content: {
          "application/json": {
            schema: z.object({ novoHabito: HabitResponseSchema }),
          },
        },
      },
    },
  });

  r.registerPath({
    method: "patch",
    path: "/habits/{habitId}",
    request: {
      params: HabitParamsSchema,
      body: { content: { "application/json": { schema: HabitUpdateSchema } } },
    },
    responses: {
      201: {
        description: "Atualizado de forma exitosa",
        content: {
          "application/json": {
            schema: z.object({
              habitoAtualizado: HabitResponseSchema,
            }),
          },
        },
      },
    },
  });

  r.registerPath({
    method: "delete",
    path: "/habits/{habitId}",
    request: {
      params: HabitParamsSchema,
    },
    responses: {
      204: {
        description: "Arquivado de forma exitosa",
      },
    },
  });
}
