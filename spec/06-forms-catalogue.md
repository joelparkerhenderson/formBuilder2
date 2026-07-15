<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: code
Verified-against: 637f03a
Owns: the per-form living specifications — one entry per clinical form, plus supporting screens.

# spec/06 — Forms catalogue

One entry per clinical form, in a fixed template: *Purpose · Route & files · Engine & persistence · Sections · Behaviour notes · Known deviations*. The route ↔ engine matrix is owned by [spec/02](02-architecture.md); engine mechanics by [spec/04](04-engine-a-spec-driven.md) and [spec/05](05-engine-b-designer.md); save/versioning/cooling-off rules by [spec/07](07-rest-api-and-data-model.md).

| Form | Route | Engine | `form_type` | Cooling-off |
|---|---|---|---|---|
| Waiting list card | `/waiting-list-card` | Hand-coded (reference) | `waiting_list_card` | 240 min |
| Operation note | `/operation-note` | Engine A | `operation_note` | 240 min |
| Outpatient outcome | `/outpatient-outcome` | Hand-coded | `outpatient_outcome` | 240 min |
| Treatment summary | `/treatment-summary` | Engine B | `treatment_summary` | 240 min |
| Cardiology test request | `/cardiology-test-request` | Hand-coded | `cardiology_test_request` | 30 min |
| Public Composer forms | `/userForm.html#:publicId` | Engine B | (design, not clinical) | — |

All clinical forms share the common chrome and lifecycle: `fbLayout` with section nav, `fbHeader` with addressograph and badges, bottom controls with Highly-sensitive + Final checkboxes and username/password, append-only versioned save (`POST /forms/{type}` + `POST /forms-index`), and RoV after save.

## Waiting list card

- **Purpose**: lists a patient for a planned procedure (priority, procedure details, risks, pre-op, anaesthesia, post-op).
- **Route & files**: `src/routes/waiting-list-card/+page.svelte` (~938 lines) + `+page.ts`; option data and label lookups in `src/lib/data/waitingListCard.ts`.
- **Engine & persistence**: hand-coded against the `fb*` primitives; saves `form_type: 'waiting_list_card'`.
- **Sections**: From · Listing and priority · Planned procedure(s) · Specific operative risks · Pre-operative · Anaesthesia · Post-op · Other. (RoV condenses to From / Listing / Procedure / Other.)
- **Behaviour notes**: this is the **canonical reference implementation** named in `README.md`'s AI prompt — new hand-coded forms should be modelled on it.
- **Known deviations**: predates both engines (GAP-04).

## Operation note

- **Purpose**: records an operation — surgeons/anaesthetists, procedures, findings, specimens, implants.
- **Route & files**: `src/routes/operation-note/+page.svelte` (thin mount) + `+page.ts`; spec object `operationNoteSpec` in `src/lib/data/specDrivenFormSpecs.ts`.
- **Engine & persistence**: **Engine A** — the only committed `SpecDrivenFormSpec`; saves `form_type: 'operation_note'` with destination metadata columns (`organisation`, `hospital`, `senior_responsible_clinician`, `speciality`).
- **Sections** (8): Basic information · Surgeons and anaesthetists · Prophylaxis and other specific preop or intraop medication · Procedure(s) · Detail · Tissue removed and pathological specimens · Images · Implants – Scan for safety.
- **Behaviour notes**: required-field specials — `procedures` needs ≥1 non-empty row; `urgency` needs `emergency` or `elective`+`electiveUrgency`. On a **final** save, non-empty `form_data.implants[]` rows get persistent UUIDs and, after cooling-off promotion, are synchronised into the Implant registry (`implants` table; rows dropped in a later final version become `superseded`). Contract detail in [spec/07](07-rest-api-and-data-model.md).
- **Known deviations**: RoV renders table fields as raw JSON (GAP-13).

## Outpatient outcome

- **Purpose**: records the outcome of an outpatient appointment and feeds the operational Outpatient outcomes worklist.
- **Route & files**: `src/routes/outpatient-outcome/+page.svelte` (~795 lines) + `+page.ts`.
- **Engine & persistence**: hand-coded; saves `form_type: 'outpatient_outcome'` with an `appointment_uuid` link. Saving links the appointment (`PATCH /appointments/{uuid}` sets `outcome_form_uuid`).
- **Behaviour notes**: the worklist at `/system/outpatient-outcomes` shows appointments with linked outcome forms; a truly-final outcome can be marked **actioned** (`PATCH /outpatient-outcomes/{appointmentUuid}/actioned`), which appends a new appointment version (audit trail) — cooling-off drafts cannot be actioned.
- **Known deviations**: hand-coded (GAP-04).

## Treatment summary

- **Purpose**: cancer treatment summary — diagnosis, treatment aim, prognosis, referrals, follow-up.
- **Route & files**: `src/routes/treatment-summary/+page.svelte` + `+page.ts`; spec object `treatmentSummarySpec` in `src/lib/data/treatmentSummarySpec.ts`.
- **Engine & persistence**: **Engine B** via `GeneratedEditForm`/`GeneratedReadOnlyForm` + `designerSections`/`defaultFormState`; saves `form_type: 'treatment_summary'` with `form_data` keyed by **component ids** from the JSON spec (e.g. `field19`).
- **Sections** (6): Details · Diagnosis · Treatment · Prognosis · Referrals · Follow-up.
- **Behaviour notes**: demonstrates the "Composer design promoted to a clinical form" path.
- **Known deviations**: component-id state keys make `form_data` non-self-describing — a consequence of the Engine B format (GAP-02 discussion).

## Cardiology test request

- **Purpose**: electronic test request (eTR) for cardiology investigations — ABPM, ambulatory ECG, exercise tolerance test, implantable loop recorder, CIED check, tilt test, transthoracic echo — with per-investigation indication blocks.
- **Route & files**: `src/routes/cardiology-test-request/+page.svelte` (~701 lines, bespoke `{#snippet}` indication blocks per investigation) + `+page.ts`.
- **Engine & persistence**: hand-coded; saves `form_type: 'cardiology_test_request'` with destination metadata in `organisation`, `hospital`, `senior_responsible_clinician`, `speciality`.
- **Behaviour notes**: shortest cooling-off (30 minutes).
- **Known deviations**: hand-coded and the largest single route; prime candidate for Engine A migration (GAP-04). The legacy `reactOrig/src/etr/CardiologyTestRequest.tsx` is larger — diff before assuming parity (GAP-09).

## Supporting screens (not forms, but agents touch them)

- **Patient record** — `src/routes/patient-record/[uuid]/` loads patient + forms index + appointments in parallel (`+page.ts`); shows form tiles with status/highly-sensitive badges, version history (`fbFormHistoryMenu`), and the Add-form menu. `/patient-record` (no uuid) is the entry/selector.
- **Patient search / registry** — `/patient-search` (fuzzy via `POST /patients/search`), `/patient-registry` (full list).
- **Implant registry** — `/system/implant-registry`: rows from `GET /implants` (superseded excluded), mark-removed via `PATCH /implants/{id}/removed`.
- **Outpatient outcomes worklist** — `/system/outpatient-outcomes`: see Outpatient outcome above.
- **Component library** — `/component-library`: gallery of the `fb*` primitives ([spec/03](03-design-system.md)).
- **Home** — `/`: tile menu (`src/lib/components/app/SvelteKitHome.svelte`); patient-form tiles carry a demo `patientUuid` query param.

## Adding a form to this catalogue

Author the entry *first* (spec-driven), then implement per the recipes in [AGENTS/workflows.md](../AGENTS/workflows.md) and the checklist in [spec/04](04-engine-a-spec-driven.md). Every new form must appear in: this file, the spec/02 route matrix, the home tiles, and (if a new `form_type`) the REST allowed list in [spec/07](07-rest-api-and-data-model.md).
