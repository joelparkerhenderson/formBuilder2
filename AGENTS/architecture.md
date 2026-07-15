# Architecture — how the app hangs together

Operational summary. The authoritative detail (context diagram, module ownership map, route ↔ engine matrix, deployment) is [spec/02](../spec/02-architecture.md).

## Runtime model in five lines

1. Pure client SPA: SvelteKit with `ssr = false` in `src/routes/+layout.ts`; no server code in this repo.
2. Deployed under base path `/formBuilder2/`; every internal link prepends `base` from `$app/paths`.
3. All persistence via an external REST API (`/api` or `/formBuilder2/api`) through `src/lib/api/client.ts` — server implementation is **not in this repo**.
4. PostgreSQL schema/seed tooling lives at the repo root (`setup-db.ts`, `seed-patients.ts`, `scripts/`) for dev/review databases.
5. Case Note Tracker (`/cnt`) runs on a browser-local simulated backend ([AGENTS/cnt.md](cnt.md)).

## Where things live

- `src/routes/` — one directory per page; form routes pair `+page.svelte` with a query-param-reading `+page.ts`.
- `src/lib/components/` — component families by prefix ([AGENTS/conventions.md](conventions.md) has the taxonomy).
- `src/lib/data/` — form specs and option data. `src/lib/utils/` — engines and helpers. `src/lib/api/` — REST client.
- `src/lib/caseNoteTracker/` — the whole CNT sub-app.
- `docs/` — canonical HTML specifications + historical API markdown. `spec/` — the living spec suite. `reactOrig/`, `svelteOrig/` — frozen legacy ([AGENTS/legacy.md](legacy.md)).

## Which engine renders which route

Owned by the matrix in [spec/02](../spec/02-architecture.md). Short version: `operation-note` is Engine A; `treatment-summary` and `userForm.html` are Engine B; `waiting-list-card`, `outpatient-outcome`, and `cardiology-test-request` are hand-coded. Never guess — check the matrix, then [AGENTS/form-engines.md](form-engines.md).

## Structural warnings

- **No build tooling is committed** (no root `package.json`/`svelte.config.js`) — GAP-01 in [spec/10](../spec/10-gaps-and-roadmap.md). Don't invent config; read the gap entry first.
- `src/lib/api/.vs/` is a committed IDE artefact (GAP-06) — not app code; don't extend it.
- There are no tests or CI (GAP-05) — verify changes by running the affected flow, not by assuming a suite will catch regressions.
