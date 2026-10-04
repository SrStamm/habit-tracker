import { Cell } from "../../entry/lib/buildHeatmap";

type HeatmapProps = {
  weeks: (Cell | null)[][];
  onCellSelect: (c: Cell) => void;
};

export const LEVEL_CLASSES = [
  "bg-slate-100", // 0 sin actividad
  "bg-emerald-200", // 1
  "bg-emerald-300", // 2
  "bg-emerald-400", // 3
  "bg-emerald-500", // 4 máximo
] as const;

function HeatmapGrid({ weeks, onCellSelect }: HeatmapProps) {
  return (
    <div
      className="flex items-start gap-1"
      role="img"
      aria-label="Heatmap de atividade por dia"
    >
      {weeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          className="grid gap-1"
          style={{ gridTemplateRows: "repeat(7, 20px)" }}
        >
          {week.map((cell, cellIndex) =>
            cell === null ? (
              <div
                key={cellIndex}
                className="size-5 rounded-[3px] bg-transparent"
              />
            ) : (
              <div
                key={cellIndex}
                title={cell.label}
                aria-label={cell.label}
                className={`size-5 rounded-[3px] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all ${LEVEL_CLASSES[cell.level]}`}
                onClick={() => onCellSelect(cell)}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

export default HeatmapGrid;
