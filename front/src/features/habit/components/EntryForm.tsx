import { DurationOptions, Habit, HabitType } from "@habits/shared/habit";
import { Entry } from "@habits/shared/entry";
import { cn } from "../../../lib/cn";
import { Label } from "../../../components/ui/Label";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useEffect, useState } from "react";
import { useCreateEntry } from "../../entry/hooks/useEntries";
import { DURATION_OPTIONS_LABELS } from "../lib/durationOptionsLabels";

interface EntryFormProps {
  habit: Habit;
  entries: Entry[];
  dayKey: string;
  setDayKey: (v: string) => void;
  todayKey: string;
  showEntryForm: boolean;
  setShowEntryForm: (v: boolean) => void;
  onEntrySaved?: () => void;
}

function EntryForm({
  habit,
  entries,
  dayKey,
  setDayKey,
  todayKey,
  showEntryForm,
  setShowEntryForm,
  onEntrySaved,
}: EntryFormProps) {
  const [value, setValue] = useState<number | "">("");
  const [completed, setCompleted] = useState(false);

  const { isPending, error: errorCreate, mutate } = useCreateEntry();

  const isToday = dayKey === todayKey;
  const entryUnitLabel =
    habit.type === HabitType.DURATION && habit.unit
      ? DURATION_OPTIONS_LABELS[habit.unit as DurationOptions]
      : (habit.unit ?? "");

  useEffect(() => {
    const entry = entries.find((entry) => entry.dayKey === dayKey);

    setValue(entry?.value ?? "");
    setCompleted(entry?.completed ?? false);
  }, [dayKey, entries]);

  const handleSubmit = async () => {
    if (habit.type === HabitType.BOOLEAN) {
      const saved = await mutate({ completed: !completed, dayKey }, habit._id);

      if (saved) {
        setCompleted(saved.completed ?? false);
        setShowEntryForm(false);
        onEntrySaved?.();
      }
    } else {
      if (value === "" || Number.isNaN(value)) return;

      const created = await mutate({ value, dayKey }, habit._id);

      if (created) {
        setCompleted(true);
        setShowEntryForm(false);
        onEntrySaved?.();
      }
    }
  };

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        showEntryForm ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="overflow-hidden">
        <div
          inert={!showEntryForm}
          className={cn(
            "pt-4 transition-opacity duration-200",
            showEntryForm ? "opacity-100" : "opacity-0",
          )}
        >
          <form
            id="form-entry"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-wrap items-end gap-3"
          >
            {/* Data */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="entry-date" className="text-xs text-slate-500">
                Data
              </Label>
              <Input
                id="entry-date"
                type="date"
                max={todayKey}
                value={dayKey}
                onChange={(e) => {
                  if (e.target.value > todayKey) return;
                  setDayKey(e.target.value);
                }}
                className="px-2 py-1.5 text-sm"
              />
            </div>

            {/* Valor + Unidade — solo QUANTITY / DURATION */}
            {habit.type !== HabitType.BOOLEAN && (
              <div className="flex flex-col gap-1">
                <Label htmlFor="entry-value" className="text-xs text-slate-500">
                  Valor
                </Label>
                <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Input
                    id="entry-value"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={value}
                    onChange={(e) =>
                      setValue(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="w-24 border-0 rounded-none px-2 py-1.5 text-sm focus:ring-0"
                  />
                  <span className="flex items-center border-l border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">
                    {entryUnitLabel}
                  </span>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs"
                disabled={isPending}
                onClick={() => setShowEntryForm(false)}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                size="sm"
                className="text-xs"
                disabled={
                  isPending ||
                  (habit.type !== HabitType.BOOLEAN &&
                    (value === "" || Number.isNaN(value)))
                }
              >
                {isPending
                  ? "Salvando..."
                  : habit.type === HabitType.BOOLEAN
                    ? completed
                      ? "Desmarcar"
                      : isToday
                        ? "Marcar hoje"
                        : "Marcar"
                    : "Salvar"}
              </Button>
            </div>
          </form>

          {errorCreate && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {errorCreate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EntryForm;
