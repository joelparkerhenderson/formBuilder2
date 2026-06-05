# formBuilder2

formBuilder2 is a re-implentation of the original shadesOfPale formBuilder form design and forms engine using techniques and technologies that may be easier to reproduce.

The shadesOfPale formDesign form design is the reference design for eForms in the WCP and associated applications.

This document is a manifestation of the design principles and is intended to include a compelte description of the functionality, layouts and styling required as is. It should contain enough information for both humans and LLMs to re-create the design and regenerate the application from scratch without additional prompting.

---

## Document conventions

'fbXxx' denotes a standardised part of the design which should be described in detail somewhere in this document. There is often a corresponding React component, CSS class or Typescript constant.

---

## Document overview
- Language rules
- Colours and typography
- Features common to all forms and pages
- Read-only views
- Custom components
- Navigation
- Forms and pages
- Algorithms (including javascript fragments) used to provide  features common to all forms and pages
- Complex custom controls
- CSS rules and declarations
- Technical overview of the application
- Compile and runtime dependencies
- Compile and deploy steps
- Database schema
- SQL queries

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
- All forms use `backgroundColor: white;` for the form shell, central workspace, header, and footer. Coloured fills are reserved for section title bars, status badges, buttons, warnings, active highlights, and popups.
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
    - `fbFaintGreen`: `#C5E1A5`

---

## Icons

Material Icons render as ligature text inside elements with `className="material-icons"` or `className="material-icons-outlined"`. HTML renderers that load the Material Icons stylesheet display the glyphs directly; renderers without that font still show the ligature name as readable fallback text.

| Icon | Rendered HTML | Used for |
| :--- | :--- | :--- |
| `check_circle_outline` | <span class="material-icons" aria-hidden="true">check_circle_outline</span> | Coded / confirmed status indicators in MSI, SNOMED CT, and RoV fields. |
| `warning` | <span class="material-icons" aria-hidden="true">warning</span> | Not-coded / unconfirmed status indicators in MSI, SNOMED CT, and RoV fields. |
| `swap_vertical_circle` | <span class="material-icons" aria-hidden="true">swap_vertical_circle</span> | Drag handles in procedure, diagnosis, and specimen tables. |
| `highlight_off` | <span class="material-icons" aria-hidden="true">highlight_off</span> | Delete/remove row actions in editable clinical tables. |

---

## Features common to all forms

### General layout
- All forms are nested inside the `fbLayout` global page wrapper component.
- The scrolling behaviour uses `overflowY: 'auto';` on a main central workspace container.
- The top header consists of `fbHeader`, containing the form title on the left and `fbAddressograph` on the right.
- The header uses `borderBottom: "0.2rem solid " + fbBlue;` with `backgroundColor: white;`.
- The form footer consists of `fbBottomControlsRow` at the absolute bottom of the viewport.
- The footer uses `borderTop: "0.2rem solid " + fbBlue;` with `backgroundColor: white;`.
- The sidebar navigation panel is visible in both edit and read-only views on the left-hand side.
- Visual width of the navigation panel is constrained to `width: 16rem;` (`w-64`).
- If the viewport is very narrow (width `< 768px`), the navigation panel is hidden.
- Sidebar section names and counter boxes are buttons that smooth-scroll the central scroll panel to the matching section; they must not use plain hash anchors that can close inline forms or route away.
- Editable-form sidebar section-name buttons use white text on `fbBlue`; complete counter boxes display a check mark and incomplete counter boxes display the incomplete count.
- Editable-form sidebar section-name and counter buttons deliberately leave a visible white grid gap between the section name and the fixed-width counter box. The normal form nav grid uses `display: "grid"`, `alignItems: "stretch"`, `columnGap: "0.3rem"`, and `rowGap: "0.1rem"`; the earlier `0.15rem` column gap is too narrow and visually swallows the separator. Counter boxes should stretch to the same rendered height as the section-name button in their row.
- Sidebar active indicators render exactly two triangles: one left-pointing and one right-pointing. Source code must use Unicode escapes `'\u25c0\u25b6'` rather than pasted glyphs, because pasted triangles have previously been saved as mojibake and made Controller nav rows too tall.
- The central form workspace uses the full available width of its panel rather than imposing a redundant max-width wrapper.
- Normal edit-form central workspace padding is `0.8rem 0 4rem 0`; the left and right padding values are deliberately zero to avoid redundant white space around the main form content.
- Desktop rows stacked in grids collapse into single-column layouts on narrow screens.
- All dynamic label heights are equalized across columns on desktop viewports and reset on mobile viewports.
- Edit-form label equalization and textarea auto-expansion are implemented by `/src/utils/formLayoutEffects.ts`; the shared hooks deliberately preserve the desktop label-alignment behaviour while resetting heights on mobile to avoid redundant vertical whitespace. The label equalisation row scan includes normal `.questions-row`/`.grid` rows and Controller `.fb-designer-question-row` flex rows.
- Simple textarea input resizing also uses `/src/utils/formLayoutEffects.ts` (`resizeTextareaToContent`) so manual `onInput` handlers match the automatic edit-form textarea behaviour.
- Tooltip state, delayed hide behaviour, screen-position calculation, and rendering are implemented by `/src/utils/useFbTooltips.tsx`; Operation Note, Outpatient Outcome, and relevant read-only views share this hook while preserving their existing tooltip triggers.
- Default clinical date display strings use `/src/utils/dateFormat.ts` (`formatClinicalDate`) for the `dd-Mmm-yyyy` format used when initializing form dates.

### Sections, rows, questions and subquestions
- Forms are partitioned into multiple high-level container components `fbSection`.
- Each `fbSection` container includes a dedicated section header, implemented via the `fbSectionHeader` component displaying a high-contrast visual title bar, followed by a list of child controls.
- Inside each `fbSection`, the child content is structured as a list of `fbQuestionRow` containers (or sometimes just individual questions that are not grouped inside a row).
- Row elements use the `fbQuestionRow` layout blocks to arrange questions horizontally using CSS grid.
- Where there are four questions in a row, the `fbQuestionRow` contains exactly four `fbQuestionRowCell` components, each of which wraps a single question. If there is a second (or third) set of questions, there is a second (or third) separate `fbQuestionRowCell` nested inside the row.
- Grid spaces and relative horizontal weights are divided cleanly using `<fbQuestionRowCell span={n}>` layout blocks.
- Individual fields are wrapped in `fbQuestion`, which provides visual labels and structured padding.
- Hidden display-conditional subquestions render recursively nested inline beneath selected parent triggers inside matching sections.

### Question types
- `fbTextInput`: Standard alphanumeric text input.
- `fbTextArea`: Multi-line, auto-expanding description text block.
- `fbDropdown`: Fixed-option native dropdown selector.
- `fbNumberInput`: Quantity input with side units.
- `fbRadio`: Single-choice radio selector.
- `fbCheck`: Multi-choice checkbox selector.
- `fbPartialDate`: Date control that accepts exact, month-only, or year-only dates.
- `fbExactDate`: Date control that accepts only complete dates and stores database-facing exact dates.
- `fbSCTProcedure`: SNOMED CT procedure autocomplete wrapper around `fbSCTSelector`.
- `fbSCTDiagnosis`: SNOMED CT diagnosis autocomplete wrapper around `fbSCTSelector`.
- `fbMSISelector`: Hospital clinician autocomplete.

### Required (mandatory field) indicator
- Handled centrally by `fbQuestion`, `fbTextInput`, `fbTextArea`, and `fbMSISelector` components.
- If the target question field is required, it displays a red asterisk using `color: fbRed;` (`*`).
- If a label exists, the asterisk is grouped with the last word of the label string in a single word-wrap container (`whiteSpace: 'nowrap';`).
- This prevents the asterisk from wrapping alone onto a new line, which appears as a layout defect.
- If there is no label (e.g., hidden nested subquestions), the asterisk is displayed immediately to the right of the control.
- In unlabelled scenarios, the indicator is top-aligned with the control with zero line breaks.

### Subquestions
- There is no standalone `fbSubquestion` component. Conditional subquestions are rendered by `fbRadio` and `fbCheck` when they receive `children`; those components emit the `fb-subquestion-wrapper` and `fb-subquestion` class hooks used by highlighting, label equalisation, and tooltip placement.
- Visually aligned under parent options with deep indentation style `paddingLeft: '1.5rem';` (`pl-6`).
- Fully enclosed inside conditional React renders `{parentValue === 'yes' && (...) }` to prevent initial pre-flashes.
- Stored inputs of subquestions are explicitly reset to empty strings if parent values are changed.
- Inputs utilize a direct two-way binding pattern linked to the active parent state.

### Mulit-line text input 
- All multi-line `fbTextArea` components initialize with standard heights `rows={2}`.
- The default maximum width of an `fbTextArea` is `37rem`; when a form specification marks the textarea as full width, it occupies the full width of its containing component instead.
- Textareas dynamically expand heights based on character volume tracking `textarea.scrollHeight`.
- Line breaks (`\n`) and returns (`\r`) in user descriptions are preserved.
- When rendered inside read-only views, fields are styled with `whiteSpace: 'pre-line';` to retain formatting.

### 'fbInputWithUnits'
- Quantity-with-unit inputs use a `.fb-input-with-units` wrapper.
- Container borders override standard elements; internal state input elements suppress native outlines (`border: none;`).
- Normalization ensures a simple vertical separator divider is drawn between quantity values and text unit blocks.

### 'fbMSISelector', 'fbSCTProcedure' and 'fbSCTDiagnosis'
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

### Highlighting system
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

### Tooltips
- Handled using the custom component `fbToolTip`.
- Absolute coordinates position help-bubbles directly near related clinical labels.
- Interactive tooltips are non-intrusive and avoid layout shift.
- Manual close buttons on tooltips require a solid black border (`border: 0.1rem solid black;`).
- Tooltip dimensions are kept compact using a `padding: '0 0.3rem';` button scale.
- When a hovered or focused child control opens a custom tooltip, the tooltip controller also opens custom tooltips for the containing `fbQuestion` label(s) and nearest `fbSection` heading. This is an application-level cascade implemented by `/src/utils/useFbTooltips.tsx`, not standard browser `title` tooltip behaviour.
- For radios/checks in grouped questions, tooltip bubbles appear just below the option label and align approximately `2rem` to the right of the actual radio/checkbox control.
- Tooltip bubbles clamp their horizontal position inside the viewport so they do not bleed off the right edge of the page.
- When a radio/check option has an open subquestion beneath it, the tooltip moves above the option label so it does not obscure the subquestion fields.
- Read-only views may render the same custom tooltip bubbles for clinical labels where explanatory text still matters.
- Open-subquestion detection uses component-generated wrappers (`fb-subquestion-wrapper`) and namespaced manual subquestion blocks (`fb-subquestion`) used in Outpatient Outcome.

### Save enabled / disabled
- Evaluates form state completeness via validation scripts `areRequiredFieldsComplete()`.
- If required questions are incomplete, footer action items are locked.
- Disabled buttons use a solid grey background `backgroundColor: fbSilver;` with white text.
- If changes have occurred, the save button variant alternates to `backgroundColor: fbGreen;`.
- If no changes exist, the button is disabled using standard grey.
- While a save operation is in progress, `fbSavingPopup` displays the modal title "Saving..." and the footer save button is disabled.
- If a save operation appears successful, `fbSavedPopup` displays the modal title "Data saved" for 1000 ms before the form closes.
- If a save operation reports an error, `fbSaveErrorPopup` displays the modal title "Error", the message "Changes may not have been saved", raw error details, and a white-on-green `fbButton` labelled "Return to form". Returning to the form leaves saving enabled so the user can retry.
- Shared save feedback, pending password-popup continuation, password capture, and save-status popup rendering are owned by `/src/utils/useFormSaveFeedback.tsx`; individual forms provide only their form-specific database save function and success/error side effects.
- The footer password field clears 2 seconds after losing focus. If Save is clicked before that timeout expires, the shared save hook captures the current password immediately and uses that captured value for the save operation.

### Draft / final state
- Unfinalised forms save with a status of `'draft'`.
- Saving as a draft prompts the user with the `fbDraftPopup` confirmation message.
- Draft indicators display `fbDraftBadge` (white bold text on `backgroundColor: fbRed;` with zero border-radius).
- Finalized states are reached by checking `fbFinalControl` checkmarks in footers.
- Complete finalization locks forms into permanent read-only event logs.

### RoV, EV, Save and Cancel buttons
- **RoV Toggle Button**: Triggered via toggle buttons in active edit views.
    - Checks if state has changes.
    - If changes exist, prompts users with authentication re-entry.
    - Passes modified transient state directly to read-only drawers without database writes.
- **Save and Close**: Triggered in footers.
    - Checks if password has been re-entered when changes exist.
    - Checks if finalization marks are unchecked to prompt `fbDraftPopup`.
    - Appends clinical record entries through the REST API.
- **Cancel Button**: Triggered via specialized `fbCancelFormButton` red button.
    - Shows `fbCancelPopup` warning layout if modifications are present.
    - Dismissing warning discards changes and routes away.

### `<Enter>` key behaviour
- Forms prevent the `<Enter>` key from submitting inputs inadvertently.
- Handled using standard KeyDown interceptors on parent forms.
- Enter keystrokes only trigger submissions if target focus is a button of `type="submit"`.
- Textarea elements bypass blocking actions to permit normal multi-line paragraph additions.

---

## Read-only view rules

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
- RoVs for current form versions show a white-on-blue History button in the footer bottom left, immediately to the right of EV when EV is present.
- Clicking History opens `fbFormHistoryMenu`, a popup table of saved versions with "Date and time", "Saved by", and a `fbViewOldVersion` View button.
- Clicking View loads that exact saved version into RoV.
- If the viewed RoV is not the most recent saved version of the form, `fbSupersededBadge` appears above the title, to the left of any draft badge. Superseded RoVs show Back only, with no Edit or EV control. Back reloads the most recent version of that form.

---

## Custom components

### Components for patient form specification

These components are part of the form-specification vocabulary. A human designer, a JSON form spec, or an LLM recreating a patient form should use these names rather than lower-level layout details.

| Component | File | Purpose | Arguments | Structure / Layout & CSS |
| :--- | :--- | :--- | :--- | :--- |
| `fbSection` | `/src/components/fbSection.tsx` | High-level titled form section | `id`, `title`, `children` | Blue title bar with white text followed by child rows/questions. |
| `fbQuestionRow` | `/src/components/fbQuestionRow.tsx` | Responsive multi-column question row | `cols`, `children`, `style` | CSS grid row; collapses to one column on narrow screens. |
| `fbQuestionCell` / `fbQuestionRowCell` | `/src/components/fbQuestionRowCell.tsx` | Cell inside a question row | `span`, `children` | Provides column span semantics within `fbQuestionRow`. |
| `fbTextInput` / `fbTextArea` / `fbTextInputWithUnits` | `/src/components/fbTextInput.tsx`, `/src/components/fbTextArea.tsx`, `/src/components/fbTextInputWithUnits.tsx` | Textual fields | `id`, `name`, `label`, `required`, `value`, `onChange` | Wrapped by `fbQuestion`; textareas auto-expand and preserve line breaks in RoV. |
| `fbFieldWithUnits` / `fbNumberInput` | `/src/components/fbNumberInput.tsx` | Numeric or textual field with units | `id`, `name`, `label`, `value`, `onChange`, `units`, `min` | Uses `.fb-input-with-units` with a value box and unit label separated by a vertical divider. |
| `fbCheck` | `/src/components/fbCheck.tsx` | Checkbox option, including conditional subquestions | `id`, `name`, `checked`, `label`, `onChange`, `children` | Uses `fb-radio-checkbox-item`; children render as indented subquestions. |
| `fbRadio` | `/src/components/fbRadio.tsx` | Radio option, including conditional subquestions | `id`, `name`, `value`, `checked`, `label`, `onChange`, `children` | Same highlighting and nested subquestion behaviour as `fbCheck`. |
| `fbDropdown` | `/src/components/fbDropdown.tsx` | Native dropdown selector | `id`, `name`, `label`, `required`, `value`, `onChange`, `options` | Standard silver border, compact padding, and sentence-case labels. |
| `fbGroup` | `/src/components/fbGroup.tsx` | Groups checks/radios under one legend | `label`, `children` | Optional legend in Roboto 300; children stack vertically. |
| `fbPartialDate` | `/src/components/fbPartialDate.tsx` | Date control allowing day, month, or year precision | `name`, `value`, `onChange`, `placeholder`, `required` | Accepts `dd-Mmm-yyyy`, `Mmm-yyyy`, `yyyy`, slash, and dot variants; calendar includes exact/month/year selection buttons. |
| `fbExactDate` | `/src/components/fbExactDate.tsx` | Exact date control for complete database dates | Same as `fbPartialDate` except no `exactOnly` prop is exposed | Same visual calendar as `fbPartialDate`; typed input must resolve to a complete day date and the month/year/exact-date selection buttons are hidden. Exact dates should be saved through DATE/TIMESTAMP database fields, not only JSON strings. |
| `fbTable`, `fbTableHeader`, `fbTableBody`, `fbTableRow`, `fbTableHeaderCell`, `fbTableCell` | `/src/components/fbTable.tsx`, `/src/components/fbTableCell.tsx` | Clinical tables and row lists | Standard table children and cell props | Silver borders, compact cells, optional drag handle and delete-button columns. |
| `fbAddButton` | `/src/components/fbAddButton.tsx` | Inline add-row/add-item control | `label`, `onClick` | Blue-on-white add control used below dynamic clinical row lists. |
| `fbMSISelector` | `/src/components/fbMSISelector.tsx` | Clinician autocomplete | `name`, `value`, `coded`, `onChange`, `required` | Searches the MSI endpoint and stores coded/unconfirmed state. |
| `fbSCTProcedure` | `/src/components/fbSCTProcedure.tsx` | SNOMED CT procedure autocomplete | `name`, `value`, `coded`, `onChange`, `placeholder` | Wrapper around `fbSCTSelector` using procedure search. |
| `fbSCTDiagnosis` | `/src/components/fbSCTDiagnosis.tsx` | SNOMED CT diagnosis autocomplete | `name`, `value`, `coded`, `onChange`, `placeholder` | Wrapper around `fbSCTSelector` using disorder search. |

### Components for internal use

These components are application chrome, persistence workflow controls, read-only view helpers, or lower-level infrastructure. They may appear in generated pages, but they are not ordinary patient-form specification elements.

| Component | File | Purpose | Arguments | Structure / Layout & CSS |
| :--- | :--- | :--- | :--- | :--- |
| `fbButton` | `/src/components/fbButton.tsx` | Standard action button | `variant`, `disabled`, `onClick`, `style` | Blue, green, red, and disabled button variants with yellow hover transitions. |
| `fbAddressograph` | `/src/components/fbAddressograph.tsx` | Patient demographic card | Patient demographic fields | Arial/Helvetica addressograph card, right aligned in headers. |
| `fbHeader` / `fbLayout` / `fbBottomControlsRow` | `/src/components/fbHeader.tsx`, `/src/components/fbLayout.tsx`, `/src/components/fbBottomControlsRow.tsx` | Shared edit-form shell | Header, footer, section state, save/RoV handlers | Owns sidebar navigation, footer controls, layout scrolling, highlighting, and responsive behaviour. |
| `fbDraftBadge` | `/src/components/fbDraftBadge.tsx` | Draft status badge | None | White bold text on red square badge. |
| `fbSupersededBadge` | `/src/components/fbSupersededBadge.tsx` | Old-version RoV badge | None | Same visual treatment as `fbDraftBadge`, with legend "Superseded". |
| `fbDraftPopup`, `fbPasswordPopup`, `fbSavingPopup`, `fbSavedPopup`, `fbSaveErrorPopup`, `fbCancelPopup` | `/src/components/` | Save, password, draft, and cancellation modals | Modal-specific callbacks | Blue-bordered or password-popup styled workflow modals. |
| `fbAuthControls`, `fbAuthAndSensitivity`, `fbFinalControl`, `fbPassword`, `fbSaveCancelButtons`, `fbCancelFormButton` | `/src/components/` | Edit-form authentication/finalisation controls | Form state and callback props | Footer and modal controls for credentials, final/draft state, high-sensitivity status, save, and cancel. |
| `fbUserName` | `/src/components/fbUserName.tsx` | Active username control | `value`, `onChange` | Stores the visible username in local storage and footer state. |
| `fbAddButtonForPage` / `fbAddFormMenu` | `/src/components/` | Patient-record new-form launcher | Button/menu callbacks | Bottom-left patient-record popup for creating WLC, OO, and op note forms. |
| `fbSmallAddButton` | `/src/components/fbSmallAddButton.tsx` | Compact internal inline action | `label`, `onClick` | Reduced-size add/open action used inside dense subquestion areas. |
| `fbFormTile` / `fbOutpatientAppointmentTile` | `/src/components/` | Patient-record timeline tiles | Form/appointment display props | Show chronological document and appointment summaries with badges. |
| `fbFormHistoryMenu` | `/src/components/fbFormHistoryMenu.tsx` | RoV version-history popup | `history`, `onViewVersion`, `onClose` | Table with "Date and time", "Saved by", and a `fbViewOldVersion` button for each saved form version. |
| `fbViewOldVersion` | `/src/components/fbViewOldVersion.tsx` | History row action | `onClick` | Standard `fbButton` labelled "View". |
| `fbNavigationPanel` | `/src/components/fbNavigationPanel.tsx` | Edit/RoV sidebar navigation | `sections`, `activeSection`, `onScroll` | Desktop vertical section navigator. |
| `fbRoVHeader` / `fbRoVFooter` | `/src/components/fbRoVShell.tsx` | Shared read-only view chrome | `title`, `patient`, `formStatus`, `superseded`, `onHistory`, `onBack`, `onSwitchToEV` | Header renders draft/superseded badges; footer renders EV, History, Edit, and Back according to context. |
| `fbRoVField` / `fbRoVTableCell` | `/src/components/fbRoVField.tsx` | Shared read-only data renderers | Field/table-cell props | Preserve grid spacing, typography, coded indicators, and pre-line text. |
| `fbSCTSelector` | `/src/components/fbSCTSelector.tsx` | Internal SNOMED CT popup engine | `searchCommand`, `mode`, `coded`, `onChange` | Shared autocomplete implementation used by SCT wrappers. |
| `fbSearchInput` | `/src/components/fbSearchInput.tsx` | Patient search input | `value`, `onChange`, `onClear` | Focused search box with clear control. |
| `fbToolTip` | `/src/components/fbToolTip.tsx` | Custom tooltip display | Tooltip text and child props | Absolute-positioned hover/focus help bubbles. |
| `fbAutoExpandingTextarea` | `/src/components/fbAutoExpandingTextarea.tsx` | Internal textarea helper | `id`, `name`, `value`, `onChange` | Lower-level auto-resize component. |

---

## Navigation

- Navigation is structured around five central screens: Home page, Patient registry, Patient search, Patient record, and clinical document editor.
- **Home page (`/`)**:
    - Serves as the application landing screen.
    - Displays primary links: "Patient registry" and "Patient search".
    - Active user session details are persisted as `"demoUser"` in local storage.
- **Patient registry**:
    - Reached via the home page.
    - Loads current patient rows from `patients_current`/`patients` through the REST client.
    - Lists patients alphabetically by surname, then forenames, then date of birth.
    - Each row/card must show enough identifiers to distinguish patients safely: surname, forenames, title if present, date of birth, NHS number, CRN, and sex.
    - Clicking a patient card dynamically hides the registry list and opens Patient record inline on the same page, preserving the selected patient UUID.
    - Closing the inline Patient record returns to the registry list without clearing the already loaded registry.
- **Patient search**:
    - Reached via the home page.
    - Focuses search inputs instantly on mount and queries using Postgres pg_trgm fuzzy similarity.
    - Uses `fbSearchInput` with a visible clear control. Clearing the value clears results and re-focuses the input.
    - Search calls `search_patients_fuzzy(search_term)` through the compatibility layer, which maps to `POST /api/patients/search`.
    - Results use the same patient identifier display as Patient registry.
    - Empty non-blank searches show a plain "No matches found" message.
    - Clicking a result hides the search result list and opens Patient record inline for the selected patient UUID.
    - Closing the inline Patient record returns to the search screen with the previous query/results still available unless the user cleared them.
- **Patient record**:
    - Displays patient demography and chronological EHR history list.
    - Loads the patient by UUID and renders the addressograph in the top right; if no patient is loaded, the default Donald Duck addressograph may appear only as a fallback.
    - Loads current form index entries from `forms_index_current` filtered by `patient_uuid`, ordered by `event_datetime DESC`.
    - Loads appointment detail rows only for appointment UUIDs present in the forms/index list.
    - The main record list is a single-column clinical timeline with date/time, form/document type, speciality, senior responsible clinician, and status badges.
    - Highlights future clinics using "Future appt" and non-outcomed visits using "Not outcomed".
    - Draft documents display `fbDraftBadge`.
    - Add additions trigger "New form or document" from the bottom-left `fbAddButtonForPage`, opening `fbAddFormMenu`.
    - Creating a form inline passes the active patient UUID, username, and `openInRoV: false`.
    - "Open" triggers load clinical forms in RoV inline, hiding parent dashboards.
    - Opening existing WLC, OO, or op note records passes form UUID, patient UUID, username, and `openInRoV: true`; closing the inline form refreshes the patient-record list without a full page reload.
    - Appointment rows show an "Outcome form" button only for non-future appointments. If an outcome form already exists, it opens that form; otherwise it creates a new OO for the appointment.
    - The Patient record Close button returns to the route recorded in `location.state.from` or Home if none is provided.
- **Clinical form edit views (wlc, oo, op note)**:
    - Reached from records dashboards.
    - Cancel and Back buttons navigate back depending on origin context (`location.state.openInRoV`).
    - If openInRoV is undefined, Cancel routes clinicians back to Home page (`'/'`).
    - If openInRoV is defined, Cancel routes clinicians back to the active Patient record screen.

---

### Forms and pages

### Patient forms

#### 1. Waiting list card (`wlc`)
- Reached from "New form or document" popup selections inside Patient Record.
- Fetches static baseline parameters through the REST client to load active clinical profiles.
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
                - `fbExactDate`: Date listed (required, key: `dateListed`, default: today)
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
                - `fbGroup`: Anticoagulants & antiplatelet agents (using fbQuestion container wrapping):
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
                - `fbPartialDate`: Estimated date of admission (key: `estimatedAdmission`)
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

#### 2. Outpatient outcome form (`oo`)
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
                    - `fbPartialDate`: Date (key: `anotherApptDate`)
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

#### 3. Operation note (`op note`)
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
                - `fbExactDate`: Date of operation (required, key: `date`, default: today)
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
                    - `fbPartialDate`: Remove by (required, format: `dd-Mmm-yyyy`)
                - `fbRadio`: No
            - `fbTableCell` (extreme right): Delete row column (displays icon `highlight_off` to trigger instant row deletion code)
        - `fbAddButton`: Add another implant

### Application and navigation forms and pages

#### 1. Home page (`Home.tsx`)
- High-contrast typography displays main title `"formBuilder2"` (`fontSize: "2rem"; margin: "1rem 0";` sentence case).
- Renders big blue centered navigation buttons pointing to clinical forms, Patient registry, and Patient search. The clinical buttons include Waiting list card, Operation note, Outpatient outcome, and Treatment summary for Donald Duck by default.
- The footer retains the standard `fbBottomControlsRow` rendering active user sessions.

#### 2. Patient registry (`PatientRegistry.tsx`)
- Suppresses standard Patient Addressograph panels.
- Loads registry items from database view in alphabetical order of Surnames first.
- Clicking patient cards toggles `style.display="none"` on lists, showing PatientRecord inline.

#### 3. Patient search (`PatientSearch.tsx`)
- Autofocuses the `fbSearchInput` widget wrapper centrally on page mount.
- Displays a silver clearing cross (`x`) on input values to clear lists and re-focus.
- Retains plain "No matches found" message if searches return empty strings.

#### 4. Patient record (`PatientRecord.tsx`)
- Streamlines index lists in a single-column layout, hiding the grey navigation panel.
- Arranges cards in a chronological event index timeline using standard `forms_index_current` tables.
- Renders future hospital appointments in visual bright-green "Future appt" tags.
- Open triggers mount form components in the DOM, hiding the parent records dashboard.
- The "New form or document" popup creates Outpatient outcome, Waiting list card, Treatment summary, and Operation note documents for the current patient. Treatment summary documents use the normal inline EV/RoV pattern and are indexed as `forms_index.form_type = "treatment_summary"`.

#### 4a. Treatment summary (`TreatmentSummary.tsx`)
- Treatment summary is a first-class clinical document generated from the Controller JSON form whose public id is `c2d1a786`.
- The source JSON specification is kept in `src/treatmentSummarySpec.ts`; `src/GeneratedFormRenderer.tsx` renders that spec as normal EV controls and RoV fields.
- Saved values are keyed by Controller component id in `form_data`, with coded-selector companion values saved as `{componentId}_coded`.
- Rows, row cells, `colSpan`, required fields, dropdown/radio option labels, text inputs, text areas, MSI selectors, and SNOMED CT diagnosis selectors are rendered from the imported spec.
- The first two Details questions default to "Unknown or not recorded".
- Treatment summary saves versions to the `treatment_summaries` clinical table and appends a `forms_index` row with `form_type = "treatment_summary"`, so duplicate display names do not identify records.

#### 5. Controller (`Controller.tsx`)
- Controller is a special form-building page for authenticated form controllers to create patient forms from selected components without AI assistance.
- User-created forms are stored as JSON specifications and rendered dynamically in the browser; editing a designed form mutates the JSON spec and re-renders the left-panel preview.
- Controller does not use browser local storage for design data. It saves/loads only through the REST API backed by `"designAuth"` and `"designData"`. Session tokens and preferences may be stored locally for session resume.
- Controller authentication prefers `/formBuilder2/api/controller-auth/register-start`, `/formBuilder2/api/controller-auth/register-resend`, `/formBuilder2/api/controller-auth/register-verify`, and `/formBuilder2/api/controller-auth/login`; the client still falls back to the older `/designer-auth/...` paths for compatibility. Passwords are salted and hashed in the Java API after email verification before storage. Re-registering the same email address is allowed and preserves existing Controller data by keeping the same `user_uuid` while replacing the password hash and verification timestamp.
- Each designed form has a private design UUID and a public random hexadecimal identifier. Review URLs use `/formBuilder2/userForm.html#{randomHex}` without a cachebusting query string.
- Public forms load with `/formBuilder2/api/designs/public/{randomHex}` and do not display the Controller right panel.
- `wlc.json` in the project root is a Controller-readable test specification for a Waiting List Card-style form.
- The page uses a two-panel layout:
    - Left panel: 75% of the window width, containing the live form preview.
    - Right panel: 25% of the window width, containing authentication, design lists, property sheets, breadcrumbs, JSON tools, save/delete/logout, and public URL controls.
- When no user is logged in, the left panel is blank and the right panel shows a Login/Register radio toggle, defaulting to Login.
- Login uses email address and one password field.
- Registration requires email address, password, repeat password, and a six-digit email verification code. Email addresses must end with `@wales.nhs.uk`. Passwords must be at least 12 characters. Password inputs have a vertically centred inline show-password icon.
- Registration must show the red italic warning between email and password: "Passwords must be 12 characters or longer. Do NOT use your NADEX password. Do NOT re-use another password. There is no automatic password recovery or reset."
- Pressing Enter in a Controller login or registration password field submits that auth form for validation. Switching between Login and Register disables plain-text password display.
- Registration sends a six-digit verification code by email. The code entry panel tells users to check inbox and junk folders, supports Resend code and Cancel, and logs the user in only after the correct unexpired code is entered. Codes expire after ten minutes; expired and incorrect codes show the specified Retry panel.
- After login, the right panel shows the user's prior designs as blue underlined links, followed by a "New form" button. Controller stores the session token in a same-path browser cookie and local storage so ordinary reloads, hot updates, and local server rebuilds can resume without asking for credentials.
- After successful login or registration, and after explicit Logout, Controller clears the visible login and registration email/password inputs. Logout also clears in-memory user email, password, and session-token state, deletes local session storage, and clears the session cookie.
- New forms have title "My first form", are for Donald Duck by default, and start with an empty form body.
- Left-panel selection:
    - Clicking, focusing, or selecting a component from the right panel marks it selected.
    - Selected components have `border: 0.1rem solid purple;` with square corners. `fbQuestionRow`, `fbQuestionRowCell`, and selected/all-purple form body drop targets use `0.4rem` internal selection padding.
    - A `1rem` square solid purple drag handle is flush with the upper-left corner of selected draggable component borders.
    - The form body itself can be selected; it has a purple border around the central form body and no drag handle. When empty, the selected form body is at least `2rem` high.
    - `fbQuestionRow` and `fbQuestionRowCell` are directly selectable and draw the purple border and drag handle when selected.
    - Dragging from the purple handle onto another component moves the dragged component's JSON before the drop target's JSON. Dropping a question onto a question inside an `fbQuestionRowCell` inserts a new `fbQuestionRowCell` into the parent `fbQuestionRow` and places the dropped question inside that new cell.
    - Drag/drop placement is handled by Controller separators only. Blank-space or component-body drops are rejected with the drag/drop problem modal rather than being interpreted as append or move-before operations.
    - The form title, component labels/text, and radio/check option labels are editable in place. In-place label edits update JSON on blur so the page is not re-rendered on every keystroke.
- Add controls:
    - Purple `+` controls are no longer shown in the left Designer preview panel. Adding is driven from the contextual right-panel Add controls.
    - Right-panel fixed-type Add actions add immediately. General component actions expand nested lists of component types; all add actions are top-level right-panel items rather than nested below an Add item. All task items except Delete are blue and underlined, and every item/task has a right-pointing or downward-pointing triangle.
    - The text of an action is underlined, but the triangle marker to its left is not underlined.
    - Components are inserted according to the selected context: for example, after/below the selected section or row, to the right of the selected row cell, below the selected question, or inside the selected group where appropriate.
    - For an `fbQuestionRow`, adding creates an `fbQuestionRowCell`, then adds the selected question component into that cell.
    - If an invalid component type is dropped onto a component, show a purple-bordered explanatory popup with an OK button and do not change JSON.
- Allowed add menus:
    - Form body: `fbSection`, `fbQuestionRow`, any question type, and tables.
    - `fbSection`: `fbQuestionRow`, any question type, and tables.
    - `fbQuestionRow`: any question type, added inside a new selectable `fbQuestionRowCell`.
    - `fbQuestionRowCell`: any question type, added inside the selected cell.
    - `fbGroup`: `fbRadio` or `fbCheck`.
    - Any question type: `fbTextInput`, `fbTextArea`, `fbDropdown`, `fbNumberInput`, `fbFieldWithUnits`, `fbCheck`, `fbRadio`, `fbGroup`, `fbPartialDate`, `fbExactDate`, `fbMSISelector`, `fbSCTDiagnosis`, `fbSCTProcedure`.
    - Table components may only be added to the top-level form body or to an `fbSection`.
- Special add cases:
    - When an `fbRadio` or `fbCheck` is selected, add controls add subquestions. Adding a subcomponent forces the parent check/radio into its checked preview state so the newly visible subcomponent outcome can be seen immediately. For radios inside an `fbGroup`, this sets the group preview value to the selected radio id.
    - `fbQuestionRowCell` is intended to contain a vertical column of single components, possibly with subcomponents, and must not contain nested `fbQuestionRow` layouts. When a component is selected and that component is a direct child of an `fbQuestionRowCell`, the right panel does not show "Add component to right"; it only allows adding below inside the same cell. Green tall-for-single separators are not rendered to the left or right of direct children inside a row cell.
    - When the selected component is the only child of an `fbQuestionRowCell`, and that cell is the only child of its `fbQuestionRow`, the right panel shows "Remove enclosing row and cell components" after the add actions and before Delete. The action removes the row and cell wrapper and replaces the row in the JSON tree with the selected component.
    - Right-panel contextual Add controls are top-level accordion/list items. Fixed-type actions such as section, row, radiobutton, and check box add directly. General component actions expand nested lists of component types. For the form body they are "Add section to form", "Add component row to form", and "Add single component to form". For a section they are "Add component row to section", "Add component to section", and "Add another section". For a component row they are "Add component at end of row", "Add a single component below this row", and "Add another row of components below this row". For a row cell they are "Add component to the right" and "Add component below". For a group they are "Add radiobutton to group", "Add check box to group", "Add a component below", and "Add a row of components below". For a radio or check they are "Add a subcomponent" and "Add another radiobutton below" or "Add another check box below".
    - Right-panel design:
    - Minimalist black-on-white UI, visually distinct from patient forms.
    - Header contains clickable blue underlined breadcrumbs for the current form/component context, including `fbQuestionRowCell` nodes. When a question row is selected, its child cells are displayed as selectable cell links beneath the breadcrumb path.
    - Right-panel buttons highlight on hover and keyboard focus with a grey/silver background.
    - Below the breadcrumbs is a checked-by-default "Show selected purple boxes (component boundaries)" checkbox. Unchecking it hides the selected purple border and drag handle until it is checked again or a breadcrumb that points to a selectable purple box is clicked. Beneath it is "Show all purple boxes"; checking it outlines every control in the left panel and unchecks "Show selected purple boxes (component boundaries)". Unchecking it returns to selected-only behaviour. Checking "Show selected purple boxes (component boundaries)" or clicking a breadcrumb unchecks "Show all purple boxes". Purple drag handles display only when "Show green bars (enables drag and drop)" is checked.
    - Above the purple-box controls is an unchecked-by-default "Show rows and cells in breadcrumbs" checkbox. When unchecked, `fbQuestionRow` and `fbQuestionRowCell` are omitted from breadcrumbs; when checked, they are included.
    - Beneath the purple-box controls is "Show green bars (enables drag and drop)". Green bars are transient Controller-only drop targets and are not saved to database JSON. Separators use `fbFaintGreen` (`#C5E1A5`) with `1.0rem` thickness. Wide separators appear between vertically stacked children, including radio/check children inside groups. Tall separators appear between row cells. Tall-for-single separators appear to the left and right of single questions in form/section contexts; adding or dropping a component on either side converts the single question to a two-cell `fbQuestionRow`. Selecting a green separator shows right-panel add actions for that insertion point and hides Delete.
    - Controller green separators do not have browser tooltip text.
    - The `fbSeparator` element is the drop zone and carries `data-designer-drop-zone-id`; surrounding layout wrappers may still provide padding, grids, selection borders, or section/cell structure, but they are not the green drop target.
    - If a form body, section body, question row, or question row cell has no child content while green bars are visible, its single separator fills the available width and uses the standard `1rem` separator height.
    - Drag/drop is only accepted by the light-green separators. `fbQuestionRow` components can only be dropped on separators whose parent is the form body or an `fbSection`. `fbQuestionRowCell` components can only be dropped on separators whose parent is an `fbQuestionRow`. Invalid drops show a 600ms modal titled "Drag and drop problem" explaining the allowed targets.
    - When the selected `fbSeparator` is the only child placeholder for an empty `fbSection`, `fbQuestionRow`, or `fbQuestionRowCell`, the right panel shows a red "Delete section", "Delete component row", or "Delete component row cell" action after the add action. Clicking it deletes the empty parent container.
    - Footer contains the public URL line above the action buttons, then Show JSON, Save, and Logout. Form deletion is handled by the red underlined Delete accordion item. The public URL block has one silver horizontal rule above it and one matching silver horizontal rule below it.
    - Public URL is rendered inline as black "Public URL: " text followed by a blue underlined URL and a borderless Material Icons copy icon. Controller public URLs do not include a cachebusting query string.
    - Show JSON opens a large popup with indented editable JSON. The textarea has horizontal and vertical scroll bars. OK validates and applies JSON to the live design, saves through the normal design persistence path, resets selection to the form body, and keeps the parsed/replacement design active even if the pasted JSON contains a different design `id`.
    - Save writes JSON to the database with an incremented version or updated saved timestamp. Auto-save should run when changing design, leaving the page, or logging out when feasible.
    - The red underlined Delete task exposes "Confirm delete component" for selected components and "Confirm delete form" for the whole form. Confirm delete form requires a browser confirmation popup and calls the REST delete endpoint so database reloads do not restore the deleted form. Controller task items use compact vertical spacing; all task accordion items show one disclosure triangle, and open accordions collapse after a subitem action is clicked.
- Controller preview footer:
    - Controller uses its own simple footer with a single RoV/EV toggle button. It does not render the full clinical save/auth/final footer inside Controller preview mode.
    - Controller RoV preview renders the live values entered in EV preview, including option labels for radio/check/dropdown controls.
- Property sheet:
    - When a component is selected, the right panel shows editable properties in an HTML table with `border=1`; the delete control appears below the table, not inside it.
    - Editable common properties: type dropdown, label or legend, id, required toggle, tooltip, bold override toggle, plain override toggle, show in RoV if empty/not selected, placeholder where applicable, and database column name. Bold/plain overrides apply consistently to component display text, including standalone checks/radios, group options, groups, sections, ordinary question labels, and RoV values.
    - Value-bearing components show a "Default value" property between "Id" and "Required". For most components this is a borderless auto-expanding textarea; for `fbCheck` and `fbRadio` it is a checkbox. Default values are applied to the rendered control when a saved form specification is first loaded, and are not reapplied after the user edits live values in that session.
    - `fbDropdown` also has an editable list of options.
    - `fbQuestionRowCell` has a numeric `colSpan` property from 1 to 12, defaulting to 1. In Controller preview, `fbQuestionRow` uses a flex row rather than a Tailwind/grid span layout. Controller manually calculates each selectable row-cell wrapper's flex basis from the cell's `colSpan`, the total row span, the fixed `1rem` widths of any green row separators, and the `1rem` gaps between row items. This manual calculation is used because the selectable purple-border wrapper is the actual row child, and earlier attempts to put grid span classes or `grid-column` on the inner `fbQuestionRowCell` were visually ineffective. When an immediate child of an `fbQuestionRowCell` is selected, the property sheet displays and edits the containing cell's `colSpan`.
    - `fbTextArea` has a "Full width" checkbox property. When unchecked, the textarea keeps the standard `37rem` max-width; when checked, the textarea occupies the full width of its container.
    - `fbMSISelector`, `fbSCTProcedure`, and `fbSCTDiagnosis` have an "Accept uncoded values" toggle, reserved for future implementation.
    - Tables can be added to forms and sections. Table properties include toggles for use full width, include drag handles, and include row delete buttons, plus editable column labels and row count.
    - Property-grid inputs and textareas in the value column must not show borders when focused. Label and Tooltip properties use one-line-minimum auto-expanding textareas rather than inputs. Property-grid textareas auto-expand to fit content, do not show scroll bars, and have no resize handle. Options and longer free-text textareas start at four lines high; Options textareas commit option changes on blur so Enter can insert line breaks normally while editing.
    - Standalone `fbRadio` and `fbCheck` components render as one normal radio/checkbox control with an editable label and optional subquestions. They must not render as an `fbGroup` or as a group-like wrapper containing one option when added to a section, question row, or question row cell.
    - `fbRadio` and `fbCheck` children inside an `fbGroup` render as individual radio/checkbox options using the normal group styling and compact vertical spacing, not as standalone question blocks. Controller group labels are bold and editable in place. Selecting a radio/check option displays its own purple selection border and editable in-place label. This individual selectability must remain true when green drop-target separators are visible.
    - Designer required indicators appear once: after the displayed label when a label exists, or to the right of the control when no label exists. `fbGroup` required indicators are displayed after the group label.
    - In-place label editing must strip the rendered required asterisk from the saved label text, so saving a required component label never accumulates multiple `*` characters.
    - Designer tooltip property values are rendered by Controller's custom tooltip hook on selectable controls and displayed label/heading; green separators have no tooltip.
    - New standalone `fbCheck` components default to labels such as "Check 1"; new standalone `fbRadio` components default to labels such as "Radio 1".
    - When selected, ordinary controls such as text inputs, text areas, groups, dropdowns, MSI selectors, and SNOMED CT selectors expose right-panel "Add component to right" and "Add component below" actions. Adding to the right of a standalone component converts it into a two-cell `fbQuestionRow`; adding below inserts the new component after the selected one.
    - New IDs are allocated automatically as `section1`, `section2`, `field1`, `field2`, etc. Users may edit IDs. IDs may be used as React keys.
    - Controller forms and components store persistent free-text `notes` values. The property grid shows a "Notes" row with a borderless textarea that accepts line breaks.
    - Controller components also store a persistent `key` value. Missing or duplicate keys and missing or duplicate component IDs are repaired when designs are loaded from the database or edited through the JSON popup. New component IDs are allocated by scanning existing IDs for the first unused prefix number, not by using component count, so deleted or reordered components do not cause ID reuse. React rendering uses the stored key with the component id as fallback.
- Controller JSON form specification schema:
    - A saved Controller form is a JSON object with `id`, `publicId`, `title`, `patientUuid`, `components`, optional `savedAt`, and optional `notes`.
    - `id` is the private design UUID. `publicId` is the random public URL key stored in `"designData".random_hex`. `title` is the editable form title. `patientUuid` is the default patient UUID used when previewing public forms.
    - `components` is an ordered tree of component objects. Every component has `id`, `type`, `label`, optional persistent `key`, optional `children`, and optional design metadata such as `notes`.
    - Component `type` is one of `fbSection`, `fbQuestionRow`, `fbQuestionRowCell`, `fbTable`, `fbGroup`, `fbTextInput`, `fbTextArea`, `fbDropdown`, `fbNumberInput`, `fbFieldWithUnits`, `fbCheck`, `fbRadio`, `fbPartialDate`, `fbExactDate`, `fbMSISelector`, `fbSCTDiagnosis`, or `fbSCTProcedure`.
    - Structural components own ordered `children`: forms contain sections, rows, tables, and single questions; sections contain rows, tables, and single questions; rows contain `fbQuestionRowCell`; row cells contain a vertical stack of single components; groups contain `fbRadio` and `fbCheck` options; checks/radios may contain conditional subcomponents.
    - Common optional component fields are `required`, `tooltip`, `databaseColumn`, `placeholder`, `defaultValue`, `boldOverride`, `plainOverride`, `showInRoVIfEmpty`, and `acceptUncodedValues`. `defaultValue` is a string; for `fbRadio` and `fbCheck`, the string `"checked"` means checked/selected by default.
    - `fbQuestionRowCell.colSpan` is a number from 1 to 12 and controls its desktop grid span. Missing or invalid `colSpan` values are treated as 1.
    - If a saved JSON spec contains duplicate component IDs, Controller repairs later duplicates on load before rendering so selection, property edits, and deletion target one component rather than every component sharing the same ID.
    - `fbTextArea.fullWidth` is a boolean that overrides the default 37rem textarea max-width. Tables keep their existing `useFullWidth`, `includeDragHandles`, `includeRowDeleteButtons`, `tableColumns`, and `tableRows` fields.
    - `fbDropdown.options` is an ordered array of `{ "value": string, "label": string }` option objects. Controller-generated option values may be regenerated from labels when the Options property is edited.
- Controller approaches tried that did not work:
    - "Show green bars when dragging" was tried as a second right-panel checkbox that displayed separators only after native drag start. It was removed because React had to insert or rewrap separator DOM during the browser's fragile native `dragstart` window. Inserting wrappers around the source could cancel the first drag; skipping source wrappers preserved dragging but meant separators were not reliably visible when the drag began. The stable behaviour is to show green bars before starting drag/drop work.
    - Full-size empty-container separators were first tried with percentage `height`/`min-height`/`min-width` values such as `100%`. This did not work reliably because the parent containers often only had `min-height`, not a definite computed height, so the separator could be present in the DOM but visually collapse.
    - Transform-scaling empty-container separators with `scaleY()` and then absolutely positioning a taller separator inside a fixed-height wrapper were both tried. They produced uneven-looking whitespace or otherwise looked worse, so the Controller returned to the standard `1rem` full-width empty separator.
- Designer persistence tables:
    - `"designAuth"`: user UUID, lower-case user email, salt, password hash, email verified date/time, date/time registered, date/time password changed, date/time last save operation, and JSONB `prefs`.
    - `"designData"`: user UUID, designed form UUID, random hexadecimal public identifier, date/time saved, and JSON spec of the form.
    - `"emailVerificationsInProgress"`: user email, six-digit verification code, and date/time the code was sent.
    - `"designSessions"`: session token, user UUID, expiry time, remember flag, created time, and last-seen time. Non-remembered sessions use a rolling 10-minute expiry. Remembered sessions use a long-lived expiry and still end on explicit Logout.

---

## Algorithms (including Javascript fragments)

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

## Complex custom controls

### `fbPartialDate` and `fbExactDate`
- **Day-precision, month-precision, and year-precision parsers in `fbPartialDate`**:
    - Implements regular expressions processing `dd-Mmm-yyyy` down to single `yyyy`.
- **Layout and styling**:
    - Main input constrained to `width: 100%; maxWidth: 11rem;`.
    - Today's date displayed inside calendar grids using `border: 0.2rem solid " + fbGreen;`.
    - Double steppers (`-` / `+`) alter calendar grids cleanly.
    - Active index highlights inside `backgroundColor: fbGreen;` with bold white text.
- **Exact-date mode**:
    - `fbExactDate` wraps the same visual picker and keyboard handling but sets exact-only validation.
    - Month-only and year-only typed values are rejected with "Complete date required".
    - The Select exact date, Select month, and Select year buttons are not displayed.
    - WLC `dateListed` and operation note `date` use `fbExactDate`; their event dates are converted to ISO date values for database `event_datetime`/index persistence.

### 'fbMSISelector'
- **Clinician search query endpoint**:
    - `https://www.shadesofpale.net/MSISearch?st={query}` (auth: `dhcw:dhcw`).
- **Data validation**:
    - Persistent state keys `seniorClinician_coded` or `listedBy_coded` track clinician selection validation.
    - If empty, no indicator displays.
    - If verified selection exists, displays `check_circle` (`fbGreen`, tooltip `"Coded"`).
    - If typed text is unconfirmed, displays `warning` (`fbOrange`, tooltip `"Not coded"`).
    - User edits invalidate confirmed selections immediately.

### 'fbSCTProcedure', 'fbSCTDiagnosis', and 'fbSCTSelector'
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

## Technical overview of the application

- Built as an offline-capable Electronic Health Record (EHR) clinicial-forms editor.
- Implemented as a full-stack, single-page React 19 application using Vite and TypeScript.
- Styles driven using Tailwind CSS v4 paired with local overrides.
- Database client calls are routed through `/src/restClient.ts`, which maps the subset of query/RPC/update/insert calls used by the forms to the Node/Express REST API in `/server.ts`.
- By default the REST shim uses same-origin relative `/api/...` paths for local and bundled deployments.
- The Node/Express server supports an opt-in mock database mode for restricted development machines. Set `FORMBUILDER2_MOCK_DB=true` to store prototype data in a local JSON file instead of PostgreSQL while preserving the same REST paths.
- Static-host deployments can point the browser bundle at a separate API origin by building with `VITE_API_BASE_URL` set to the API base URL, for example `https://api.example.org`.
- Cross-origin static/API deployments require the API server to allow the static site origin via the comma-separated `CORS_ORIGINS` environment variable.
- A browser page served from HTTPS is a secure context, but it cannot call an HTTP API endpoint because that is active mixed content. The API origin also needs a valid HTTPS certificate for its hostname; an IP-address HTTPS endpoint with a mismatched/self-signed certificate will fail browser fetches.
- Saved form history is served through `/api/forms-index/:uuid/history`. Exact historical form reads use `/api/forms/:formType/:uuid/versions/:version`. The browser compatibility layer maps `forms_index` history queries and `eq('version', n)` form queries to these endpoints. Clinical form types currently include `waiting_list_card`, `operation_note`, `outpatient_outcome`, and `treatment_summary`.
- Development machines may be unable to reach the PostgreSQL database directly even when Node.js can run. On SGS-TGALappy, verified on 2026-06-03, the alternate Codex Node binary works but both localhost SWAS `/formBuilder2/api/health/db` and a direct Node/`pg` probe timed out connecting to the configured database.

---

## Compile and runtime dependencies

- `react` (`^19.0.1`)
- `react-dom` (`^19.0.1`)
- `react-router` (`^7.15.1`)
- `express` (`^4.21.2`)
- `lucide-react` (`^0.546.0`)
- `motion` (`^12.23.24`)
- `pg` (`^8.21.0`)
- `vite` (`^6.2.3`)
- `tsx` (`^4.21.0`)
- `typescript` (`~5.8.2`)

---

## Compile and deploy steps

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
- **Experimental preserved-module static build**:
    - Uses Vite library mode with `preserveModules` and writes a fresh timestamped directory under `/compiled/`.
    - This strategy preserves individual ES module files and sets `minify: false` in `vite.library.config.ts`; it is the preferred current localhost SWAS static deployment style when avoiding a single large minified bundle.
    - `compiled/latest-library-build.txt` contains the latest generated directory path.
  ```bash
  npm run build:library
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

## Database schema

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

CREATE TABLE treatment_summaries (
  uuid UUID NOT NULL,
  version INT NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  form_status VARCHAR(20) NOT NULL,
  form_data JSONB NOT NULL,
  PRIMARY KEY (uuid, version)
);

CREATE TABLE "designAuth" (
  user_uuid UUID PRIMARY KEY,
  user_email VARCHAR(320) NOT NULL UNIQUE,
  salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified TIMESTAMP WITH TIME ZONE,
  datetime_registered TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  datetime_password_changed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  datetime_last_save_operation TIMESTAMP WITH TIME ZONE,
  prefs JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE "designData" (
  user_uuid UUID NOT NULL REFERENCES "designAuth"(user_uuid) ON DELETE CASCADE,
  designed_form_uuid UUID NOT NULL,
  random_hex VARCHAR(64) NOT NULL UNIQUE,
  datetime_saved TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  json_spec JSONB NOT NULL,
  PRIMARY KEY (user_uuid, designed_form_uuid, datetime_saved)
);

CREATE TABLE "emailVerificationsInProgress" (
  user_email VARCHAR(320) PRIMARY KEY,
  verification_code VARCHAR(6) NOT NULL,
  datetime_code_sent TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE "designSessions" (
  session_token UUID PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES "designAuth"(user_uuid) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  remember BOOLEAN NOT NULL DEFAULT false,
  datetime_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  datetime_last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);
```

---

## SQL Queries used by the app

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
