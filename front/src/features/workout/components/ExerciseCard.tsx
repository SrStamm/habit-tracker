import { useId } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  ExerciseDraft,
  SetDraft,
  duplicateSet,
  emptySet,
} from "../lib/workoutDraft";
import SetRow from "./SetRow";

type Props = {
  exercise: ExerciseDraft;
  onChange: (next: ExerciseDraft) => void;
  onRemove: () => void;
  disabled?: boolean;
  suggestions?: string[];
};

function ExerciseCard({
  exercise,
  onChange,
  onRemove,
  disabled,
  suggestions = [],
}: Props) {
  const suggestionsId = useId();
  const updateSet = (setId: string, patch: Partial<SetDraft>) =>
    onChange({
      ...exercise,
      sets: exercise.sets.map((set) =>
        set.id === setId ? { ...set, ...patch } : set,
      ),
    });

  const removeSet = (setId: string) =>
    onChange({
      ...exercise,
      sets: exercise.sets.filter((set) => set.id !== setId),
    });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <Input
          aria-label="Nome do exercício"
          placeholder="Nome do exercício"
          list={suggestions.length > 0 ? suggestionsId : undefined}
          value={exercise.exercise}
          disabled={disabled}
          onChange={(e) => onChange({ ...exercise, exercise: e.target.value })}
          className="flex-1 px-2 py-1.5 text-sm"
        />
        {suggestions.length > 0 && (
          <datalist id={suggestionsId}>
            {suggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Remover exercício"
          disabled={disabled}
          onClick={onRemove}
          className="h-8 w-8 shrink-0 px-0 text-slate-500 hover:text-danger"
        >
          ×
        </Button>
      </div>

      <div className="grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <span>Série</span>
        <span>Reps</span>
        <span>Peso (kg)</span>
        <span />
      </div>

      {exercise.sets.map((set, index) => (
        <SetRow
          key={set.id}
          index={index}
          set={set}
          disabled={disabled}
          canRemove={exercise.sets.length > 1}
          onChange={(patch) => updateSet(set.id, patch)}
          onRemove={() => removeSet(set.id)}
        />
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => {
          const last = exercise.sets[exercise.sets.length - 1];
          onChange({
            ...exercise,
            sets: [...exercise.sets, last ? duplicateSet(last) : emptySet()],
          });
        }}
        className="self-start text-xs text-primary"
      >
        + Adicionar série
      </Button>
    </div>
  );
}

export default ExerciseCard;
