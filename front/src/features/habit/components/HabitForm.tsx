import { useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Select } from "../../../components/ui/Select";
import {
  CreateHabitDTO,
  DurationOptions,
  Habit,
  HabitType,
} from "@habits/shared/habit";
import { useCreateHabit, useUpdateHabit } from "../hooks/useHabits";
import { Button } from "../../../components/ui/Button";
import { HABIT_TYPE_LABELS } from "../lib/habitTypeLabels";
import { DURATION_OPTIONS_LABELS } from "../lib/durationOptionsLabels";

type HabitFormProps = {
  onSuccess?: (habit: Habit) => void;
} & ({ state: "create"; habit?: undefined } | { state: "edit"; habit: Habit });

function HabitForm({ onSuccess, state, habit }: HabitFormProps) {
  const [nome, setNome] = useState(() => habit?.name ?? "");
  const [description, setDescription] = useState(
    () => habit?.description ?? "",
  );
  const [category, setCategory] = useState(() => habit?.category ?? "");
  const [type, setType] = useState(() => habit?.type ?? HabitType.BOOLEAN);
  const [target, setTarget] = useState(() => habit?.target ?? "");
  const [unit, setUnit] = useState(() => habit?.unit ?? "");

  const { error, isPending, mutate } = useCreateHabit();
  const {
    error: updateError,
    isPending: updateIsPending,
    mutate: updateMutate,
  } = useUpdateHabit();

  const activeError = state === "edit" ? updateError : error;
  const activeIsPending = state === "edit" ? updateIsPending : isPending;

  const handleSubmit = async () => {
    const measurableTarget = type === HabitType.BOOLEAN ? undefined : target;

    const payload: CreateHabitDTO = {
      name: nome,
      description,
      category,
      type,
      ...(typeof measurableTarget === "number"
        ? { target: measurableTarget }
        : {}),
      ...(type !== HabitType.BOOLEAN && unit ? { unit } : {}),
    };

    const saved =
      state === "edit"
        ? await updateMutate(habit._id, payload) // CreateHabitDTO es asignable a UpdateHabitDTO
        : await mutate(payload);

    if (saved) onSuccess?.(saved);
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Label htmlFor="nome">Nome:</Label>
      <Input
        id="nome"
        type="text"
        required
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <Label htmlFor="description">Descripção:</Label>
      <Input
        id="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Label htmlFor="category">Categoria:</Label>
      <Input
        id="category"
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Label htmlFor="type">Tipo:</Label>
      <Select
        id="type"
        required
        value={type}
        onChange={(e) => setType(e.target.value as HabitType)}
      >
        {Object.values(HabitType).map((habitType) => (
          <option key={habitType} value={habitType}>
            {HABIT_TYPE_LABELS[habitType]}
          </option>
        ))}
      </Select>

      {type !== HabitType.BOOLEAN && (
        <>
          <Label htmlFor="target">Meta:</Label>
          <Input
            id="target"
            type="number"
            min={1}
            value={target}
            onChange={(e) => setTarget(e.target.valueAsNumber || "")}
          />

          {type === HabitType.DURATION ? (
            <>
              <Label htmlFor="unit">Unidade de medida:</Label>
              <Select
                id="unit"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value as DurationOptions)}
              >
                {Object.values(DurationOptions).map((durationOptions) => (
                  <option key={durationOptions} value={durationOptions}>
                    {DURATION_OPTIONS_LABELS[durationOptions]}
                  </option>
                ))}
              </Select>
            </>
          ) : (
            <>
              <Label htmlFor="unit">Unidade de medida:</Label>
              <Input
                id="unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </>
          )}
        </>
      )}

      {activeError ? (
        <p role="alert" className="text-sm text-red-600">
          {activeError}
        </p>
      ) : null}

      <Button disabled={activeIsPending}>
        {state === "create"
          ? activeIsPending
            ? "Criando...."
            : "Criar"
          : activeIsPending
            ? "Atualizando..."
            : "Atualizar"}
      </Button>
    </form>
  );
}

export default HabitForm;
