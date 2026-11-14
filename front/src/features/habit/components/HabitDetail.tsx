import { Habit, HabitType } from "@habits/shared/habit";
import { Entry } from "@habits/shared/entry";
import { Tag } from "../../../components/ui/Tag";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { buildHeatmap, Cell } from "../../entry/lib/buildHeatmap";
import {
  useHabitEntries,
  useWorkoutRecords,
} from "../../entry/hooks/useEntries";
import { mergeEntries } from "../../entry/lib/mergeEntries";
import { fmtDayKey } from "../../../lib/fmtDayKey";
import { shiftDayKey } from "@habits/shared/dayKey";
import WeekLabels from "./WeekLabels";
import HeatmapGrid from "./HeatmapGrid";
import { HabitTypeBadge } from "./HabitTypeBadge";
import Legend from "./Legend";
import { useEffect, useMemo, useRef, useState } from "react";
import GoalList from "../../goal/components/GoalList";
import { formatDate } from "../../../lib/formDate";
import KpiCard from "./KpiCard";
import EntryForm from "./EntryForm";
import WorkoutRecords from "../../workout/components/WorkoutRecords";

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
  const [dayKey, setDayKey] = useState<string>(todayKey);
  const [showEntryForm, setShowEntryForm] = useState(false);
  // Se incrementa al guardar una entry para que GoalList vuelva a pedir
  // el progreso (sus goals no cambian de identidad).
  const [refreshKey, setRefreshKey] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuOpenRef = useRef(menuOpen);

  const rangeEntries = useHabitEntries(habit._id, days);
  // Sin condicionales: rules of hooks. Solo fetch activo si es WORKOUT.
  const records = useWorkoutRecords(
    habit._id,
    habit.type === HabitType.WORKOUT,
  );

  const entriesInRange = useMemo(
    () => mergeEntries(entries, rangeEntries.data ?? []),
    [entries, rangeEntries.data],
  );

  const desdeKey = shiftDayKey(todayKey, -days);

  const weeks = buildHeatmap(
    entriesInRange,
    habit.type,
    desdeKey,
    todayKey,
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
    const inRange = entriesInRange.filter(
      (e) => e.dayKey >= desdeKey && e.dayKey <= todayKey,
    );

    if (habit.type === HabitType.BOOLEAN) {
      return inRange.filter((e) => e.completed === true).length;
    }

    if (habit.type === HabitType.WORKOUT) {
      return inRange.filter((e) => (e.workout?.length ?? 0) > 0).length;
    }

    if (habit.type === HabitType.LECTURE) {
      return inRange.filter((e) => (e.lecture?.length ?? 0) > 0).length;
    }

    return inRange.reduce((sum, e) => sum + (e.value ?? 0), 0);
  }, [entriesInRange, desdeKey, todayKey, habit.type]);

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
  };

  const onCellSelect = (cell: Cell) => {
    setSelectedDate(cell.date);
    syncDay(cell.date);
    setShowEntryForm(true);
  };

  const handleEntrySaved = () => {
    rangeEntries.refetch();
    records.refetch(); // no-op si el hábito no es WORKOUT (enabled=false)
    setRefreshKey((k) => k + 1);
    onEntrySaved?.();
  };

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

          {habit.active && (
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
          )}
        </div>

        {/* Tarjetas de Métricas (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <KpiCard
            label="Racha actual"
            value={
              <>
                {streak && streak > 0 ? "🔥" : "💤"} {streak ?? 0}{" "}
                {streak === 1 ? "día" : "días"}
              </>
            }
            valueClassName="text-amber-500 flex items-center gap-1.5"
          />

          {/* Objetivo / Meta */}
          <KpiCard
            label="Meta diaria"
            value={
              habit.target ? `${habit.target} ${habit.unit ?? ""}` : "Sin meta"
            }
          />

          {/* Total del Período (últimos N días del selector del heatmap) */}
          <KpiCard
            label="Total do Período"
            value={
              habit.type === HabitType.BOOLEAN
                ? `${periodTotal} ${periodTotal === 1 ? "dia" : "dias"}`
                : `${periodTotal} ${habit.unit ?? ""}`.trim()
            }
            valueClassName="text-primary"
          />
        </div>
      </div>

      {/*
      # Visualización de Consistencia
      - Heatmap interactivo: rango seleccionado (hasta 365 días).
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

        {/* p-2 (no solo pb-2): overflow-x fuerza overflow-y a auto y recortaría
            el ring de hover de la primera fila. */}
        <div className="overflow-x-auto p-2">
          <div className="flex gap-2 w-fit mx-auto mb-2">
            <WeekLabels />

            <HeatmapGrid weeks={weeks} onCellSelect={onCellSelect} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
          <Legend />

          {selectedDate && (
            <div className="text-right text-text">
              <span className="font-medium">{formatDate(selectedDate)}: </span>
              <span className="text-primary font-semibold">
                {selectedLabel}
              </span>
            </div>
          )}
        </div>

        {rangeEntries.error && (
          <p role="alert" className="text-center text-xs text-red-600">
            {rangeEntries.error}
          </p>
        )}
      </div>

      {habit.type === HabitType.WORKOUT && (
        <WorkoutRecords
          records={records.data ?? []}
          isPending={records.isPending}
          error={records.error}
          unit={habit.unit ?? undefined}
        />
      )}

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
        <EntryForm
          habit={habit}
          entries={entriesInRange}
          dayKey={dayKey}
          setDayKey={setDayKey}
          todayKey={todayKey}
          showEntryForm={showEntryForm}
          setShowEntryForm={setShowEntryForm}
          onEntrySaved={handleEntrySaved}
        />
      </div>

      <GoalList
        habitId={habit._id}
        habitType={habit.type}
        unit={habit.unit}
        refreshKey={refreshKey}
      />
    </div>
  );
}

export default HabitDetail;
