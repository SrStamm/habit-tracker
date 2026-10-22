import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";

interface Props {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

function KpiCard({ label, value, valueClassName }: Props) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <span className={cn("text-lg font-bold text-text", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

export default KpiCard;
