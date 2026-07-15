# Form engines — the decision guide

This repo has **two form-spec engines plus hand-coded forms**. Getting this wrong is the most common way to break things. Full references: [spec/04](../spec/04-engine-a-spec-driven.md) (Engine A), [spec/05](../spec/05-engine-b-designer.md) (Engine B); per-form facts in [spec/06](../spec/06-forms-catalogue.md).

## The three ways a form exists

| | Engine A — `SpecDrivenFormSpec` | Engine B — `DesignerFormSpec` | Hand-coded |
|---|---|---|---|
| Spec shape | Hierarchical: Spec → Section → Row → Cell → Field | Flat recursive `fb*`-typed component tree | None — Svelte all the way down |
| Types | `src/lib/data/specDrivenFormTypes.ts` | `src/lib/data/treatmentSummarySpec.ts` | — |
| Renderer | `src/lib/components/specDriven/SpecDrivenForm.svelte` | `src/lib/components/generated/Generated*` + `src/lib/utils/generatedForm.ts` | The route itself |
| Field vocabulary | `SimpleFieldType` (`text`, `msi`, `procedureTable`, …) | `fb*` names (`fbTextInput`, `fbMSISelector`, …) | `fb*` components directly |
| State keys | `field.key`; compounds with **underscores** (`bp_systolic`) | `component.id`; compounds with **hyphens** (`field3-heightCm`) | Author's choice |
| Authored by | Hand, in TypeScript | Composer WYSIWYG (or hand JSON) | Hand, in Svelte |
| Used by | `operation-note` | `treatment-summary`, `userForm.html`, Composer | `waiting-list-card`, `outpatient-outcome`, `cardiology-test-request` |

The vocabularies map but differ (unification pending — GAP-02); the mapping table is in [spec/05](../spec/05-engine-b-designer.md).

## Which to use for a new form

1. **Default: Engine A.** A new spec-driven clinical form gets a `SpecDrivenFormSpec` in `src/lib/data/specDrivenFormSpecs.ts` and a thin route modelled on `src/routes/operation-note/`. Follow the authoring checklist in [spec/04](../spec/04-engine-a-spec-driven.md).
2. **Engine B only via the Composer path** — when the form is designed in Composer or must render from saved design JSON (`userForm.html`), or follows the treatment-summary "design promoted to clinical form" pattern.
3. **Hand-coded only when the engines can't express it** (heavy bespoke conditional flows like cardiology's per-investigation indication blocks) — model on `src/routes/waiting-list-card/+page.svelte`, the canonical reference named in `README.md`. Prefer extending Engine A over adding a fourth pattern; a new hand-coded form needs a note in [spec/06](../spec/06-forms-catalogue.md) saying why.

## Before touching an existing form

- Identify its engine from the table above (or the [spec/02](../spec/02-architecture.md) matrix) — a change to `SpecDrivenForm.svelte` affects *every* Engine A form; a change to `Generated*` affects every Composer/public form.
- Engine A conditional logic is hardcoded in the renderer (GAP-10) — new conditional behaviour means renderer work, not just spec data.
- Keep save semantics intact: append-only versions, cooling-off, `forms-index` companion row — the rules are in [spec/07](../spec/07-rest-api-and-data-model.md) and [AGENTS/api-and-data.md](api-and-data.md).
- Update [spec/06](../spec/06-forms-catalogue.md) (and the spec/02 matrix if routes change) in the same change.
