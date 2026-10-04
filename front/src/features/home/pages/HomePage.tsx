import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import HabitForm from "../../habit/components/HabitForm";
import HabitList from "../../habit/components/HabitList";
import TodaySummary from "../components/TodaySummary";
import { useArchiveHabit, useGetHabits } from "../../habit/hooks/useHabits";
import { useEntries } from "../../entry/hooks/useEntries";
import { useAuth } from "../../auth/context/AuthContext";
import { fmtDayKey } from "../../../lib/fmtDayKey";
import { groupByHabitId } from "../../habit/lib/groupById";
import { calculateStreak } from "../../habit/lib/calculateStreak";
import HabitDetail from "../../habit/components/HabitDetail";
import { Habit } from "@habits/shared/habit";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stateModal, setStateModal] = useState<"create" | "edit">("create");
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [habitSelected, setHabitSelected] = useState<Habit | null>();
  const {
    data: habitData,
    error,
    mutate: habitMutate,
    removeLocal,
  } = useGetHabits();
  const historyEntries = useEntries();
  const { logout } = useAuth();
  const { isPending: isArchivePending, mutate: archiveMutate } =
    useArchiveHabit();

  const selectHabit = (_id: string) => {
    const habitFinded = habitData?.find((h) => h._id === _id);

    if (habitFinded) {
      setHabitSelected(habitFinded);
      setIsDetailOpen(true);
    }
  };

  const today = fmtDayKey(new Date());

  useEffect(() => {
    habitMutate();
  }, []);

  const hace90d = new Date();
  hace90d.setDate(hace90d.getDate() - 90);

  useEffect(() => {
    void historyEntries.mutate({ from: hace90d, to: new Date() });
  }, []);

  const refreshHistory = () =>
    void historyEntries.mutate({ from: hace90d, to: new Date() });

  const todayByHabit = useMemo(
    () =>
      new Map(
        (historyEntries.data ?? [])
          .filter((e) => e.dayKey === today)
          .map((e) => [e.habitId, e]),
      ),
    [historyEntries.data],
  );

  const historyByHabit = useMemo(
    () => groupByHabitId(historyEntries.data ?? []),
    [historyEntries.data],
  );

  const streaks = useMemo(() => {
    if (habitData === null || historyEntries.data === null) return undefined;
    return new Map(
      habitData.map((h) => [
        h._id,
        calculateStreak(h, historyByHabit.get(h._id) ?? []),
      ]),
    );
  }, [historyByHabit, habitData, historyEntries.data]);

  const onArchive = async (habitId: string) => {
    if (isArchivePending) return;

    const ok = await archiveMutate({ habitId });
    if (!ok) return;

    setHabitSelected(null);
    setIsDetailOpen(false);
    removeLocal(habitId);
  };

  const onCreateHabit = () => {
    setIsDetailOpen(false);
    setIsModalOpen(true);
    setStateModal("create");
  };

  const onEditHabit = (habit: Habit) => {
    setIsDetailOpen(false);
    setIsModalOpen(true);
    setStateModal("edit");
    setHabitSelected(habit);
  };

  const onSuccess = () => {
    setIsModalOpen(false);
    habitMutate();
  };

  const formProps =
    stateModal === "edit" && habitSelected
      ? ({ state: "edit", habit: habitSelected } as const)
      : ({ state: "create" } as const);

  return (
    <main className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between  gap-4 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">
              Habits Tracker
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Track your habits, one day at a time.
            </p>
            <p>{today}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onCreateHabit}
              className="self-start sm:self-auto shadow-sm"
            >
              + Novo Hábito
            </Button>

            <Button
              onClick={logout}
              className="self-start sm:self-auto"
              variant="danger"
            >
              Sair
            </Button>
          </div>
        </header>

        <section>
          <TodaySummary
            habits={habitData ?? []}
            entriesByHabit={todayByHabit}
            isPending={historyEntries.isPending}
            error={historyEntries.error}
            onRefresh={refreshHistory}
          />
        </section>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={stateModal === "create" ? "Criar Hábito" : "Atualizar Hábito"}
        >
          <HabitForm {...formProps} onSuccess={onSuccess} />
        </Modal>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text">Meus Hábitos</h2>
            <span className="text-xs text-text-muted">
              {habitData ? habitData.length : 0} ativos
            </span>
          </div>

          <HabitList
            habits={habitData ?? []}
            todayByHabit={todayByHabit}
            onEntrySaved={refreshHistory}
            streaks={streaks}
            onSelect={selectHabit}
          />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </section>
      </div>

      {habitSelected ? (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
          }}
        >
          <HabitDetail
            habit={habitSelected}
            streak={streaks?.get(habitSelected._id)}
            entries={historyByHabit.get(habitSelected._id) ?? []}
            onEntrySaved={refreshHistory}
            onArchive={onArchive}
            onEdit={onEditHabit}
          />
        </Modal>
      ) : (
        ""
      )}
    </main>
  );
}
