import { useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Select } from "../../../components/ui/Select";
import { Habit, HabitType } from "@habits/shared/habit";
import { useCreateHabit } from "../hooks/useHabits";
import { Button } from "../../../components/ui/Button";
import { HABIT_TYPE_LABELS } from "../lib/habitTypeLabels";

type HabitFormProps = {
  onSuccess?: (habit: Habit) => void;
};

function HabitForm({ onSuccess }: HabitFormProps) {
  const [nome, setNome] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<HabitType>(HabitType.BOOLEAN);
  const { error, isPending, mutate } = useCreateHabit();

  const handleCreate = async () => {
    const created = await mutate({ name: nome, description, category, type });
    if (created) onSuccess?.(created);
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreate();
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
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button disabled={isPending}>
        {isPending ? "Criando...." : "Criar"}
      </Button>
    </form>
  );
}

export default HabitForm;
