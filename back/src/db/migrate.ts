import mongoose from "mongoose";
import { connect } from "./connection";
import { runnerMigrations } from "./runner";

try {
  const db = await connect();
  await runnerMigrations(db, "./migrations/");
} catch (error) {
  console.error("Migration run failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
