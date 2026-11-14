import { describe, expect, it } from "vitest";
import { DurationOptions, HabitType } from "@habits/shared/habit";
import { buildHabitPayload } from "./buildHabitPayload";

const base = {
  name: "Leer",
  description: "desc",
  category: "salud",
};

describe("buildHabitPayload", () => {
  describe("edit", () => {
    it("envía target null cuando la meta queda vacía en DURATION", () => {
      const payload = buildHabitPayload({
        state: "edit",
        ...base,
        type: HabitType.DURATION,
        target: "",
        unit: DurationOptions.MINUTES,
      });

      expect(payload).toHaveProperty("target", null);
      expect(payload).toMatchObject({ unit: DurationOptions.MINUTES });
    });

    it("envía target null cuando la meta queda vacía en QUANTITY", () => {
      const payload = buildHabitPayload({
        state: "edit",
        ...base,
        type: HabitType.QUANTITY,
        target: "",
        unit: "pages",
      });

      expect(payload).toHaveProperty("target", null);
    });

    it("envía target numérico tal cual", () => {
      const payload = buildHabitPayload({
        state: "edit",
        ...base,
        type: HabitType.QUANTITY,
        target: 5,
        unit: "pages",
      });

      expect(payload).toMatchObject({ target: 5, unit: "pages" });
    });
  });

  describe("create", () => {
    it("omite target cuando la meta está vacía", () => {
      const payload = buildHabitPayload({
        state: "create",
        ...base,
        type: HabitType.QUANTITY,
        target: "",
        unit: "pages",
      });

      expect(payload).not.toHaveProperty("target");
      expect(payload).toMatchObject({ unit: "pages" });
    });

    it("envía target numérico", () => {
      const payload = buildHabitPayload({
        state: "create",
        ...base,
        type: HabitType.DURATION,
        target: 30,
        unit: DurationOptions.MINUTES,
      });

      expect(payload).toMatchObject({ target: 30 });
    });
  });

  describe("tipos no medibles", () => {
    it.each([HabitType.BOOLEAN, HabitType.WORKOUT, HabitType.LECTURE])(
      "%s no envía target ni unit (edit y create)",
      (type) => {
        const edit = buildHabitPayload({
          state: "edit",
          ...base,
          type,
          target: 3,
          unit: "x",
        });
        const create = buildHabitPayload({
          state: "create",
          ...base,
          type,
          target: 3,
          unit: "x",
        });

        for (const payload of [edit, create]) {
          expect(payload).not.toHaveProperty("target");
          expect(payload).not.toHaveProperty("unit");
          expect(payload).toMatchObject(base);
          expect(payload).toMatchObject({ type });
        }
      },
    );
  });

  describe("unit", () => {
    it("omite unit cuando está vacía en tipo medible", () => {
      const payload = buildHabitPayload({
        state: "edit",
        ...base,
        type: HabitType.QUANTITY,
        target: 2,
        unit: "",
      });

      expect(payload).not.toHaveProperty("unit");
      expect(payload).toMatchObject({ target: 2 });
    });
  });
});
