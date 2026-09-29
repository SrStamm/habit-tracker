import mongoose from "mongoose";
import path from "node:path";
import { connect } from "./connection";
import { getLedger, readMigrationFiles } from "./runner";

// Read-only. Never writes to the ledger and never calls `up`.
try {
  const db = await connect();
  const ledger = getLedger(db);
  const files = readMigrationFiles(
    path.join(import.meta.dirname, "./migrations/"),
  );
  const applied = await ledger.find({}).toArray();

  let pending = 0;
  let drifted = 0;

  const rows = files.map((file) => {
    const entry = applied.find((candidate) => candidate._id === file.id);

    if (!entry) {
      pending += 1;

      return {
        migration: file.id,
        status: "pending",
        "applied at": "-",
        checksum: "-",
      };
    }

    const matches = entry.checksum === file.checksum;
    if (!matches) drifted += 1;

    return {
      migration: file.id,
      status: matches ? "applied" : "DRIFTED",
      "applied at": entry.appliedAt.toISOString(),
      checksum: matches ? "ok" : "MISMATCH",
    };
  });

  // An applied migration with no file is history nobody can reproduce. The
  // runner does not guard against it yet, but hiding it here would make this
  // report lie about the state of the database.
  const fileIds = new Set(files.map((file) => file.id));
  const orphans = applied.filter((entry) => !fileIds.has(entry._id));

  for (const orphan of orphans) {
    rows.push({
      migration: orphan._id,
      status: "MISSING FILE",
      "applied at": orphan.appliedAt.toISOString(),
      checksum: "unknown",
    });
  }

  console.table(rows);
  console.log(
    `${applied.length - orphans.length} applied, ${pending} pending, ${drifted} drifted, ${orphans.length} missing file`,
  );

  // Exit code means one thing: do the repo and the database agree? Drift and
  // missing files are both disagreement, so both fail — same contract as
  // `migrate`, which refuses to run on a drifted ledger.
  if (drifted > 0 || orphans.length > 0) process.exitCode = 1;
} catch (error) {
  console.error("Migration status failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
