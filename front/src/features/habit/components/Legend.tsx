import { LEVEL_CLASSES } from "./HeatmapGrid";

function Legend() {
  return (
    <div className="flex items-center gap-1 text-xs text-text-muted">
      <span>Menos</span>
      {LEVEL_CLASSES.map((className) => (
        <div key={className} className={`size-3 rounded-[3px] ${className}`} />
      ))}
      <span>Mais</span>
    </div>
  );
}

export default Legend;
