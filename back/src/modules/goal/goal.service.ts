import { dayKeyFrom } from "../../lib/dayKey";
import { HttpError } from "../../lib/errors";
import Goal, { type GoalDoc } from "../../models/Goal";
import Entry, { EntryDoc } from "../../models/Entry";
import {
  CreateGoalDTO,
  GoalProgressResponseDTO,
  GoalResponseDTO,
} from "@habits/shared/goal";
import { APP_TIMEZONE } from "../../config/timeZone";
import { Habit, HabitType, DurationOptions } from "@habits/shared/habit";

const toGoalResponse = (doc: GoalDoc): GoalResponseDTO => ({
  _id: doc._id.toString(),
  userId: doc.userId.toString(),
  habitId: doc.habitId.toString(),
  amount: doc.amount,
  period: doc.period,
});

// Converte os componentes de calendário de um Date em "YYYY-MM-DD".
// Não passe um instante (new Date()): aí quem decide o dia é a timezone
// do servidor, não a da aplicação.
const toLocalDayKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const getGoals = async (userId: string, habitId: string) => {
  const goals = await Goal.find({ userId, habitId });
  return goals.map(toGoalResponse);
};

const lastPageByBook = (entries: EntryDoc[]) => {
  const pages = new Map<string, number>();
  const sorted = [...entries].sort((a, b) => a.dayKey.localeCompare(b.dayKey));

  for (const entry of sorted) {
    for (const item of entry.lecture ?? []) {
      if (item.book != null && item.page != null) {
        pages.set(item.book, item.page);
      }
    }
  }

  return pages;
};

export const getGoalProgress = async (
  userId: string,
  habitId: string,
  goalId: string,
  habit: Habit,
): Promise<GoalProgressResponseDTO> => {
  // O goal define o valor e a periodicidade; o hábito, como contar.
  const goal = await Goal.findOne({ _id: goalId, userId, habitId });

  if (!goal) throw new HttpError("Goal não encontrado", 404);

  // Janela calendário em curso (segunda..domingo ou dia 1..último),
  // calculada na timezone da aplicação e não na do servidor.
  const today = dayKeyFrom(new Date(), APP_TIMEZONE);
  const [year, month, day] = today.split("-");

  // Opera como calculadora de calendário (componentes de data), não como
  // instante: assim nenhum deslocamento de timezone entra na conta.
  const currentDate = new Date(Number(year), Number(month) - 1, Number(day));

  let periodStart = "";
  let periodEnd = "";

  if (goal.period === "WEEK") {
    // Segunda-feira = índice 0 ((diaDaSemana + 6) % 7).
    const weekDay = (currentDate.getDay() + 6) % 7;

    currentDate.setDate(currentDate.getDate() - weekDay);
    periodStart = toLocalDayKey(currentDate);

    currentDate.setDate(currentDate.getDate() + 6);
    periodEnd = toLocalDayKey(currentDate);
  } else {
    currentDate.setDate(1);
    periodStart = toLocalDayKey(currentDate);

    // setMonth é 0-based: Number(month) já aponta para o mês seguinte.
    // setDate(0) = último dia do mês atual.
    currentDate.setMonth(Number(month));
    currentDate.setDate(0);
    periodEnd = toLocalDayKey(currentDate);
  }

  // O dayKey é "YYYY-MM-DD", então comparar string é comparar data.
  const entries = await Entry.find({
    userId,
    habitId,
    dayKey: { $gte: periodStart, $lte: periodEnd },
  });

  let current = 0;

  if (habit.type === HabitType.BOOLEAN) {
    const newEntries = entries.filter((e) => e.completed === true);
    current = newEntries.length;
  } else if (habit.type === HabitType.WORKOUT) {
    current = entries.reduce(
      (total, entry) =>
        total +
        (entry.workout ?? []).reduce(
          (t, ex) =>
            t +
            ex.sets.reduce(
              // Peso 0 explícito (peso corporal) conta reps × 1 para o
              // progresso não ficar em 0. Peso ausente/null (dado legado)
              // continua contando 0.
              (s, set) =>
                s +
                (set.reps ?? 0) *
                  (set.weight == null ? 0 : set.weight || 1),
              0,
            ),
          0,
        ),
      0,
    );
  } else if (habit.type === HabitType.LECTURE) {
    const inPeriod = lastPageByBook(entries);

    if (inPeriod.size > 0) {
      const before = await Entry.find({
        userId,
        habitId,
        dayKey: { $lt: periodStart },
      });
      const baseline = lastPageByBook(before);

      current = [...inPeriod.entries()].reduce(
        (total, [book, page]) =>
          total + Math.max(0, page - (baseline.get(book) ?? 0)),
        0,
      );
    }
  } else {
    current = entries.reduce((acum, currVal) => {
      // value é optional no schema de Entry: sem valor, conta 0.
      const value = currVal.value ?? 0;

      if (habit.type !== HabitType.DURATION) {
        return acum + value;
      }

      // DURATION: converge para MINUTES, a unidade canônica do progresso.
      switch (habit.unit) {
        case DurationOptions.SECONDS:
          return acum + value / 60;
        case DurationOptions.MINUTES:
          return acum + value;
        case DurationOptions.HOURS:
          return acum + value * 60;
        default:
          // Unidade fora do enum: dado inconsistente no banco.
          throw new HttpError(
            `DURATION com unidade inválida: ${String(habit.unit)}`,
            500,
          );
      }
    }, 0);
  }

  // Arredonda para 2 casas decimais: o front só pinta o valor, então a
  // precisão (e a representação dela) é responsabilidade do backend.
  const pct = Math.round((current / goal.amount) * 100 * 100) / 100;

  // DURATION é sempre MINUTES porque a soma acima já converteu;
  // QUANTITY usa a unidade livre do hábito.
  const unit =
    habit.type === HabitType.BOOLEAN
      ? "BOOLEAN"
      : habit.type === HabitType.DURATION
        ? DurationOptions.MINUTES
        : habit.type === HabitType.WORKOUT
          ? "kg·rep"
          : habit.type === HabitType.LECTURE
            ? "páginas"
            : (habit.unit ?? "");

  return {
    goalId: goal._id.toString(),
    amount: goal.amount,
    current,
    pct,
    unit,
    periodStart,
    periodEnd,
  };
};

export const createGoal = async (
  userId: string,
  habitId: string,
  data: CreateGoalDTO,
) => {
  const novoGoal = new Goal({ userId, habitId, ...data });
  const saved = await novoGoal.save();
  return toGoalResponse(saved);
};

export const deleteGoal = async (
  userId: string,
  habitId: string,
  goalId: string,
) => {
  const res = await Goal.deleteOne({ userId, habitId, _id: goalId });

  if (res.deletedCount === 0) throw new HttpError("Goal não encontrado", 404);

  return;
};
