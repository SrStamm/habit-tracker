import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { mongo } from "mongoose";
import { pathToFileURL } from "node:url";
import type { Migration } from "./migration.types";
import { createHash } from "node:crypto";

export interface MigrationFile {
  id: string;
  fileName: string;
  filePath: string;
  checksum: string;
}

export interface LedgerEntry {
  _id: string;
  appliedAt: Date;
  checksum?: string;
}

export const getLedger = (db: mongo.Db) =>
  db.collection<LedgerEntry>("_migrations");

/**
 * Lists migration files sorted by filename, with the sha256 of each source.
 * Takes an absolute dir, so it never depends on process.cwd() or on where the
 * caller lives. The checksum is computed once, here, so `migrate` and `status`
 * can never disagree about how it is calculated.
 */
export const readMigrationFiles = (dir: string): MigrationFile[] => {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const filePath = path.join(dir, entry.name);

      return {
        id: path.parse(entry.name).name,
        fileName: entry.name,
        filePath,
        checksum: createHash("sha256")
          .update(readFileSync(filePath, "utf8"))
          .digest("hex"),
      };
    });
};

export const runnerMigrations = async (
  db: mongo.Db,
  migrationsDir: string,
) => {
  const files = readMigrationFiles(
    path.join(import.meta.dirname, migrationsDir),
  );
  const ledger = getLedger(db);

  // Loop for all files from directory
  for (const file of files) {
    // Search in DB if exist a migration
    const exist = await ledger.findOne({ _id: file.id });

    if (exist) {
      // INVARIANT: an applied migration is frozen history and this throw is
      // not a bug to be silenced. The ledger is NOT where you fix it —
      // rewriting the stored checksum makes the drift permanent and invisible,
      // because the ledger is the only record of what actually ran. The only
      // correct response is a new migration that reconciles reality.
      if (file.checksum !== exist.checksum)
        throw new Error(
          `Migration file error: invalid checksum on migration ${exist._id}`,
        );

      continue;
    }

    // Gets migration executer
    const url = pathToFileURL(file.filePath).href;
    const migration = (await import(url)) as { default: Migration };

    // Valide if 'id' is the same
    if (migration.default.id !== file.id) {
      throw new Error(
        `Migration id "${migration.default.id}" no matchea el archivo "${file.fileName}"`,
      );
    }

    // Execute migration
    await migration.default.up(db);

    // Save migration executed
    await ledger.insertOne({
      _id: file.id,
      appliedAt: new Date(),
      checksum: file.checksum,
    });
  }
};
