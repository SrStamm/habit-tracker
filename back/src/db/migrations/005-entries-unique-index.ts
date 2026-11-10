import { mongo } from "mongoose";
import type { Migration } from "../migration.types";

const migration: Migration = {
  id: "005-entries-unique-index",
  async up(db: mongo.Db) {
    await db
      .collection("entries")
      .createIndex({ userId: 1, habitId: 1, dayKey: 1 }, { unique: true });
  },
};

export default migration;
