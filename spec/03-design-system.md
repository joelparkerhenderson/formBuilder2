<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: docs/wcp-eForms-designSystem-specification.html
Verified-against: 90b6614
Owns: the machine-readable index of the WCP eForms design system — tokens, the fb* component inventory, and cross-cutting rules. On any conflict, the canonical HTML specification wins.

# spec/03 — Design system

This file is the distilled, machine-readable index of the WCP eForms design system. The **canonical specification is `docs/wcp-eForms-designSystem-specification.html`** (prose, rationale, per-component detail) with worked examples in `docs/wcp-eForms-designSystem-examples.html`. This file indexes what an agent needs at authoring time and points back to the HTML for depth. Live reference implementations: `src/routes/component-library/` (gallery) and `src/routes/waiting-list-card/` (the canonical form example).

## Design tokens

Defined as CSS custom properties in `src/styles/global.css` and duplicated as TS constants in `src/lib/constants/fbColours.ts` (GAP-08 in [spec/10](10-gaps-and-roadmap.md) — `global.css` is authoritative).

| Token | Value | Use |
|---|---|---|
| `--fb-blue` | `#1b6ec2` | Primary: buttons, borders, section chrome |
| `--fb-red` | `#d50000` | Errors, alerts, required markers |
| `--fb-green` | `#008000` | Success, confirmation |
| `--fb-orange` | `#fd8a10` | Warnings |
| `--fb-active-lighter-yellow` | `#ffffcc` | Question hover/focus highlight (outer) |
| `--fb-active-darker-yellow` | `#fee715` | Nested question / radio-item highlight (inner) |
| `--fb-silver` | `#c0c0c0` | Borders, muted chrome |
| `--fb-light-blue` | `#8cd2e7` | Secondary accents |
| `--fb-faint-green` | `#c5e1a5` | Subtle positive backgrounds |
| `--fb-white` / `--fb-black` | `#ffffff` / `#000000` | Base |

**Typography**: Roboto (weights 300/400/500/700, via Google Fonts import) is forced with `!important` on effectively all elements; Material Icons for iconography (`.material-icons`); the addressograph card alone uses Arial/Helvetica. Sizes in `rem`.

**Focus/hover model** (from `global.css`): form inputs suppress default outlines/box-shadows; instead the *containing question* highlights — `.fb-question-container` hover/focus-within gets the lighter yellow, nested containers and radio/checkbox items get the darker yellow (the "Highlight Hierarchy" of the HTML spec).

**Responsive rule**: below 768 px, `.fb-grid-row` collapses to a single column and `.fb-layout-nav` is hidden.

## Component inventory — `src/lib/components/fb/` (77 components)

Per-component behavioural detail (props, states, edge rules) lives in the HTML spec's "Component specifications detail"; this table is the inventory and one-line purpose. Casing note: two files are Pascal-cased (`FbModalActions`, `FbModalMessage`) — see GAP-07.

### Form question primitives

| Component | Purpose |
|---|---|
| `fbTextInput` | Single-line text question |
| `fbTextArea` | Multi-line text question (`rows`, `fullWidth`) |
| `fbNumberInput` | Numeric input |
| `fbNumberInputWithUnits` | Numeric input with a fixed units suffix |
| `fbDropdown` | Select from `{value,label}` options |
| `fbSmartDropdown` | Type-ahead dropdown (logic in `src/lib/utils/smartDropdown.ts`) |
| `fbHBSelector` | Health-board selector (options from `src/lib/data/clinicalDestinations.ts`) |
| `fbRadio` | Single radio option; children render as subquestions |
| `fbCheck` | Single checkbox option |
| `fbGroup` | Labelled group wrapper for radios/checks/related fields |
| `fbDateExact` | Full date control |
| `fbDatePartial` | Partial date (year, or year+month) |
| `fbDateDisplay` | Read-only date presentation |
| `fbTime` | Time-of-day control |
| `fbBloodPressure` | Paired systolic/diastolic inputs (`_systolic`/`_diastolic` state keys) |
| `fbDateHeightWeightBMIRow` | Date/height/weight row with computed BMI (`src/lib/utils/bmi.ts`) |
| `fbMSISelector` | Coded staff selector; writes `_text`, `_NADEXId`, `_coded` companions |
| `fbSCTDiagnosis` | SNOMED CT diagnosis selector (coded flag) |
| `fbSCTProcedure` | SNOMED CT procedure selector (coded flag) |
| `fbSCTSelector` | Shared SNOMED CT selector base |
| `fbNotificationTypeGroup` | Notification-type radio group |
| `fbSubqForOption` | Subquestion shown for a chosen option value |
| `fbInverseSubq` | Subquestion shown when an option is *not* chosen |
| `fbAnimatedSubquestion` | Animated reveal wrapper for subquestions |
| `fbValueError` | Inline value-error message |
| `fbRequiredForAudit` | "Required for audit" marker |
| `fbHoverTooltipField` | Field wrapper with hover tooltip |

### Layout and page chrome

| Component | Purpose |
|---|---|
| `fbLayout` | Form page shell: section nav + content + bottom controls (snippets: `header`, `bottomControls`) |
| `fbLayoutNav` | Left section navigation with completeness indicators |
| `fbSection` | Titled form section (nav target) |
| `fbGridRow` / `fbGridCell` | 1–12 column grid row / spanning cell |
| `fbQuestion` | Label + control wrapper (required markers, subfield indent) |
| `fbHeader` | Form header: title, addressograph, status badges |
| `fbAddressograph` | Patient identity card |
| `fbBottomControlsRow` | Save bar: highly-sensitive + final checkboxes, username/password, save/cancel, RoV switch |
| `fbSaveCancelButtons` | Save/cancel pair |
| `fbFinalControl` | Final checkbox control |
| `fbAuthAndSensitivity` / `fbAuthControls` | Auth (username/password) and sensitivity groupings |
| `fbUserName` | Username display/input |
| `fbSearchInput` | Search box |
| `fbButton` / `fbButtonSmaller` | Primary/secondary buttons |
| `fbAddButton` / `fbAddButtonSmall` / `fbAddButtonForPage` | Add-row / add-item buttons |
| `fbCancelFormButton` | Cancel/back button |
| `fbAddFormMenu` | "Add form" menu on patient record |
| `fbFormTile` | Home/patient-record form tile |
| `fbOutpatientAppointmentTile` | Appointment tile on patient record |
| `fbFormHistoryMenu` | Version-history menu on saved forms |
| `fbToolTip` / `fbToolTipUser` | Tooltip; user-record tooltip (NADEX enrichment) |
| `fbReadOnly` | Read-only field presentation for RoV (units, coded marker, `preserveGridSpace`) |
| `context.ts` | Shared component context helpers |

### Tables

| Component | Purpose |
|---|---|
| `fbTable` | Table shell (columns, add-row, drag handles, delete buttons) |
| `fbTableHeader` / `fbTableHeaderCell` | Header row / cell |
| `fbTableBody` / `fbTableRow` / `fbTableCell` | Body / row / cell |

### Messages, badges, modals

| Component | Purpose |
|---|---|
| `fbBoxedMessage` | Boxed message base (`variant: info | warning | alert`) |
| `fbBoxedInfo` / `fbBoxedWarning` / `fbBoxedAlert` | Variant wrappers |
| `fbBadgeDraft` | Draft status badge |
| `fbBadgeSuperseded` | Superseded-version badge (currently imported nowhere — GAP-17) |
| `fbBadgeHighlySensitive` | Highly-sensitive badge |
| `fbModal` / `FbModalActions` / `FbModalMessage` | Modal base, action row, message body |
| `fbModalPassword` | Password prompt |
| `fbModalSaving` / `fbModalSaved` / `fbModalSaveError` | Save lifecycle modals |
| `fbModalDraft` / `fbModalCancel` | Draft-saved / cancel-confirm modals |
| `fbPopup` (HTML spec) | Popup — *listed in the HTML spec; verify presence before citing* |

## Cross-cutting rules

Each rule is owned (with rationale) by the named section of the canonical HTML spec:

- **Highlight Hierarchy** — nested hover/focus highlighting as encoded in `src/styles/global.css` (outer lighter-yellow, inner darker-yellow).
- **Required-Label Rendering** — how required markers and `requiredForAudit` render on labels.
- **Label equalisation and textarea expansion** — aligned label heights across a grid row; textareas grow with content.
- **Date controls detail** — exact vs partial date semantics and storage formats (`src/lib/utils/dateFormat.ts`: `formatFormDate`, `formDateToIsoDate`).
- **fbMSISelector detail / fbSCT selectors detail** — coded-value behaviour and companion state keys.
- **RoV Rules** — what renders (and what is suppressed) in read-only view; empty-value suppression per `isFbReadOnlyEmptyValue` in `src/lib/utils/generatedForm.ts`.
- **Tooltip Behaviour**, **Value Errors**, **Password cleanup**, **Shared CSS rules** — see the HTML spec sections of the same names.
- **Accessibility** — the HTML spec's Accessibility section; requirements distilled in [spec/09](09-non-functional.md).

## Adding a component

Register new primitives here *and* follow the recipe in [AGENTS/workflows.md](../AGENTS/workflows.md): check the HTML spec for an existing pattern, follow `fb*` naming and prop conventions ([AGENTS/conventions.md](../AGENTS/conventions.md)), add it to the `/component-library` gallery, and wire it into the engines only via their type vocabularies ([spec/04](04-engine-a-spec-driven.md), [spec/05](05-engine-b-designer.md)).
