import {
  CreateHabitDTO,
  HabitType,
  isMeasurableType,
  UpdateHabitDTO,
} from "@habits/shared/habit";

type HabitPayloadCommon = {
  name: string;
  description: string;
  category: string;
  type: HabitType;
  target: number | "";
  unit: string;
};

type CreateHabitPayloadInput = HabitPayloadCommon & { state: "create" };
type EditHabitPayloadInput = HabitPayloadCommon & { state: "edit" };

/**
 * Arma el payload del form de hábito.
 *
 * - En edición, meta vacía en un tipo medible → `target: null` (limpia la meta
 *   guardada en el back).
 * - En creación, meta vacía → se omite `target`.
 * - Tipos no medibles → no envían `target` ni `unit`.
 */
export function buildHabitPayload(input: CreateHabitPayloadInput): CreateHabitDTO;
export function buildHabitPayload(input: EditHabitPayloadInput): UpdateHabitDTO;
export function buildHabitPayload(
  input: CreateHabitPayloadInput | EditHabitPayloadInput,
): CreateHabitDTO | UpdateHabitDTO {
  const { state, name, description, category, type, target, unit } = input;
  const measurable = isMeasurableType(type);
  const unitPart = measurable && unit ? { unit } : {};

  if (state === "create") {
    return {
      name,
      description,
      category,
      type,
      ...(measurable && typeof target === "number" ? { target } : {}),
      ...unitPart,
    };
  }

  const targetPart = !measurable
    ? {}
    : typeof target === "number"
      ? { target }
      : { target: null };

  return {
    name,
    description,
    category,
    type,
    ...targetPart,
    ...unitPart,
  };
}
