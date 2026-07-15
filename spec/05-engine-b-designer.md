<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: code
Verified-against: 637f03a
Owns: the complete Engine B (`DesignerFormSpec`) reference — component-tree types, the generatedForm engine, the Composer pipeline, and the Engine A ↔ B vocabulary mapping.

# spec/05 — Engine B: DesignerFormSpec

Engine B renders a form from a **flat, recursive component tree** whose node `type`s are `fb*` component names directly. It is the format the **Composer** WYSIWYG produces and consumes. Types: `DesignerFormSpec` / `DesignerComponentSpec` in `src/lib/data/treatmentSummarySpec.ts`. Engine utilities: `src/lib/utils/generatedForm.ts`. Renderers: `src/lib/components/generated/` (`GeneratedEditForm`, `GeneratedEditComponent`, `GeneratedReadOnlyForm`, `GeneratedReadOnlyComponent`, `GeneratedTableShell`). Committed instance: `treatmentSummarySpec` (used by `src/routes/treatment-summary/`).

## Type reference

```
DesignerFormSpec { id, publicId, title, patientUuid?, components: DesignerComponentSpec[], savedAt? }
DesignerComponentSpec {
  id, key?, type, label,
  required?, requiredForAudit?, placeholder?, defaultValue?, valueError?, units?,
  bigLabel?, boldLabel?, fullWidth?, noWidthConstraint?, colSpan?,
  options?: DesignerOption[], optionValue?,
  children?: DesignerComponentSpec[],
  tableColumns?, tableRows?, tableCellTemplates?,
  includeDragHandles?, includeRowDeleteButtons?,
  requireAtLeastOneRow?, requireAtLeastOneRowText?,
  includeAddButton?, addButtonLabel?, useFullWidth?
}
```

- `id` is the **form-state key**: `formState[component.id]` holds the value. Ids must be unique in the tree (the Composer client repairs duplicates on load).
- `publicId` is the random-hex public URL key (`userForm.html#:publicId`).
- **Structural types**: `fbSection` (top-level nav sections), `fbGridRow`/`fbGridCell` (grid; `colSpan` clamped 1–12), `fbGroup` (radio group — the *group* id holds the selected child id; `defaultValue` names the pre-selected child), `fbTable`. Legacy aliases `fbQuestionRow`/`fbQuestionRowCell` normalise to row/cell via `componentType`.
- **Leaf field types** (the `fieldTypes` set in `generatedForm.ts`): `fbBloodPressure`, `fbDropdown`, `fbSmartDropdown`, `fbDateExact`, `fbMSISelector`, `fbNumberInput`, `fbNumberInputWithUnits`, `fbDatePartial`, `fbSCTDiagnosis`, `fbSCTProcedure`, `fbTextArea`, `fbTextInput`, `fbTime`, `fbNotificationTypeGroup`.
- **Display/other types** recognised by the pipeline (per `docs/restAPI.md`, `POST /api/designs`): `fbBoxedInfo`, `fbBoxedWarning`, `fbBoxedAlert`, `fbReadOnly`, `fbDateHeightWeightBMIRow`, `fbInverseSubq`, `fbSubqForOption` (bound to an option via `optionValue`).
- **Tables**: `tableColumns` (strings or `{id,label}`), `tableRows` (count or row-id array; default 3), `tableCellTemplates` (one component template per column, row-scoped at render time via `rowScopedComponent` — child ids become `{id}-{rowScope}`), plus the `include*`/`require*` UI flags.

## The generatedForm engine (`src/lib/utils/generatedForm.ts`)

| Function | Behaviour |
|---|---|
| `designerSections(spec)` | Derives nav sections from top-level `fbSection` nodes, with `requiredFields` = `requiredFieldIds()` |
| `requiredFieldIds(component)` | Recursive: a node counts when `required` and it is a leaf field type or an `fbGroup` |
| `defaultFormState(spec)` | Seeds `''` (or string `defaultValue`) for every leaf field and group |
| `componentType(c)` | Normalises legacy `fbQuestionRow(Cell)` aliases |
| `tableColumns/tableRows/tableCellTemplates` | Normalise table config with sensible fallbacks |
| `rowScopedComponent`, `tableRowScope` | Scope a cell template (and its children) to one table row |
| `bmiKeys(c)` | The three state keys of `fbDateHeightWeightBMIRow`: `{id}-dateRecorded/-heightCm/-weightKg` |
| `hasRoVData(c, state)` | Whether a node has data worth showing in RoV (drives empty suppression) |
| `isFbReadOnlyEmptyValue(v)` | Empty test — `''`, `'select'`, `'Select side'`, `[]`, null/undefined |
| `cleanDesignerLabel`, `optionLookup`, `asOptions` | Label/option helpers (trailing `*` stripped from labels) |

Note the state-key convention difference from Engine A: Engine B compound keys use **hyphens** (`{id}-heightCm`), Engine A uses **underscores** (`{key}_heightCm`).

## Composer pipeline

1. **Author** at `/composer` (`src/routes/composer/+page.svelte`): canvas + chrome from `src/lib/components/fbc/` (`fbcPanel`, `fbcProperties`, `fbcActions`, `fbcBreadcrumbs`, `fbcOptions`, `fbcModal`, `fbcButton`), property editors from `src/lib/components/fbcp/`, raw-JSON editing via `src/lib/components/composer/ComposerJsonModal.svelte` (validated/normalised client-side, saved through the same path).
2. **Authenticate** via `/composer-auth/*` (register/verify/login/session/logout/prefs) — contract in [spec/07](07-rest-api-and-data-model.md). The session token lives in the `formBuilder2ComposerSession` cookie + local storage.
3. **Persist** via `POST /designs` (upsert by `publicId`), list via `POST /designs/session/list`, delete via `POST /designs/delete`. The REST layer treats the JSON as opaque and must preserve unknown fields.
4. **Publish**: anyone can render the latest version at `userForm.html#:publicId` — `src/routes/userForm.html/+page.svelte` fetches `GET /designs/public/{publicId}`, normalises it (`normalisePublicDesign`), and renders with `GeneratedEditForm`/`GeneratedReadOnlyForm`.
5. **Save as clinical form**: `src/routes/treatment-summary/` shows the pattern — Engine B state saved as `form_type: 'treatment_summary'` with `form_data` keyed by component ids.

## Engine A ↔ Engine B vocabulary mapping

The two engines name the same controls differently (unification is GAP-02 in [spec/10](10-gaps-and-roadmap.md)):

| Engine A `SimpleFieldType` | Engine B `type` | Notes |
|---|---|---|
| `text` | `fbTextInput` | |
| `textarea` | `fbTextArea` | |
| `dropdown` | `fbDropdown` | |
| `smartDropdown` | `fbSmartDropdown` | |
| `hbSelector` | — | A-only (health boards) |
| `radioGroup` | `fbGroup` + `fbRadio` children | B stores selected *child id*; A stores option value |
| `checkGroup` | — | no direct B equivalent |
| `urgencyGroup`, `surgeonGroup`, `anaesthetistGroup` | — | A-only clinical composites |
| `number` / `numberWithUnits` | `fbNumberInput` / `fbNumberInputWithUnits` | |
| `bloodPressure` | `fbBloodPressure` | A: `{key}_systolic/_diastolic`; B: object or single key |
| `dateHeightWeightBMIRow` | `fbDateHeightWeightBMIRow` | A underscores, B hyphens (see above) |
| `date` / `partialDate` / `time` | `fbDateExact` / `fbDatePartial` / `fbTime` | |
| `msi` | `fbMSISelector` | both write coded companions |
| `sctProcedure` / `sctDiagnosis` | `fbSCTProcedure` / `fbSCTDiagnosis` | |
| `procedureTable`, `diagnosisTable`, `specimenTable`, `implantTable` | `fbTable` + `tableCellTemplates` | A: fixed clinical schemas; B: generic templated tables |
| `imageTiles` | — | A-only placeholder |
| `boxedInfo`/`boxedWarning`/`boxedAlert` | `fbBoxedInfo`/`fbBoxedWarning`/`fbBoxedAlert` | |
| `notificationTypeGroup` | `fbNotificationTypeGroup` | |
| — | `fbReadOnly`, `fbInverseSubq`, `fbSubqForOption` | B-only |
