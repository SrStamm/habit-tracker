import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  GoalResponseSchema,
  GoalProgressResponseSchema,
  GetGoalsProgressSchema,
  ParamsGoalsSchema,
  CreateGoalSchema,
} from "@habits/shared/goal";
import z from "zod";

export function registerGoalDocs(r: OpenAPIRegistry) {
  r.registerPath({
    summary: "Listar todos os goals",
    tags: ["Goal"],
    operationId: "listAllGoals",
    method: "get",
    path: "/habits/{habitId}/goals",
    security: [{ bearerAuth: [] }],
    request: {
      params: ParamsGoalsSchema,
    },
    responses: {
      200: {
        description: "Obter todos os goals de forma exitosa",
        content: {
          "application/json": {
            schema: z.object({ goals: z.array(GoalResponseSchema) }),
          },
        },
      },
    },
  });

  r.registerPath({
    summary: "Obter o progresso de um Habit para um Goal",
    tags: ["Goal"],
    operationId: "getProgressByHabit",
    method: "get",
    path: "/habits/{habitId}/goals/{goalId}/progress",
    security: [{ bearerAuth: [] }],
    request: {
      params: GetGoalsProgressSchema,
    },
    responses: {
      200: {
        description: "Obter o progresso do Goal de forma exitosa",
        content: {
          "application/json": {
            schema: GoalProgressResponseSchema,
          },
        },
      },
    },
  });

  r.registerPath({
    summary: "Criar um Goal",
    tags: ["Goal"],
    operationId: "createGoal",
    method: "post",
    path: "/habits/{habitId}/goals",
    security: [{ bearerAuth: [] }],
    request: {
      params: ParamsGoalsSchema,
      body: {
        content: {
          "application/json": { schema: CreateGoalSchema },
        },
      },
    },
    responses: {
      201: {
        description: "Criado um novo Goal de forma exitosa",
        content: {
          "application/json": {
            schema: GoalResponseSchema,
          },
        },
      },
    },
  });

  r.registerPath({
    summary: "Apagar um Goal",
    tags: ["Goal"],
    operationId: "deleteGoal",
    method: "delete",
    path: "/habits/{habitId}/goals/{goalId}",
    security: [{ bearerAuth: [] }],
    request: {
      params: GetGoalsProgressSchema,
    },
    responses: {
      204: {
        description: "Apagado o Goal de forma exitosa",
      },
    },
  });
}
