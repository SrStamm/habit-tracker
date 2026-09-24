import type { Cell } from "../../entry/lib/buildHeatmap";

type HeatmapProps = {
  weeks: (Cell | null)[][];
};

const LEVEL_CLASSES = [
  "bg-slate-100", // 0 sin actividad
  "bg-emerald-200", // 1
  "bg-emerald-300", // 2
  "bg-emerald-400", // 3
  "bg-emerald-500", // 4 máximo
] as const;

function Heatmap({ weeks }: HeatmapProps) {
  if (weeks.length === 0) {
    return <p className="text-sm text-text-muted">Sin datos en este rango.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2 w-fit mx-auto">
      <div
        className="flex items-start gap-1"
        role="img"
        aria-label="Heatmap de actividad por día"
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
                  className={`size-5 rounded-[3px] ${LEVEL_CLASSES[cell.level]}`}
                />
              ),
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 text-xs text-text-muted">
        <span>Menos</span>
        {LEVEL_CLASSES.map((className) => (
          <div
            key={className}
            className={`size-3 rounded-[3px] ${className}`}
          />
        ))}
        <span>Más</span>
      </div>
    </div>
  );
}

export default Heatmap;
