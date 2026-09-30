import { z } from "zod";

export enum HabitType {
  BOOLEAN = "BOOLEAN",
  QUANTITY = "QUANTITY",
  DURATION = "DURATION",
}

export enum DurationOptions {
  SECONDS = "SECONDS",
  MINUTES = "MINUTES",
  HOURS = "HOURS",
}

const isDurationOption = (value: string): value is DurationOptions =>
  Object.values(DurationOptions).includes(value as DurationOptions);

const QueryBoolean = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => v === true || v === "true");

export const QueryGetHabits = z
  .object({
    all: QueryBoolean.optional(),
  })
  .strict();

export type QueryGetHabitsDTO = z.infer<typeof QueryGetHabits>;

const targetOnlyForMeasurable = (
  habit: { type?: HabitType; target?: number | null },
  ctx: z.RefinementCtx,
) => {
  if (habit.target !== undefined && habit.type === HabitType.BOOLEAN) {
    ctx.addIssue({
      code: "custom",
      path: ["target"],
      message: "target only applies to QUANTITY and DURATION",
    });
  }
};

const unitRequiredForMeasurable = (
  habit: { type?: HabitType; unit?: string },
  ctx: z.RefinementCtx,
) => {
  if (
    habit.unit === undefined &&
    habit.type !== undefined &&
    habit.type !== HabitType.BOOLEAN
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["unit"],
      message: "unit is required for QUANTITY and DURATION",
    });
  }
};

const unitsForMeasurable = (
  habit: { type?: HabitType; unit?: string },
  ctx: z.RefinementCtx,
) => {
  if (habit.type === HabitType.BOOLEAN && habit.unit !== undefined) {
    ctx.addIssue({
      code: "custom",
      path: ["unit"],
      message: "unit only applies to QUANTITY and DURATION",
    });
  }

  if (
    habit.type === HabitType.DURATION &&
    habit.unit !== undefined &&
    !isDurationOption(habit.unit)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["unit"],
      message: "unit must be SECONDS, MINUTES or HOURS",
    });
  }
};

export const CreateHabitSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    type: z.enum(HabitType),
    target: z.number().min(1).optional(),
    unit: z.string().min(1).optional(),
  })
  .strict()
  .superRefine(targetOnlyForMeasurable)
  .superRefine(unitRequiredForMeasurable)
  .superRefine(unitsForMeasurable);

export type CreateHabitDTO = z.infer<typeof CreateHabitSchema>;

export const HabitUpdateSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    type: z.enum(HabitType).optional(),
    target: z.number().min(1).nullable().optional(),
    unit: z.string().min(1).optional(),
  })
  .strict()
  .superRefine(targetOnlyForMeasurable)
  .superRefine(unitsForMeasurable);

export type UpdateHabitDTO = z.infer<typeof HabitUpdateSchema>;

export const HabitParamsSchema = z.object({
  habitId: z.string().min(1),
});

export type ParamsHabitDTO = z.infer<typeof HabitParamsSchema>;

export type Habit = CreateHabitDTO & {
  _id: string;
  userId: string;
  active: boolean;
};
