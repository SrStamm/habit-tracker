import Habit from "../../models/Habit";

export const findAllHabits = async (userId: string) => {
  const allHabits = await Habit.find({ userId });

  if (allHabits.length == 0 || allHabits == null) {
    throw new Error("Não se encontraram hábitos para o userId ingresado");
  }

  return allHabits;
};
