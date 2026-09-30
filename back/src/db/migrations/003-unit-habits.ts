import { mongo } from "mongoose";
import type { Migration } from "../migration.types";
import { HabitType } from "@habits/shared/habit";

const migration: Migration = {
  id: "003-unit-habits",
  async up(db: mongo.Db) {
    await db.collection("habits").updateMany(
      {
        type: HabitType.DURATION,
        unit: { $exists: false },
      },
      {
        $set: { unit: "MINUTES" },
      },
    );
  },
};

export default migration;
