import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import HabitForm from "../../habit/components/HabitForm";
import HabitList from "../../habit/components/HabitList";
import TodaySummary from "../components/TodaySummary";
import ConsistencyHeatmap from "../components/ConsistencyHeatmap";
import { useArchiveHabit, useGetHabits } from "../../habit/hooks/useHabits";
import { useEntries } from "../../entry/hooks/useEntries";
import { useAuth } from "../../auth/context/AuthContext";
import { fmtDayKey } from "../../../lib/fmtDayKey";
import { shiftDayKey } from "@habits/shared/dayKey";
import { groupByHabitId } from "../../habit/lib/groupById";
import { calculateStreak } from "../../habit/lib/calculateStreak";
import HabitDetail from "../../habit/components/HabitDetail";
import { Habit } from "@habits/shared/habit";
import { formatDate } from "../../../lib/formDate";
import { Select } from "../../../components/ui/Select";
import { cn } from "../../../lib/cn";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stateModal, setStateModal] = useState<"create" | "edit">("create");
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [habitSelected, setHabitSelected] = useState<Habit | null>();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [all, setAll] = useState<boolean>(false);
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

  // Obtem as categories que existem nos Habits ativos
  const categories = useMemo(
    () => [
      ...new Set(
        (habitData ?? [])
          .filter((h) => h.active)
          .map((h) => h.category)
          .filter(Boolean),
      ),
    ],
    [habitData],
  );

  // Vista Ativos/Arquivados + filtro de categoria (aplicado só na vista ativa)
  const filteredHabits = useMemo(() => {
    const habits = (habitData ?? []).filter((h) =>
      all ? !h.active : h.active,
    );

    return !all && categoryFilter
      ? habits.filter((h) => h.category === categoryFilter)
      : habits;
  }, [habitData, categoryFilter, all]);

  // Heatmap global: só hábitos ativos (arquivados ficam de fora, v1) e o
  // filtro de categoria só se aplica na vista Ativos — mesma lógica do Select,
  // que fica oculto na vista Arquivados.
  const heatmapHabits = useMemo(() => {
    const habits = (habitData ?? []).filter((h) => h.active);

    return !all && categoryFilter
      ? habits.filter((h) => h.category === categoryFilter)
      : habits;
  }, [habitData, categoryFilter, all]);

  const selectHabit = (_id: string) => {
    const habitFinded = habitData?.find((h) => h._id === _id);

    if (habitFinded) {
      setHabitSelected(habitFinded);
      setIsDetailOpen(true);
    }
  };

  const today = fmtDayKey(new Date());

  // Uma única busca com todos os hábitos; a vista Ativos/Arquivados
  // é filtrada no cliente para a troca ser instantânea, sem rede.
  useEffect(() => {
    void habitMutate(true);
  }, []);

  // Ventana en días canónicos: el borde no depende de la zona del navegador.
  // Se recalcula en cada carga para que la vuelta de medianoche no la congele.
  const historyWindow = () => {
    const toDayKey = fmtDayKey(new Date());
    return { fromDayKey: shiftDayKey(toDayKey, -90), toDayKey };
  };

  useEffect(() => {
    void historyEntries.mutate(historyWindow());
  }, []);

  const refreshHistory = () => void historyEntries.mutate(historyWindow());

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
    void habitMutate(true);
  };

  const formProps =
    stateModal === "edit" && habitSelected
      ? ({ state: "edit", habit: habitSelected } as const)
      : ({ state: "create" } as const);

  return (
    <main className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-text-muted border-b border-border/40 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">
              Habits Tracker
            </h1>
            <p className="mt-1">Track your habits, one day at a time.</p>
            <p className="mt-1">{formatDate(today)}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={logout} variant="danger">
              Sair
            </Button>
          </div>
        </header>

        <section>
          <TodaySummary
            habits={all ? [] : filteredHabits}
            entriesByHabit={todayByHabit}
            isPending={historyEntries.isPending}
            error={historyEntries.error}
            onRefresh={refreshHistory}
          />
        </section>

        <section>
          <ConsistencyHeatmap
            habits={heatmapHabits}
            entries={historyEntries.data ?? []}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-text">Meus Hábitos</h2>

              {/* Switch de vista: Ativos / Arquivados */}
              <div className="flex items-center rounded-lg border border-border bg-card p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setAll(false)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    all
                      ? "text-text-muted hover:text-text"
                      : "bg-primary text-white",
                  )}
                >
                  Ativos
                </button>
                <button
                  type="button"
                  onClick={() => setAll(true)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    all
                      ? "bg-primary text-white"
                      : "text-text-muted hover:text-text",
                  )}
                >
                  Arquivados
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!all && categories.length > 0 && (
                <Select
                  className="py-0.5 w-auto text-xs px-2"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  value={categoryFilter}
                >
                  <option key="" value="">
                    Todas
                  </option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              )}

              <span className="text-xs text-text-muted">
                {filteredHabits ? filteredHabits.length : 0}{" "}
                {all ? "arquivados" : "ativos"}
              </span>

              <Button onClick={onCreateHabit} className="shadow-sm">
                + Novo Hábito
              </Button>
            </div>
          </div>

          <HabitList
            habits={filteredHabits}
            todayByHabit={todayByHabit}
            onEntrySaved={refreshHistory}
            streaks={streaks}
            onSelect={selectHabit}
            emptyTitle={
              all
                ? "Ainda não tem nenhum hábito arquivado."
                : undefined
            }
            emptyDescription={
              all
                ? "Os hábitos que arquivar aparecem aqui."
                : undefined
            }
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
          className="max-w-3xl"
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
