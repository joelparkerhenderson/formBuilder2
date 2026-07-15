# AGENTS.md — start here

Instructions for AI agents (and a fast orientation for humans) working on **formBuilder2**: a re-implementation of the shadesOfPale WCP (Welsh Clinical Portal, NHS Wales) form design and forms engine. Three sub-products: the **forms engine**, the **Composer** WYSIWYG form builder, and the **Case Note Tracker (CNT)**. The active app is a **SvelteKit + Svelte 5 (runes) client-only SPA** (`ssr = false`) served under `/formBuilder2/`.

This repo practises **spec-driven development**: `spec/` is living documentation, updated with (ideally before) the code. The full documentation map is [index.md](index.md).

## Repo map

| Path | What it is |
|---|---|
| `src/` | The active SvelteKit app (routes, `fb*` component library, engines, CNT) |
| `spec/` | Living specifications — the normative truth ([spec/00](spec/00-conventions.md) has the rules) |
| `AGENTS/` | Topic guides for agents (this file's children) |
| `docs/` | Canonical HTML specifications + historical API markdown — inputs, never modified |
| `reactOrig/`, `svelteOrig/` | Frozen legacy implementations — reference only, never modified |
| `setup-db.ts`, `seed-patients.ts`, `scripts/` | PostgreSQL schema + deterministic review seeds |
| `README.md` | Human intro, demo URLs, suggested usage |

## Critical warnings

1. **No build tooling is committed** — no root `package.json`/`svelte.config.js`/`vite.config.ts`. Do not invent one silently; read GAP-01 in [spec/10](spec/10-gaps-and-roadmap.md) first.
2. **Two form engines coexist** (Engine A `SpecDrivenFormSpec`, Engine B `DesignerFormSpec`) plus hand-coded forms. Read [AGENTS/form-engines.md](AGENTS/form-engines.md) before touching any form — renderer edits have engine-wide blast radius.
3. **Never modify** `reactOrig/`, `svelteOrig/`, or `docs/*.html`.
4. **Clinical data rules are inviolable**: append-only versioning, cooling-off, `hospital_number` (not `crn`), fictitious data only — [AGENTS/api-and-data.md](AGENTS/api-and-data.md).
5. **No tests/CI exist** — verify by driving the affected flow ([AGENTS/workflows.md](AGENTS/workflows.md)).

## Conventions in ten lines

- Component prefixes: `fb*` design-system, `fbc*`/`fbcp*` Composer, `fbcnt*` CNT, `Generated*` Engine B, `SpecDriven*` Engine A.
- New Svelte is **runes-only** (`$props`/`$state`/`$derived`, callback props, snippets); migrate `export let` files you materially touch (migration is ~half done).
- Immutable form-state updates; colours via `--fb-*` tokens from `src/styles/global.css`; `rem` units; Roboto.
- Internal links prepend `base` from `$app/paths`; all HTTP via `src/lib/api/client.ts`/`legacy.ts`.
- British English UI text; label "CRN" may display, but code says `hospital_number`.

Details: [AGENTS/conventions.md](AGENTS/conventions.md).

## Do / Don't

**Do**: author the [spec/06](spec/06-forms-catalogue.md) entry before implementing a form · follow the update-trigger table in [spec/00](spec/00-conventions.md) so specs move with code · register unfixed findings as `GAP-NN` in [spec/10](spec/10-gaps-and-roadmap.md) · model new work on the named reference implementations (`src/routes/operation-note/` for Engine A, `src/routes/waiting-list-card/` for hand-coded).

**Don't**: add tooling, tests, or CI config without flagging it (GAP-01/GAP-05 context first) · duplicate facts across docs (single-source rule, [spec/00](spec/00-conventions.md)) · bypass cooling-off/versioning semantics client-side · strip unrecognised keys from `form_data` or Composer JSON.

## Read next

| Task | Read |
|---|---|
| Any code change | [AGENTS/conventions.md](AGENTS/conventions.md), [AGENTS/architecture.md](AGENTS/architecture.md) |
| Forms (new or existing) | [AGENTS/form-engines.md](AGENTS/form-engines.md), then [spec/04](spec/04-engine-a-spec-driven.md)/[spec/05](spec/05-engine-b-designer.md)/[spec/06](spec/06-forms-catalogue.md) |
| API, saving, database | [AGENTS/api-and-data.md](AGENTS/api-and-data.md), [spec/07](spec/07-rest-api-and-data-model.md) |
| Case Note Tracker | [AGENTS/cnt.md](AGENTS/cnt.md), [spec/08](spec/08-case-note-tracker.md) |
| Porting/parity questions | [AGENTS/legacy.md](AGENTS/legacy.md) |
| Task recipes & doc upkeep | [AGENTS/workflows.md](AGENTS/workflows.md) |
