import { Habit } from "@habits/shared/habit";
import HabitCard from "./HabitCard";
import { Entry } from "@habits/shared/entry";

type ListHabitCardProps = {
  habits: Habit[];
  todayByHabit: Map<string, Entry>;
  onSelect?: (habitId: string) => void;
  onEntrySaved?: () => void;
  streaks?: Map<string, number>;
  emptyTitle?: string;
  emptyDescription?: string;
};

function HabitList({
  habits,
  onSelect,
  todayByHabit,
  onEntrySaved,
  streaks,
  emptyTitle = "Ainda não tem nenhum hábito registado.",
  emptyDescription = 'Cria o primeiro com o botão "+ Novo Hábito".',
}: ListHabitCardProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl text-text-muted">
        <p className="text-sm">{emptyTitle}</p>
        <p className="text-xs mt-1">{emptyDescription}</p>
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
