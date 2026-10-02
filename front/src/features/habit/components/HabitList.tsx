import { Habit } from "@habits/shared/habit";
import HabitCard from "./HabitCard";
import { Entry } from "@habits/shared/entry";

type ListHabitCardProps = {
  habits: Habit[];
  todayByHabit: Map<string, Entry>;
  onSelect?: (habitId: string) => void;
  onEntrySaved?: () => void;
  streaks?: Map<string, number>;
};

function HabitList({
  habits,
  onSelect,
  todayByHabit,
  onEntrySaved,
  streaks,
}: ListHabitCardProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl text-text-muted">
        <p className="text-sm">Ainda não tem nenhum hábito registado.</p>
        <p className="text-xs mt-1">
          Cria o primeiro com o botão "+ Novo Hábito".
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {habits.map((habit) => (
        <HabitCard
          key={habit._id}
          habit={habit}
          onSelect={onSelect}
          todayEntry={todayByHabit.get(habit._id)}
          onEntrySaved={onEntrySaved}
          streak={streaks?.get(habit._id)}
        />
      ))}
    </div>
  );
}

export default HabitList;
