import { useEffect, useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import HabitForm from "../../habit/components/HabitForm";
import { Button } from "../../../components/ui/Button";
import HabitList from "../../habit/components/HabitList";
import Heatmap from "../../habit/components/Heatmap";
import { useGetHabits } from "../../habit/hooks/useHabits";
import { useEntries } from "../../entry/hooks/useEntries";
import { buildHeatmap } from "../../entry/lib/buildHeatmap";

const DAYS = 90;

const fmtDayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const { data, error, mutate } = useGetHabits();
  const entries = useEntries();

  useEffect(() => {
    mutate();
  }, []);

  // Auto-selecta el primer hábito para ver su heatmap apenas carga
  useEffect(() => {
    if (!selectedHabitId && data && data.length > 0) {
      setSelectedHabitId(data[0]._id);
    }
  }, [data, selectedHabitId]);

  // Trae las entries del hábito seleccionado en la ventana visible
  useEffect(() => {
    if (!selectedHabitId) return;

    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - DAYS);

    void entries.mutate({ from, to }, selectedHabitId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHabitId]);

  const selectedHabit =
    data?.find((habit) => habit._id === selectedHabitId) ?? null;

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - DAYS);

  const weeks =
    selectedHabit && entries.data
      ? buildHeatmap(
          entries.data,
          selectedHabit.type,
          fmtDayKey(fromDate),
          fmtDayKey(toDate),
        )
      : [];

  return (
    <main className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">
              Habits Tracker
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Track your habits, one day at a time.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto shadow-sm"
          >
            + Nuevo Hábito
          </Button>
        </header>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Criar Hábito"
        >
          <HabitForm onSuccess={() => setIsModalOpen(false)} />
        </Modal>

        {/* Sección del Heatmap del hábito seleccionado */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-text">Heatmap</h2>
          {selectedHabit ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-text-muted">
                {selectedHabit.name} · últimos {DAYS} días
              </p>
              {entries.isPending && (
                <p className="text-sm text-text-muted">
                  Cargando entries...
                </p>
              )}
              {entries.error && (
                <p role="alert" className="text-sm text-red-600">
                  {entries.error}
                </p>
              )}
              {entries.data && <Heatmap weeks={weeks} />}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              Selecciona un hábito para ver su heatmap.
            </p>
          )}
        </section>

        {/* Sección de Hábitos */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text">Mis Hábitos</h2>
            <span className="text-xs text-text-muted">
              {data ? data.length : 0} activos
            </span>
          </div>

          <HabitList data={data ?? []} onSelect={setSelectedHabitId} />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}