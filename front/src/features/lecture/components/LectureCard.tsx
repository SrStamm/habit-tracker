import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { LectureDraftItem } from "../lectureDraft";

type Props = {
  lecture: LectureDraftItem;
  onChange: (next: LectureDraftItem) => void;
  disabled?: boolean;
  onRemove: () => void;
};

function LectureCard({ lecture, onChange, disabled, onRemove }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <Input
          aria-label="Nome do livro"
          placeholder="Nome do livro"
          value={lecture.book}
          disabled={disabled}
          onChange={(e) => onChange({ ...lecture, book: e.target.value })}
          className="flex-1 px-2 py-1.5 text-sm"
        />

        <Input
          aria-label="Capitulo do livro"
          placeholder="Capitulo do livro"
          value={lecture.chapter}
          disabled={disabled}
          onChange={(e) => onChange({ ...lecture, chapter: e.target.value })}
          className="flex-1 px-2 py-1.5 text-sm"
        />

        <Input
          aria-label="Pagina do livro"
          placeholder="Pagina do livro"
          value={lecture.page}
          disabled={disabled}
          onChange={(e) => onChange({ ...lecture, page: e.target.value })}
          className="flex-1 px-2 py-1.5 text-sm"
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Remover leitura"
          disabled={disabled}
          onClick={onRemove}
          className="h-8 w-8 shrink-0 px-0 text-slate-500 hover:text-danger"
        >
          ×
        </Button>
      </div>
    </div>
  );
}

export default LectureCard;
