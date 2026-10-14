import { describe, it, expect, vi, beforeEach } from "vitest";

// Cria um mock para todas as funcoes usadas no service
const m = vi.hoisted(() => {
  const save = vi.fn();
  const habitCtor = vi.fn().mockImplementation(function (data: any) {
    return {
      ...data,
      save,
    };
  });
  return {
    save,
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
    habitCtor,
  };
});

// Mock do modelo Habit
vi.mock("../../models/Habit", () => {
  Object.assign(m.habitCtor, {
    find: m.find,
    findOneAndUpdate: m.findOneAndUpdate,
  });
  return { default: m.habitCtor };
});

// Importa as funcoes DEPOIS de mockear as funcoes

import {
  createHabit,
  findAllHabits,
  updateHabit,
  findAllActiveHabits,
  archiveHabit,
} from "./habit.service";
import {
  CreateHabitDTO,
  HabitType,
  UpdateHabitDTO,
} from "@habits/shared/habit";

describe("createHabit", () => {
  it("arma { userId, active: true, ...data } e persiste", async () => {
    const data: CreateHabitDTO = { name: "test", type: HabitType.BOOLEAN };
    const saved = { _id: "h1", ...data, active: true };
    m.save.mockResolvedValue(saved);

    const result = await createHabit("u1", data);

    // Valida que tenha sido chamado com os dados corretos (aqui é 'active: true')
    expect(m.habitCtor).toHaveBeenCalledWith({
      userId: "u1",
      active: true,
      name: "test",
      type: HabitType.BOOLEAN,
    });

    // Valida que tenha persistido a info só uma vez
    expect(m.save).toHaveBeenCalledTimes(1);

    // Valida que o result seja igual ao 'save()'
    expect(result).toBe(saved);
  });
});

describe("updateHabit", () => {
  // Limpa os mocks dos testes
  beforeEach(() => vi.clearAllMocks());

  it("retorna null se o hábito não for encontrado", async () => {
    const data: UpdateHabitDTO = { name: "test" };

    // Configura o mock para que retorne null
    m.findOneAndUpdate.mockResolvedValue(null);

    const result = await updateHabit("h1", "u1", data);

    // Valida que a chamada use a query esperada
    expect(m.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: "h1",
        userId: "u1",
      },
      {
        $set: {
          name: "test",
        },
      },
      {
        returnDocument: "after",
      },
    );

    // Valida que o resultado seja null
    expect(result).toBeNull();
  });

  it("se 'target' é null -> '$unset'", async () => {
    const data: UpdateHabitDTO = { target: null };
    const saved = {
      ...data,
      _id: "h1",
      userId: "u1",
      target: 1,
    };
    m.findOneAndUpdate.mockResolvedValue(saved);

    const result = await updateHabit("h1", "u1", data);

    expect(m.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: "h1",
        userId: "u1",
      },
      {
        $unset: {
          target: 1,
        },
      },
      {
        returnDocument: "after",
      },
    );

    expect(result).toBe(saved);
  });

  it("se 'target: 5' -> '$set: { target: 5}'", async () => {
    const data: UpdateHabitDTO = { target: 5 };
    const saved = {
      ...data,
      _id: "h1",
      userId: "u1",
      target: 5,
    };
    m.findOneAndUpdate.mockResolvedValue(saved);

    const result = await updateHabit("h1", "u1", data);

    expect(m.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: "h1",
        userId: "u1",
      },
      {
        $set: {
          target: 5,
        },
      },
      {
        returnDocument: "after",
      },
    );

    expect(result).toBe(saved);
  });

  it("campos com 'undefined' -> ignora-los e não modifica-los", async () => {
    const data: UpdateHabitDTO = { target: 5, name: undefined };
    const saved = {
      ...data,
      _id: "h1",
      userId: "u1",
      target: 5,
    };
    m.findOneAndUpdate.mockResolvedValue(saved);

    const result = await updateHabit("h1", "u1", data);

    const [, update] = m.findOneAndUpdate.mock.calls[0];
    expect(update).toStrictEqual({ $set: { target: 5 } });

    expect(result).toBe(saved);
  });

  it("body vacio -> chama findOneAndUpdate com update = {} (sem $set/$unset)", async () => {
    const data: UpdateHabitDTO = {};
    const saved = {
      ...data,
      _id: "h1",
      userId: "u1",
    };
    m.findOneAndUpdate.mockResolvedValue(saved);

    const result = await updateHabit("h1", "u1", data);

    expect(m.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: "h1",
        userId: "u1",
      },
      {},
      {
        returnDocument: "after",
      },
    );

    expect(result).toBe(saved);
  });
});

describe("findAllHabits", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Retorna um array de Habits com userId", async () => {
    const data = [{ _id: "h1", userId: "u1" }];
    m.find.mockResolvedValue(data);

    const result = await findAllHabits("u1");

    expect(m.find).toHaveBeenCalledWith({ userId: "u1" });
    expect(result).toBe(data);
  });

  it("Retorna um array vacio", async () => {
    m.find.mockResolvedValue([]);

    const result = await findAllHabits("ID_falso");

    expect(m.find).toHaveBeenCalledWith({ userId: "ID_falso" });
    expect(result).toStrictEqual([]);
  });
});

describe("findAllActiveHabits", () => {
  beforeEach(() => vi.clearAllMocks());

  it("procura com userId e 'active: true'", async () => {
    const data = [{ _id: "h1", userId: "u1", active: true }];
    m.find.mockResolvedValue(data);

    const result = await findAllActiveHabits("u1");

    expect(m.find).toHaveBeenCalledWith({ userId: "u1", active: true });
    expect(result).toBe(data);
  });
});

describe("archiveHabit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("arquiva o Habit de forma correta", async () => {
    const data = { _id: "h1", userId: "u1", active: false };
    m.findOneAndUpdate.mockResolvedValue(data);

    await archiveHabit("h1", "u1");

    const [, update] = m.findOneAndUpdate.mock.calls[0];
    expect(update).toStrictEqual({ $set: { active: false } });
  });
});
