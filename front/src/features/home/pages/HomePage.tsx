import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import HabitForm from "../../habit/components/HabitForm";
import HabitList from "../../habit/components/HabitList";
import TodaySummary from "../components/TodaySummary";
import { useGetHabits } from "../../habit/hooks/useHabits";
import { useEntries } from "../../entry/hooks/useEntries";
import { useAuth } from "../../auth/context/AuthContext";
import { fmtDayKey } from "../../../lib/fmtDayKey";
import { groupByHabitId } from "../../habit/lib/groupById";
import { calculateStreak } from "../../habit/lib/calculateStreak";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data, error, mutate } = useGetHabits();
  const todayEntries = useEntries();

  const today = fmtDayKey(new Date());

  const { logout } = useAuth();

  useEffect(() => {
    mutate();
  }, []);

  useEffect(() => {
    void todayEntries.mutate({ from: new Date(), to: new Date() });
  }, []);

  const refreshToday = () =>
    void todayEntries.mutate({ from: new Date(), to: new Date() });

  const todayByHabit = useMemo(
    () => new Map((todayEntries.data ?? []).map((e) => [e.habitId, e])),
    [todayEntries.data],
  );

  const hace90d = new Date();
  hace90d.setDate(hace90d.getDate() - 90);

  const historyEntries = useEntries();
  useEffect(() => {
    void historyEntries.mutate({ from: hace90d, to: new Date() });
  }, []);

  const historyByHabit = useMemo(
    () => groupByHabitId(historyEntries.data ?? []),
    [historyEntries.data],
  );

  const streaks = useMemo(() => {
    if (data === null || historyEntries.data === null) return undefined;
    return new Map(
      data.map((h) => [
        h._id,
        calculateStreak(h, historyByHabit.get(h._id) ?? []),
      ]),
    );
  }, [historyByHabit, data, historyEntries.data]);

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
              onClick={() => setIsModalOpen(true)}
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
            habits={data ?? []}
            entriesByHabit={todayByHabit}
            isPending={todayEntries.isPending}
            error={todayEntries.error}
            onRefresh={refreshToday}
          />
        </section>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Criar Hábito"
        >
          <HabitForm onSuccess={() => setIsModalOpen(false)} />
        </Modal>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text">Meus Hábitos</h2>
            <span className="text-xs text-text-muted">
              {data ? data.length : 0} ativos
            </span>
          </div>

          <HabitList
            habits={data ?? []}
            todayByHabit={todayByHabit}
            onEntrySaved={() => refreshToday()}
            streaks={streaks}
          />

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
