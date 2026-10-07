# Habits Tracker

Full-stack application to create habits, track their daily entries (boolean, quantity or duration) and visualize progress with heatmaps.

Monorepo managed with **pnpm workspaces**.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router 8, Zod |
| Backend | Node.js, Express 5, TypeScript, Mongoose 9, Zod, JWT (`jose`), bcrypt |
| Database | MongoDB 8 |
| Shared | `@habits/shared` — Zod schemas and DTO types consumed by both apps |
| Tooling | pnpm 11, Vitest, Docker / Docker Compose |

## Repository layout

```
.
├── back/     # REST API (Express) + MongoDB models + migrations + OpenAPI
├── front/    # SPA (React + Vite)
├── shared/   # @habits/shared — contracts (Zod schemas, types) used by both
├── docs/     # Session notes / design documents
└── docker-compose.yaml
```

Each app has its own README: [`back/README.md`](back/README.md) and [`front/README.md`](front/README.md).

## Prerequisites

- Node.js 22+
- pnpm 11.22+ (`corepack enable` or `npm i -g pnpm@11.22.0`)
- Docker + Docker Compose (only if you want a local MongoDB)

## Quick start

### Option A — MongoDB local in Docker + apps running on your machine (recommended for development)

```bash
# 1. Install dependencies
pnpm install

# 2. Start only the MongoDB service (profile "mongo" is optional by design)
docker compose --profile mongo up -d mongo

# 3. Configure the backend
cp back/.env.example back/.env
#    MONGO_URI=mongodb://localhost:27017/habits
#    JWT_SECRET=<any random string>
#    APP_TIMEZONE=America/Argentina/Buenos_Aires

# 4. Run the apps (two terminals)
pnpm --filter back dev      # http://localhost:3000
pnpm --filter front dev     # http://localhost:5173
```

### Option B — Everything in Docker (backend + frontend + MongoDB)

```bash
cp back/.env.example back/.env   # keep MONGO_URI=mongodb://mongo:27017/habits
docker compose --profile mongo up --build
```

- API: http://localhost:3000
- UI: http://localhost:5173
- Swagger: http://localhost:3000/docs

> Inside the container the database is reached through the compose service name
> `mongo`, not `localhost`. `back/.env.example` already ships that value.

### Option C — No local MongoDB (external Atlas or a shared server)

Skip Docker entirely and point the backend at your remote instance:

```bash
cp back/.env.example back/.env
#    MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/habits
pnpm install
pnpm --filter back dev      # terminal 1
pnpm --filter front dev     # terminal 2
```

## Environment variables

### `back/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string. Boot fails if missing. |
| `JWT_SECRET` | yes | Secret used to sign/verify auth tokens (HS256). |
| `APP_TIMEZONE` | yes | IANA time zone that defines the calendar day for every entry (e.g. `America/Argentina/Buenos_Aires`). Boot fails if missing or invalid. |
| `PORT` | no | API port, defaults to `3000`. |

### `front/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `API_PROXY` | no | Target of the `/api` dev proxy, defaults to `http://localhost:3000`. Set it to `http://back:3000` when the frontend runs inside Docker. |

`.env` files are gitignored; `.env.example` files are the committed reference.

## Useful commands

| Command | What it does |
| --- | --- |
| `pnpm --filter back dev` | Run the API with hot reload (`tsx watch`). |
| `pnpm --filter front dev` | Run the SPA with hot reload (Vite). |
| `pnpm --filter back test` | Backend test suite (Vitest). |
| `pnpm --filter front test` | Frontend test suite (Vitest). |
| `pnpm -r test` | Run every workspace test suite. |
| `pnpm --filter back build` | Type-check and build the API (`tsc`). |
| `pnpm --filter front build` | Type-check and build the SPA (`tsc -b && vite build`). |
| `pnpm --filter back migrate` | Apply pending MongoDB migrations. |
| `pnpm --filter back status` | Read-only migration status (applied / pending / drifted). |
| `pnpm --filter back openapi` | Regenerate `back/src/docs/openapi.json`. |
| `docker compose down -v` | Stop everything and drop the `mongo-data` volume. |

## API

- Base URL: `http://localhost:3000`
- Health check: `GET /api/health`
- Interactive docs (Swagger UI): `GET /docs`
- Auth: `POST /auth/register` and `POST /auth/login` return a JWT valid for 1 hour.
  Send it as `Authorization: Bearer <token>` on every protected route.

## Migrations

Migrations live in `back/src/db/migrations` and are tracked in the
`_migrations` collection with a SHA-256 checksum of each file. Run them after a
fresh database or after pulling changes that add migrations:

```bash
pnpm --filter back status    # what is pending
pnpm --filter back migrate   # apply
```