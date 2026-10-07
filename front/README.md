# Frontend — Habits Tracker

React SPA for creating habits, registering daily entries and exploring progress
with heatmaps.

## Stack

React 19 · Vite 8 · TypeScript · Tailwind CSS 4 (`@tailwindcss/vite`) ·
React Router 8 · Zod 4 · Vitest

No state-management library: server state lives in feature hooks
(`useHabits`, `useEntries`, …) and the session in `AuthContext`.

## Scripts

| Script | Command |
| --- | --- |
| `pnpm dev` | Vite dev server on http://localhost:5173 |
| `pnpm build` | `tsc -b && vite build` |
| `pnpm start` | build + `vite preview` |
| `pnpm test` / `pnpm test:watch` | Vitest |

## Talking to the API

`src/lib/api.ts` is a thin `fetch` wrapper:

- Requests go to `/api/*`, which the Vite dev proxy rewrites to the backend
  (`API_PROXY`, default `http://localhost:3000`).
- The JWT stored by `src/lib/authToken.ts` is attached as
  `Authorization: Bearer <token>`.
- A `401` clears the token; errors are thrown using the API's `{ error }` body.

In Docker the proxy target is set to `http://back:3000` through `API_PROXY`.

## Structure

```
front/src
├── main.tsx              # entry point
├── App.tsx               # router + AuthProvider + route guards
├── index.css             # Tailwind entry
├── lib/
│   ├── api.ts            # fetch wrapper (base /api, auth header, errors)
│   ├── authToken.ts      # JWT persistence
│   ├── cn.ts             # clsx + tailwind-merge helper
│   └── fmtDayKey.ts      # day-key formatting helpers
├── components/
│   └── ui/               # Button, Input, Label, Modal, Select, Tag
└── features/             # one folder per domain
    ├── auth/             # api, AuthContext, useLogin/useRegister,
    │                     # LoginPage, RegisterPage, ProtectedRoute, GuestRoute
    ├── habit/            # api, useHabits, HabitList, HabitCard, HabitDetail,
    │                     # HabitForm, HeatmapGrid, WeekLabels, Legend
    ├── entry/            # api, useEntries, buildHeatmap (+ tests)
    └── home/             # HomePage, TodaySummary
```

Feature folders own their API calls (`api.ts`), hooks and UI. Shared primitives
live in `components/ui`; cross-cutting helpers in `lib`.

## Routing

| Path | Guard | Page |
| --- | --- | --- |
| `/` | `ProtectedRoute` | `HomePage` |
| `/login` | `GuestRoute` | `LoginPage` |
| `/register` | `GuestRoute` | `RegisterPage` |
| anything else | — | redirect to `/` |

## Tests

Co-located `*.test.ts` files (e.g. `features/entry/lib/buildHeatmap.test.ts`)
run with `pnpm test`.
