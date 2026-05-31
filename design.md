# formBuilder2

This document details the complete design specification, styling rules, behavioral policies, state engines, database schemas, and visual paradigms for the clinical-form editing environment. It contains all information required to regenerate the application from scratch without additional prompting.

---

## Document conventions

The document uses standard prefix tags and variables to represent repeated design elements:
- `fbXxx` represents a custom React component or visual framework element.
- `fbRed` represents the deep red colour value `color: #d50000;`.
- `fbGreen` represents the clinical green colour value `color: #008000;`.
- `fbBlue` represents the royal blue theme colour value `color: #1b6ec2;`.
- `fbActiveLighterYellow` represents the light highlighting colour value `color: #ffffcc;`.
- `fbActiveDarkerYellow` represents the rich hover highlighting and active focus colour value `color: #fee715;`.
- `fbSilver` represents the standard border colour value `color: silver;` (hex `#c0c0c0`).
- `fbOrange` represents the uncoded warning indicator colour value `color: #fd8a10;` or `color: #f59e0b;`.
- `fbLightBlue` represents the tooltip and meta visual header background colour value `color: #8cd2e7;`.
- `fbWhite` represents the baseline background colour value `color: #ffffff;`.
- `fbBlack` represents the text and dark alignment colour value `color: #000000;`.
- `fbLayoutMain` represents the global application wrapper structure.

---

## Document overview

The documentation is organized into the following direct modules:
- Introductory paragraph
- Document conventions
- Document overview
- Language rules
- Colours and typography
- Description of features common to all forms
- The RoV "rules"
- List of the custom components
- A description of navigation through the application
- A description of each form
- The algorithms and javascript fragments used to provide the features common to all forms
- Detailed description of the complex custom controls
- The CSS rules and declarations
- Brief technical overview of the whole app
- List of compile and runtime dependencies
- Brief description of compile and deploy steps
- The database tables, described using SQL DDL
- Templates for the SQL Queries used by the app

---

## Language rules

- Use sentence case for all bullet points, form labels, headings, buttons, and system messages.
- Capitalise only proper nouns, acronyms (e.g. NHS, SNOMED CT, DOAC, MRSA, CRN), and standard clinical short codes.
- Use UK English spellings exclusively across the application (e.g., `'colour'`, `'speciality'`, `'programme'`, `'anaesthesia'`, `'authorisation'`).
- Do not use US spellings unless explicitly required by third-party URL paths or API targets.

---

## Colours and typography

- Standard typography uses Google Roboto globally (`fontFamily: "'Roboto', sans-serif";`) across text fields, selectors, lists, headings, buttons, forms, and ordinary layout text.
- Material Icons are explicitly excluded from Roboto enforcement so icon ligatures render with the Material Icons font.
- NHS addressograph cards are explicitly excluded from Roboto enforcement and use Arial/Helvetica to match the printed-card style.
- The primary application theme is high-contrast clinical light mode.
- Standard borders use `border: 0.1rem solid silver;` and `borderRadius: 0.4rem;`.
- The following visual color constants are configured:
  - `fbRed`: `#d50000`
  - `fbGreen`: `#008000`
  - `fbBlue`: `#1b6ec2`
  - `fbActiveLighterYellow`: `#ffffcc`
  - `fbActiveDarkerYellow`: `#fee715`
  - `fbSilver`: `#c0c0c0`
  - `fbWhite`: `#ffffff`
  - `fbBlack`: `#000000`
  - `fbOrange`: `#fd8a10`
  - `fbLightBlue`: `#8cd2e7`

---

## Description of features common to all forms

### General layout
- All forms are nested inside the `fbLayout` global page wrapper component.
- The scrolling behaviour uses `overflowY: 'auto';` on a main central workspace container.
- The top header consists of `fbHeader`, containing the form title on the left and `fbAddressograph` on the right.
- The header uses `borderBottom: "0.2rem solid " + fbBlue;` with a subtle grey `backgroundColor: '#f8f9fa';`.
- The form footer consists of `fbBottomControlsRow` at the absolute bottom of the viewport.
- The footer uses `borderTop: "0.2rem solid " + fbBlue;` with a solid white `backgroundColor: '#ffffff';`.
- The sidebar navigation panel is visible in both edit and read-only views on the left-hand side.
- Visual width of the navigation panel is constrained to `width: 16rem;` (`w-64`).
- If the viewport is very narrow (width `< 768px`), the navigation panel is hidden.
- Desktop rows stacked in grids collapse into single-column layouts on narrow screens.
- All dynamic label heights are equalized across columns on desktop viewports and reset on mobile viewports.
- Edit-form label equalization and textarea auto-expansion are implemented by `/src/utils/formLayoutEffects.ts`; the shared hooks deliberately preserve the desktop label-alignment behaviour while resetting heights on mobile to avoid redundant vertical whitespace.
- Simple textarea input resizing also uses `/src/utils/formLayoutEffects.ts` (`resizeTextareaToContent`) so manual `onInput` handlers match the automatic edit-form textarea behaviour.
- Tooltip state, delayed hide behaviour, screen-position calculation, and rendering are implemented by `/src/utils/useFbTooltips.tsx`; Operation Note, Outpatient Outcome, and relevant read-only views share this hook while preserving their existing tooltip triggers.
- Default clinical date display strings use `/src/utils/dateFormat.ts` (`formatClinicalDate`) for the `dd-Mmm-yyyy` format used when initializing form dates.

### Overview of sections, section headers, question rows, question row cells, questions and subquestions
- Clinical forms are partitioned into multiple high-level container components `fbSection`.
- Each `fbSection` container includes a dedicated section header, implemented via the `fbSectionHeader` component displaying a high-contrast visual title bar, followed by a list of child controls.
- Inside each `fbSection`, the child content is structured as a list of `fbQuestionRow` containers (or sometimes just individual questions that are not grouped inside a row).
- Row elements use the `fbQuestionRow` layout blocks to arrange questions horizontally using CSS grid.
- Where there are four questions in a row, the `fbQuestionRow` contains exactly four `fbQuestionRowCell` components, each of which wraps a single question. If there is a second (or third) set of questions, there is a second (or third) separate `fbQuestionRowCell` nested inside the row.
- Grid spaces and relative horizontal weights are divided cleanly using `<fbQuestionRowCell span={n}>` layout blocks.
- Individual fields are wrapped in `fbQuestion`, which provides visual labels and structured padding.
- Hidden display-conditional subquestions render recursively nested inline beneath selected parent triggers inside matching sections.

### List of question types with names of associated custom controls
- Standard text input: `fbTextInput` (alphanumeric text).
- Multi-line description text blocks: `fbTextArea` (auto-expanding inputs).
- Fixed option selectors: `fbDropdown` (native drop-downs).
- Quantity fields: `fbNumberInput` (input with side units).
- Single choice lists: `fbRadio` (radio select buttons).
- Multi-choice items: `fbCheck` (checkbox selectors).
- Date values: `fbDateControl` (date off-set controller).
- Terminology procedure tags: `fbSCTProcedure` (SNOMED CT autocomplete wrapper around `fbSCTSelector`).
- Terminology diagnosis tags: `fbSCTDiagnosis` (SNOMED CT diagnosis autocomplete wrapper around `fbSCTSelector`).
- Clinical staff index tags: `fbMSISelector` (hospital clinician autocomplete).

### Description of the required indicator for controls with and without labels
- Handled centrally by `fbQuestion`, `fbTextInput`, `fbTextArea`, and `fbMSISelector` components.
- If the target question field is required, it displays a red asterisk using `color: fbRed;` (`*`).
- If a label exists, the asterisk is grouped with the last word of the label string in a single word-wrap container (`whiteSpace: 'nowrap';`).
- This prevents the asterisk from wrapping alone onto a new line, which appears as a layout defect.
- If there is no label (e.g., hidden nested subquestions), the asterisk is displayed immediately to the right of the control.
- In unlabelled scenarios, the indicator is top-aligned with the control with zero line breaks.

### Description of subquestions and their behaviour
- There is no standalone `fbSubquestion` component. Conditional subquestions are rendered by `fbRadio` and `fbCheck` when they receive `children`; those components emit the `fb-subquestion-wrapper` and `fb-subquestion` class hooks used by highlighting, label equalisation, and tooltip placement.
- Visually aligned under parent options with deep indentation style `paddingLeft: '1.5rem';` (`pl-6`).
- Fully enclosed inside conditional React renders `{parentValue === 'yes' && (...) }` to prevent initial pre-flashes.
- Stored inputs of subquestions are explicitly reset to empty strings if parent values are changed.
- Inputs utilize a direct two-way binding pattern linked to the active parent state.

### Description of how textareas behave - autoexpand, line break preservation
- All multi-line `fbTextArea` components initialize with standard heights `rows={2}`.
- Textareas dynamically expand heights based on character volume tracking `textarea.scrollHeight`.
- Line breaks (`\n`) and returns (`\r`) in user descriptions are preserved.
- When rendered inside read-only views, fields are styled with `whiteSpace: 'pre-line';` to retain formatting.

### Description of peculiarities of any other controls
- Quantity-with-unit inputs use a `.fb-input-with-units` wrapper.
- Container borders override standard elements; internal state input elements suppress native outlines (`border: none;`).
- Normalization ensures a simple vertical separator divider is drawn between quantity values and text unit blocks.

### Overview of MSISelector, SCTProcedure and SCTDiagnosis and any other complex controls
- Connect to HTTP endpoints on shadesofpale.net.
- Autocomplete search text is processed securely with base auth (`dhcw:dhcw`).
- Dropdowns show results with a double-pane column layout.
- The double-pane layout uses `width: 45rem;` width.
- Left column is matches list (one-third width); right column is clinical concept meta fields (two-thirds width).
- Display lists support keyboard interactions (Up Arrow, Down Arrow, Enter, Escape).
- Close actions have a `200ms` delay on blur to safely register user clicks.
- Standard search execution is locked to trigger only when the input element has active document focus.
- Selection confirmations record a `_coded` boolean value inside parent form states.
- Handled index listings update confirmed status immediately back to unconfirmed when users edit strings.

### Description of the highlighting system
- A hierarchical hover/focus yellow alternate highlighting system is used for questions and groups.
- Elements trigger highlights when hovered, focused, or focused within `focus-within`.
- Outer question containers use `backgroundColor: fbActiveLighterYellow;`.
- Inner active inputs, radios, check items, or subquestions use `backgroundColor: fbActiveDarkerYellow;`.
- Highly nested active question items alternate color back to `backgroundColor: fbActiveLighterYellow;`.
- The nesting highlighting loops indefinitely over odd and even levels.
- `fbLayout` is the single owner of edit-form nested highlight event wiring, so individual forms do not carry duplicate mouse/focus listener blocks.
- Table table-cells inherit standard highlights via the `<fbTableCell>` wrapper.
- To prevent whole-row flashes, hovering custom controls highlights the active table cell rather than the row.
- Nesting level checks count `TD` table elements as a level to ensure radio choices inside cells highlight correctly.

### Description of the tooltip behaviour
- Handled using the custom component `fbToolTip`.
- Absolute coordinates position help-bubbles directly near related clinical labels.
- Interactive tooltips are non-intrusive and avoid layout shift.
- Manual close buttons on tooltips require a solid black border (`border: 0.1rem solid black;`).
- Tooltip dimensions are kept compact using a `padding: '0 0.3rem';` button scale.
- For radios/checks in grouped questions, tooltip bubbles appear just below the option label and align approximately `2rem` to the right of the actual radio/checkbox control.
- Tooltip bubbles clamp their horizontal position inside the viewport so they do not bleed off the right edge of the page.
- When a radio/check option has an open subquestion beneath it, the tooltip moves above the option label so it does not obscure the subquestion fields.
- Read-only views may render the same custom tooltip bubbles for clinical labels where explanatory text still matters.
- Open-subquestion detection uses component-generated wrappers (`fb-subquestion-wrapper`) and namespaced manual subquestion blocks (`fb-subquestion`) used in Outpatient Outcome.

### Description of the save enabled / disabled functionality
- Evaluates form state completeness via validation scripts `areRequiredFieldsComplete()`.
- If required questions are incomplete, footer action items are locked.
- Disabled buttons use a solid grey background `backgroundColor: fbSilver;` with white text.
- If changes have occurred, the save button variant alternates to `backgroundColor: fbGreen;`.
- If no changes exist, the button is disabled using standard grey.

### Description of the save as draft behaviour and final control
- Unfinalised forms save with a status of `'draft'`.
- Saving as a draft prompts the user with the `fbDraftPopup` confirmation message.
- Draft indicators display `fbDraftBadge` (white bold text on `backgroundColor: fbRed;` with zero border-radius).
- Finalized states are reached by checking `fbFinalControl` checkmarks in footers.
- Complete finalization locks forms into permanent read-only event logs.

### What happens when RoV, Save and Cancel are clicked
- **RoV Toggle Button**: Triggered via toggle buttons in active edit views.
  - Checks if state has changes.
  - If changes exist, prompts users with authentication re-entry.
  - Passes modified transient state directly to read-only drawers without database writes.
- **Save and Close**: Triggered in footers.
  - Checks if password has been re-entered when changes exist.
  - Checks if finalization marks are unchecked to prompt `fbDraftPopup`.
  - Appends clinical record entries to Supabase.
- **Cancel Button**: Triggered via specialized `fbCancelFormButton` red button.
  - Shows `fbCancelPopup` warning layout if modifications are present.
  - Dismissing warning discards changes and routes away.

### `<Enter>` key behaviour
- Forms prevent the `<Enter>` key from submitting inputs inadvertently.
- Handled using standard KeyDown interceptors on parent forms.
- Enter keystrokes only trigger submissions if target focus is a button of `type="submit"`.
- Textarea elements bypass blocking actions to permit normal multi-line paragraph additions.

---

## The RoV "rules"

- Omit missing details and empty questions in read-only layouts.
- Spacing grids must be preserved to prevent layout collapse.
- Spacing grids are preserved by wrapping inner components in conditional layout blocks while retaining columns:
  ```tsx
  <div>
    {formState.field && (
      <div className="space-y-2 fb-question-container">
        <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Field</label>
        <div style={{ fontWeight: 500 }}>{formState.field}</div>
      </div>
    )}
  </div>
  ```
- Checked radio or checkbox statuses render selected labels as plain text strings (`fontWeight: 500;`) with no visual checkboxes.
- Unselected options are omitted.
- Select dropdown values are mapped inside RoV lists through lookup utilities to print complete descriptive labels.
- Sidebar navigator entries omit locators, checkbox indicators, and badge counts in RoV.
- Staff details render confirmed status ticks (`check_circle_outline`) and warning badges (`warning`) in RoV.
- Standard RoV field display is centralized in `fbRoVField`; it preserves a blank grid placeholder for absent values when a column must not collapse.
- Repeated RoV table-cell typography is centralized in `fbRoVTableCell`, with related CSS selectors named under the `fb-rov-*` component namespace.
- Repeated RoV header and footer chrome is centralized in `fbRoVHeader` and `fbRoVFooter`; the shared shell owns the draft badge, addressograph, username display, and EV/Edit/Back controls.
- Shared clinical option display labels live in `/src/data/formLabels.ts` for organisation, speciality, hospital, side, and yes/no/unknown values.

---

## List of the custom components

| Component | File | Purpose | Arguments | Structure / Layout & CSS |
| :--- | :--- | :--- | :--- | :--- |
| `fbButton` | `/src/components/fbButton.tsx` | Standard action button with hover checks | `variant`, `disabled`, `onClick`, `style` | `<button className="fb-button">` with transition `border: 0.1rem solid fbActiveDarkerYellow;` on hover. |
| `fbTextInput` | `/src/components/fbTextInput.tsx` | Standard textual field input | `id`, `name`, `label`, `required`, `value`, `onChange` | Rendered via `fbQuestion` as `<div className="fb-question-container">` with inner `<input>` styled with `border: 0.1rem solid silver;`. |
| `fbTextArea` | `/src/components/fbTextArea.tsx` | Standard auto-expanding textarea | `id`, `name`, `label`, `required`, `value`, `onChange` | Rendered via `fbQuestion` as `<div className="fb-question-container">` with inner `<textarea>` resizing via layout effects. |
| `fbDropdown` | `/src/components/fbDropdown.tsx` | Native styled dropdown element | `id`, `name`, `label`, `required`, `value`, `onChange`, `options` | `<select>` having overrides `border: 0.1rem solid silver;` and standard padding `0.2rem;`. |
| `fbNumberInput` | `/src/components/fbNumberInput.tsx` | Input box supporting side units | `id`, `name`, `label`, `required`, `value`, `onChange`, `units` | Uses the shared `fbQuestion` wrapper and, when units are present, the namespaced `fb-input-with-units` side-unit styling. |
| `fbSection` | `/src/components/fbSection.tsx` | Group container with a blue heading | `title`, `children` | `<div className="fb-section-block">` hosting the `fbSectionHeader` element and structural questions lists. |
| `fbSectionHeader` | *Part of `fbSection`* | Section visual bar displaying title | `title` | `<h3>` styled with royal blue background, sans-serif font, white text and sentence case. |
| `fbQuestionRow` | `/src/components/fbQuestionRow.tsx` | Multi-column grid layout row | `cols`, `children` | `<div className="questions-row grid">` with robust responsive column sizes. |
| `fbQuestionRowCell` | `/src/components/fbQuestionRowCell.tsx` | Column spanning grid cell | `span`, `children` | `<div className="question-row-cell">` with span mapping selectors. |
| `fbQuestion` | `/src/components/fbQuestion.tsx` | Label and asterisk helper | `label`, `required`, `children` | Wraps children with elegant top-aligned sentence-case question labels. |
| `fbRadio` | `/src/components/fbRadio.tsx` | Direct single-option radio click | `id`, `name`, `value`, `checked`, `label`, `onChange` | `<label className="fb-radio-checkbox-item">` inside `fb-subquestion-wrapper`, supporting highlight nesting and conditional children. |
| `fbCheck` | `/src/components/fbCheck.tsx` | Direct multi-choice check option | `id`, `name`, `checked`, `label`, `onChange` | `<label className="fb-radio-checkbox-item">` inside `fb-subquestion-wrapper`, supporting nested conditional children. |
| `fbGroup` | `/src/components/fbGroup.tsx` | Aligns list selectors under questions | `label`, `children` | `<div className="fb-radio-checkbox-group-container">` grouping choice controls; optional group labels are Roboto 300, 1rem, black. |
| `fbTable` | `/src/components/fbTable.tsx` | Unified custom grid tabular list layout | `children` | Exports elements `FbTable` through `FbTableCell` utilizing clean borders. |
| `fbTableCell` | `/src/components/fbTableCell.tsx` | Hoverable cell for procedures lists | `children`, `style` | `<td>` supporting transition classes `hover:bg-fbActiveLighterYellow;` without row flashes. |
| `fbAddressograph` | `/src/components/fbAddressograph.tsx` | Standard clinical patient card | `patient`, `style` | Card using `fontFamily: Arial;` of size `90mm` by `11pt` with standard tooltips. |
| `fbHeader` | `/src/components/fbHeader.tsx` | Clinical form top heading block | `title`, `patient` | Left title paired with right-aligned demographics inside a grey header strip. |
| `fbLayout` | `/src/components/fbLayout.tsx` | Main application shell layout wrapper | `children`, `title` | Incorporates layout areas, sidebar drawers, and footer blocks. |
| `fbDraftBadge` | `/src/components/fbDraftBadge.tsx` | Unsaved indicator badge | None | Square block using `backgroundColor: fbRed;` with white text. |
| `fbDraftPopup` | `/src/components/fbDraftPopup.tsx` | Confirms save on drafts | `isOpen`, `onConfirm`, `onCancel` | Modal with blue border prompts for draft status saves. |
| `fbPasswordPopup` | `/src/components/fbPasswordPopup.tsx` | Enforces active password validations | `isOpen`, `onSave`, `onCancel` | Modal using `fbPassword` inputs requesting passwords. |
| `fbCancelPopup` | `/src/components/fbCancelPopup.tsx` | Asks to save modified state | `isOpen`, `onDiscard`, `onCancel` | Warning box prompting to discard changes or return to form. |
| `fbCancelFormButton` | `/src/components/fbCancelFormButton.tsx` | Special dismiss button | `onClick` | Special red button component labeled with sentence-case variant `'Cancel'`. |
| `fbUserName` | `/src/components/fbUserName.tsx` | Interactive username updater | `value`, `onChange` | `<input>` reflecting `demoUser` stored inside footers with yellow highlight support. |
| `fbAddButton` | `/src/components/fbAddButton.tsx` | Unified custom inline plus action button | `onClick`, `label` | High contrast button triggers row append events inside medical list tables. |
| `fbSmallAddButton` | `/src/components/fbSmallAddButton.tsx` | Compact inline add/open action button | `onClick`, `label` | Same behaviour and visual language as `fbAddButton`, with `fontSize: 0.8rem` and reduced vertical scale for inline subquestions. |
| `fbAddButtonForPage` | `/src/components/fbAddButtonForPage.tsx` | Prominent header card action button | `onClick`, `label` | Centered action block offering quick access to trigger new form creation popups. |
| `fbAddFormMenu` | `/src/components/fbAddFormMenu.tsx` | Form launch list selector overlay | `onSelect`, `isOpen`, `onClose` | Overlay dashboard selector to choose and spin up empty clinical document instances. |
| `fbAuthAndSensitivity` | `/src/components/fbAuthAndSensitivity.tsx` | Form security & validation settings banner | `highlySensitive`, `onToggleSensitivity` | Security panel grouping the document-wide lock and clinical signature elements. |
| `fbAuthControls` | `/src/components/fbAuthControls.tsx` | Active confirmation password controls bar | `onVerify`, `onChange` | Action confirmation fields verifying credentials before executing state transitions. |
| `fbAutoExpandingTextarea` | `/src/components/fbAutoExpandingTextarea.tsx` | Content volume auto-resizable description area | `id`, `name`, `value`, `onChange` | Custom textbox extending vertical height dynamically to fit text breaks cleanly. |
| `fbFinalControl` | `/src/components/fbFinalControl.tsx` | Terminal document completion checkbox | `checked`, `onChange` | Form completion toggle setting record status to either final or active draft in footer. |
| `fbFormTile` | `/src/components/fbFormTile.tsx` | Historical clinical file timeline entry card | `form`, `onOpen` | Responsive panel indexing record versions, dates, draft states, and clinicians. |
| `fbNavigationPanel` | `/src/components/fbNavigationPanel.tsx` | Structural slide-out sidebar navigation list | `sections`, `activeSection`, `onScroll` | Vertical timeline index aiding rapid navigation between form chapters on desktop. |
| `fbOutpatientAppointmentTile` | `/src/components/fbOutpatientAppointmentTile.tsx` | Visual clinics index registry tile | `appointment`, `onOpen` | Demographics list card tracking clinic schedules, status badges and consultant owners. |
| `fbPassword` | `/src/components/fbPassword.tsx` | Masked security credential input element | `value`, `onChange` | Secure input element containing custom character masking and clear icons. |
| `fbSaveCancelButtons` | `/src/components/fbSaveCancelButtons.tsx` | Aggregated bottom edit actions bar | `onSave`, `onCancel`, `disabled` | Unified action grouping managing form save pipelines, draft badges and exit routes. |
| `fbSearchInput` | `/src/components/fbSearchInput.tsx` | Instant-focus index text filter widget | `value`, `onChange`, `onClear` | Standard filter field with matching cleaning symbols and focused state tracking. |
| `fbTextInputWithUnits` | `/src/components/fbTextInputWithUnits.tsx` | Technical measurement numerical control | `id`, `value`, `onChange`, `units` | Composite text fields appending diagnostic measurement parameters standardly. |
| `fbBottomControlsRow` | `/src/components/fbBottomControlsRow.tsx` | Footer strip layout container | None | Full-width grey bottom strip displaying demo user text and local time displays. |
| `fbDateControl` | `/src/components/fbDateControl.tsx` | Highly customized precision date picker | `name`, `value`, `onChange`, `placeholder`, `required` | Keyboard inputs matching date regexes and double stepper calendars selectors. |
| `fbMSISelector` | `/src/components/fbMSISelector.tsx` | Live searching clinician input field | `name`, `value`, `coded`, `onChange`, `required` | Dynamic lookup field showing validation coded tick or warning indicators. |
| `fbRoVHeader` | `/src/components/fbRoVShell.tsx` | Shared read-only-view title/header chrome | `title`, `patient`, `formStatus` | Renders the draft badge, page title, and addressograph with consistent RoV blue divider spacing. |
| `fbRoVFooter` | `/src/components/fbRoVShell.tsx` | Shared read-only-view footer chrome | `username`, `reachedByRoVButton`, `onSwitchToEV`, `onBack` | Renders username plus EV/Edit/Back controls with consistent RoV blue divider spacing. |
| `fbRoVField` | `/src/components/fbRoVField.tsx` | Shared read-only field renderer | `label`, `value`, `lookupTable`, `units`, `coded` | Preserves RoV grid spacing for empty values, prints labels and pre-line values consistently, and renders coded/not-coded indicators where supplied. |
| `fbRoVTableCell` | `/src/components/fbRoVField.tsx` | Shared read-only table cell renderer | `tone`, `verticalAlign`, standard `<td>` props | Applies repeated RoV table cell typography through `fb-rov-*` CSS classes. |
| `fbSCTSelector` | `/src/components/fbSCTSelector.tsx` | Shared double-pane SNOMED CT selector engine | `name`, `value`, `onChange`, `searchCommand`, `mode`, `coded` | Internal generic component containing SCT search, history, popup positioning, parser use, and coded/not-coded indicators. |
| `fbSCTDiagnosis` | `/src/components/fbSCTDiagnosis.tsx` | Diagnosis-specific SNOMED CT wrapper | `value`, `name`, `onChange`, `placeholder` | Documentation/specification-facing wrapper around `fbSCTSelector` using disorder search behaviour. |
| `fbSCTProcedure` | `/src/components/fbSCTProcedure.tsx` | Procedure-specific SNOMED CT wrapper | `value`, `name`, `coded`, `onChange`, `placeholder` | Documentation/specification-facing wrapper around `fbSCTSelector` using procedure search behaviour. |
| `fbToolTip` | `/src/components/fbToolTip.tsx` | Hover overlay message tooltips helper | `id`, `text`, `children` | Custom label layouts spawning responsive popup description bubbles instantly. |

---

## Global routing and navigation matrix

- Navigation is structured around five central screens: Home page, Patient registry, Patient search, Patient record, and clinical document editor.
- **Home page (`/`)**:
  - Serves as the application landing screen.
  - Displays primary links: "Patient registry" and "Patient search".
  - Active user session details are persisted as `"demoUser"` in local storage.
- **Patient registry**:
  - Reached via the home page.
  - Lists patients alphabetically by Surname, then Forenames, then DOB.
  - Clicking on a patient card dynamically toggles display styles, opening Patient record view inline on the same page.
- **Patient search**:
  - Reached via the home page.
  - Focuses search inputs instantly on mount and queries using Postgres pg_trgm fuzzy similarity.
  - Matches open Patient record sheets inline.
- **Patient record**:
  - Displays patient demography and chronological EHR history list.
  - Highlights future clinics using "Future appt" and non-outcomed visits using "Not outcomed".
  - Add additions trigger "New form or document" launches standard creation modals.
  - "Open" triggers load clinical forms in RoV inline, hiding parent dashboards.
- **Clinical form edit views (wlc, oo, op note)**:
  - Reached from records dashboards.
  - Cancel and Back buttons navigate back depending on origin context (`location.state.openInRoV`).
  - If openInRoV is undefined, Cancel routes clinicians back to Home page (`'/'`).
  - If openInRoV is defined, Cancel routes clinicians back to the active Patient record screen.

---

### Description of each form

### Forms about patients

#### 1. Waiting List Card (`wlc`)
- Reached from "New form or document" popup selections inside Patient Record.
- Fetches static baseline parameters from Supabase to load active clinical profiles.
- Form contents include:
  - `fbSection`: From
    - `fbDropdown`: Organisation (required, default: `'cwm-taf'`)
      - `aneurin-bevan`: Aneurin Bevan
      - `betsi-cadwaladr`: Betsi Cadwaladr
      - `cardiff-vale`: Cardiff & Vale
      - `cwm-taf`: Cwm Taf Morgannwg
      - `hywel-dda`: Hywel Dda
      - `powys`: Powys
      - `swansea-bay`: Swansea Bay
      - `velindre`: Velindre
    - `fbDropdown`: Speciality (required, loaded from `./data/specialities`)
    - `fbDropdown`: Hospital (required, default: `'princess-wales'`)
      - `prince-charles`: Prince Charles Hospital, Merthyr Tydfil
      - `royal-glamorgan`: Royal Glamorgan Hospital, Llantrisant
      - `princess-wales`: Princess of Wales Hospital, Bridgend
    - `fbMSISelector`: Senior responsible clinician (required, key: `seniorClinician`)
  - `fbSection`: Listing and priority
    - `fbQuestionRow`
      - `fbQuestionRowCell span={2}`
        - `fbDateControl`: Date listed (required, key: `dateListed`, default: today)
      - `fbQuestionRowCell span={2}`
        - `fbMSISelector`: Listed by clinician (key: `listedBy`)
    - `fbQuestionRow`
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Urgency (required)
          - `fbRadio`: Routine
          - `fbRadio`: Urgent
          - `fbRadio`: USC - Urgent Suspected Cancer
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Operating surgeon
          - `fbRadio`: Any grade with supervision
          - `fbRadio`: Discuss with consultant
          - `fbRadio`: Consultant only
          - `fbRadio`: Named clinician
            - `fbMSISelector`: Clinician name (required, key: `namedClinicianName`, unlabelled required asterisk placed on right side)
          - `fbRadio`: Unknown (default)
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Patient available at short notice
          - `fbRadio`: Yes
          - `fbRadio`: No
          - `fbRadio`: Unknown (default)
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Royal College of Surgeons priority
          - `fbRadio`: Yes
          - `fbRadio`: No
          - `fbRadio`: Unknown (default)
  - `fbSection`: Planned procedure(s)
    - `fbTable`: Drag-and-drop interactive procedures table list
      - `fbTableCell` (left-most position): Drag handle column (displays icon `swap_vertical_circle`)
      - `fbTableCell`: Surgical side selection column
        - `fbDropdown`: Surgical side selection (key: `side`)
          - `left`: Left
          - `right`: Right
          - `bilateral`: Bilateral
          - `na`: Not applicable
      - `fbTableCell`: Core procedure name column (`fbSCTProcedure` autocomplete search selector)
      - `fbTableCell`: Supplementary notes column (standard textual input)
      - `fbTableCell` (extreme right): Delete row column (displays icon `highlight_off` to trigger instant row deletion code)
  - `fbSection`: Specific operative risks
    - `fbQuestionRow`
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Risks
          - `fbCheck`: Diabetic
          - `fbCheck`: Latex allergy
          - `fbCheck`: MRSA
          - `fbCheck`: Pacemaker
          - `fbCheck`: Blood transfusion refusal
          - `fbCheck`: Previous anaesthetic reactions
            - `fbTextArea`: Previous anaesthetic reactions details (required, key: `riskReactionsDetail`)
          - `fbCheck`: Other
            - `fbTextArea`: Other risk details (required, key: `riskOtherDetail`, asterisk on right)
      - `fbQuestionRowCell span={1}`
        - `fbGroup` — Anticoagulants & antiplatelet agents (using fbQuestion container wrapping):
          - `fbCheck`: DOAC
            - `fbTextInput`: Drug name (required, key: `doac-name`)
            - `fbGroup`: Indication (key: `doac-indication`)
              - `fbRadio`: DVT/PE (acute)
              - `fbRadio`: DVT/PE (prevention)
              - `fbRadio`: Atrial fibrillation
              - `fbRadio`: Other
                - `fbTextInput`: Specify (key: `doac-indication-other`)
          - `fbCheck`: Warfarin
            - `fbGroup`: Indication (key: `warfarin-indication`)
              - `fbRadio`: DVT/PE (acute)
              - `fbRadio`: DVT/PE (prevention)
              - `fbRadio`: Atrial fibrillation
              - `fbRadio`: Other
                - `fbTextInput`: Specify (key: `warfarin-indication-other`)
          - `fbCheck`: Aspirin
            - `fbGroup`: Indication (key: `aspirin-indication`)
              - `fbRadio`: Pain
              - `fbRadio`: Stroke prevention
              - `fbRadio`: Other
                - `fbTextInput`: Specify (key: `aspirin-indication-other`)
            - `fbGroup`: Dose (key: `aspirin-dose`)
              - `fbRadio`: 75mg
              - `fbRadio`: 300mg
              - `fbRadio`: Other
                - `fbTextInput`: Specify (key: `aspirin-dose-other`)
          - `fbCheck`: Clopidogrel
          - `fbCheck`: Other anticoagulant or antiplatelet
            - `fbTextInput`: Medication and dose (required, key: `anticoag-other-med`)
            - `fbTextInput`: Indication (required, key: `anticoag-other-indication`)
      - `fbQuestionRowCell span={2}`
        - `fbTextArea`: Surgeon's specific anticoagulant instructions (key: `anticoagInstructions`)
  - `fbSection`: Pre-operative
    - `fbQuestionRow`
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Intended management (required)
          - `fbRadio`: Outpatient
          - `fbRadio`: Daycase
          - `fbRadio`: Inpatient
          - `fbRadio`: Unknown (default)
      - `fbQuestionRowCell span={1}`
        - `fbNumberInput`: Admit before surgery (key: `admitBefore`, units: `'days'`, default: 0)
      - `fbQuestionRowCell span={1}`
        - `fbDateControl`: Estimated date of admission (key: `estimatedAdmission`)
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Pre-operative imaging required
          - `fbRadio`: Yes
            - `fbTextArea`: Pre-op imaging details (required, key: `imagingDetail`)
          - `fbRadio`: No
          - `fbRadio`: Unknown (default)
  - `fbSection`: Anaesthesia
    - `fbQuestionRow`
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Planned anaesthetic type
          - `fbRadio`: General
          - `fbRadio`: Regional
          - `fbRadio`: Local
          - `fbRadio`: None
          - `fbRadio`: Unknown (default)
      - `fbQuestionRowCell span={3}`
        - `fbTextArea`: Anaesthesia requirements (key: `anaesthesiaRequirements`)
  - `fbSection`: Post-op
    - `fbQuestionRow`
      - `fbQuestionRowCell span={1}`
        - `fbNumberInput`: Planned length of post-op stay (key: `postopStay`, units: `'days'`)
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Bed requirement
          - `fbRadio`: ITU
          - `fbRadio`: HDU
          - `fbRadio`: PACU
          - `fbRadio`: Ward bed
          - `fbRadio`: Unknown (default)
      - `fbQuestionRowCell span={2}`
        - `fbTextArea`: Post-operative requirements (key: `postopRequirements`)
  - `fbSection`: Other
    - `fbQuestionRow`
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Could this case be outsourced?
          - `fbRadio`: Yes
          - `fbRadio`: No
          - `fbRadio`: Unknown (default)
      - `fbQuestionRowCell span={3}`
        - `fbTextArea`: Any other information (key: `otherInfo`)

#### 2. Outpatient Outcome (`oo`)
- Reached via patient appointments list inside Patient Record.
- Structured around visual Groups instead of sections. Suppresses EV sidebar navigation.
- Form contents include:
  - Group: Appointment
    - Organisation (read-only label)
    - Speciality (read-only label)
    - Site (read-only label)
    - Senior Clinician (read-only label)
    - Clinic name (compact block label)
    - Date and Time (compact block label)
  - Group: Consultation Outcome
    - `fbGroup`: Attendance (required)
      - `fbRadio`: Attended
        - `fbGroup`: Urgent suspected cancer (required, key: `usc`)
          - `fbRadio`: Yes
          - `fbRadio`: No
          - In Outpatient Outcome RoV, the displayed `Urgent suspected cancer` label uses `fontWeight: 500; fontSize: '1rem';`.
        - `fbSCTDiagnosis`: Working diagnosis (key: `workingDiagnosis`)
      - `fbRadio`: Unable to attend
        - `fbTextInput`: Reason (key: `unableReason`)
        - `fbRadio`: Another appointment already made
          - `fbDateControl`: Date (key: `anotherApptDate`)
        - `fbRadio`: Send another appointment
        - `fbRadio`: No further appointment
          - `fbRadio`: Send system-generated letter to GP and patient
          - `fbRadio`: Letter to GP and patient done
      - `fbRadio`: Did not attend
        - `fbCheck`: Was not brought
        - `fbRadio`: Send another appointment
        - `fbRadio`: No further appointment
          - `fbRadio`: Send system-generated letter to GP and patient
          - `fbRadio`: Letter to GP and patient done
  - Group: Status / Referrals
    - `fbCheck`: Discharge
    - `fbCheck`: See on symptom
      - `fbRadio`: Six months
      - `fbRadio`: Twelve months
    - `fbCheck`: Patient initiated follow-up
    - `fbCheck`: Remote monitoring
    - `fbCheck`: Tests requested
      - `fbRadio`: Result required before deciding treatment
      - `fbRadio`: Result required for monitoring or after treatment
      - `fbTextArea`: Tests requested (key: `testsRequested`)
    - `fbCheck`: Add to waiting list for surgery or other treatment
      - Hidden field: `linkedWaitingListCardUuid`; persisted in database column `outpatient_outcomes.linked_waiting_list_card_uuid`, nullable UUID. It links the OO record to the WLC created/opened from this subquestion.
      - First subquestion row in EV uses `fbSmallAddButton` controls. `Create waiting list card` is shown only when there is no linked WLC; `Open waiting list card` is shown only when `linkedWaitingListCardUuid` exists.
        - `Create waiting list card` hides the OO form by setting its wrapper `style.display` to `none` and mounts an inline WLC EV for the same patient. It pre-fills organisation, speciality, hospital/site, senior responsible clinician, today's date as `dateListed`, and maps OO `Urgent suspected cancer` to WLC `Urgency > USC`. The inline WLC hides its own RoV button.
        - `Open waiting list card` opens the linked WLC using the same display-toggle inline transition: from OO EV it opens WLC EV and Cancel returns to OO EV; from OO RoV it opens WLC RoV with Edit and Back buttons and no EV button.
        - On successful WLC save and close, OO updates `linkedWaitingListCardUuid`, maps WLC `intendedManagement: daycase` to OO waiting-list `Day case`, maps `intendedManagement: inpatient` to OO waiting-list `Inpatient`, and populates `Treatment planned` from comma-separated `[side ]procedure` values from the WLC procedure rows. WLC side values of `na` / `Not applicable` are omitted from the OO display.
      - In RoV, only `Open waiting list card` is shown, and only when `Add to waiting list...` is selected and `linkedWaitingListCardUuid` exists.
      - `fbGroup`: Waiting list
        - `fbRadio`: Day case
        - `fbRadio`: Inpatient
      - `fbTextArea`: Treatment planned (required, key: `treatmentPlanned`)
    - `fbCheck`: Outpatient treatment planned
      - `fbTextArea`: Treatment planned (required, key: `oprxTreatmentPlanned`)
      - `fbGroup`: Priority
        - `fbRadio`: Routine
        - `fbRadio`: Urgent
        - `fbRadio`: Urgent suspected cancer
    - `fbCheck`: Admitted from clinic to wait or department
    - `fbCheck`: MDT review
    - `fbCheck`: Treatment given in clinic today
      - `fbTextArea`: Treatment given (required, key: `treatmentGiven`)
    - `fbCheck`: Stop referral to treatment clock
    - `fbCheck`: Referred to therapies
      - `fbTextArea`: Therapy or department (for example physiotherapy) (required, key: `therapyDetails`)
    - `fbCheck`: Referred to another consultant, speciality or hospital
      - `fbTextInput`: Consultant, speciality or hospital (required, key: `consultantDetails`)
    - `fbCheck`: Follow up appointment
      - `fbCheck`: Patient to remain on cancer pathway (key: `cancerPathway`)
      - `fbTextInput`: Interval (required, key: `interval`)
      - `fbCheck`: Must be seen in the same clinic (key: `sameClinic`)
      - `fbCheck`: Must be seen by the same senior responsible clinician (key: `sameClinician`)
      - `fbGroup`: Consultation type
        - `fbRadio`: Face to face
          - `fbTextInput`: Hospital (if different) (key: `hospitalDifferent`)
        - `fbRadio`: Telephone consultation
        - `fbRadio`: Video call
        - `fbRadio`: Case review (patient not required to attend)
      - `fbGroup`: Priority (appointment directive)
        - `fbRadio`: A* : Overbook
        - `fbRadio`: A : Do not postpone appointment
        - `fbRadio`: B : Do not postpone appointment for more than four weeks
        - `fbRadio`: D : After test results
        - `fbRadio`: T : Add to outpatient treatment waiting list
      - `fbTextInput`: Tests to be done on arrival (key: `testsOnArrival`)
  - **Outcome check boxes enabling / disabling (mutual exclusivity) logic**:
    - Outcome choices are categorized into **Tier 1** and **Tier 2** to enforce strict pathways:
      - **Tier 1**: Discharged, SOS: See on symptom, PIFU: Patient initiated follow-up.
      - **Tier 2**: Remote monitoring, Tests required, Wait listed, Outpatient treatment planned, Admitted from clinic, MDT review, and Follow up appointment.
    - **Logic specifications**:
      - If *any* Tier 1 checkbox is checked, *all* Tier 2 checkboxes are immediately disabled.
      - If *any* Tier 1 checkbox is checked, all *other* Tier 1 checkboxes are immediately disabled (making Tier 1 completely mutually exclusive).
      - If *any* Tier 2 checkbox is checked, *all* Tier 1 checkboxes are immediately disabled.
      - The non-pathway checkboxes ("Treatment given in clinic today", "Referral to therapies", and "Referral to consultant") always remain active and enabled regardless of the selected Tier.

#### 3. Operation Note (`op note`)
- Reached from Patient Record forms menu.
- Form contents include:
  - `fbSection`: Basic information
    - `fbDropdown`: Organisation (required, default: `'cwm-taf'`)
      - `aneurin-bevan`: Aneurin Bevan
      - `betsi-cadwaladr`: Betsi Cadwaladr
      - `cardiff-vale`: Cardiff & Vale
      - `cwm-taf`: Cwm Taf Morgannwg
      - `hywel-dda`: Hywel Dda
      - `powys`: Powys
      - `swansea-bay`: Swansea Bay
      - `velindre`: Velindre
    - `fbDropdown`: Speciality (required, loaded from `./data/specialities`)
    - `fbDropdown`: Hospital (required, default: `'princess-wales'`)
      - `prince-charles`: Prince Charles Hospital, Merthyr Tydfil
      - `royal-glamorgan`: Royal Glamorgan Hospital, Llantrisant
      - `princess-wales`: Princess of Wales Hospital, Bridgend
    - `fbQuestionRow`
      - `fbQuestionRowCell span={1}`
        - `fbGroup`: Urgency (required)
          - `fbRadio`: Elective
            - `fbRadio`: Routine
            - `fbRadio`: Urgent
            - `fbRadio`: USC (default)
          - `fbRadio`: Emergency
      - `fbQuestionRowCell span={1}`
        - `fbDateControl`: Date (required, key: `date`, default: today)
      - `fbQuestionRowCell span={1}`
        - `fbTextInput`: Start (key: `startTime`, type: `'time'`)
      - `fbQuestionRowCell span={1}`
        - `fbTextInput`: End (key: `endTime`, type: `'time'`)
  - `fbSection`: Surgeons and anaesthetists
    - `fbQuestionRow`
      - `fbQuestionRowCell span={2}`
        - `fbGroup`: Surgeons
          - `fbMSISelector`: Lead operating surgeon (required, key: `leadSurgeon`)
          - `fbMSISelector`: Additional surgeons (key: `additionalSurgeons`)
          - `fbAddButton`: Add surgeon
          - `fbMSISelector`: Supervising surgeon present (key: `supervisingSurgeon`)
          - `fbMSISelector`: Senior responsible clinician (required, key: `surgeonSRC`)
      - `fbQuestionRowCell span={2}`
        - `fbGroup`: Anaesthetists
          - `fbMSISelector`: Lead anaesthetist (required, key: `leadAnaesthetist`)
          - `fbMSISelector`: Additional anaesthetists (key: `additionalAnaesthetists`)
          - `fbAddButton`: Add anaesthetist
          - `fbMSISelector`: Supervising anaesthetist present (key: `supervisingAnaesthetist`)
          - `fbMSISelector`: Senior responsible clinician (required, key: `anaesthetistSRC`)
  - `fbSection`: Prophylaxis and other specific preop or intraop medication
    - `fbQuestionRow`
      - `fbQuestionRowCell span={1}`
        - `fbTextArea`: Antibiotic prophylaxis (key: `antibioticProphylaxis`)
      - `fbQuestionRowCell span={1}`
        - `fbTextArea`: Venous thromboembolism prophylaxis (key: `vteProphylaxis`)
      - `fbQuestionRowCell span={1}`
        - `fbTextArea`: Other (key: `otherMedication`)
  - `fbSection`: Procedure(s)
    - `fbTable`: Planned procedures drag-to-reorder list
      - `fbTableCell` (left-most position): Drag handle column (displays icon `swap_vertical_circle`)
      - `fbTableCell`: Surgical side selection column
        - `fbDropdown`: Side (key: `side`)
          - `left`: Left
          - `right`: Right
          - `bilateral`: Bilateral
          - `na`: Not applicable
      - `fbTableCell`: Core procedure name column (`fbSCTProcedure` autocomplete search selector)
      - `fbTableCell`: Supplementary notes column (standard textual input)
      - `fbTableCell` (extreme right): Delete row column (displays icon `highlight_off` to trigger instant row deletion code)
  - `fbSection`: Detail
    - `fbTextArea`: Indication (key: `indication`)
    - `fbTextArea`: Incision (key: `incision`)
    - `fbTextArea`: Findings (key: `findings`)
    - `fbGroup`: Operative diagnoses
      - `fbTable`: Drag-to-reorder diagnoses list
        - `fbTableCell` (left-most position): Drag handle column (displays icon `swap_vertical_circle`)
        - `fbTableCell`: Core diagnosis name column (`fbSCTDiagnosis` autocomplete search selector)
        - `fbTableCell` (extreme right): Delete row column (displays icon `highlight_off` to trigger instant row deletion code)
      - `fbAddButton`: Add operative diagnosis
    - `fbTextArea`: Procedure description (key: `procedureDescription`)
    - `fbTextArea`: Extra procedures undertaken (key: `extraProcedures`)
    - `fbNumberInput`: Estimated blood loss (key: `bloodLoss`, units: `'ml'`)
    - `fbTextArea`: Specific surgical intraoperative problems encountered (key: `problems`)
    - `fbTextArea`: Closure (key: `closure`)
    - `fbTextArea`: Post-op instructions (key: `postOpInstructions`)
    - `fbTextArea`: Follow-up (key: `followUp`)
  - `fbSection`: Tissue removed and pathological specimens
    - `fbTable`: Specimen lists and biopsies
      - `fbTableCell` (left-most position): Drag handle column (displays icon `swap_vertical_circle`)
      - `fbTableCell`: Specimen reference name block (standard text input)
      - `fbTableCell`: Type / Description (standard textarea)
      - `fbTableCell` (extreme right): Delete button (icon `highlight_off`)
    - `fbAddButton`: Add specimen
  - `fbSection`: Images
    - Visual placeholder thumbnail blocks with a grid size repeat layout.
  - `fbSection`: Implants - Scan for safety
    - `fbTable`: Implants list
      - `fbTableCell` (left-most position): Drag handle column (displays icon `swap_vertical_circle`)
      - `fbTableCell`: Implant ID (standard input)
      - `fbTableCell`: Description (standard textarea)
      - `fbTableCell`: Does this implant require exchange or removal?
        - `fbRadio`: Yes
          - `fbDateControl`: Remove by (required, format: `dd-Mmm-yyyy`)
        - `fbRadio`: No
      - `fbTableCell` (extreme right): Delete row column (displays icon `highlight_off` to trigger instant row deletion code)
    - `fbAddButton`: Add another implant

### The application / navigation forms

#### 1. Home page (`Home.tsx`)
- High-contrast typography displays main title `"formBuilder2"` (`fontSize: "2rem"; margin: "1rem 0";` sentence case).
- Renders big blue centered navigation buttons pointing to Patient registry and Patient search.
- The footer retains the standard `fbBottomControlsRow` rendering active user sessions.

#### 2. Patient registry (`PatientRegistry.tsx`)
- Suppresses standard Patient Addressograph panels.
- Loads registry items from database view in alphabetical order of Surnames first.
- Clicking patient cards toggles `style.display="none"` on lists, showing PatientRecord inline.

#### 3. Patient search (`PatientSearch.tsx`)
- Autofocuses the `fbSearchInput` widget wrapper centrally on page mount.
- Displays a silver clearing cross (`✕`) on input values to clear lists and re-focus.
- Retains plain "No matches found" message if searches return empty strings.

#### 4. Patient record (`PatientRecord.tsx`)
- Streamlines index lists in a single-column layout, hiding the grey navigation panel.
- Arranges cards in a chronological event index timeline using standard `forms_index_current` tables.
- Renders future hospital appointments in visual bright-green "Future appt" tags.
- Open triggers mount form components in the DOM, hiding the parent records dashboard.

---

## The algorithms and javascript fragments used to provide features common to all forms

### State snapshotting & dirty check equation (`formChanged`)
Used inside `formStateUtils.ts` to compare modified fields against initialized records:
```typescript
export const compareFormStatesObj = (snap: any, current: any) => {
  if (!snap || !current) return false;

  const allKeys = Array.from(new Set([
    ...Object.keys(snap.formState || {}),
    ...Object.keys(current.formState || {})
  ]));

  for (const key of allKeys) {
    const v1 = snap.formState?.[key] === null || snap.formState?.[key] === undefined ? "" : snap.formState[key];
    const v2 = current.formState?.[key] === null || current.formState?.[key] === undefined ? "" : current.formState[key];
    if (String(v1) !== String(v2)) {
      return false;
    }
  }

  if (snap.procedures && current.procedures) {
    if (snap.procedures.length !== current.procedures.length) return false;
    for (let i = 0; i < snap.procedures.length; i++) {
       const p1 = snap.procedures[i];
       const p2 = current.procedures[i];
       if (p1.side !== p2.side || p1.procedure !== p2.procedure || p1.additionalInfo !== p2.additionalInfo) {
         return false;
       }
    }
  }

  if (JSON.stringify(snap.anticoagChecked) !== JSON.stringify(current.anticoagChecked)) return false;
  if (Boolean(snap.highlySensitive) !== Boolean(current.highlySensitive)) return false;
  if (Boolean(snap.finalChecked) !== Boolean(current.finalChecked)) return false;

  return true;
};
```

### Auto-expanding textareas logic
```typescript
export const handleAutoExpand = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = 'auto';
  const defaultHeight = 44; // Minimum bounding container size
  textarea.style.height = `${Math.max(defaultHeight, textarea.scrollHeight)}px`;
};
```

---

## Detailed description of the complex custom controls

### DateControl
- **Day-precision, month-precision, and year-precision parsers**:
  - Implements regular expressions processing `dd-Mmm-yyyy` down to single `yyyy`.
- **Layout and styling**:
  - Main input constrained to `width: 100%; maxWidth: 11rem;`.
  - Today's date displayed inside calendar grids using `border: 0.2rem solid " + fbGreen;`.
  - Double steppers (`-` / `+`) alter calendar grids cleanly.
  - Active index highlights inside `backgroundColor: fbGreen;` with bold white text.

### MSISelector
- **Clinician search query endpoint**:
  - `https://www.shadesofpale.net/MSISearch?st={query}` (auth: `dhcw:dhcw`).
- **Data validation**:
  - Persistent state keys `seniorClinician_coded` or `listedBy_coded` track clinician selection validation.
  - If empty, no indicator displays.
  - If verified selection exists, displays `check_circle` (`fbGreen`, tooltip `"Coded"`).
  - If typed text is unconfirmed, displays `warning` (`fbOrange`, tooltip `"Not coded"`).
  - User edits invalidate confirmed selections immediately.

### fbSCTProcedure, fbSCTDiagnosis, and fbSCTSelector
- **Component structure**:
  - `fbSCTProcedure` and `fbSCTDiagnosis` remain separate public/specification components.
  - Both wrappers delegate their shared popup, parsing, selection, search-history, and coded-indicator mechanics to `/src/components/fbSCTSelector.tsx`.
  - `fbSCTProcedure` passes `searchCommand="findProcedure"`, `mode="procedure"`, and the procedure input CSS hook.
  - `fbSCTDiagnosis` passes `searchCommand="findDisorder"` and `mode="diagnosis"`.
- **Search endpoints**:
  - Procedure: `https://www.shadesofpale.net/SCTSearch?cmd=findProcedure&st={query}&count=30`
  - Diagnosis: `https://www.shadesofpale.net/SCTSearch?cmd=findDisorder&st={query}&count=30`
- **Double-pane coordinate popup**:
  - Absolute wrapper dimensions locked to `width: 45rem;`.
  - Left matches block occupies one-third width; right details container occupies two-thirds width.
- **Custom response parser**:
  - Handled by `/src/utils/shadesOfPaleParser.ts`.
  - Uses `skipMetadata()` to scrub raw non-standard database prefixes (`!` and `~`).
  - Standardizes unquoted boolean literals to javascript constants (`!n` $\rightarrow$ `null`, `!f` $\rightarrow$ `false`).

### Row-list state helpers
- Dynamic clinical tables that use numeric `id` fields share pure helpers in `/src/utils/rowState.ts`.
- `appendRow()` calculates the next stable id from the current row list and appends a generated row.
- `removeRowIfMultiple()` preserves the existing rule that list editors keep at least one editable row.
- `updateRowById()` centralizes immutable id-targeted updates for procedures, diagnoses, specimens, implants, surgeons, and anaesthetists without changing their rendered table structure.

---

## CSS rules and declarations

```css
@import "tailwindcss";

body,
input,
textarea,
select,
button,
label,
div,
span:not(.material-icons):not(.material-icons-outlined),
p,
a,
option,
header,
footer,
section,
h1,
h2,
h3,
h4,
h5,
h6,
html,
::placeholder,
.placeholder {
  font-family: 'Roboto', sans-serif !important;
}

.material-icons, .material-icons-outlined {
  font-family: 'Material Icons' !important;
}

.fb-addressograph-card,
.fb-addressograph-card * {
  font-family: Arial, Helvetica, sans-serif !important;
  line-height: normal !important;
}

.fb-layout-edit-view-form input:not([type="radio"]):not([type="checkbox"]),
.fb-layout-edit-view-form select,
.fb-layout-edit-view-form textarea {
  border: 0.1rem solid silver !important;
  border-radius: 0.4rem !important;
  background-color: white !important;
  padding: 0.2rem !important;
}

.fb-rov-field-label {
  font-weight: 300;
  font-size: 0.8rem;
}

.fb-rov-field-value {
  font-weight: 500;
  margin-left: 0.4rem;
  white-space: pre-line;
}

.fb-rov-table-cell {
  padding: 0.4rem;
  font-size: 0.9rem;
}

.fb-rov-header {
  border-bottom: 0.2rem solid rgb(27, 110, 194);
  margin-bottom: 0.2rem;
  padding: 0.4rem;
}

.fb-rov-footer {
  border-top: 0.2rem solid rgb(27, 110, 194);
  margin-top: 0.2rem;
  padding: 0.2rem 0;
}

.fb-waiting-list-rov-nav-section-name {
  background-color: rgb(27, 110, 194);
  color: white !important;
  font-weight: 500 !important;
}
```

---

## Brief technical overview of the whole app

- Built as an offline-capable Electronic Health Record (EHR) clinicial-forms editor.
- Implemented as a full-stack, single-page React 19 application using Vite and TypeScript.
- Styles driven using Tailwind CSS v4 paired with local overrides.
- Supabase-style client calls are routed through `/src/mockSupabase.ts`, which maps the subset of query/RPC/update/insert calls used by the forms to the Node/Express REST API in `/server.ts`.
- By default the REST shim uses same-origin relative `/api/...` paths for local and bundled deployments.
- Static-host deployments can point the browser bundle at a separate API origin by building with `VITE_API_BASE_URL` set to the API base URL, for example `https://api.example.org`.
- Cross-origin static/API deployments require the API server to allow the static site origin via the comma-separated `CORS_ORIGINS` environment variable.
- A browser page served from HTTPS is a secure context, but it cannot call an HTTP API endpoint because that is active mixed content. The API origin also needs a valid HTTPS certificate for its hostname; an IP-address HTTPS endpoint with a mismatched/self-signed certificate will fail browser fetches.

---

## List of compile and runtime dependencies

- `react` (`^19.0.1`)
- `react-dom` (`^19.0.1`)
- `react-router` (`^7.15.1`)
- `express` (`^4.21.2`)
- `@supabase/supabase-js` (`^2.106.1`)
- `lucide-react` (`^0.546.0`)
- `motion` (`^12.23.24`)
- `pg` (`^8.21.0`)
- `vite` (`^6.2.3`)
- `tsx` (`^4.21.0`)
- `typescript` (`~5.8.2`)

---

## Brief description of compile and deploy steps

- **Locally Run Dev Environment**:
  - Serves direct, interactive local host preview:
  ```bash
  npm run dev
  ```
- **Compile Application Bundle**:
  - Executes Vite and TSC scripts to compile files under `/dist/`:
  ```bash
  npm run build
  ```
- **Static Host Bundle With Separate API Origin**:
  - Build with `VITE_API_BASE_URL=https://api.example.org npm run build`.
  - Upload `dist/index.html` and the complete `dist/assets/` directory to the HTTPS static host.
  - Do not upload `dist/server.js` or `dist/server.js.map` to the static host; those belong only on the Node API server.
  - Configure the API server with `CORS_ORIGINS=https://mysite.example.org` so browser requests from the static site are accepted.
- **Pruning build logs**:
  - Removes build directories and temporary configurations:
  ```bash
  npm run clean
  ```

---

## The database tables, described using SQL DDL

```sql
CREATE TABLE patients (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL UNIQUE,
  version INT DEFAULT 1 NOT NULL,
  nhs_number VARCHAR(20),
  surname VARCHAR(100) NOT NULL,
  forenames VARCHAR(100) NOT NULL,
  title VARCHAR(20),
  address_line1 VARCHAR(150),
  address_line2 VARCHAR(150),
  address_line3 VARCHAR(150),
  address_line4 VARCHAR(150),
  crn VARCHAR(50),
  date_of_birth DATE NOT NULL,
  sex VARCHAR(20) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE forms_index (
  id BIGSERIAL PRIMARY KEY,
  form_uuid UUID NOT NULL,
  form_version INT NOT NULL,
  form_type VARCHAR(50) NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  document_datetime TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  form_status VARCHAR(20) NOT NULL,
  speciality VARCHAR(100),
  organisation VARCHAR(100),
  hospital VARCHAR(100),
  senior_responsible_clinician VARCHAR(150),
  event_or_document VARCHAR(20) DEFAULT 'Document'::character varying NOT NULL,
  details TEXT
);

CREATE VIEW forms_index_current AS
SELECT DISTINCT ON (form_uuid) *
FROM forms_index
ORDER BY form_uuid, form_version DESC;

CREATE TABLE waiting_list_cards (
  uuid UUID NOT NULL,
  version INT NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  form_status VARCHAR(20) NOT NULL,
  form_data JSONB NOT NULL,
  PRIMARY KEY (uuid, version)
);

CREATE TABLE operation_notes (
  uuid UUID NOT NULL,
  version INT NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  form_status VARCHAR(20) NOT NULL,
  organisation VARCHAR(100),
  hospital VARCHAR(100),
  senior_responsible_clinician VARCHAR(150),
  speciality VARCHAR(100),
  form_data JSONB NOT NULL,
  PRIMARY KEY (uuid, version)
);

CREATE TABLE outpatient_outcomes (
  uuid UUID NOT NULL,
  version INT NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  form_status VARCHAR(20) NOT NULL,
  form_data JSONB NOT NULL,
  appointment_uuid UUID,
  PRIMARY KEY (uuid, version)
);
```

---

## Templates for the SQL Queries used by the app

### 1. Fetch Demographics
```sql
SELECT * FROM patients WHERE uuid = :patientUuid LIMIT 1;
```

### 2. Fetch Latest Document State
```sql
SELECT * FROM waiting_list_cards 
WHERE uuid = :formUuid 
ORDER BY version DESC 
LIMIT 1;
```

### 3. Append Fresh Audit Record
```sql
INSERT INTO forms_index (
  form_uuid, form_version, form_type, patient_uuid, event_datetime, document_datetime, form_status, speciality, organisation, hospital, senior_responsible_clinician, details
) VALUES (
  :formUuid, :nextVersion, :formType, :patientUuid, :eventDatetime, :documentDatetime, :status, :speciality, :organisation, :hospital, :seniorClinician, :details
);
```

---

## Anything I've forgotten

### Seeding configuration
- System is pre-seeded with Donald Duck as patient and pre-populated clinicians in registry.
- Checks if entries are lower than 50 patient entries inside localStorage buffers to automatically expand cases up to more than 200 realistic fictional patient records.
- NHS number formats are normalized at seed runtime to spacing layout notation `### ### ####`.

### Verified Non-Working Strategies
- **TableRow Focus Highlights**: Initially hover states were applied directly on rows. It caused full tables to change color when clinicians focused individual inputs. Corrected by restricting backgrounds to `TD` cells.
- **`fbAddButton` Highlight Locks**: Clicking buttons previously locked yellow focus highlights. Solved by replacing focus state hooks with the native CSS `focus-visible` pseudo-class.
- **Empty list rows warnings**: Initially queried entries via `procedures.every()` checks which failed on initial uninitialized arrays. Corrected using safe arrays length validations: `(procedures.length === 0 || procedures.every(p => !p.procedure || String(p.procedure).trim() === ''))`.

---

## Additional Technical Specifications and Refactorings

The following technical paradigms, specifications, page behaviors, and custom mechanics have been carried over directly to represent the absolute state of the formBuilder2 EHR layout:

### 1. Isolated Table Cell Interaction-Highlighting (`fbTableCell`)
To prevent the entire table row from flashing or highlighting with a yellow background (`#ffffcc`) when a nested control (such as a dropdown, checkbox, or input field) is hovered or focused:
- **Component-Scoped Interactivity (`fbTableCell`):** Cell containers for structured user-interactive clinical tabular lists (e.g., procedures lists, specimens, and implants) utilize the `<FbTableCell>` component (`/src/components/fbTableCell.tsx`). It inherits all React standard `<td>` properties while cleanly applying hover and `focus-within` transitions.
- **Visual Segregation & Class Precedence Fix:** Highlighting is confined completely to the active element's cell. Because standard inline styles override CSS class declarations, the component's base state is styled using the Tailwind `bg-white` class instead of an inline `backgroundColor: 'white'` style. This enables the CSS-defined cell hover state (`hover:bg-[#ffffcc]`) and active form input focus-within state (`focus-within:bg-[#ffffcc]`) to cleanly override the default color, keeping hover and input focus highlights active in both clinical tabular editors under full desktop or mobile rendering.
- **Encapsulated Typography and Margins:** Enforces robust default spacing (`padding: '0.4rem'`), a clean grey divider (`border-bottom: 1px solid silver`), and a crisp white background.

### 2. Custom Global Tooltips Interface (`fbToolTip`)
To present clinical rules, definitions, and contextual tooltips with absolute consistency and precise close buttons across different editors (such as `OutpatientOutcome` and `OperationNote`):
- **Encapsulated Overlay Control (`fbToolTip`):** Renders floating context boxes securely above targeted label elements using absolute screen coordinates (`x`, `y` coordinates dynamically calculated relative to targeted label's bounds).
- **Close Action Solid Outline:** The manual tooltip close buttons utilize the standardized `<FbToolTip>` component (`/src/components/fbToolTip.tsx`). Its close action button specifically enforces a high-contrast boundary styled with:
  ```css
  border: 0.1rem solid black;
  border-radius: 0.2rem;
  background-color: transparent;
  ```
  This guarantees accessibility and crisp button definition against the soft light blue background (`#8cd2e7`) of the tooltip shell.
- **Shared tooltip controller:** Forms that need manual clinical tooltips use `/src/utils/useFbTooltips.tsx` to manage active tooltip state, refs, position measurement, delayed mouse-leave hiding, immediate closing, and tooltip rendering. The visual tooltip element remains `/src/components/fbToolTip.tsx`.

### 3. Material Icons Font Family Protection
To resolve the issue where standard Google Material Icons displayed as raw text ligature tags (e.g., `check_circle_outline`, `swap_vertical_circle`) instead of visual icons:
- **Exclusion of `.material-icons` from Global Directives:** Inside `src/index.css`, the global layout rule enforcing the Google Roboto font-family (`font-family: 'Roboto', sans-serif !important;`) previously styled standard text tags such as `span` or `i` without distinguishing terminology symbols. We refactored the global span selector to explicitly exclude vector elements: `span:not(.material-icons):not(.material-icons-outlined)`.
- **Enforced Icon Font Priority:** Added a specific higher-specificity class pairing declaration globally:
  ```css
  .material-icons, .material-icons-outlined {
    font-family: 'Material Icons' !important;
  }
  ```
- **Outcome:** This ensures the font engine preserves "Material Icons" for clinical badges and glyphs across all interactive panels and summaries immediately.

### 4. Robust Empty Procedures Table Warning Row
To ensure the "Enter at least one procedure" notice displays correctly when procedures are absent inside both clinical tabular editors:
- **Comprehensive Empty State Equation:** Both the Waiting List Card (`src/WaitingListCard.tsx`) and the Operation Note (`src/OperationNote.tsx`) previously used a brittle validation check (`procedures.every(p => !p.procedure)`) which failed to consistently gauge uninitialized fields or draft loading anomalies. This was replaced with an all-inclusive validation rule:
  ```typescript
  (procedures.length === 0 || procedures.every(p => !p.procedure || String(p.procedure).trim() === ''))
  ```
- **Unified Placeholder Insertion:** 
  - **Operation Note (`OperationNote.tsx`):** Spans across 5 table columns (`colSpan={5}`).
  - **Waiting List Card (`WaitingListCard.tsx`):** Spans across 4 table columns (`colSpan={4}`) inside the Planned Procedure(s) card list.
- **Visual Separation and Read-Only Filtering:** In edit view, these conditional rows print the required bold italic instruction in Deep Red (`#d50000`). In read-only views, empty structures are cleanly omitted from rendering by pre-filtering elements (`procedures.filter(p => p.procedure)`), avoiding any visual clutter.

### 5. Non-Sticky Focus Highlight Behavior (`fbAddButton`)
To fix the bug where interactive skeletal buttons (such as the "Upload image" `fbAddButton` in the Operation Note) retained a sticky yellow background after being pressed:
- **Root Cause of Focus Lock:** Standard browser interactions maintain state focus on a clicked button until another element is focused. Inside `src/components/fbAddButton.tsx`, Javascript `onFocus` and `onBlur` events were coupled directly to the `hovered` state, forcing the button to lock into a yellow focus backdrop state even when the cursor had already departed.
- **Decoupled Focus Control:** 
  1. We completely removed `onFocus` and `onBlur` listeners from state binders in `fbAddButton.tsx`, confining the React state entirely to cursor physical interactions (`onMouseEnter` and `onMouseLeave`).
  2. The custom styles inside the form stylesheets (`OperationNote.tsx` and `WaitingListCard.tsx`) were refactored to replace standard focus overrides (`.add-procedure-btn:focus`) with keyboard-only interaction rules:
     ```css
     .add-procedure-btn:hover,
     .add-procedure-btn:focus-visible {
       background-color: #fee715 !important;
       color: black !important;
       border-color: #fee715 !important;
     }
     ```
- **Outcome:** Buttons change beautifully to a highlight yellow on cursor hover or keyboard tab focus-visible, and instantly return to pristine default white once unhovered, regardless of how many times they are clicked or tapped.

### 6. Tooltip Close Button Compact Styling
To improve target density and visual cohesion inside the custom blue tooltips (`fbToolTip.tsx`):
- **Compact Padding Sizing:** Decreased the top and bottom padding of the manual Close button by `0.1rem` (changing from `padding: '0.1rem 0.3rem'` to `padding: '0rem 0.3rem'`).
- **Outcome:** This ensures a slimmer, more elegant button fit that preserves the tooltip's negative space and layout symmetry perfectly, without encroaching on nearby text.

### 7. Highlight Support for Inner Form Table-Cell Radios
To resolve the issue where the Yes/No radio options in the Implants grid/table would not visually pop or dynamically highlight with the darker yellow styling:
- **Nesting Level Compensation for Cells (`TD`):** The nesting level highlight logic (located in `src/components/fbLayout.tsx`) calculates the hierarchical nesting level of each form element to alternate between `#ffffcc` (light yellow) and `#fee715` (darker yellow) on hover or focus-within. Since the table cells (`FbTableCell`) are inherently styled/hovered with `#ffffcc`, standard radios inside it (nesting level 0) turned the exact same color, rendering their individual hover boundaries invisible.
- **Table-Cell Detection Integration:** We explicitly expanded `getNestingLevel` to detect HTML table-cell parents:
  ```typescript
  if (
    current.classList.contains("fb-question-container") ||
    current.classList.contains("fb-radio-checkbox-item") ||
    current.classList.contains("fb-subquestion") ||
    current.tagName === "TD"
  ) {
    level++;
  }
  ```
- **Outcome:** By counting `TD` towards the nesting boundary, nested radio containers inside tables dynamically evaluate with an odd nesting depth (level 1). They correctly transition to the rich darker yellow highlight color (`#fee715`) on hover or focus, contrasting beautifully against the lighter yellow background of the active table cell and ensuring robust visual feedback.

### 8. Automated PostgreSQL Database Setup Script (`setup-db.ts`)
To support direct setup of external PostgreSQL databases that lack web consoles:
- **Comprehensive DDL Compilation:** A TypeScript script (`setup-db.ts`) was added to the project root containing the full medical schema layouts and auto-versioning triggers/views:
  - Table: `patients` (primary details and demographics)
  - Table: `forms_index` (audit-journal tracking metadata)
  - Table: `waiting_list_cards`, `operation_notes`, `outpatient_outcomes` (clinical document JSONB records)
  - View: `forms_index_current` (live version tracking lookup using `DISTINCT ON` query parsing)
- **Automatic SSL Resolution:** Automatically activates secure SSL handlers when connecting to common hosted databases (such as Supabase, Azure, AWS, ElephantSQL) to prevent connection-handshake warnings or rejections.
- **Execution Workflow:** Accessible via local command execution:
  ```bash
  DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require" npx tsx setup-db.ts
  ```

### 9. Interactive Large-Scale Patient Seeding Script (`seed-patients.ts`)
To populate the registry with realistic test cases for performance, pagination, and listing evaluation:
- **Diverse Fictional Roster:** A script (`seed-patients.ts`) was engineered to seed the `patients` table with **274 highly recognizable household fictional characters** (covering universes such as *Harry Potter*, *Star Wars*, *DC Comics/Batman*, *Marvel Comics*, *Lord of the Rings*, *Sherlock Holmes*, *James Bond*, *Disney Classics*, *The Simpsons*, *Family Guy*, *SpongeBob*, *Shrek*, *Toy Story*, *Game of Thrones*, *Breaking Bad*, and historical legends).
- **Medical String Formats & Logic:**
  - **Welsh Demographics:** Full custom-styled addresses (Line 1/2/3/4) and valid postcode prefix combinations (e.g. `CF`, `SA`, `NP`, `LL`, `LD`, `SY`) sounding explicitly Welsh.
  - **Calculated DoBs:** Calculates realistic dates of birth mapping back deterministically to ages between 0 and 100 relative to 2026.
  - **Correct NHS Number Notation:** Pre-calculated with 3-3-4 digit grouping spaces (e.g. `XXX XXX XXXX`).
  - **Systematic CRN Format:** Composes hospital numbers consisting of a custom letter (excluding 'O') followed by 7 random digits (e.g. `A5023912`).

### 10. Revised Patient Registry Page Design
To improve usability, simplicity, and consistency with custom header/footer standards, the Patient Registry page layout was revised with the following design specifications:
- **Header Section Override (No Addressograph, Standard Typography):** The top header area displays the page title "Patient registry" in the standard Google Roboto font used throughout the rest of the application. The header background is styled as pure white with a royal blue 0.2rem bottom border. The standard patient `Addressograph` is omitted as there is no active patient selection in the general registry view.
- **Table-Based Patient Rows (No Search Panel or Headings):** All search query panels, filters, and auxiliary headings (such as "Patients") have been removed to deliver a minimalist, focused presentation. The central area consists of a clean HTML `<table>` that populates a single row (`tr`) for each patient retrieved from the database:
  - **Dynamic Patient Table:** Every table row encloses a single custom `fbAddressograph` card showing complete demographic and metadata fields, alongside a white-on-blue **"Open record"** primary action button positioned neatly on the right extreme of each row.
  - **Deterministic Clinical Ordering:** To align with standard registrar lookups, the retrieval process queries the `patients_current` view using a multi-layered deterministic order: ordered alphabetically by **Surname**, then alphabetically by **First Names (forenames)**, and finally by **Date of Birth** in ascending order.
  - **Single Page DOM Toggling (Null-Routing Navigation):** Clicking either an Addressograph card or its sibling **"Open record"** button avoids slow separate routing parameters. It sets `.style.display="none"` (utilizing the React conditional display state `display: activePatientUuid ? 'none' : 'flex'`) directly on the outer Registry container, mounting the patient record view as a lightweight child component and passing the active clinician `userName` and `patientUuid`.
  - **Standard escape Close Button:** Once opened inline, the Patient Record features a standard white-on-blue **"Close"** Action button in its bottom-right footer controller bar. Clicking this removes the active patient record from the DOM and instantly un-hides the high-speed parent Patient Registry list.
  - **Automatic High-Density Data Sync & NHS Code Alignment:** To ensure the system evaluates with a clinically representative layout, the local database connector automatically resets and populates all 200+ high-density fictional patients if a legacy browser session contains less than 50 patient slots. Furthermore, all existing and newly generated patient registers are actively validated and auto-reformed on load to strictly follow the standard, space-separated NHS layout (`### ### ####`).
- **Defensive Line-Height & Native Hover Tooltips:**
  - **Line-Height Reset:** A global class rule `line-height: normal !important;` is explicitly bound under `.fb-addressograph-card` and its child selectors inside `index.css`. This prevents table cell or grid parent properties from distorting text line spacing within registry cards.
  - **Sub-field Tooltips:** Standard HTML `title` attributes have been integrated across all specific demographic sections of the standard `fbAddressograph` card template. When a clinician hovers their cursor over any part of the addressograph card, the native browser tooltip dynamically reveals the field's explicit medical category (e.g. "Surname", "First name(s)", "Title", "Address", "CRN", "Date of birth", "Age", "Sex").
- **Footer Section Custom Controls (Right-Aligned Username & Dual Navigation):**
  - **Username Field:** Located to the immediate left of the Back button in the Registry bottom control bar, permitting instant visualization and `localStorage`-backed updates to the clinician's active session signature. Highlighted with a soft yellow focus styling (`#ffffcc`).
  - **Registry Return Navigation:** Styled as a white-on-blue primary Action control via the standard `fbButton` component, positioned at the extreme right to return clinicians to the App Home Page (`/`).
  - **Patient Record Home Escape:** When the Patient Record sheet is loaded in standalone mode (direct navigation from the Home dashboard rather than the inline Registry overlay), its footer provides a primary white-on-blue **"Back"** button that seamlessly returns the clinician back to the App Home Page (`/`).

### 11. Patient Search Page Design
To support rapid, multi-entry clinical inquiries, a dedicated **Patient search** page was established, featuring:
- **Consistent Clinical Design**: Utilizes robust, table-based patient rows, full sub-field demographic hover tooltips, and inline patient record sheet opening capabilities.
- **Custom `fbSearchInput` Component**: Factored the search control into a highly reusable, custom `fbSearchInput` widget wrapper that provides styling parity with `fbQuestion` and encapsulates all focus/clearing states.
- **Keyboard Auto-focus**: Forces the keyboard cursor to focus the `fbSearchInput` element immediately whenever the Patient Search view mounts.
- **Silver Clearing Cross**: Positions a silver dismiss-cross icon (`✕`) on the right margin of the input box when characters are present. Clicking this instantly clears both input searchQuery state and active results list before re-focusing the cursor input.
- **Empty Query Prevention**: When first opened or while the search control remains empty, the redundant guidance sentence is removed, and the list of addressographs is completely blank. Database queries are withheld to keep processes highly lightweight.
- **Dynamic Change Response & Race Condition Protection**: Typing or updates immediately clear existing content and cancel/ignore any previous, stale background queries using incremental identifier locks (`queryRef`).
- **Postgres pg_trgm Fuzzy Similarity**: Utilizes PostgreSQL trigram similarity matching (`similarity`) via the `search_patients_fuzzy` database RPC function, matching against a concatenated, comma-separated representation of all demographics in the addressograph card, ordering the output from the most similar record downwards.
- **Pristine Error / Zero State Typography**: When no matching patient is returned, a clean slate "No matches found" message is displayed, utilizing pure Roboto body styling (`fontFamily: 'Roboto', fontSize: '1rem', fontWeight: 300, fontStyle: 'italic'`) without any trailing period.
- **Home Integration**: Accessible via a white-on-blue link element directly on the application's central Home Dashboard.

### 12. Outpatient Appointments & Clinical Events Architecture
To support structured outpatient workflows and tracking of outpatient appointment status, a complete outpatient appointment system has been integrated:
- **Database Schema (`outpatient_appointments` table)**:
  - `uuid` (UUID, Primary Key)
  - `version` (INT, Version identifier)
  - `patient_uuid` (UUID, Foreign Key referencing `patients`)
  - `updated_at` (TIMESTAMPTZ, Timestamp)
  - `updated_by` (TEXT, Editing clinician ID)
  - Columns mapped to the appointment metadata section: `organisation`, `speciality`, `site`, `senior_clinician`, `clinic_name`, `date`, `time`.
- **Forms Index Category Separation (`event_or_document`)**:
  - The `forms_index` (and `forms_index_current` view) includes an `event_or_document` discriminator column.
  - Scheduled Appointments are saved as `event_or_document = 'Event'`. `event_datetime` stores the appointment time, and `document_datetime` is set to null.
  - Medical Documents (Waiting List Cards, Operation Notes, Outpatient Outcomes) are saved as `event_or_document = 'Document'`. Both `event_datetime` and `document_datetime` are fully populated.
- **Patient Record Event Display**:
  - Events of type `Event` are highlighted in the patient forms list with a custom-styled, clinical-blue **Scheduled Event** tag (replacing standard Draft/Final labels).
  - List items for scheduled events suppress superfluous metadata (such as version or write time) and focus on presenting the appointment date/time and clinic details.
  - Hovering and clicking on an appointment event item launches a pre-linked Outpatient Outcome drafting screen directly.
- **Outpatient Outcome Linking Workflow**:
  - The `outpatient_outcomes` table has been enhanced with an `appointment_uuid` column.
  - When opening an Outpatient Outcome sheet, the system queries for any existing scheduled outpatient appointments for the active patient.
  - If a new outcome document is created, an elegant blue notification panel displays an optional **Link Scheduled Outpatient Appointment** dropdown. Choosing an appointment auto-links it, filling the appointment fields block seamlessly and hiding the picker.
  - When opening pre-linked documents, the outcome sheet fetches appointment fields in real-time. Since this data is read-only, it displays the clinic and clinician metadata natively in read-only form sections.
- **Single-Query Database Architecture for Patient Records**:
  - Instead of running redundant queries to load the entire collection of forms and appointments upfront in separate parallel streams, the patient record page leverages `forms_index_current` as a single master index.
  - Standard list generation queries `forms_index_current` only once to retrieve both clinical documents and scheduled appointments/events in chronological order.
  - To hydrate optional outcomes badges and clinician data, the client inspects the returned dataset. If and only if outpatient appointment entries are present in the list, a highly targeted secondary query is executed against `outpatient_appointments` specifically for those matching UUIDs (using the SQL `IN` operator) to retrieve only the required subset of live appointment metadata (like `outcome_form_uuid`).
  - This preserves performance, reduces overall payload size, and allows future filtering capabilities (e.g., date ranges) to scale seamlessly on `forms_index`.

### 13. Modern Patient Record Grid and Active Inline Toggling
The **Patient Record Page** has been completely modernized into a high-density, unified clinical portal:
- **Streamlined Single-Column Workspace**:
  - Removed the redundant left-side grey navigation panel to present a full-screen, focused portal.
  - Removed the redundant "Forms index" label for clean negative space.
- **Three-Column Clinical Index Grid**:
  - Grid items are arranged in a strict CSS grid: `gridTemplateColumns: '170px 1fr auto'`.
  - **Column 1 (Status Indicators)**:
    - Green **Future appt** badge: For scheduled appointments occurring in the future.
    - Red **Not outcomed** badge: For non-future appointments that lack a linked `final` outcome form.
    - Red **fbDraftBadge**: Standard status badge for non-final clinical documents.
  - **Column 2 (Custom Demographic Tiles)**:
    - Custom components `fbOutpatientAppointmentTile` and `fbFormTile` render events and documents respectively using Arial/Roboto `1.0rem` black `fontWeight 300` styling.
    - To eliminate dead vertical space, an explicit compact `line-height: 1.15` is applied to eliminate gaps between text rows within each tile, making the listing snug and highly precise.
    - Raw database value keys for clinical specialities (e.g. `'plastic'`, `'general-surgery'`) are mapped dynamically on the patient record using a `getSpecialityDisplay` helper to yield human-friendly, properly formatted labels (such as `"Plastic Surgery"`, `"General Surgery"`) from the shared specialities database.
    - Field name labels are fully omitted in the visual tree, but hovered elements generate dynamic native HTML tooltips on cursor hover.
  - **Column 3 (Action Controls)**:
    - Outpatient appointments render a white button with blue text `"Outcome form"` (`border: 0.1rem solid #1b6ec2`, `color: #1b6ec2`) to create or open outcome forms.
    - Clinical documents render a white button with blue text `"Open"` (`border: 0.1rem solid #1b6ec2`, `color: #1b6ec2`) to open the forms in Read-Only View (RoV).
- **Smooth Inline View Toggling (display: none)**:
  - Clicking "Outcome form" or "Open" hides the parent Patient Record page container (`style.display = "none"`) and mounts the active forms inline.
  - When a document is saved or cancelled, the active form is unmounted, and the parent container is shown again. This completely preserves the window scroll position and prevents slow, redundant database re-queries.
- **Precision Footer Control Bar**:
  - Positioned the standard username update field `fb_username` to the immediate left of the Close action button.
  - Positioned the blue outline `"New form / document"` add-form trigger in the extreme bottom left-hand corner using the custom `fbAddButton` control, which opens a dynamic popup menu matching design standards.

### 14. Standardized Interactive Styling and Specialized Form Components
To establish pristine aesthetic uniformity and modular UX interactions across all patient listings and medical questionnaires, we introduced and customized several bespoke UI controls:
- **`fbAddButton` Refinement**:
  - Refined the standard blue-framed action trigger to use a compact `borderWidth: '0.1rem'` and a modern, high-density light font pairing of `fontWeight: 300`.
  - Configured custom transitional hover properties to change from a white background with a blue border to a rich black-on-yellow (`#fee715`) color pairing with a solid `0.1rem` black border.
- **`fbButton` Uniformity Support**:
  - Upgraded the central clickable `fbButton` component with native React state variables for mouse hover and focus-within detection (`isHovered`, `isFocused`).
  - Standardized the hover/focus style across all variants to transition cleanly to a black-on-yellow (`#fee715`) display with an explicit solid `0.1rem` black border. This guarantees hover highlighting activates reliably everywhere—including on the custom navigation, open, and close controls listed inside the Patient Record portal.
- **`fbPassword` Component**:
  - Created a robust custom questionnaire component (`fbPassword`) modeled directly after the responsive layouts of `fbTextInput` but natively hardcoded with `type="password"`.
  - Inherits complete forward compatibility for standard input attributes (including React mouse, focus, autoFocus, and keydown listeners) using the Javascript `...props` rest parameter pattern.
- **`fbPasswordPopup` Refactoring**:
  - Replaced the embedded native HTML password elements inside the authentication re-entry frame with the single centralized `fbPassword` child module labeled cleanly with `"Password"`.
  - Retained the standardized right-aligned actions using two high-contrast `fbButton` controls: a green `success` variant for `"Save"` and a red `danger` variant for `"Return to form"`.
- **`fbUserName` Component**:
  - Extracted the plain username text control into a dedicated reusable `fbUserName` React class element.
  - Built direct state triggers (`onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`) directly into the component's render tree to turn the text input's background yellow (`#fee715`) whenever focused or hovered, creating a highly coherent signature identifier across all clinical search lists, registries, and patient forms index overlays.

### 15. Modernized fbTable, fbAddButtonForPage, and Template-Driven Homepage Refactoring
To further unify the EHR aesthetic feel and meet structural clinical requirements, we rolled out a major upgrade across multiple central components:
- **`fbTable` Component Architecture**:
  - Created a dedicated `/src/components/fbTable.tsx` codebase encapsulating all layout, responsive grid container styles, font properties, and borders.
  - Exports a unified set of subcontrols: `FbTable`, `FbTableHeader`, `FbTableBody`, `FbTableRow`, `FbTableHeaderCell`, and `FbTableCell`.
  - Replaced native system table markup (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`) across active clinical documents:
    - **Waiting List Card**: The "Planned procedure(s)" table uses modernized borders, typography margins, and dragging controls.
    - **Operation Note**: The "Procedure(s)" table, "Operative diagnoses" table, "Tissue removed" specimen drag-to-reorder list, and "Implants" scanning lists are refactored.
    - **Waiting List Card RoV / Operation Note RoV**: Read Only Views use the exact same template layout components, providing visual parity.
- **`fbAddButtonForPage` Component**:
  - Developed a robust dynamic action button similar to `fbAddButton` but optimized for primary page actions with custom styling: a bold `borderWidth: '0.2rem'` and thick `fontWeight: 500` typographic style.
  - Substituted the `fbAddButton` at the bottom of the patient records screen with the new `fbAddButtonForPage` component to emphasize primary actions.
- **`fbPasswordPopup` Validation Language**:
  - Simplified and refined the confirmation prompt instructions label inside the modal from *"You must re-enter your password to complete this action."* to *"You must re-enter your password to save the form."*.
- **RoV Navigation and EV Quick Switching**:
  - Introduced the `reachedByRoVButton` navigation property across Read Only Views.
  - When an RoV is reached by clicking an RoV button in the patient record, it hides traditional "Edit" and "Back" buttons in the bottom right corner, displaying instead a high-contrast white-on-blue "EV" button in the bottom left-hand corner to return directly to the patient's record portal cleanly.
- **Template-Driven App Home Page (`Home.tsx`)**:
  - Completely recreated the app landing page using the pristine layout of the `PatientRegistry` component as a template.
  - Configured a clean white background, the header title `"formBuilder2"`, Google Roboto font scales, and centered big blue link blocks matching standard styling cues.
  - Integrated the right-aligned `fbUserName` input control in the footer area and made sure the selected user credentials persist in `localStorage` as `"demoUser"` on startup, passing the updated username cleanly across all medical screens.

### 16. Layout Polishing, Clinical Table Parity, and Custom Grid Question Cell Refactoring
To round out the EHR layout and meet strict validation constraints, we completed the following refactoring work:
- **Homepage Title Styling**:
  - Promoted the landing page's main title `"formBuilder2"` to a proud `fontSize: '2rem'`.
  - Added exactly `1rem` of breathing space (white vertical margins) both above and below the title to set a balanced aesthetic layout.
- **Button Label Clarity**:
  - Simplified the `fbAddButtonForPage` action prompt label in the patient records board bottom left to `"New form or document"`, ensuring readable, approachable clinical language.
- **Outpatient Outcome EV Cancellation Routing**:
  - Configured custom canceling routing logic. When an outpatient outcome form is created or opened inline via the patient records view, clicking "Cancel" disables silent/accidental saving and directly returns the physician to the patient records portal cleanly.
- **Read-Only Table Parity in Operation Note RoV**:
  - Replaced native map divs on second, third, and fourth clinical lists in `OperationNoteRoV` (Operative Diagnoses, Tissue Removed, and Implants) with standard `FbTable` layout wrappers. This ensures visual parity between editing and reading states.
- **Reusable `fbQuestionRowCell` Component**:
  - Built a structural `/src/components/fbQuestionRowCell.tsx` grid control wrapping inner question components.
  - Replaced manual column layout spans (such as `className="md:col-span-2"` or `<div className="md:col-span-2">`) inside `WaitingListCard.tsx` and `WaitingListCardRoV.tsx` with unified `<FbQuestionRowCell span={2}>` blocks.

### 17. Unified Cancellation Popup Workflow, Specialized Cancel Form Button, and Core Component Renaming
To deliver a reliable, standardized form cancellation procedure and clean up internal naming semantics, we completed the following updates:
- **`fbCancelPopup` Confirmation Alert**:
  - Engineered `/src/components/fbCancelPopup.tsx` representing a standard warning prompt ("Confirm cancel").
  - Framed with standard royal blue border lines, readable text alerting that *"Any changes you have made will be lost"*, and bottom-right button options.
  - Uses standard `FbButton` components: white-on-red **Discard changes** (`variant="danger"`) and green-on-white custom **Return to form**.
- **`fbCancelFormButton` & Unified Row Control Integration**:
  - Created `/src/components/fbCancelFormButton.tsx` rendering a specialised red-backed button with standard text `"Cancel"`.
  - Nested `fbCancelFormButton` into `/src/components/fbSaveCancelButtons.tsx` as the default Cancel block.
  - Integrated `fbCancelPopup` across all edit screens (**WaitingListCard.tsx**, **OutpatientOutcome.tsx**, and **OperationNote.tsx**). Whenever a user attempts to dismiss a modified form, they are prompted with standard safety confirmation instead of quiet loss or accidental persistence.
- **Codebase Class Renaming (`fbSCTProcedure`)**:
  - Renamed component file `/src/components/fbSCTProcedureSelector.tsx` to `/src/components/fbSCTProcedure.tsx`.
  - Updated all imports, class interfaces, typed props, and nesting tags within **WaitingListCard.tsx** and **OperationNote.tsx** to align perfectly.
- **Verification of Bottom Row Controls and Custom `fbButton` Promotion**:
  - Verified and confirmed that **WaitingListCard.tsx**, **OutpatientOutcome.tsx**, and **OperationNote.tsx** use `<BottomControlsRow />` for the entire persistence panel.
  - Promoted the RoV switch button inside `<fbBottomControlsRow />` from a manual `<button>` tag to a standardized `<FbButton>` component to enforce uniform font family, padding scales, and yellow hover feedback.
  - Replaced the final remaining raw HTML `<button>` inside `fbSaveCancelButtons.tsx` (the "Save" submit button) with a styled `<FbButton>` component, finishing the comprehensive refactoring of key action tags to the standardized design system.
- **Specific CSS Class Renaming & Custom Prefix Standardizing**:
  - Reviewed the codebase for app/component-specific CSS classes and renamed them to accurately reflect their parent component names under the uniform `fb-` design namespace.
  - Changed `add-procedure-btn` to `fb-add-button`.
  - Refactored `addressograph-card`, `addressograph-field`, `addressograph-container`, and `addressograph-wrapper` to `fb-addressograph-card`, `fb-addressograph-field`, `fb-addressograph-container`, and `fb-addressograph-wrapper` respectively.
  - Aligned other component elements by renaming selector targets like `form-button`, `subfield-wrapper`, `subfield`, `form-layout-container`, `edit-view-form`, `nav-grid`, `nav-section-name`, `nav-counter-box`, `nav-indicator`, `form-nav-panel-container`, `form-nav-link`, `form-header-with-divider`, `question-container`, `form-section-block`, `bottom-control-bar`, `bottom-control-btn-rov`, `bottom-control-item`, `bottom-control-final`, `bottom-control-password`, `bottom-control-username`, `input-with-units`, `hideBorderInRoV`, `sct-popup-btn`, and `sct-popup-hoverable` to their standardized `fb-` namespace variants (e.g. `fb-subquestion-wrapper`, `fb-layout-container`, `fb-bottom-btn-save`, `fb-hide-border-in-rov`, etc.).
  - Updated all style rules, DOM selection queries, and view classes to synchronize.
- **Solid White-On-Green Return to Form Button in `fbCancelPopup`**:
  - Styled the "Return to form" button on the dismiss confirmation box using the solid library `success` variant. This replaces the outlined style with a proud, high-contrast white-on-green background.
- **Namespaced Shared Styling**:
  - Shared layout and input components now emit the `fb-*` namespace directly for custom classes: `fb-layout-container`, `fb-layout-edit-view-form`, `fb-layout-nav-grid`, `fb-layout-nav-section-name`, `fb-layout-nav-counter-box`, `fb-layout-nav-indicator`, `fb-header-with-divider`, `fb-addressograph-container`, `fb-question-container`, `fb-section-block`, `fb-radio-checkbox-group-container`, `fb-radio-checkbox-item`, `fb-subquestion-wrapper`, `fb-subquestion`, `fb-msi-selector-input`, `fb-date-control-input`, `fb-sct-procedure-selector-input`, `fb-hide-border-in-rov`, and `fb-input-with-units`.
  - Manual question wrappers in Operation Note, Outpatient Outcome, Waiting List Card, and their relevant RoV views have been aligned to `fb-question-container`, `fb-radio-checkbox-item`, and `fb-subquestion` so generated and handwritten form markup use the same selector language.
  - Outpatient Outcome's Outcome question now uses the shared `fbCheck` wrapper for the treatment/referral/follow-up checkbox rows that own conditional subquestions, while preserving the existing checkbox enable/disable rules exactly through `isOutcomeCheckboxDisabled()`.
  - All edit-view radio/check option labels use `0.2rem` left/right padding so yellow hover/focus highlights have breathing room around the control and text.
  - Shared `fbRadio` and `fbCheck` leave native radio/checkbox dimensions in place rather than forcing `1rem` control sizing, keeping WLC and OO controls visually consistent.
  - Shared components no longer emit legacy layout, addressograph, bottom-control, question, radio/check, section, navigation, date, MSI, SCT, or input-with-units custom classes; they emit the corresponding `fb-*` names.
  - Successfully recovered 100% of the original scoped/custom styling and panel structures, eliminating parent overrides issues while preserving the standardised component namespaces.

### Visual Left-Bar Refactoring in Read-Only Views (RoV)
- To achieve a cleaner design in accord with clinical preferences, the left blue vertical border (`border-l-2 border-blue-200`) previously framing conditional subquestions inside the Read-Only Views (specifically in the anticoagulants overview breakdown of `WaitingListCardRoV.tsx`) has been completely removed.
- Padding indents (`pl-4`) have been fully preserved to visually denote nesting heirarchies clearly and accurately, without visual heavy bars.

### Safe Contextual UUID Fallback Engine
- To support flawless performance during demonstrations where the browser's cryptographic API or secure random contexts are restricted (such as legacy or sandboxed demo iframe containers), the app utilizes a fallback identifier generator (`/src/utils/formUtils.ts`).
- It attempts version 4 compliant `window.crypto.randomUUID()`. If that's unavailable, it tries creating compliant hexadecimal strings utilizing random bytes from `window.crypto.getRandomValues(buffer)`. If all secure cryptography modules are unavailable, it seamlessly falls back to a pseudo-random identifier generator using Math.random. This eliminates rendering or initialization crashes in non-secure frames while guaranteeing a flawless user experience.

### Verified Non-Working Strategies
- **TableRow Focus Highlights**: Initially hover states were applied directly on rows. It caused full tables to change color when clinicians focused individual inputs. Corrected by restricting backgrounds to `TD` cells.
- **`fbAddButton` Highlight Locks**: Clicking buttons previously locked yellow focus highlights. Solved by replacing focus state hooks with the native CSS `focus-visible` pseudo-class.
- **Empty list rows warnings**: Initially queried entries via `procedures.every()` checks which failed on initial uninitialized arrays. Corrected using safe arrays length validations: `(procedures.length === 0 || procedures.every(p => !p.procedure || String(p.procedure).trim() === ''))`.
