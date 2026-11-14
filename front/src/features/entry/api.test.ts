import { describe, expect, it } from "vitest";
import { buildEntriesURL } from "./api";

// A query fala em dias canônicos. Um instante ISO aqui seria a doble
// conversión que corría la ventana según la zona del navegador: se defiende
// que la URL solo transporte `fromDayKey`/`toDayKey`.
describe("buildEntriesURL", () => {
  it("sin filtro devuelve la URL pelada", () => {
    expect(buildEntriesURL()).toBe("/habits/entries");
    expect(buildEntriesURL(undefined, "h1")).toBe("/habits/h1/entries");
  });

  it("serializa fromDayKey y toDayKey tal cual, sin toISOString", () => {
    expect(
      buildEntriesURL(
        { fromDayKey: "2026-03-10", toDayKey: "2026-03-12" },
        "h1",
      ),
    ).toBe("/habits/h1/entries?fromDayKey=2026-03-10&toDayKey=2026-03-12");
  });

  it("acepta una sola borda", () => {
    expect(buildEntriesURL({ fromDayKey: "2026-03-10" })).toBe(
      "/habits/entries?fromDayKey=2026-03-10",
    );

    expect(buildEntriesURL({ toDayKey: "2026-03-12" })).toBe(
      "/habits/entries?toDayKey=2026-03-12",
    );
  });

  it("no emite las claves viejas from/to aunque el filtro llegue vacío", () => {
    const url = buildEntriesURL({}, "h1");

    expect(url).toBe("/habits/h1/entries");
    expect(url).not.toContain("from=");
    expect(url).not.toContain("to=");
  });
});
