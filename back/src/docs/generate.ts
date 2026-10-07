import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDocument } from "./openapi";
import "./index";

const out = resolve(dirname(fileURLToPath(import.meta.url)), "./openapi.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(buildDocument(), null, 2) + "\n");
