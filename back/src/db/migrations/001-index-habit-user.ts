import { mongo } from "mongoose";
import type { Migration } from "../migration.types";

const migration: Migration = {
  id: "001-index-habit-user",
  async up(db: mongo.Db) {
    await db.collection("habits").createIndex({ userId: 1 });
  },
};

export default migration;
