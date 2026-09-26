import { describe, it } from "vitest";
import {
  buildCreateEntrySchema,
  GetEntriesQuerySchema,
  EntryParamsSchema,
} from "./entry";
import { HabitType } from "./habit";

// Estos schemas son el contrato del POST /habits/:habitId/entries.
// A diferencia de CreateHabitSchema, este SI es .strict(): una key de mas
// se rechaza en vez de descartarse. Esa asimetria es intencional y hay que
// defenderla con tests, no dejarla al azar.
describe("buildCreateEntrySchema con HabitType.BOOLEAN", () => {
  it.todo("acepta completed booleano");
  it.todo("rechaza completed ausente");
  it.todo("rechaza completed como string");
  it.todo("rechaza value, porque BOOLEAN no lleva value");
  it.todo("rechaza una key desconocida, por ser .strict()");

  // LANDMINE: z.iso.datetime() sin { offset: true } rechaza cualquier
  // datetime con timezone, tipo 2026-01-01T10:00:00+02:00. Y tambien
  // rechaza date-only, tipo 2026-01-01.
  // Hoy no explota porque el front nunca manda `at` (HabitCard no lo
  // incluye). Explotara el dia que alguien registre un dia pasado, que
  // es justo el caso de uso de Entry por dia.
  // Probalo y decide: agregar offset, o documentar que `at` es UTC Z.
  it.todo("acepta at como ISO 8601 con Z");
  it.todo("detecta que at con offset horario se rechaza");
  it.todo("detecta que at date-only se rechaza");
});

describe("buildCreateEntrySchema con QUANTITY y DURATION", () => {
  it.todo("acepta value numerico");
  it.todo("acepta value 0, porque el min es 0 y no 1");
  it.todo("rechaza value negativo");
  it.todo("rechaza value como string, porque no hay coerce");
  it.todo("rechaza completed, porque QUANTITY y DURATION no llevan completed");
  it.todo("DURATION genera el mismo shape que QUANTITY");
});

describe("GetEntriesQuerySchema", () => {
  // OJO: es z.coerce.date(), no z.date(). El front manda
  // filter.from.toISOString() (un string) y por eso funciona. Sin el
  // coerce, GET /habits/entries?from=... seria un 400.
  it.todo("coacciona from y to de string a Date");
  it.todo("rechaza from con una fecha invalida");
  it.todo("acepta query vacio, porque from y to son opcionales");
  it.todo("acepta solo from, sin to");
});

describe("EntryParamsSchema", () => {
  it.todo("acepta un habitId normal");

  // GAP CONFIRMADO: aca sigue z.string() sin .min(1), y HabitDeleteSchema
  // ya fue corregido a z.string().min(1). O sea que hoy los tres schemas
  // de params se comportan distinto entre si: delete rechaza el vacio,
  // update y entries lo aceptan. Vale la pena unificar.
  it.todo("detecta que habitId vacio pasa la validacion");
});
