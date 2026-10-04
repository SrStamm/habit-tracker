import { DurationOptions, Habit, HabitType } from "@habits/shared/habit";
import { Entry } from "@habits/shared/entry";
import { Tag } from "../../../components/ui/Tag";
import { Button } from "../../../components/ui/Button";
import { buildHeatmap, Cell } from "../../entry/lib/buildHeatmap";
import { fmtDayKey } from "../../../lib/fmtDayKey";
import WeekLabels from "./WeekLabels";
import HeatmapGrid from "./HeatmapGrid";
import Legend from "./Legend";
import { HABIT_TYPE_LABELS } from "../lib/habitTypeLabels";
import { useState } from "react";
import { Select } from "../../../components/ui/Select";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { DURATION_OPTIONS_LABELS } from "../lib/durationOptionsLabels";
import { useCreateEntry } from "../../entry/hooks/useEntries";

type Props = {
  habit: Habit;
  entries: Entry[];
  streak?: number;
  onEntrySaved?: () => void;
  onArchive: (habitId: string) => void;
};

function HabitDetail({
  habit,
  streak,
  entries,
  onEntrySaved,
  onArchive,
}: Props) {
  const todayKey = fmtDayKey(new Date());

  const [selectedDate, setSelectedDate] = useState<string>();
  const [days, setDays] = useState<number>(90);
  const [value, setValue] = useState<number | "">("");
  const [dayKey, setDayKey] = useState<string>(todayKey);
  const [completed, setCompleted] = useState<boolean>(false);
  const { isPending, mutate } = useCreateEntry();

  const today = new Date();
  const hace90d = new Date();
  hace90d.setDate(hace90d.getDate() - days);

  const weeks = buildHeatmap(
    entries,
    habit.type,
    fmtDayKey(hace90d),
    fmtDayKey(today),
  );

  const selectedLabel = weeks
    .flat()
    .find((c) => c?.date === selectedDate)?.label;

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
  };

  const handleSubmit = async () => {
    if (habit.type === HabitType.BOOLEAN) {
      const saved = await mutate({ completed: !completed, dayKey }, habit._id);

      if (saved) {
        setCompleted(saved.completed ?? false);
        onEntrySaved?.();
      }
    } else {
      if (value === "" || Number.isNaN(value)) return;

      const created = await mutate({ value, dayKey }, habit._id);

      if (created) {
        setCompleted(true);
        onEntrySaved?.();
      }
    }
  };

  return (
    <div>
      {/*
      # Encabezado y Contexto
      - Información identitaria: Nombre, categoría y tipo
      - Meta u objetivo configurado
      - Métricas rápidas:
        - Racha actual vs Mejor racha histórica
        - Porcentaje global de cumplimiento (ej: 78% en los últimos 3 meses)
    */}

      <div className="flex flex-col gap-6 p-6 bg-card border-b border-border/40">
        {/* Header: Metadata + Título */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag>{HABIT_TYPE_LABELS[habit.type]}</Tag>
            {habit.category && <Tag variant="outline">{habit.category}</Tag>}
          </div>

          <h2 className="text-2xl font-bold text-text">{habit.name}</h2>

          {habit.target && (
            <p className="text-xs text-text-muted">
              Objetivo:{" "}
              <span className="font-medium text-text">
                {habit.target} {habit.unit ?? ""}
              </span>
            </p>
          )}
        </div>

        {/* Tarjetas de Métricas (KPIs) */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Racha Actual */}
          <div className="flex flex-col gap-1 rounded-xl border border-border/40 bg-background p-3.5">
            <span className="text-xs text-text-muted font-medium">
              Racha Actual
            </span>
            <span className="text-xl font-bold text-amber-500 flex items-center gap-1.5">
              <span>{streak && streak > 0 ? "🔥" : "💤"}</span>
              <span>
                {streak ?? 0} {streak === 1 ? "día" : "días"}
              </span>
            </span>
          </div>

          {/* Objetivo / Meta */}
          <div className="flex flex-col gap-1 rounded-xl border border-border/40 bg-background p-3.5">
            <span className="text-xs text-text-muted font-medium">
              Meta Diaria
            </span>
            <span className="text-xl font-bold text-text">
              {habit.target
                ? `${habit.target} ${habit.unit ?? ""}`
                : "Sin meta"}
            </span>
          </div>
        </div>
      </div>

      {/*
      # Visualización de Consistencia
      - Heatmap interactivo: últimos 90 días.
      - Tooltip al hacer hover/click en un día: ver fecha exacta y valor registrado
      */}

      <div className="flex flex-col gap-3 p-6 border-b border-border/40">
        <div className="flex flex-row items-center gap-2 justify-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
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

        <div className="flex items-center justify-between text-xs text-text-muted mt-1">
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

      {/*
      # Registro histórico e Edición retroactiva
      - Selector de fecha: Permite elegir cualquier día del pasado
      - Formulario de ajuste manual: un control para cargar o corregir
        la entrada de esa fecha seleccionada (marcar/desmarcar o cambiar cantidad)
      - Histórico reciente (Lista de entradas): Una pequeña lista de los últimos
        días con registros para poder modificar un valor rápido si cometió un error.
      */}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-row items-center justify-center gap-2"
      >
        <Label htmlFor="modificar-value">Modificar data:</Label>

        <Input
          type="date"
          max={todayKey}
          value={dayKey}
          onChange={(e) => {
            if (e.target.value > todayKey) return; // el back no valida, acá sí
            setDayKey(e.target.value);
            syncDay(e.target.value);
          }}
        />

        {habit.type === HabitType.BOOLEAN ? (
          <Button
            size="sm"
            variant={completed ? "primary" : "outline"}
            disabled={isPending}
            className="text-xs"
            type="submit"
          >
            {completed ? "✓ Cumprido" : "Marcar hoje"}
          </Button>
        ) : (
          <>
            <Input
              type="number"
              placeholder={
                habit.type === HabitType.DURATION && habit.unit
                  ? DURATION_OPTIONS_LABELS[habit.unit as DurationOptions]
                  : habit.unit
              }
              value={value}
              onChange={(e) => setValue(e.target.valueAsNumber || "")}
              className="w-24 px-2 py-1 text-xs bg-background"
            />

            <Button size="sm" type="submit" disabled={!value}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </>
        )}
      </form>

      {/*
      # Configuración y Acciones
      - Editar hábito: Botón para abrir el formulario de edición de nombre, meta o categoría
      - Archivar: Dejar de mostrar el hábito en la lista activa.
      */}

      <div className="flex flex-row justify-center gap-3 p-3 border-a border-border/40">
        <Button>Editar</Button>
        <Button
          variant="danger"
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            onArchive(habit._id);
          }}
        >
          Arquivar
        </Button>
      </div>
    </div>
  );
}

export default HabitDetail;
