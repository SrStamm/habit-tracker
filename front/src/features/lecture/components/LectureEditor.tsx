import { Button } from "../../../components/ui/Button";
import { emptyLecture, LectureDraft } from "../lectureDraft";
import LectureCard from "./LectureCard";

type Props = {
  value: LectureDraft;
  onChange: (next: LectureDraft) => void;
  disabled?: boolean;
};

function LectureEditor({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Leituras
      </span>

      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
          Nenhuma leitura adicionada.
        </p>
      )}

      {value.map((l) => (
        <div key={l.id}>
          <LectureCard
            lecture={l}
            disabled={disabled}
            onChange={(next) =>
              onChange(value.map((e) => (e.id === next.id ? next : e)))
            }
            onRemove={() => onChange(value.filter((e) => e.id !== l.id))}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onChange([...value, emptyLecture()])}
        className="w-full border-dashed text-xs"
      >
        + Adicionar leitura
      </Button>
    </div>
  );
}

export default LectureEditor;
