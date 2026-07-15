<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: code
Verified-against: 90b6614
Owns: the complete Engine A (`SpecDrivenFormSpec`) reference — spec hierarchy, field types, renderer behaviour, and the authoring checklist.

# spec/04 — Engine A: SpecDrivenFormSpec

Engine A renders a clinical form from a **hand-authored, hierarchical TypeScript spec**. Types: `src/lib/data/specDrivenFormTypes.ts`. Renderer: `src/lib/components/specDriven/SpecDrivenForm.svelte` (+ `SpecDrivenTableField.svelte` for table-family fields). Committed instance: `operationNoteSpec` in `src/lib/data/specDrivenFormSpecs.ts`, mounted by `src/routes/operation-note/+page.svelte`.

Use Engine A for new spec-driven clinical forms; the decision guide is [AGENTS/form-engines.md](../AGENTS/form-engines.md).

## Spec hierarchy

```
SpecDrivenFormSpec { title, formType, filename, sections[] }
└─ SimpleSection { id, name, requiredFields?[], rows[] }
   └─ SimpleRow { cols?, noGrid?, cells[] }
      └─ SimpleCell { span?, groupLabel?, fields?[] }
         └─ SimpleField { key, type, label, … }
            └─ SimpleOption { value, label }
```

- `formType` is the REST form type (e.g. `operation_note`) — must be one of the allowed types in [spec/07](07-rest-api-and-data-model.md).
- `SimpleSection.id` becomes the section-nav anchor; `requiredFields` lists the `formState` keys that must be non-empty for the section (and form) to count as complete.
- `SimpleRow`: `cols` forces the grid column count (clamped 1–12 by `rowCols`); otherwise columns = sum of cell spans (min 3, max 12). `noGrid: true` renders cells' fields full-width without the grid.
- `SimpleCell`: `span` (default 1); `groupLabel` wraps the cell's fields in an `FbGroup`.
- `SimpleField` options: `required`, `requiredForAudit`, `subfield` (indent), `span`, `text` (boxed messages), `tooltip`, `units`, `rows` (textarea), `fullWidth`, `noWidthConstraint`, `options[]`.

## Field type reference (`SimpleFieldType`, 29 values)

| Type | Renders | State shape / notes |
|---|---|---|
| `text` | `fbTextInput` | string |
| `textarea` | `fbTextArea` | string; `rows` (default 2), `fullWidth` (auto when `span > 1`) |
| `dropdown` | `fbDropdown` | string; needs `options` |
| `hbSelector` | `fbHBSelector` | string; health-board options |
| `smartDropdown` | `fbSmartDropdown` | string; type-ahead over `options` |
| `radioGroup` | `FbGroup` of `fbRadio` | string = chosen option value |
| `urgencyGroup` | Hardcoded elective/emergency group | `key` = `'elective' | 'emergency'`; elective reveals `electiveUrgency` sub-radios (`routine`/`urgent`/`usc`); choosing emergency clears `electiveUrgency` |
| `checkGroup` | `FbGroup` of `fbCheck` | string[] of chosen values |
| `number` | `fbNumberInput` | string; optional `units` |
| `numberWithUnits` | `fbNumberInputWithUnits` | string; `units` |
| `bloodPressure` | `fbBloodPressure` | two keys: `{key}_systolic`, `{key}_diastolic` |
| `dateHeightWeightBMIRow` | `fbDateHeightWeightBMIRow` | three keys: `{key}_dateRecorded`, `{key}_heightCm`, `{key}_weightKg` |
| `date` | `fbDateExact` in `FbQuestion` | string; defaults to today when the key contains "date" |
| `partialDate` | `fbDatePartial` in `FbQuestion` | string |
| `time` | `fbTime` | string |
| `msi` | `fbMSISelector` | coded: writes `{key}`, `{key}_coded`, `{key}_text`, `{key}_NADEXId` via `setCodedValue` |
| `sctProcedure` | `fbSCTProcedure` | coded: `{key}`, `{key}_coded`, `{key}_text` |
| `sctDiagnosis` | `fbSCTDiagnosis` | coded: same shape |
| `procedureTable` | `SpecDrivenTableField` | rows `{id, side, procedure, additionalInfo}`; seeded with 1 blank row |
| `diagnosisTable` | `SpecDrivenTableField` | rows `{id, diagnosis, diagnosis_coded}`; seeded with 3 blank rows |
| `specimenTable` | `SpecDrivenTableField` | rows `{id, label, description}`; seeded with 3 blank rows |
| `implantTable` | `SpecDrivenTableField` | rows `{id, implantId, description, requiresRemoval, removeBy}`; non-empty rows get a persistent `uuid` on save (`ensureSavedImplantRowUuids`) |
| `surgeonGroup` | `SpecDrivenTableField` | rows `{id, name, coded}`; seeded with 1 row |
| `anaesthetistGroup` | `SpecDrivenTableField` | rows `{id, name, coded}`; seeded with 1 row |
| `imageTiles` | Placeholder 6-tile grid + upload button | display-only prototype |
| `boxedInfo` / `boxedWarning` / `boxedAlert` | `fbBoxedMessage` with matching variant | display-only; content from `field.text` |
| `notificationTypeGroup` | `fbNotificationTypeGroup` | string |

## Renderer behaviour (`SpecDrivenForm.svelte`)

**Props** (`$props()`): `spec`, `patient`, `patientUuid`, `formUuid?`, `savedForm?`, `openInRoV?`, `readOnlyBackOnly?`, `inline?`, `onClose?`.

**State initialisation** (`initialState`): seeds every field key per the table above; also seeds `organisation: 'cwm-taf'`, `hospital: 'princess-wales'`, `speciality: ''` as demo defaults. A `savedForm.form_data` overlays defaults; `formUuid` comes from the prop, the saved form, or `generateUUID()`.

**Derived state**: `effectiveFormStatus` (`final` iff the Final checkbox is ticked), `formChanged` (deep compare against `cleanSnapshot` via `compareFormStatesObj` in `src/lib/utils/formStateUtils.ts`), `requiredFieldsComplete`.

**Validation** is *required-completeness only* (`areAllSectionsComplete`): every section's `requiredFields` must be non-empty, with two special cases — `procedures` needs at least one row with a non-empty `procedure`; `urgency` passes when `emergency`, or `elective` **and** `electiveUrgency` set. There is no schema/regex validation layer, and conditional logic is hardcoded in the renderer, not declarative in the spec (GAP-10 in [spec/10](10-gaps-and-roadmap.md)).

**Tables**: immutable row updates keyed by numeric `id` (`nextRowId` = max+1); `removeTableRow` refuses to empty the table (min 1 row); HTML5 drag-and-drop row reordering (`tableRowDragStart/Over/Drop` → `moveTableRow`), scoped per table key.

**Save flow** (`saveForm`):
1. Password must be non-empty ("Enter password before saving.") — no server-side auth check; see [spec/09](09-non-functional.md).
2. Implant rows get persistent `uuid`s (`ensureSavedImplantRowUuids`).
3. `version` = current + 1 (append-only, never in-place); `event_datetime` derived from `date`/`operationDate`/`clinicDate` (fallback: now); `form_data` = full form state + `uuid`, `highlySensitive`, `finalChecked`, `savedBy`.
4. `POST /forms/{formType}` then `POST /forms-index` (title/summary = `spec.title`, `event_or_document: 'Document'`) — contract in [spec/07](07-rest-api-and-data-model.md), including the cooling-off conversion of requested `final`.
5. On success: snapshot refreshed, password cleared, switch to RoV.

**Read-only view (RoV)**: the `rovField` snippet renders each field via `fbReadOnly` (option labels resolved by `optionLabel`; blood pressure as `systolic/diastolic mmHg`; BMI row as three read-only fields). Table-family fields render read-only `fbTable`s with proper headers (empty rows filtered, blank optional cells shown as em-dashes, entirely-empty tables suppressed); surgeon/anaesthetist groups render as labelled `fbReadOnly` rows. Sections whose fields are all empty are hidden entirely (`sectionHasRovData`; display-only boxed messages and image placeholders never count as data), and the section nav shows only visible sections. An **EV** (edit view) button returns to editing unless the form is final, superseded, or `readOnlyBackOnly`.

**Version history**: for saved forms the renderer loads the version list (`getFormHistory`) on mount and after each save, shows a **History** button in the RoV footer, and opens any version read-only via `viewHistoryVersion` (`getFormVersion`). Routes may pass a `formVersion` query param to open a specific version directly (see `src/routes/operation-note/+page.ts` — historical versions always open in RoV). Save numbering asks the server for the latest version and uses `max(latest, loaded) + 1`, so saving after viewing an old version cannot collide with existing rows.

**Superseded state**: the renderer derives `superseded` (viewed version older than the latest in history); the RoV header then shows `fbBadgeSuperseded` and the EV/History controls are hidden, matching the react-era behaviour.

**Stale-save guard**: before inserting, the save flow calls `assertFormVersionIsLatest` (`src/lib/utils/formVersion.ts`); if another editor saved a newer version since this form was opened, the "Changes NOT saved" modal (`fbModalStaleSave`) appears and Continue reloads the current version into RoV.

## Authoring checklist — adding an Engine A form

1. Specify the form in [spec/06](06-forms-catalogue.md) first (sections, fields, required keys, form type).
2. Add the spec object to `src/lib/data/specDrivenFormSpecs.ts`, importing option data from `src/lib/data/` (`healthBoards`, `facilities`, `specialities`, …). Field `key`s must be unique across the whole form.
3. Confirm the `formType` is in the REST allowed list and has a mapped table ([spec/07](07-rest-api-and-data-model.md)); if not, that is a backend change to raise, not a client-side workaround.
4. Add a route `src/routes/<form-name>/+page.svelte` + `+page.ts` modelled on `src/routes/operation-note/` (query-param loading, `ssr = false`).
5. Add a home tile in `src/lib/components/app/SvelteKitHome.svelte`.
6. List every `required` field key in its section's `requiredFields` — the renderer does not infer this from `field.required`.
7. Update spec/06 (and spec/02's route matrix) in the same change, per [spec/00](00-conventions.md).
