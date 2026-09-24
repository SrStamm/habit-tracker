import { Habit } from "@habits/shared/habit";
import HabitCard from "./HabitCard";

type ListHabitCardProps = {
  data: Habit[];
  onSelect?: (habitId: string) => void;
};

function HabitList({ data, onSelect }: ListHabitCardProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl text-text-muted">
        <p className="text-sm">No tienes hábitos registrados aún.</p>
        <p className="text-xs mt-1">
          Crea el primero con el botón "+ Nuevo Hábito".
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((habit) => (
        <HabitCard key={habit._id} data={habit} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default HabitList;
