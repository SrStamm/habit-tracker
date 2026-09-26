import { useState } from "react";
import { Habit, HabitType } from "@habits/shared/habit";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Tag } from "../../../components/ui/Tag";
import { HABIT_TYPE_LABELS } from "../lib/habitTypeLabels";
import { useCreateEntry } from "../../entry/hooks/useEntries";

type HabitCardProps = {
  data: Habit;
  onSelect?: (habitId: string) => void;
};

function HabitCard({ data, onSelect }: HabitCardProps) {
  const [completedToday, setCompletedToday] = useState(false);
  const [value, setValue] = useState<number | "">("");
  const { isPending, error, mutate } = useCreateEntry();

  // Handler para marcar hábitos simples/booleanos
  const handleToggleCheck = async () => {
    const saved = await mutate({ completed: !completedToday }, data._id);

    // Refleja solo lo que quedo guardado. El flip optimista anterior movia el
    // boton a "Cumprido" aunque la API no hubiera escrito nada.
    if (saved) setCompletedToday(saved.completed ?? false);
  };

  // Handler para hábitos cuantitativos o de tiempo
  const handleValueSubmit = async () => {
    if (!value) return;

    const created = await mutate({ value }, data._id);
    if (created) setCompletedToday(true);
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
        <span className="text-xs text-text-muted">Hoje:</span>

        {data.type === HabitType.BOOLEAN ? (
          <Button
            size="sm"
            variant={completedToday ? "primary" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCheck();
            }}
            disabled={isPending}
            className="text-xs"
          >
            {completedToday ? "✓ Cumprido" : "Marcar hoje"}
          </Button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleValueSubmit();
            }}
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
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </form>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default HabitCard;
