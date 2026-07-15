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
| GAP-13 | Low | Engine A RoV renders table fields as raw JSON | Resolved 2026-07-15 |
| GAP-14 | Low | Actioned-endpoint body field names differ between client and contract doc | Open (evidence favours client) |
| GAP-15 | Medium | `setup-db.ts` schema drift vs API contract | Resolved 2026-07-15 |
| GAP-16 | Medium | No stale-version write guard (concurrent-save conflicts undetected) | Resolved 2026-07-15 |
| GAP-17 | Medium | Superseded state never computed; `fbBadgeSuperseded` orphaned; no old-version banner | Resolved 2026-07-15 |
| GAP-18 | Medium | Engine A (operation-note) has no version-history support | Resolved 2026-07-15 |
| GAP-19 | Low | RoV does not suppress empty sections (react did) | Resolved for Engine A 2026-07-15; hand-coded routes deferred to GAP-04 |

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

**GAP-16 — No stale-version write guard.** *(Resolved 2026-07-15.)* reactOrig's `reactOrig/src/utils/formVersion.ts` blocked saving over a newer version and forced the form into RoV on conflict; no equivalent existed in `src/`, so two concurrent editors silently interleaved versions. *Resolution*: ported the utility as `src/lib/utils/formVersion.ts` (`assertFormVersionIsLatest`, `isStaleFormVersionError`, coded `STALE_FORM_VERSION` error) and the modal as `src/lib/components/fb/fbModalStaleSave.svelte` ("Changes NOT saved" + Continue). All five clinical save flows now assert before insert — `SpecDrivenForm.svelte` (Engine A), waiting-list-card, outpatient-outcome, cardiology-test-request, and treatment-summary — and on conflict show the modal; Continue reloads the server's current version into RoV. Each route tracks its loaded version (set on load, on viewing a historical version, and after save), which also feeds the GAP-17 superseded computation.

**GAP-17 — Superseded state missing.** *(Resolved 2026-07-15.)* reactOrig computed `superseded = currentFormVersion < latestFormVersion`, showed `fbBadgeSuperseded` in the RoV header, and hid EV/History controls when viewing an old version; none of that had been ported. *Resolution*, matching the react pattern: `fbHeader.svelte` gained a `superseded` prop rendering `fbBadgeSuperseded` first in the badge row; `SpecDrivenForm.svelte` (Engine A) and the three hand-coded form routes each compute `superseded` (viewed version vs the max version in the loaded history), pass it to the RoV header, and hide the EV and History controls when viewing a superseded version. Viewing or saving the latest version clears the state. One deliberate deviation: the cardiology route's version `<select>` stays visible when superseded (it is the only way back to the latest version there), whereas the History popover in the other routes hides per react's behaviour.

**GAP-18 — Engine A lacks version history.** *(Resolved 2026-07-15.)* Originally `src/routes/operation-note/+page.ts` never read a `formVersion` query param and `SpecDrivenForm.svelte` had no history wiring. *Resolution*, following the `src/routes/waiting-list-card/` reference pattern: `SpecDrivenForm.svelte` now loads `getFormHistory` on mount (for saved forms) and after every save, shows a **History** button in the RoV footer, renders `fbFormHistoryMenu`, and `viewHistoryVersion` loads any version into RoV via `getFormVersion(spec.formType, …)`; `operation-note/+page.ts` reads `formVersion` (loading that exact version, always in RoV). Save-time version numbering now uses the server's latest (see GAP-16 mitigation). Every Engine A form gets this for free. Incidental fix: `fbFormHistoryMenu.svelte`'s hover style referenced the non-existent token `--fb-yellow`; corrected to `--fb-active-darker-yellow`. Residual: no "viewing an old version" banner — that is GAP-17.

**GAP-19 — RoV empty-section suppression.** reactOrig's dedicated `*RoV.tsx` views hid whole sections whose fields were all empty; current RoVs rendered every `fbSection` header unconditionally (field-level suppression via `fbReadOnly` works). *Resolved for Engine A 2026-07-15*: `SpecDrivenForm.svelte` derives `visibleRovSections` via `sectionHasRovData`/`fieldHasRovData` (type-aware emptiness — compound blood-pressure/BMI keys, table-row content, staff groups including the lead/SRC form-state fields; display-only boxed messages and image placeholders never count as data), filters both the rendered sections and the section nav, and re-anchors `activeSection` if the current one is hidden. *Deferred*: the hand-coded routes (waiting-list-card, outpatient-outcome, cardiology-test-request) still render their RoV sections unconditionally — retrofitting hand-written per-section guards across three bespoke ~700–900-line files is high-risk without runtime verification (GAP-01/GAP-05); they inherit the behaviour when migrated to Engine A (GAP-04).

**GAP-10 — Hardcoded conditional logic.** Engine A has no declarative "show X when Y"; `urgencyGroup` subquestions and the `procedures`/`urgency` completeness specials live in `SpecDrivenForm.svelte`. Adding a form with new conditional behaviour means editing the renderer. *Action*: add declarative conditions to `SimpleField` (e.g. `showWhen`) when a second consumer needs them.

**GAP-11 — CNT backend.** Browser-local simulated backend by design; the server contract exists ([spec/07](07-rest-api-and-data-model.md)) and `cnt_*` tables can be seeded for review. *Action*: implement server routes to the contract; keep mock and contract converged.

**GAP-12 — Legacy typo.** `reactOrig` contains both `fbBadgeSuperseded` and misspelled `fbBadgeSupperseded`. Record-only: never propagate the misspelling; legacy dirs are frozen.

**GAP-13 — Engine A RoV tables.** *(Resolved 2026-07-15.)* `rovField` in `SpecDrivenForm.svelte` rendered table-family fields as `JSON.stringify` into `fbReadOnly`. *Resolution*, following `reactOrig/src/OperationNoteRoV.tsx`: each table type now renders a read-only `fbTable` with proper headers and plain-text cells — procedure (Side/Procedure/Additional information, side values labelled), diagnosis (single Diagnosis column), specimen (A, B, C/Description), implant (Implant Id/Type/Requires removal as Yes–No/Remove by) — with empty rows filtered out, em-dashes for blank optional cells, and entirely-empty tables suppressed. Surgeon/anaesthetist groups render as labelled `fbReadOnly` rows (lead, SRC, then named additional staff).

**GAP-14 — Actioned body naming.** `markOutpatientOutcomeActioned` in `src/lib/api/legacy.ts` sends `outcome_actioned_date`/`outcome_actioned_user_id`; `docs/restAPI.md` documents `date_actioned`/`user_id`. The server may accept both. *Evidence 2026-07-15*: the database columns added by `scripts/seed-outpatient-outcomes-real-db.ts` are `outcome_actioned_date`/`outcome_actioned_user_id` — matching the client, suggesting the contract doc's wording is stale. *Action*: confirm against the server, then align the wording in [spec/07](07-rest-api-and-data-model.md).

**GAP-15 — Schema drift.** *(Resolved 2026-07-15.)* `setup-db.ts` originally created only six tables; `treatment_summaries`, `implants`, `user_lookup`, and the cooling-off/`highly_sensitive`/actioned columns existed only as scattered DDL inside `scripts/seed-implants-real-db.ts` and `scripts/seed-outpatient-outcomes-real-db.ts` — and **nothing created `cardiology_test_requests`** (the seed script's ALTER loop would fail on a fresh database). *Resolution*: `setup-db.ts` now carries the full contract schema (sections 8–12): `treatment_summaries`, `cardiology_test_requests` (with destination metadata columns), `implants` + indexes, `implants_synced_at` on `operation_notes`, `user_lookup`, the lifecycle-column loop across all form tables + `forms_index`, and a post-ALTER recreation of `forms_index_current` so the view includes the new columns on first run. Seed scripts keep their own DDL for standalone use; DDL shapes copied verbatim so they stay compatible.

## Roadmap (ordered)

1. **Restore build tooling** (GAP-01) — everything else depends on a reproducible build.
2. **Hygiene sweep** (GAP-06, GAP-15) — ~~add `.gitignore`, complete `setup-db.ts`~~ done 2026-07-15; remaining: delete `.vs/` (needs maintainer approval).
3. **Quality baseline** (GAP-05) — `svelte-check`, utility tests, CI.
4. **Engine unification decision** (GAP-02, GAP-10) — decide the target vocabulary and declarative-conditions design before migrating forms.
5. **Complete the runes migration** (GAP-03).
6. **Migrate hand-coded forms** (GAP-04). ~~Fix Engine A RoV tables (GAP-13)~~ done 2026-07-15.
7. **Versioning robustness** — ~~GAP-16, GAP-17, GAP-18~~ done 2026-07-15; GAP-19 done for Engine A (hand-coded remainder rides on GAP-04); remaining: contract reconciliation (GAP-14).
8. **CNT server backend** (GAP-11) when SWAS work is scheduled.
