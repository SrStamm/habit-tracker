import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { SetDraft } from "../lib/workoutDraft";

type Props = {
  index: number;
  set: SetDraft;
  canRemove: boolean;
  disabled?: boolean;
  onChange: (patch: Partial<SetDraft>) => void;
  onRemove: () => void;
};

function SetRow({
  index,
  set,
  canRemove,
  disabled,
  onChange,
  onRemove,
}: Props) {
  return (
    <div className="grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2">
      <span className="text-xs font-medium text-slate-500">#{index + 1}</span>

      <Input
        aria-label={`Repetições da série ${index + 1}`}
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        placeholder="0"
        value={set.reps}
        disabled={disabled}
        onChange={(e) => onChange({ reps: e.target.value })}
        className="w-full min-w-0 px-2 py-1.5 text-sm"
      />

      <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Input
          aria-label={`Peso da série ${index + 1} em quilogramas`}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.5"
          placeholder="0"
          value={set.weight}
          disabled={disabled}
          onChange={(e) => onChange({ weight: e.target.value })}
          className="w-full min-w-0 rounded-none border-0 px-2 py-1.5 text-sm focus:ring-0"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">
          kg
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Remover série ${index + 1}`}
        disabled={disabled || !canRemove}
        onClick={onRemove}
        className="h-8 w-8 px-0 text-slate-400 hover:text-danger disabled:invisible"
      >
        ×
      </Button>
    </div>
  );
}

export default SetRow;
