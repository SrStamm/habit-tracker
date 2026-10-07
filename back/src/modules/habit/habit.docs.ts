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
    summary: "Listar todos os Hábitos",
    tags: ["Habit"],
    operationId: "listHabits",
    method: "get",
    path: "/habits",
    security: [{ bearerAuth: [] }],
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
    summary: "Criar um Hábito",
    tags: ["Habit"],
    operationId: "createHabit",
    method: "post",
    path: "/habits",
    security: [{ bearerAuth: [] }],
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
    summary: "Atualizar um Hábito",
    tags: ["Habit"],
    operationId: "updateHabit",
    method: "patch",
    path: "/habits/{habitId}",
    security: [{ bearerAuth: [] }],
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
    summary: "Arquivar um Hábito",
    tags: ["Habit"],
    operationId: "archiveHabit",
    method: "delete",
    path: "/habits/{habitId}",
    security: [{ bearerAuth: [] }],
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
