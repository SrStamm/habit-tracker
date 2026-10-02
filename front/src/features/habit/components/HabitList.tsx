import { Habit } from "@habits/shared/habit";
import HabitCard from "./HabitCard";
import { Entry } from "@habits/shared/entry";

type ListHabitCardProps = {
  data: Habit[];
  todayByHabit: Map<string, Entry>;
  onSelect?: (habitId: string) => void;
  onEntrySaved?: () => void;
};

function HabitList({
  data,
  onSelect,
  todayByHabit,
  onEntrySaved,
}: ListHabitCardProps) {
  if (data.length === 0) {
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
      {data.map((habit) => (
        <HabitCard
          key={habit._id}
          data={habit}
          onSelect={onSelect}
          todayEntry={todayByHabit.get(habit._id)}
          onEntrySaved={onEntrySaved}
        />
      ))}
    </div>
  );
}

export default HabitList;
