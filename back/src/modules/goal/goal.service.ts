import { HttpError } from "../../lib/errors";
import Goal, { type GoalDoc } from "../../models/Goal";
import { CreateGoalDTO, GoalResponseDTO } from "@habits/shared/goal";

const toGoalResponse = (doc: GoalDoc): GoalResponseDTO => ({
  _id: doc._id.toString(),
  userId: doc.userId.toString(),
  habitId: doc.habitId.toString(),
  amount: doc.amount,
  period: doc.period,
});

export const getGoals = async (userId: string, habitId: string) => {
  const goals = await Goal.find({ userId, habitId });
  return goals.map(toGoalResponse);
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
