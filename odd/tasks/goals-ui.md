# [FEATURE] Objetivos (UI) — barra de progresso, formulario y stats del período

## Objective

Frontend de Objetivos periódicos: mostrar en `HabitDetail` una sección
"Objetivos" con barra de progresso por goal, formulario de creación, borrado
y un bloque de stats del período.

## Problem

El backend expone goals por hábito (rama `goals-api`), pero el usuario aún no
puede ver ni gestionar objetivos desde la app: no hay barra de progresso
periódico, solo el límite diario por entrada.

## Scope

In scope:

- `front/src/features/goal/` (nuevo: api, hooks, componentes).
- Sección "Objetivos" en `HabitDetail.tsx`.
- Estados de carga/error consistentes con los cartones existentes.

Out of scope:

- Recordes personales (Fase 3).
- Gráficos con Recharts (Fase 4).
- Tipos de hábito definidos por el usuario (Fase 4).
- Semántica del target diario (se mantiene).

## Tasks

- [x] T1 — `front/src/features/goal/`: `api.ts` + hooks siguiendo el patrón de
  `front/src/features/habit/api.ts` y `front/src/features/habit/hooks/useHabits.ts`.
  Tipar las respuestas desde `shared/src/goal.ts` — **sin tipos duplicados**.
- [x] T2 — `HabitDetail.tsx`: sección "Objetivos" — una fila por objetivo con
  barra de progresso (`current / amount`, %, rótulo del período). La barra se
  limita a 100% cuando `current > amount`.
- [x] T3 — Formulario para crear un objetivo (valor + selector de período
  semana/mes) dentro de `HabitDetail`.
- [x] T4 — Botón de eliminar por objetivo, con actualización de la lista.
- [x] T5 — Estado vacío cuando el hábito no tiene objetivos.
- [x] T6 — Bloco de stats del período: total del período (suma/conteúdo de las
  entradas) y sequencia de días consecutivos (ya implementada en
  `calculateStreak.ts`).
- [x] T7 — Estados de loading y error consistentes con los cartones existentes.
- [ ] T8 — Verificación: `pnpm -r build` pasa + manual:
  - crear objetivo → la barra refleja el progresso tras registrar entradas.
  - objetivo de hábito BOOLEAN cuenta días, no valores.
- [ ] T9 — Commit de work unit en la feature branch + PR → `main`.

## Authorized scope

- `front/src/features/goal/` (nuevo: api, hooks, componentes)
- `front/src/features/habit/components/HabitDetail.tsx` (renderizar secciones)
- Tests front si se añaden

## Acceptance criteria

- Una fila por objetivo con barra `current/amount` + % + rótulo de período.
- Crear objetivo desde el formulario; eliminar con actualización de lista.
- Barra capada al 100%.
- Estado vacío claro sin objetivos.
- Stats del período: total + streak (vía `calculateStreak.ts`).
- Tipos de respuesta provenientes de `shared/src/goal.ts`.
- `pnpm -r build` verde.

## Applicable checks

- `pnpm -r build` (workspace completo)
- `pnpm --filter front test` (vitest, si hay tests)
- Manual en navegador: crear objetivo → registrar entradas → barra refleja
  progresso; caso BOOLEAN cuenta días.

## TDD mode

No está habilitado explícitamente (sin configuración strict-TDD registrada en
Engram). Runner disponible: **vitest** en `front`. Verificación principal:
`pnpm -r build` + prueba manual.

## Delivery

- Estrategia acordada (2026-10-19): **dos PRs secuenciales a `main`**.
  Esta rama es el PR 2.
- **Bloqueada por:** merge de PR #34 (`Objetivos (API)`) en `main` —
  https://github.com/SrStamm/habit-tracker/pull/34.
- Branch: **`KAN-37/goals-ui`** (ticket confirmado por el usuario),
  creada desde `main` actual (3939e22, incluye la API mergeada).
- Presupuesto: si el PR supera ~400 líneas cambiadas → trocear o pedir
  `size:exception`.

## Progress

- 2026-10-19 — Documento creado (decisión de estrategia: PRs secuenciales a main).
- 2026-10-19 — Especificación oficial de la tarea hija UI confirmada por el
  usuario: el documento coincide 1:1 con los criterios técnicos recibidos
  (barra con %, formulario, borrado con actualización de lista, cap 100%,
  estado vacío, bloque de stats con streak vía `calculateStreak.ts`,
  tipos desde `shared/src/goal.ts` sin duplicar). Sin cambios de alcance.
  Bloqueo actualizado: PR #34 abierto, esperando merge.
- 2026-10-20 — T1–T4 completadas (api+hooks, barra de progresso, formulario
  de creación, borrado con actualización local). Commits a724d65, 7659e26,
  14777d4, ccc4c07, ad69484.
- 2026-10-20 — T5 completada: estado vacío en `GoalList.tsx` cuando `goals`
  es `[]` y el form está cerrado. Mismo patrón visual que `HabitList`
  (border-dashed + texto muted en portugués). `tsc` y `vite build` limpios.
- 2026-10-20 — T6 completada: card "Total do Período" en `HabitDetail.tsx`
  (grilla de KPIs pasó a 3 columnas en sm+). `periodTotal` con `useMemo`
  sobre `entries` + rango del selector del heatmap (`days`). BOOLEAN cuenta
  días cumplidos; QUANTITY/DURATION suman `value` en la unidad cruda del
  hábito (sin conversión, decisión documentada). Streak ya venía como prop.
- 2026-10-20 — T7 completada: loading (skeleton con `animate-pulse` cuando
  `goals === null && isPendingGet`), error de lista (`role="alert"` con
  `errorGet`), y error de progress (`.catch()` en el `Promise.all` que setea
  `progressError` — el goal muestra el error en vez de quedarse en skeleton
  eterno). Patrón visual consistente con `HabitCard`/`HabitForm`.

## Next step

Esperar merge del PR #34 (goals-api) en `main`; después crear
`KAN-37/goals-ui` y empezar por T1 (api + hooks del feature goal).

## Engram mirror

Mirror en Engram: observación #420, topic `odd/goals-ui/tasks`
(proyecto `habit-tracker`).
