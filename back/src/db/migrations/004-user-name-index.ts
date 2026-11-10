import { mongo } from "mongoose";
import type { Migration } from "../migration.types";

const migration: Migration = {
  id: "004-user-name-index",
  async up(db: mongo.Db) {
    await db.collection("users").createIndex({ nome: 1 }, { unique: true });
  },
};

export default migration;
