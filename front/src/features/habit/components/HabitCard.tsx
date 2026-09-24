import { useState } from "react";
import { Habit, HabitType } from "@habits/shared/habit";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Tag } from "../../../components/ui/Tag";
import { HABIT_TYPE_LABELS } from "../lib/habitTypeLabels";

type HabitCardProps = {
  data: Habit;
  onSelect?: (habitId: string) => void;
};

function HabitCard({ data, onSelect }: HabitCardProps) {
  const [completedToday, setCompletedToday] = useState(false);
  const [value, setValue] = useState<number | "">("");

  // Handler para marcar hábitos simples/booleanos
  const handleToggleCheck = () => {
    // TODO: Llamar a POST /entries
  };

  // Handler para hábitos cuantitativos o de tiempo
  const handleValueSubmit = () => {
    // TODO: Llamar a POST /entries { value }
  };

  return (
    <div
      onClick={() => onSelect?.(data._id)}
      className="group relative flex flex-col justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Tag>{HABIT_TYPE_LABELS[data.type]}</Tag>
          <h3 className="text-base font-medium text-text mt-1 group-hover:text-primary transition-colors">
            {data.name}
          </h3>
        </div>
      </div>

      {/* Controles de registro diario segun el tipo de hábito */}
      <div className="mt-2 pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs text-text-muted">Hoy:</span>

        {data.type === HabitType.BOOLEAN ? (
          <Button
            size="sm"
            variant={completedToday ? "primary" : "outline"}
            onClick={() => handleToggleCheck()}
            className="text-xs"
          >
            {completedToday ? "✓ Cumplido" : "Marcar hoy"}
          </Button>
        ) : (
          <form
            onSubmit={() => handleValueSubmit()}
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              type="number"
              placeholder="Cant."
              value={value}
              onChange={(e) => setValue(e.target.valueAsNumber || "")}
              className="w-16 px-2 py-1 text-xs bg-background"
            />
            <Button size="sm" type="submit" disabled={!value}>
              Guardar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default HabitCard;
