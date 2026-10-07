import {
  GetAllEntriesQuerySchema,
  EntryResponseSchema,
  buildCreateEntrySchema,
  GetEntriesQuerySchema,
} from "@habits/shared/entry";
import { HabitParamsSchema as EntryParamsSchema } from "@habits/shared/habit";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";

export function registerHabitDocs(r: OpenAPIRegistry) {
  r.registerPath({
    method: "get",
    path: "/habits/entries",
    security: [{ bearerAuth: [] }],
    request: {
      query: GetEntriesQuerySchema,
    },
    responses: {
      200: {
        description: "Obter todas as entries de forma exitosa",
        content: {
          "application/json": {
            schema: z.object({ entries: z.array(EntryResponseSchema) }),
          },
        },
      },
    },
  });

  r.registerPath({
    method: "get",
    path: "/habits/{habitId}/entries",
    security: [{ bearerAuth: [] }],
    request: {
      params: EntryParamsSchema,
      query: GetAllEntriesQuerySchema,
    },
    responses: {
      200: {
        description: "Obter todas as entries de um Habit de forma exitosa",
        content: {
          "application/json": {
            schema: z.object({ entries: z.array(EntryResponseSchema) }),
          },
        },
      },
    },
  });

  r.registerPath({
    method: "post",
    path: "/habits/{habitId}/entries",
    security: [{ bearerAuth: [] }],
    request: {
      params: EntryParamsSchema,
      body: {
        content: { "application/json": { schema: buildCreateEntrySchema } },
      },
    },
    responses: {
      200: {
        description: "Obter todas as entries de forma exitosa",
        content: {
          "application/json": {
            schema: z.object({ newEntry: EntryResponseSchema }),
          },
        },
      },
      201: {
        description: "Atualizado a entry com successo",
        content: {
          "application/json": {
            schema: z.object({ newEntry: EntryResponseSchema }),
          },
        },
      },
    },
  });
}
