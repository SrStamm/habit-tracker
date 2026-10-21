import { DurationOptions, Habit, HabitType } from "@habits/shared/habit";
import { Entry } from "@habits/shared/entry";
import { Tag } from "../../../components/ui/Tag";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { buildHeatmap, Cell } from "../../entry/lib/buildHeatmap";
import { fmtDayKey } from "../../../lib/fmtDayKey";
import WeekLabels from "./WeekLabels";
import HeatmapGrid from "./HeatmapGrid";
import { HabitTypeBadge } from "./HabitTypeBadge";
import Legend from "./Legend";
import { DURATION_OPTIONS_LABELS } from "../lib/durationOptionsLabels";
import { useCreateEntry } from "../../entry/hooks/useEntries";
import { useEffect, useMemo, useRef, useState } from "react";
import GoalList from "../../goal/components/GoalList";
import { cn } from "../../../lib/cn";

type Props = {
  habit: Habit;
  entries: Entry[];
  streak?: number;
  onEntrySaved?: () => void;
  onArchive: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
};

function HabitDetail({
  habit,
  streak,
  entries,
  onEntrySaved,
  onArchive,
  onEdit,
}: Props) {
  const todayKey = fmtDayKey(new Date());

  const [selectedDate, setSelectedDate] = useState<string>();
  const [days, setDays] = useState<number>(90);
  const [value, setValue] = useState<number | "">("");
  const [dayKey, setDayKey] = useState<string>(todayKey);
  const [completed, setCompleted] = useState<boolean>(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuOpenRef = useRef(menuOpen);
  const { isPending, error: errorCreate, mutate } = useCreateEntry();

  const today = new Date();
  const hace90d = new Date();
  hace90d.setDate(hace90d.getDate() - days);

  const weeks = buildHeatmap(
    entries,
    habit.type,
    fmtDayKey(hace90d),
    fmtDayKey(today),
    undefined,
    habit.unit ?? undefined,
  );

  const selectedLabel = weeks
    .flat()
    .find((c) => c?.date === selectedDate)?.label;

  // Total del período: recorte de entries según el rango del heatmap.
  // BOOLEAN cuenta días cumplidos; QUANTITY/DURATION suman value en la
  // unidad cruda del hábito (no hay conversión en el front).
  const periodTotal = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const cutoff = fmtDayKey(start);
    const inRange = entries.filter(
      (e) => e.dayKey >= cutoff && e.dayKey <= todayKey,
    );

    if (habit.type === HabitType.BOOLEAN) {
      return inRange.filter((e) => e.completed === true).length;
    }

    return inRange.reduce((sum, e) => sum + (e.value ?? 0), 0);
  }, [entries, days, habit.type, todayKey]);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!menuOpenRef.current) return;
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!menuOpenRef.current) return;
      if (e.key !== "Escape") return;

      e.preventDefault();
      e.stopImmediatePropagation();
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const syncDay = (next: string) => {
    if (!next || next > todayKey) return;
    setDayKey(next);
    const found = entries.find((e) => e.dayKey === next);
    setValue(found?.value ?? "");
    setCompleted(found?.completed ?? false);
  };

  const onCellSelect = (cell: Cell) => {
    setSelectedDate(cell.date);
    syncDay(cell.date);
    setShowEntryForm(true);
  };

  const handleSubmit = async () => {
    if (habit.type === HabitType.BOOLEAN) {
      const saved = await mutate({ completed: !completed, dayKey }, habit._id);

      if (saved) {
        setCompleted(saved.completed ?? false);
        setShowEntryForm(false);
        onEntrySaved?.();
      }
    } else {
      if (value === "" || Number.isNaN(value)) return;

      const created = await mutate({ value, dayKey }, habit._id);

      if (created) {
        setCompleted(true);
        setShowEntryForm(false);
        onEntrySaved?.();
      }
    }
  };

  const isToday = dayKey === todayKey;
  const entryUnitLabel =
    habit.type === HabitType.DURATION && habit.unit
      ? DURATION_OPTIONS_LABELS[habit.unit as DurationOptions]
      : (habit.unit ?? "");

  return (
    <div>
      {/*
      # Encabezado y Contexto
      - Información identitaria: Nombre, categoría y tipo
      - Meta u objetivo configurado
      - Métricas rápidas:
        # TODO: Racha actual vs Mejor racha histórica
        # TODO: Porcentaje global de cumplimiento (ej: 78% en los últimos 3 meses)
    */}

      <div className="flex flex-col gap-6 p-6 bg-white border-b border-slate-200">
        {/* Header: Metadata + Título */}
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <HabitTypeBadge type={habit.type} />
              {habit.category && (
                <Tag
                  className="border-slate-200 text-slate-500"
                  variant="outline"
                >
                  {habit.category}
                </Tag>
              )}
            </div>

            <h2 className="text-2xl font-bold text-text">{habit.name}</h2>

            {habit.target && (
              <p className="text-xs text-slate-500">
                Meta:{" "}
                <span className="font-medium text-text">
                  {habit.target} {habit.unit ?? ""}
                </span>
              </p>
            )}
          </div>

          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="rounded-lg px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
            >
              ⋯
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 z-10 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(habit);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                >
                  Editar
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onArchive(habit._id);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-red-50"
                >
                  Arquivar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tarjetas de Métricas (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Racha Actual
            </span>
            <span className="text-lg font-bold text-amber-500 flex items-center gap-1.5">
              <span>{streak && streak > 0 ? "🔥" : "💤"}</span>
              <span>
                {streak ?? 0} {streak === 1 ? "día" : "días"}
              </span>
            </span>
          </div>

          {/* Objetivo / Meta */}
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Meta Diaria
            </span>
            <span className="text-lg font-bold text-text">
              {habit.target
                ? `${habit.target} ${habit.unit ?? ""}`
                : "Sin meta"}
            </span>
          </div>

          {/* Total del Período (últimos N días del selector del heatmap) */}
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total do Período
            </span>
            <span className="text-lg font-bold text-primary">
              {habit.type === HabitType.BOOLEAN
                ? `${periodTotal} ${periodTotal === 1 ? "dia" : "dias"}`
                : `${periodTotal} ${habit.unit ?? ""}`.trim()}
            </span>
          </div>
        </div>
      </div>

      {/*
      # Visualización de Consistencia
      - Heatmap interactivo: últimos 90 días.
      - Tooltip al hacer hover/click en un día: ver fecha exacta y valor registrado
      */}

      <div className="flex flex-col gap-3 p-6 border-b border-slate-200">
        <div className="flex flex-row items-center gap-2 justify-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Histórico de Actividade
          </span>
          <Select
            className="py-0.5 w-auto text-xs px-2"
            onChange={(e) => setDays(Number(e.target.value))}
            value={days}
          >
            <option value={7}>1 semana</option>
            <option value={15}>15 días</option>
            <option value={30}>1 mês</option>
            <option value={90}>3 meses</option>
            <option value={180}>6 meses</option>
            <option value={270}>9 meses</option>
            <option value={365}>12 meses</option>
          </Select>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 w-fit mx-auto mb-2">
            <WeekLabels />

            <HeatmapGrid weeks={weeks} onCellSelect={onCellSelect} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
          <Legend />

          {selectedDate && (
            <div className="text-right text-text">
              <span className="font-medium">{selectedDate}: </span>
              <span className="text-primary font-semibold">
                {selectedLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Entrada
          </span>

          {!showEntryForm && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              type="button"
              onClick={() => setShowEntryForm(true)}
            >
              Registrar / Modificar data
            </Button>
          )}
        </div>

        {/* Colapsable: CSS only, sin librería */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            showEntryForm ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "pt-4 transition-opacity duration-200",
                showEntryForm ? "opacity-100" : "opacity-0",
              )}
            >
              <form
                id="form-entry"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex flex-wrap items-end gap-3"
              >
                {/* Data */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="entry-date"
                    className="text-xs text-slate-500"
                  >
                    Data
                  </Label>
                  <Input
                    id="entry-date"
                    type="date"
                    max={todayKey}
                    value={dayKey}
                    onChange={(e) => {
                      if (e.target.value > todayKey) return;
                      setDayKey(e.target.value);
                      syncDay(e.target.value);
                    }}
                    className="px-2 py-1.5 text-sm"
                  />
                </div>

                {/* Valor + Unidade — solo QUANTITY / DURATION */}
                {habit.type !== HabitType.BOOLEAN && (
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="entry-value"
                      className="text-xs text-slate-500"
                    >
                      Valor
                    </Label>
                    <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                      <Input
                        id="entry-value"
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={value}
                        onChange={(e) =>
                          setValue(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="w-24 border-0 rounded-none px-2 py-1.5 text-sm focus:ring-0"
                      />
                      <span className="flex items-center border-l border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">
                        {entryUnitLabel}
                      </span>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={isPending}
                    onClick={() => setShowEntryForm(false)}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    className="text-xs"
                    disabled={
                      isPending ||
                      (habit.type !== HabitType.BOOLEAN &&
                        (value === "" || Number.isNaN(value)))
                    }
                  >
                    {isPending
                      ? "Salvando..."
                      : habit.type === HabitType.BOOLEAN
                        ? completed
                          ? "Desmarcar"
                          : isToday
                            ? "Marcar hoje"
                            : "Marcar"
                        : "Salvar"}
                  </Button>
                </div>
              </form>

              {errorCreate && (
                <p role="alert" className="mt-2 text-xs text-red-600">
                  {errorCreate}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <GoalList habitId={habit._id} habitType={habit.type} unit={habit.unit} />
    </div>
  );
}

export default HabitDetail;
