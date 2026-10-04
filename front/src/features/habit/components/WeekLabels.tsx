function WeekLabels() {
  return (
    <div
      className="grid gap-1 text-[10px] text-text-muted select-none"
      style={{ gridTemplateRows: "repeat(7, 20px)" }}
    >
      <span className="h-5 flex items-center">Seg</span>
      <span className="h-5 flex items-center"></span>
      <span className="h-5 flex items-center">Qua</span>
      <span className="h-5 flex items-center"></span>
      <span className="h-5 flex items-center">Sex</span>
      <span className="h-5 flex items-center"></span>
      <span className="h-5 flex items-center">Dom</span>
    </div>
  );
}

export default WeekLabels;
