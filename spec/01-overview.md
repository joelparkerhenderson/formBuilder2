<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: code
Verified-against: 90b6614
Owns: the product statement, sub-product inventory, generational history, and the project glossary.

# spec/01 — Product overview

## Product statement

**formBuilder2** is a re-implementation of the original "shadesOfPale" formBuilder — the WCP (Welsh Clinical Portal) form design and forms engine — using technology intended to be more approachable and more easily reproducible than the original. Its aim is **consistency of design and user experience across all WCP forms** (see `README.md`).

The current implementation is a **SvelteKit + Svelte 5 (runes) single-page application** in `src/`, rendered entirely client-side (`ssr = false` in `src/routes/+layout.ts`) and served under the base path `/formBuilder2/`. A working demo runs at `https://www.shadesOfPale.net/formBuilder2/index.html`.

## The three sub-products

| Sub-product | What it is | Entry route | Detailed spec |
|---|---|---|---|
| **Forms engine** | Renders WCP clinical forms (draft/final, versioned, read-only view) from specifications or hand-coded routes, using the `fb*` design-system component library | `/` (home tiles) → per-form routes | [spec/04](04-engine-a-spec-driven.md), [spec/05](05-engine-b-designer.md), [spec/06](06-forms-catalogue.md) |
| **Composer** | WYSIWYG form designer that produces Engine B (`DesignerFormSpec`) JSON, persisted via the `/designs` API; published forms render at `userForm.html#:publicId` | `/composer` | [spec/05](05-engine-b-designer.md) |
| **Case Note Tracker (CNT)** | Self-contained sub-app for tracking physical case-note volumes (locations, movements, batches, pick lists, requests) | `/cnt` | [spec/08](08-case-note-tracker.md) |

## Audience and usage model

The intended audience is **clinicians, project managers, business analysts, and developers** experimenting or working with WCP form design.

Two usage paths (from `README.md`):

1. **Engage with SGS** — submit a form idea and receive a clinical sense check, design check, English language check, usability check, and a standards-compliant prototype with a working backend and public URL, usually within 48 hours.
2. **AI-driven self-service** — fork the repo, describe the form (prose, Markdown, legacy `.comp.sjs`, JSON, or XML), and prompt an AI to read the design-system specification and a reference implementation, then generate the form and its design document. This spec suite exists to make that path reliable; the operational recipe is in [AGENTS/workflows.md](../AGENTS/workflows.md).

## Generational history

| Generation | Directory | Stack | Status |
|---|---|---|---|
| 1. React | `reactOrig/` | React 19, react-router 7, Vite 6, Tailwind 4, Express + PostgreSQL scripts | Frozen reference — parity audited 2026-07-15; remaining regressions are GAP-16..19 in [spec/10](10-gaps-and-roadmap.md) |
| 2. Standalone Svelte | `svelteOrig/` | Plain Vite 6 multi-page app; components in legacy Svelte-4 dialect (`export let`), compiled under Svelte 5 | Frozen reference |
| 3. **Current** | `src/` | SvelteKit + Svelte 5 runes, client-only SPA | Active; runes migration incomplete (GAP-03) |

The legacy directories are retained "for posterity and reference" and are **never modified** (see [spec/00](00-conventions.md), canonical inputs).

## Glossary

Terms defined here are used unglossed throughout `spec/` and `AGENTS/`.

- **WCP** — Welsh Clinical Portal, the NHS Wales clinical system these forms target.
- **SGS** — the service/team behind formBuilder2 engagement (see `README.md`, "Suggested usage").
- **Engine A** — the `SpecDrivenFormSpec` form engine: hierarchical, hand-authored specs rendered by `src/lib/components/specDriven/SpecDrivenForm.svelte`. Reference: [spec/04](04-engine-a-spec-driven.md).
- **Engine B** — the `DesignerFormSpec` form engine: flat recursive component trees produced by Composer and rendered by the `Generated*` components. Reference: [spec/05](05-engine-b-designer.md).
- **CNT** — Case Note Tracker, the third sub-product.
- **RoV** — Read-only View: the non-editable presentation of a saved form.
- **Draft / Final** — form statuses. A form saved as final enters a *cooling-off* period first.
- **Cooling-off** — the window during which a requested `final` save remains effectively `draft` and editable (240 minutes for most forms, 30 for Cardiology test request); expired rows are promoted to `final` server-side on read. Owned by [spec/07](07-rest-api-and-data-model.md).
- **forms-index** — the cross-form index table/API (`forms_index`, `forms_index_current` view) that Patient record lists; every form save writes a companion index row.
- **hospital_number** — the canonical patient hospital-number field. UI may label it **CRN**, but code and data never introduce new `crn` fields.
- **Addressograph** — the patient identity block (name, DOB, NHS number, hospital number, address) shown on forms (`src/lib/components/fb/fbAddressograph.svelte`).
- **MSI selector** — staff selector (`fbMSISelector`) that records coded staff identity (`_text`, `_NADEXId`, `_coded` companions).
- **SCT** — SNOMED CT; `fbSCTDiagnosis` / `fbSCTProcedure` record coded clinical terms.
- **NADEX Id** — NHS Wales staff directory identifier (e.g. `ow000105`).
- **Highly sensitive** — per-form flag stored as `highly_sensitive`, surfaced as a badge without opening the form.
- **Composer** — the WYSIWYG designer sub-product (formerly "Controller"/"Designer"; legacy auth route aliases remain).
- **SWAS** — the NHS Wales static/Java hosting environment; deployment target where the API is rooted at `/formBuilder2/api`.
- **Volume** — CNT: one physical case-note folder for a patient; volumes move between **locations**, may be grouped into **batches**, and carry movement history events.
