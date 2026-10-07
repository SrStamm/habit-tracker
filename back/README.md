# Backend — Habits Tracker API

REST API for the habits tracker: authentication, habits CRUD (with archive),
and per-day entries that feed the heatmaps.

## Stack

Express 5 · TypeScript (ESM) · Mongoose 9 · Zod 4 · `jose` (JWT HS256) ·
bcrypt · Swagger UI · Vitest · tsx (runtime, no build step in dev)

## Structure

```
back/src
├── index.ts                 # boot: connect() → createApp() → listen(PORT)
├── app.ts                   # createApp(): JSON body, routes, /docs, /api/health
├── config/
│   └── timeZone.ts          # APP_TIMEZONE parsing/validation (fails boot if wrong)
├── db/
│   ├── connection.ts        # mongoose.connect(MONGO_URI, { autoIndex: false })
│   ├── migrate.ts           # pnpm migrate — applies pending migrations
│   ├── status.ts            # pnpm status — read-only ledger report
│   ├── runner.ts            # file discovery, sha256 checksums, ledger collection
│   ├── migration.types.ts
│   └── migrations/          # 001-index-habit-user, 002-active-habit, 003-unit-habits
├── middleware/
│   ├── auth.ts              # Bearer JWT → req.userId (401 otherwise)
│   ├── validate.ts          # Zod validation of body / query / params
│   └── validateHabitOwner.ts# ensures the habit belongs to req.userId (404/403)
├── models/                  # Mongoose schemas → see "MongoDB models" below
│   ├── User.ts
│   ├── Habit.ts
│   └── Entry.ts
├── modules/                 # one folder per domain: routes → controller → service
│   ├── auth/                # auth.routes / auth.controller / auth.service / auth.docs
│   ├── habit/
│   └── entry/
├── lib/
│   └── dayKey.ts            # day-key resolution in APP_TIMEZONE (+ tests)
├── docs/
│   ├── openapi.ts           # registry + buildDocument()
│   ├── generate.ts          # pnpm openapi → writes docs/openapi.json
│   └── index.ts             # registers each module's route docs
└── types/
    └── express.d.ts         # augments Express Request with userId
```

**Layering rule:** `routes` declare paths and validation → `controller` handles
the HTTP concern → `service` holds the business logic and talks to the models.
`*.docs.ts` files only feed the OpenAPI registry.

## Environment

Read from `back/.env` (`tsx --env-file-if-exists=.env`):

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGO_URI` | yes | e.g. `mongodb://localhost:27017/habits` locally, `mongodb://mongo:27017/habits` in Docker |
| `JWT_SECRET` | yes | HS256 signing secret; boot throws if missing |
| `APP_TIMEZONE` | yes | IANA zone that defines the calendar day of every entry; boot throws if missing or invalid |
| `PORT` | no | defaults to `3000` |

Copy `back/.env.example` → `back/.env` to start.

## Scripts

| Script | Command |
| --- | --- |
| `pnpm dev` | `tsx watch src/index.ts` (hot reload) |
| `pnpm start` | run once |
| `pnpm build` | `tsc` |
| `pnpm test` / `pnpm test:watch` | Vitest |
| `pnpm migrate` | apply pending migrations |
| `pnpm status` | read-only migration status |
| `pnpm openapi` | regenerate `src/docs/openapi.json` |

## Endpoints

All routes except `auth` require `Authorization: Bearer <jwt>`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness probe |
| `GET` | `/docs` | Swagger UI |
| `POST` | `/auth/register` | Create account, returns user + token |
| `POST` | `/auth/login` | Sign in, returns token (1 h) |
| `GET` | `/habits` | List habits (`?all=true` includes archived) |
| `POST` | `/habits` | Create habit |
| `PATCH` | `/habits/:habitId` | Update habit (name, description, category, target, unit, active…) |
| `DELETE` | `/habits/:habitId` | Archive habit (soft delete) |
| `GET` | `/habits/entries` | All entries of the user (`?from`, `?to`, `?habitId`) — feeds the home heatmap |
| `GET` | `/habits/:habitId/entries` | Entries of one habit (`?from`, `?to`) |
| `POST` | `/habits/:habitId/entries` | Register the entry for a `dayKey` |

Ownership is enforced by `validateHabitOwner` before every `:habitId` handler.

## Auth

- Register/login validate the body against `LoginSchema` from `@habits/shared/auth`.
- Passwords are hashed with bcrypt (cost 10) and never returned.
- Tokens: `SignJWT({ userId })`, HS256, 1 h expiry, verified by `authMiddleware`.
- A 401 clears the stored token on the frontend.

## MongoDB models

Schemas live in `back/src/models`. Timestamps (`createdAt`, `updatedAt`) are
enabled on every model. Indexes are **not** built by Mongoose at boot
(`autoIndex: false`); they are applied through migrations.

### `User` → collection `users`

| Field | Type | Constraints |
| --- | --- | --- |
| `nome` | String | required, trimmed, **unique** |
| `password` | String | required, trimmed (bcrypt hash) |
| `timestamps` | — | `createdAt`, `updatedAt` |

### `Habit` → collection `habits`

| Field | Type | Constraints |
| --- | --- | --- |
| `userId` | ObjectId → `User` | required |
| `name` | String | required, trimmed |
| `description` | String | optional, trimmed |
| `category` | String | optional, trimmed |
| `type` | String | required, enum `HabitType`: `BOOLEAN` \| `QUANTITY` \| `DURATION` |
| `target` | Number | optional, `min: 1` — only meaningful for `QUANTITY`/`DURATION` |
| `unit` | String | optional, `min: 1` — required by the API for measurable types (`SECONDS`/`MINUTES`/`HOURS` for `DURATION`) |
| `active` | Boolean | required — `false` marks the habit as archived |
| `timestamps` | — | `createdAt`, `updatedAt` |

Migration `001-index-habit-user` adds the supporting index, `002-active-habit`
and `003-unit-habits` backfill later schema changes.

### `Entry` → collection `entries`

| Field | Type | Constraints |
| --- | --- | --- |
| `userId` | ObjectId → `User` | required |
| `habitId` | ObjectId → `Habit` | required |
| `dayKey` | String | required, `YYYY-MM-DD` |
| `value` | Number | optional — used by `QUANTITY` / `DURATION` |
| `completed` | Boolean | optional — used by `BOOLEAN` |
| `timestamps` | — | `createdAt`, `updatedAt` |

**Unique compound index:** `{ userId, habitId, dayKey }` — one entry per habit
per user per day (idempotent daily check-in).

The `dayKey` is computed by the backend from the request instant using
`APP_TIMEZONE`, so clients in any timezone record the same calendar day.

## Validation

Request contracts are shared with the frontend through `@habits/shared`:
`LoginSchema`, `CreateHabitSchema`, `HabitUpdateSchema`, `GetEntriesQuerySchema`,
`buildCreateEntrySchema(type)` (the entry body depends on the habit type —
`completed` for booleans, `value` for measurable ones). The `validate`
middleware checks `body`, `query` and `params` and answers `400` with the Zod
issues.

## Migrations

`src/db/migrations/*.ts` are applied in filename order and recorded in the
`_migrations` collection together with a SHA-256 checksum of the file. If a
file changes after being applied, `pnpm status` reports it as *drifted*.
Migrations run with `autoIndex: false` semantics — schema/index changes are
explicit and reviewable.

## API documentation

`pnpm openapi` regenerates `src/docs/openapi.json` (gitignored). The live spec
is served by Swagger UI at `/docs`.