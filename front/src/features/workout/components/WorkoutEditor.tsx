import { Button } from "../../../components/ui/Button";
import { WorkoutDraft, emptyExercise } from "../lib/workoutDraft";
import ExerciseCard from "./ExerciseCard";

type Props = {
  value: WorkoutDraft;
  onChange: (next: WorkoutDraft) => void;
  disabled?: boolean;
};

function WorkoutEditor({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Exercícios
      </span>

      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
          Nenhum exercício adicionado.
        </p>
      )}

      {value.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          disabled={disabled}
          onChange={(next) =>
            onChange(value.map((e) => (e.id === next.id ? next : e)))
          }
          onRemove={() => onChange(value.filter((e) => e.id !== exercise.id))}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onChange([...value, emptyExercise()])}
        className="w-full border-dashed text-xs"
      >
        + Adicionar exercício
      </Button>
    </div>
  );
}

export default WorkoutEditor;
