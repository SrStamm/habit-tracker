import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import HabitForm from "../../habit/components/HabitForm";
import { Button } from "../../../components/ui/Button";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <main className="h-screen w-screen justify-center bg-background flex p-4">
      <header>
        <h1 className="text-2xl font-bold text-text mb-6 text-center">
          Habits Tracker
        </h1>
        <p>Track your habits, one day at a time.</p>

        <Button onClick={() => setIsModalOpen(true)}>+ Nuevo Hábito</Button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Criar Hábito"
        >
          <HabitForm onSuccess={() => setIsModalOpen(false)} />
        </Modal>
      </header>
    </main>
  );
}
