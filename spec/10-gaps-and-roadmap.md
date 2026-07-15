<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: this-file
Verified-against: 90b6614
Owns: the audit register (GAP-NN items) and the improvement roadmap. Other documents cite gaps by ID only.

# spec/10 — Gaps and roadmap

The audit register. Every known defect, inconsistency, or missing capability gets a permanent `GAP-NN` id (append-only; resolved items are marked resolved, never deleted or renumbered). Reviewed on every documentation pass.

## Register

| ID | Severity | Summary | Status |
|---|---|---|---|
| GAP-01 | High | Build tooling not committed at repo root | Open |
| GAP-02 | High | Two form-spec engines with divergent vocabularies | Open (decision needed) |
| GAP-03 | Medium | Svelte 5 runes migration incomplete | Open |
| GAP-04 | Medium | Three forms hand-coded outside both engines | Open |
| GAP-05 | High | No tests, lint, type-check, or CI | Open |
| GAP-06 | Low | Stray Visual Studio artefact directory committed | Partially resolved 2026-07-15 |
| GAP-07 | Low | Component file-casing inconsistency | Open |
| GAP-08 | Low | Colour tokens duplicated in CSS and TS | Open |
| GAP-09 | Medium | reactOrig features not verified as ported | Closed 2026-07-15 (audit done; residue = GAP-16..19) |
| GAP-10 | Medium | Engine A conditional logic hardcoded in renderer | Open |
| GAP-11 | Medium | CNT simulated backend vs future REST contract | Open (by design, pending) |
| GAP-12 | Info | Legacy typo component `fbBadgeSupperseded` in reactOrig | Record-only |
| GAP-13 | Low | Engine A RoV renders table fields as raw JSON | Open |
| GAP-14 | Low | Actioned-endpoint body field names differ between client and contract doc | Open (evidence favours client) |
| GAP-15 | Medium | `setup-db.ts` schema drift vs API contract | Resolved 2026-07-15 |
| GAP-16 | Medium | No stale-version write guard (concurrent-save conflicts undetected) | Open |
| GAP-17 | Medium | Superseded state never computed; `fbBadgeSuperseded` orphaned; no old-version banner | Open |
| GAP-18 | Medium | Engine A (operation-note) has no version-history support | Open |
| GAP-19 | Low | RoV does not suppress empty sections (react did) | Open |

## Detail

**GAP-01 — Build tooling not committed.** No `package.json`, `svelte.config.js`, `vite.config.ts`, or `tsconfig.json` exists at the repo root for the active SvelteKit app; a fresh clone cannot build. The source assumes SvelteKit + static adapter, base `/formBuilder2/`, `VITE_API_BASE_URL`. Legacy configs remain in `reactOrig/` and `svelteOrig/` (the latter shows the dev proxy convention). *Action*: commit the real tooling from the working environment — do **not** invent config from scratch, which could silently diverge from the deployed build.

**GAP-02 — Dual engines.** Engine A (`SpecDrivenFormSpec`) and Engine B (`DesignerFormSpec`) overlap heavily but name field types differently and use different state-key conventions (underscore vs hyphen compounds) — mapping table in [spec/05](05-engine-b-designer.md). Every new form or component pays the cost twice. *Action*: decide a target (likely: Engine B vocabulary as the interchange format, Engine A hierarchy as authoring sugar, or a converter) and record the decision here.

**GAP-03 — Runes migration incomplete.** At `637f03a`: 75 of 190 `.svelte` files under `src/` still use `export let` props; 91 use runes. *Action*: new code runes-only; opportunistically migrate files you touch ([AGENTS/conventions.md](../AGENTS/conventions.md)).

**GAP-04 — Hand-coded forms.** Waiting list card (~938 lines), Outpatient outcome (~795), Cardiology test request (~701) predate the engines. They work, but every layout/behaviour fix is bespoke. *Action*: migrate to Engine A as specs stabilise — Cardiology test request first (most regular structure of the three); keep Waiting list card last (it is the README's canonical hand-coded reference).

**GAP-05 — No quality infrastructure.** No tests, lint, `svelte-check`, or CI anywhere. Requirements listed in [spec/09](09-non-functional.md). *Action*: after GAP-01, add `svelte-check` + a small vitest suite over `src/lib/utils/` + CI.

**GAP-06 — VS artefacts.** `src/lib/api/.vs/` (including `slnx.sqlite`, `VSWorkspaceState.json`) is an IDE artefact committed into source. *Progress 2026-07-15*: root `.gitignore` added (covers `.vs/`, `node_modules/`, build output, env files). *Remaining*: `git rm -r src/lib/api/.vs` — deletion deferred pending explicit maintainer approval.

**GAP-07 — File casing.** `src/lib/components/fb/` mixes `fbModal.svelte` with `FbModalActions.svelte`/`FbModalMessage.svelte`; CNT mixes `Fbcnt*` and `fbcnt*`. *Action*: convention for new files in [AGENTS/conventions.md](../AGENTS/conventions.md); bulk rename only as a deliberate change (import churn).

**GAP-08 — Token duplication.** The `--fb-*` custom properties in `src/styles/global.css` are duplicated as TS exports in `src/lib/constants/fbColours.ts`. `global.css` is authoritative. *Action*: generate one from the other, or read CSS variables at runtime.

**GAP-09 — Unported reactOrig features.** *(Closed 2026-07-15 — full parity audit completed.)* **At parity**: Cardiology test request (every section, investigation, indication block, warning, and validation rule from `reactOrig/src/etr/CardiologyTestRequest.tsx` is present in the Svelte route — the React file is larger only because it inlines the RoV shell and a password hook; the Svelte version additionally offers an RoV version dropdown). Composer WYSIWYG (drag/drop, Show JSON edit/reimport, save/load/delete designs, public link + `userForm.html` viewing, preview, prefs persistence, auth — all present; the "missing" `fbcFooter`/`fbcpName`/`fbcpVal` were one-line markup wrappers absorbed inline; neither version has undo/redo). RoV shell (`fbRoVShell` capabilities reimplemented inline via `fbLayout`/`fbHeader`/`fbBottomControlsRow` with field-level empty suppression), history menu (`fbFormHistoryMenu.svelte` is a faithful port), and `fbViewOldVersion` (inlined into the menu). **Real regressions found** were split into GAP-16, GAP-17, GAP-18, GAP-19. Minor note: the cardiology route uses a plain `<select>` version picker instead of `fbFormHistoryMenu`, and captures the save password inline rather than via `fbModalPassword` — harmonisation nits, not omissions.

**GAP-16 — No stale-version write guard.** reactOrig's `reactOrig/src/utils/formVersion.ts` (`assertFormVersionIsLatest`, `STALE_FORM_VERSION`) blocked saving over a newer version and forced the form into RoV on conflict. No equivalent exists in `src/`: every save path just reads the latest version and increments, so two concurrent editors silently interleave versions. *Action*: port the guard into the shared save flows (`SpecDrivenForm.svelte` and the hand-coded routes) using `getLatestVersion` before insert.

**GAP-17 — Superseded state missing.** reactOrig computed `superseded = currentFormVersion < latestFormVersion`, showed `fbBadgeSuperseded` in the RoV header, and hid EV/History controls when viewing an old version. In `src/`, `fbBadgeSuperseded.svelte` exists but is imported nowhere, no route computes superseded-ness, `fbHeader.svelte` has no `superseded` prop, and viewing an old version shows no banner and leaves footer controls unchanged. *Action*: compute superseded per route (or in a shared helper), wire the badge through `fbHeader`, and suppress edit controls on old versions.

**GAP-18 — Engine A lacks version history.** `src/routes/operation-note/+page.ts` never reads a `formVersion` query param and `SpecDrivenForm.svelte` contains no `getFormHistory`/`getFormVersion`/history-menu wiring — waiting-list-card and outpatient-outcome have the full pattern, cardiology a partial one. Any form adopting Engine A silently loses history viewing. *Action*: add history support to `SpecDrivenForm.svelte` (props/param plumbing + `fbFormHistoryMenu`), which fixes every Engine A form at once.

**GAP-19 — RoV empty-section suppression.** reactOrig's dedicated `*RoV.tsx` views hid whole sections whose fields were all empty; current RoVs render every `fbSection` header unconditionally (field-level suppression via `fbReadOnly` works). *Action*: add a per-section has-data check in RoV rendering (Engine B's `hasRoVData` in `src/lib/utils/generatedForm.ts` is prior art).

**GAP-10 — Hardcoded conditional logic.** Engine A has no declarative "show X when Y"; `urgencyGroup` subquestions and the `procedures`/`urgency` completeness specials live in `SpecDrivenForm.svelte`. Adding a form with new conditional behaviour means editing the renderer. *Action*: add declarative conditions to `SimpleField` (e.g. `showWhen`) when a second consumer needs them.

**GAP-11 — CNT backend.** Browser-local simulated backend by design; the server contract exists ([spec/07](07-rest-api-and-data-model.md)) and `cnt_*` tables can be seeded for review. *Action*: implement server routes to the contract; keep mock and contract converged.

**GAP-12 — Legacy typo.** `reactOrig` contains both `fbBadgeSuperseded` and misspelled `fbBadgeSupperseded`. Record-only: never propagate the misspelling; legacy dirs are frozen.

**GAP-13 — Engine A RoV tables.** `rovField` in `SpecDrivenForm.svelte` renders table-family fields as `JSON.stringify` into `fbReadOnly`. *Action*: render proper read-only tables (Engine B's `GeneratedTableShell` is prior art).

**GAP-14 — Actioned body naming.** `markOutpatientOutcomeActioned` in `src/lib/api/legacy.ts` sends `outcome_actioned_date`/`outcome_actioned_user_id`; `docs/restAPI.md` documents `date_actioned`/`user_id`. The server may accept both. *Evidence 2026-07-15*: the database columns added by `scripts/seed-outpatient-outcomes-real-db.ts` are `outcome_actioned_date`/`outcome_actioned_user_id` — matching the client, suggesting the contract doc's wording is stale. *Action*: confirm against the server, then align the wording in [spec/07](07-rest-api-and-data-model.md).

**GAP-15 — Schema drift.** *(Resolved 2026-07-15.)* `setup-db.ts` originally created only six tables; `treatment_summaries`, `implants`, `user_lookup`, and the cooling-off/`highly_sensitive`/actioned columns existed only as scattered DDL inside `scripts/seed-implants-real-db.ts` and `scripts/seed-outpatient-outcomes-real-db.ts` — and **nothing created `cardiology_test_requests`** (the seed script's ALTER loop would fail on a fresh database). *Resolution*: `setup-db.ts` now carries the full contract schema (sections 8–12): `treatment_summaries`, `cardiology_test_requests` (with destination metadata columns), `implants` + indexes, `implants_synced_at` on `operation_notes`, `user_lookup`, the lifecycle-column loop across all form tables + `forms_index`, and a post-ALTER recreation of `forms_index_current` so the view includes the new columns on first run. Seed scripts keep their own DDL for standalone use; DDL shapes copied verbatim so they stay compatible.

## Roadmap (ordered)

1. **Restore build tooling** (GAP-01) — everything else depends on a reproducible build.
2. **Hygiene sweep** (GAP-06, GAP-15) — ~~add `.gitignore`, complete `setup-db.ts`~~ done 2026-07-15; remaining: delete `.vs/` (needs maintainer approval).
3. **Quality baseline** (GAP-05) — `svelte-check`, utility tests, CI.
4. **Engine unification decision** (GAP-02, GAP-10) — decide the target vocabulary and declarative-conditions design before migrating forms.
5. **Complete the runes migration** (GAP-03).
6. **Migrate hand-coded forms** (GAP-04) and fix Engine A RoV tables (GAP-13).
7. **Versioning robustness** (GAP-16, GAP-17, GAP-18, GAP-19 — the residue of the completed GAP-09 audit) and contract reconciliation (GAP-14).
8. **CNT server backend** (GAP-11) when SWAS work is scheduled.
