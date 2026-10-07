import {
  GetAllEntriesQuerySchema,
  EntryResponseSchema,
  buildCreateEntrySchema,
  GetEntriesQuerySchema,
} from "@habits/shared/entry";
import {
  HabitParamsSchema as EntryParamsSchema,
  HabitType,
} from "@habits/shared/habit";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";

export function registerEntryDocs(r: OpenAPIRegistry) {
  r.registerPath({
    summary: "Listar todas as entries",
    tags: ["Entry"],
    operationId: "listAllEntries",
    method: "get",
    path: "/habits/entries",
    security: [{ bearerAuth: [] }],
    request: {
      query: GetAllEntriesQuerySchema,
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
    summary: "Listar todas as entries de um Habito",
    tags: ["Entry"],
    operationId: "listEntries",
    method: "get",
    path: "/habits/{habitId}/entries",
    security: [{ bearerAuth: [] }],
    request: {
      params: EntryParamsSchema,
      query: GetEntriesQuerySchema,
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
    summary: "Criar ou Atualizar uma entry",
    tags: ["Entry"],
    operationId: "upsertEntry",
    method: "post",
    path: "/habits/{habitId}/entries",
    security: [{ bearerAuth: [] }],
    request: {
      params: EntryParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: z.union([
              buildCreateEntrySchema(HabitType.BOOLEAN),
              buildCreateEntrySchema(HabitType.DURATION),
            ]),
            examples: {
              booleano: { value: { dayKey: "2026-10-07", completed: true } },
              medible: { value: { dayKey: "2026-10-07", value: 5 } },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Atualizado a entry com successo",
        content: {
          "application/json": {
            schema: z.object({ newEntry: EntryResponseSchema }),
          },
        },
      },
      201: {
        description: "Cria uma entry com successo",
        content: {
          "application/json": {
            schema: z.object({ newEntry: EntryResponseSchema }),
          },
        },
      },
    },
  });
}
