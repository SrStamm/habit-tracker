import { useEffect, useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import HabitForm from "../../habit/components/HabitForm";
import { Button } from "../../../components/ui/Button";
import HabitList from "../../habit/components/HabitList";
import { useGetHabits } from "../../habit/hooks/useHabits";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data, error, mutate } = useGetHabits();

  useEffect(() => {
    mutate();
  }, []);

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

        {/* Sección del Heatmap General */}
        {/*TODO: Criar e implementar o Heatmap */}

        {/* Sección de Hábitos */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text">Mis Hábitos</h2>
            <span className="text-xs text-text-muted">
              {data ? data.length : 0} activos
            </span>
          </div>

          <HabitList data={data ?? []} />

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
