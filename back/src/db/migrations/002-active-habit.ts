import { mongo } from "mongoose";
import type { Migration } from "../migration.types";

const migration: Migration = {
  id: "002-active-habit",
  async up(db: mongo.Db) {
    await db.collection("habits").updateMany({}, { $set: { active: true } });
  },
};

export default migration;
