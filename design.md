# Medical Forms Design Specification (formBuilder2)

This document details the complete design specification, styling rules, behavioral policies, state engines, database schemas, and visual paradigms for the three core web-clinical documents: **Waiting List Card (WLC)**, **Operation Note (OpNote)**, and **Outpatient Outcome (OPO)**. It acts as a complete blueprint to regenerate the entire application without additional prompting.

---

## 1. Global Visual and Typography Standards

- **Primary Font:** Google Roboto (`font-family: "'Roboto', sans-serif"`, weight: 300, 400, 500) for general readable text blocks, labels, inputs, checkboxes, and radio lists.
- **Display Typography:** Google Space Grotesk/Outfit (`font-family: 'Space Grotesk', sans-serif`) for large titles and dashboard details.
- **Code & Tech Accents:** Google JetBrains Mono (`font-family: 'JetBrains Mono', sans-serif`) for status indicators and units.
- **Form Action Button Font:** Google Roboto (`font-family: "'Roboto', sans-serif"`, size: `1rem`, weight: `500` - bold UI metrics).
- **Default Theme:** High-contrast clinical light mode (pure off-whites, silver borders, and royal blue accents).
- **Core Theme Color:** Royal Blue (`rgb(27, 110, 194)` / `#1b6ec2`).
- **Required Indicator:** Deep Red (`#d50000`) asterisks (`*`). Required indicator asterisks inside question labels must always be grouped with the label's last word using `<span style={{ display: "inline-block", whiteSpace: "nowrap" }}>lastWord <span style={{ color: "#d50000" }}>*</span></span>`. This allows fluid word wrapping of label strings on cramped screens, while preventing the asterisk from splitting alone to a separate line mourned as a spelling or layout bug.

---

## 2. Common Style Overrides (CSS)

The form views are governed by a customized stylesheet injecting the following precise styling rules:

```css
/* Precise layout spacing between adjacent question blocks */
.edit-view-form .questions-row, 
.edit-view-form .grid {
  column-gap: 1.0rem !important;
  row-gap: 0.4rem !important;
  margin-bottom: 0.4rem !important;
  margin-top: 0 !important;
}

.edit-view-form .question-container {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* Control borders: 0.1rem solid silver, borderRadius 0.4rem, padding 0.2rem, white base */
.edit-view-form input:not([type="radio"]):not([type="checkbox"]),
.edit-view-form select,
.edit-view-form textarea,
.edit-view-form .msi-selector-input,
.edit-view-form .sct-procedure-selector-input,
.edit-view-form .date-control-input,
.edit-view-form input.border {
  border: 0.1rem solid silver !important;
  border-radius: 0.4rem !important;
  background-color: white !important;
  padding-top: 0.2rem !important;
  padding-bottom: 0.2rem !important;
  box-sizing: border-box !important;
}

/* Focus and hover rules: prevent standard outline ring and thick black borders */
.edit-view-form input:not([type="radio"]):not([type="checkbox"]):hover,
.edit-view-form input:not([type="radio"]):not([type="checkbox"]):focus,
.edit-view-form select:hover,
.edit-view-form select:focus,
.edit-view-form textarea:hover,
.edit-view-form textarea:focus {
  background-color: white !important;
  border: 0.1rem solid silver !important;
  box-shadow: none !important;
  outline: none !important;
}

/* Radio & Checkbox Focus Ring Prevention: disable solid black outline or focus ring */
input[type="radio"]:focus,
input[type="checkbox"]:focus,
input[type="radio"]:focus-visible,
input[type="checkbox"]:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}

/* Input Fields with Units (e.g., admitting timeframe or night stays) */
.edit-view-form .input-with-units {
  border: 0.1rem solid silver !important;
  border-radius: 0.4rem !important;
  height: 2.0rem !important;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
}

.edit-view-form .input-with-units input {
  border: none !important;
  border-width: 0px !important;
  outline: none !important;
  height: 100% !important;
  padding-top: 0.2rem !important;
  padding-bottom: 0.2rem !important;
}

/* Redundant vertical margins within checkbox/radio items eliminated */
.edit-view-form .radio-checkbox-item {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  box-sizing: border-box !important;
}

/* Dynamic height collapse for hidden dynamic fields */
.edit-view-form .subfield-wrapper {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  box-sizing: border-box !important;
}

/* Standardized hover/focus padding highlights */
.question-container, .radio-checkbox-item, .subfield {
  padding-top: 0.2rem !important;
  padding-bottom: 0.2rem !important;
  box-sizing: border-box !important;
  border-radius: 0.4rem;
}
```

### Hierarchical Hover/Focus Highlight System (Yellow Alternate Alternations)
Question containers, subquestions, radio items, and checkbox items use a hierarchical hover/focus yellow alternate highlighting system:
- A question is active when it is hovered, focused, has focus within it, or contains a hovered/focused question, radio item, checkbox item, or subquestion.
- Radio and checkbox items are active when hovered, focused, or focus-within.
- Subquestions use the same active behavior as top-level questions.
- **Nesting Alternations:** 
  - Top-level active question containers use lighter yellow `#ffffcc`.
  - Inside a lighter-yellow active box, the active contained question/radio/checkbox/subquestion uses yellow `#fee715`.
  - Inside a yellow active box, the next nested active question/radio/checkbox/subquestion alternates back to lighter yellow `#ffffcc`.
  - The alternating nesting feedback loop continues strictly according to CSS depth: **lighter yellow `#ffffcc`** $\rightarrow$ **yellow `#fee715`** $\rightarrow$ **lighter yellow `#ffffcc`**.
- Applying `0.2rem` internal padding and `0.4rem` border radius ensures beautiful nesting borders.
- Dynamic table procedure cells continue to highlight lighter yellow `#ffffcc` on hover or focus-within.

---

## 3. Dynamic Layout Mechanics (React Hooks)

All edit forms apply direct layout calculation hooks to achieve clean, aligned desktop screens:

### A. Auto-Expanding Textareas
All `<textarea>` components are instantiated with standard `rows={2}` rows, removing fixed height style properties. Inside active layouts, a `useLayoutEffect` DOM event hook adjusts text container boxes as character counts flex:

```tsx
React.useLayoutEffect(() => {
  if (isReadOnlyView) return;

  const textareas = document.querySelectorAll('.edit-view-form textarea');
  const listeners: Array<{ element: HTMLTextAreaElement; handler: () => void }> = [];

  textareas.forEach(ta => {
    const textarea = ta as HTMLTextAreaElement;
    
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      const defaultHeight = 44; // Approx 2 lines
      textarea.style.height = `${Math.max(defaultHeight, textarea.scrollHeight)}px`;
    };

    adjustHeight();
    textarea.addEventListener('input', adjustHeight);
    listeners.push({ element: textarea, handler: adjustHeight });
  });

  return () => {
    listeners.forEach(({ element, handler }) => {
      element.removeEventListener('input', handler);
    });
  };
}, [procedures, isReadOnlyView, formState]);
```

### B. Padding-based Label Height Equalization & Mobile Stacking Resolution
Aligns upper control borders across parallel desktop grid columns without corrupting block formats or wrapping label spans. Dynamic resize observers reset label parameters when viewport width shrinks below the mobile threshold (`768px`), preventing large empty vertical spaces:

```tsx
React.useLayoutEffect(() => {
  if (isReadOnlyView) return;

  const adjustLabelHeights = () => {
    const isMobile = window.innerWidth < 768;
    const rows = document.querySelectorAll('.questions-row, .grid');

    rows.forEach(row => {
      // Find all top-level question labels inside row grid (isolate dynamic subfields under radios & tables)
      const labels = Array.from(row.querySelectorAll('.question-container > label:not(.radio-checkbox-item)')) as HTMLElement[];
      const filteredLabels = labels.filter(lbl => !lbl.closest('.subfield, .subfield-wrapper, .procedures-table'));
      
      if (filteredLabels.length <= 1) return;

      // Do not apply equalization to question containers that contain radio/checkbox lists
      const hasListBlock = filteredLabels.some(lbl => lbl.parentElement?.querySelector('.radio-list, .check-list'));
      if (hasListBlock) return;

      if (isMobile) {
        // Mobile view: clear modifications
        filteredLabels.forEach(lbl => {
          lbl.style.height = 'auto';
          lbl.style.paddingTop = '0px';
          lbl.style.display = 'block';
        });
      } else {
        // Desktop view: calculate heights
        filteredLabels.forEach(lbl => {
          lbl.style.height = 'auto';
          lbl.style.paddingTop = '0px';
          lbl.style.display = 'block';
        });

        const heights = filteredLabels.map(lbl => lbl.getBoundingClientRect().height);
        const maxHeight = Math.max(...heights);

        if (maxHeight > 0) {
          filteredLabels.forEach(lbl => {
            const naturalHeight = lbl.getBoundingClientRect().height;
            lbl.style.height = `${maxHeight}px`;
            lbl.style.paddingTop = `${maxHeight - naturalHeight}px`;
            lbl.style.display = 'block';
          });
        }
      }
    });
  };

  adjustLabelHeights();
  window.addEventListener('resize', adjustLabelHeights);
  return () => window.removeEventListener('resize', adjustLabelHeights);
}, [procedures, isReadOnlyView, formState]);
```

---

## 4. App Scaffolding & Extracted Component List

To maintain absolute reproducibility, clinical forms are structured modularly, backed by independent, reusable components under `/src/components/`:

| Control Component | File Location | Purpose & Details |
| :--- | :--- | :--- |
| **DateControl** | `/src/components/DateControl.tsx` | Custom text-precision date input with interactive date-offset offsets calendar. |
| **SCTProcedureSelector** | `/src/components/SCTProcedureSelector.tsx` | SNOMED CT procedure database search; handles custom parser queries. |
| **SCTDiagnosis** | `/src/components/SCTDiagnosis.tsx` | SNOMED CT diagnosis database search; maps custom unquoted parser lists. |
| **MSISelector** | `/src/components/MSISelector.tsx` | DHW Clinician search. Performs lazy-fetch debounce typing lists. |
| **Addressograph** | `/src/components/Addressograph.tsx` | Patient health demographic grid labels (NHS, dob, address) of exact medical proportions. |
| **AddButton** | `/src/components/AddButton.tsx` | Outline blue dynamic additions action button. |
| **SaveCancelButtons** | `/src/components/SaveCancelButtons.tsx` | Action controls row triggers (Save & Cancel) of medical button specs. |
| **CodedSelectorShell** | `/src/components/CodedSelectorShell.tsx` | Bordered inline shell unifying status indicators and clear icons under inputs. |
| **AuthControls** | `/src/components/AuthControls.tsx` | Contains password input validation fields, implementing automatic blur blanking. |
| **fbHeader** | `/src/components/fbHeader.tsx` | Renders the top clinician headings and custom Addressograph wrappers. |
| **fbLayout** | `/src/components/fbLayout.tsx` | Standardizes the page layout grid: Header box, scrolling area, left Nav, footer track. |
| **DraftBadge** | `/src/components/DraftBadge.tsx` | Bold square red indicators signaling unfinalized forms. |
| **DraftPopup** | `/src/components/DraftPopup.tsx` | Intercepts save intents, prompting confirmation of draft indexing. |
| **PasswordPopup** | `/src/components/PasswordPopup.tsx` | Modal enforcing active password criteria when modifications arise. |
| **fbQuestion** | `/src/components/fbQuestion.tsx` | Question text wrapper with required colored asterisk markers. |
| **fbTextInput** | `/src/components/fbTextInput.tsx` | Reusable text input component styled with silver borders, yellow hover active highlighting, and font weight optimizations. |
| **fbTextArea** | `/src/components/fbTextArea.tsx` | Reusable auto-expanding textarea component styled with silver borders, yellow hover active highlighting, and font weight optimizations. |
| **fbDropdown** | `/src/components/fbDropdown.tsx` | Reusable dropdown component rendering customized select boxes with active highlighting support. |
| **fbNumberInput** | `/src/components/fbNumberInput.tsx` | Reusable numeric quantity input specifying unit labels cleanly on double silver borders. |
| **fbSection** | `/src/components/fbSection.tsx` | Section grouping card element that encapsulates individual clinical areas with high-contrast, blue header bars. |
| **fbQuestionRow** | `/src/components/fbQuestionRow.tsx` | Flexible layout row container establishing configurable multi-column grid layouts for responsive parallel question blocks. |
| **fbRadio** | `/src/components/fbRadio.tsx` | Custom individual radio list item offering seamless hierarchical hover highlight support and optional children (for nested display-conditional subquestions). |
| **fbCheck** | `/src/components/fbCheck.tsx` | Custom individual checkbox option offering seamless hierarchical hover highlight support and optional children (for nested display-conditional subquestions). |
| **fbGroup** | `/src/components/fbGroup.tsx` | Reusable multiple-choice list component managing group-level radio or checkbox configurations. |
| **fbBottomControlsRow** | `/src/components/fbBottomControlsRow.tsx` | Standardized modular control bar unifying read-only transition button, security options, digital signature credentials, and primary save/cancel submit actions. |

---

## 5. Architectural Components Detailed Specification

### A. Coded Selector Shell Styling
Reused by `MSISelector`, `SCTProcedureSelector`, and `SCTDiagnosis` to maintain absolute visual alignment:
- `.coded-control-row`: Flex row, center-aligned, `gap: 0.2rem`, `width: 100%`.
- `.coded-input-shell`: Flex child, `min-width: 0`, display flex, align stretch, `border: 0.1rem solid silver`, `borderRadius: 0.4rem`, white background, `overflow: hidden`.
- `.coded-input-shell:focus-within`: Yellow highlighted background `#ffffcc`.
- `.coded-input-shell input`: Flex 1, no borders, no border radius, transparent background, `height: 2rem`, `padding: 0.2rem`.
- `.coded-clear-button` & `.coded-toggle-button`: Placed inside the shell, transparent borders/backgrounds, black text, `flex-basis: 1.6rem`, `min-height: 2rem`, center content alignment.
- `.coded-clear-button`: Displays ASCII cross `&cross;`, `fontSize: 0.9rem`, `fontWeight: 500`.
- **Interactive Highlighting:** `.coded-clear-button:hover`, `.coded-clear-button:focus`, `.coded-toggle-button:hover`, and `.coded-toggle-button:focus` transition immediately to yellow background `#fee715` with black text and no outline.
- `.down-triangle`: CSS triangle with transparent left/right borders and black top border.
- `.coded-status`: Material Icons status identifier placed immediately to the right of the input shell wrapper, `fontSize: 1.4rem`, `lineHeight: 1`.
  - **Unconfirmed (typed text):** Displays orange colors (`#f59e0b`), icon text `"warning"`, and tooltip `"Not coded"`.
  - **Confirmed (selected concept):** Displays green colors (`#008000`), icon text `"check_circle"`, and tooltip `"Coded"`.
- Editing a confirmed clinician or term immediately resets its verified status and falls back to unconfirmed.
- **Viewport-Aware Positioning:** Popups automatically measure boundaries. If the dropdown position would extend beyond the right edge of the page window, it shifts left only far enough to align its right edge. If the window is narrower than the popup, it limits the width to the viewport bounds with its left edge pinned at `0`.

### B. DateControl Component Details
Custom input with responsive calendar popup:
- **Formats Accepted:**
  - Day precision: `dd-Mmm-yyyy`, `dd-Mmm-yy`, `dd/mm/yyyy`, `dd/mm/yy`, `dd.mm.yyyy`, `dd.mm.yy`
  - Month precision: `Mmm-yyyy`, `Mmm-yy`, `mm/yyyy`, `mm/yy`, `mm.yyyy`, `mm.yy`
  - Year precision: `yyyy`, `yy`
- **Dynamic Popup Features:**
  - Quick action rows centered: Yesterday, Today, Tomorrow (these select date and close popup).
  - Offset triggers: Next week, +Six weeks, +Three months, +1 year (these shift the active baseline date forward and keep the calendar open).
  - Monthly and yearly double steppers using `-` and `+` decrementors (decreased padding `0.1rem`).
  - Strict 6-row calendar grids including clickable boundary dates filling standard grids in silver.
  - Baseline selection buttons: `Select exact date`, `Select month`, `Select year`, and `Close`.
- **Typing Responsiveness:** Input retains focus as the user types. As parseable entries are entered, the calendar frame updates matching years and highlighting dates in real-time. Moving focus away or clicking Close reformats valid items to standard `dd-Mmm-yyyy`. Invalid inputs preserve typed strings but trigger red border warnings and an `Invalid date` label.
- **Design Specifications:** Fixed container `width: 100%; maxWidth: 11rem`. Today's date is framed by a `0.2rem` solid green border (`#008000`). Selected index highlights in green (`#008000`) with bold white text. Weekday headers are abbreviated to single letters: `M T W T F S S`. Calendar buttons utilize standard styling (`border: 0.1rem solid #1b6ec2`, `borderRadius: 0.4rem`, `#fee715` yellow hover). Outer popup padding is locked to `0.2rem`.

### C. Addressograph Component Details
Patient demographic panel. Mr. Donald Duck acts as the default patient demo record.
- **Form Proportions:** Width `90mm`, font Arial `11pt` (not Inter/Roboto for true label accuracy), padding `0.4rem`, white background, `border: 0.1rem solid silver`.
- **Structure:** Two-column grid (`gridTemplateColumns: 'auto auto'`, gap `0.2rem 1rem`).
  - Left Column (left-justified): NHS number (bold, spaced `123 456 7890`), Full Name (Surname bold `DUCK Mr Donald`), and 4 address lines.
  - Right Column (right-justified): CRN identifier (`CRN 012345678`), DOB formatted as `dd-Mmm-yyyy` with age in years (`12-Apr-1956 (70y)`), and Sex.
- Each field wrapper displays `className="addressograph-field"`, utilizing yellow background highlight (`#ffffcc`) on hover and generating an overlay text tooltip (`data-tooltip`) positioned near the field (`NHS number`, `Surname`, `Date of birth`, etc.) in light-blue, without distorting baseline layouts.

### D. SCTProcedureSelector & SCTDiagnosis Components
Establishes direct SNOMED CT terminology lookups.
- **Endpoints:** 
  - Procedure: `https://www.shadesofpale.net/SCTSearch?cmd=findProcedure&st={query}&count=30`
  - Diagnosis: `https://www.shadesofpale.net/SCTSearch?cmd=findDiagnosis&st={query}&count=30`
- **Core Typography in Popups/Dropdowns:** The autocomplete results popups, concepts, and synonyms utilise the **Google Roboto** font (`font-family: 'Roboto', sans-serif`) with strict sizing: matching list items use `fontSize: '0.9rem'` and `lineHeight: '1.2'`; parent header tabs and meta labels inside information panes use a compact `fontSize: '0.6rem'`; main focused concept titles use a display scale of `fontSize: '1.5rem'`, `fontWeight: 500`, and `lineHeight: '1.2'`. All suggestions, synonyms, and child concepts wrap natively without overflow issues.
- **Double-Pane Viewport:** Width locked to `45rem`.
  - Left Column: Ordered match list (exactly one-third of popup width). Matches are left-aligned and wrap, filling the full popup height with zero horizontal scrollbars.
  - Right Column: Precise clinical concept details (two-thirds width).
- **Parser specifications:** Search queries are processed using basic auth (`dhcw:dhcw`). Due to non-standard custom response bodies returned by Shades of Pale endpoints, the parser has been factored out into a dedicated, reusable shared utility file `/src/utils/shadesOfPaleParser.ts`. The parser implements specialized extraction mappings:
  - Must include `skipMetadata()` to safely strip custom headers and metadata punctuation markers (`!` and `~`).
  - Maps custom unquoted literals to standard JavaScript values: `!n` $\rightarrow$ `null`, `!f` $\rightarrow$ `false`, and `!t` $\rightarrow$ `true`.
  - Explicitly extracts matching lists from raw text fragments first to guarantee stability if downstream parsers encounter edge-case variables.
- Clicking matched lists redirects and issues a new search, updating details in place without closing the popup.
- Details render sections headings with light blue background `#8cd2e7` with black text, `fontSize: '0.6rem'`, full width, and padding `0.2rem 0.5rem`.
- Parents (`parents`), synonyms (`synonyms`), and children (`children`) render with the `.sct-popup-hoverable` styling class, providing a light-yellow (`#ffffcc`) background highlight when hovered, focused, or focused-within. Parent concepts and synonyms are separated by a " | " pipe delimiter. Hovering or focusing nested search results supports standard keyboard focus index shifts to launch nested searches instantly.
- **Search Input Styling Constraints:** The terminology autocomplete inputs render with a `0.1rem solid silver` border when unfocused, a standard `0.4rem` border-radius, and a solid white background matching other input elements.
- **Search Intent Focus Lock:** To prevent unprompted dropdown flashes and loading-draft overlay transitions, search query executions (`performSearch`) under the term dependency `useEffect` are gated to trigger only when the input has active focus (`document.activeElement === inputRef.current`).
- **Pagination Navigation:** Pagination buttons display `<` and `>` arrows. Active transitions render white text on royal blue (`#1b6ec2`) with zero borders, converting to black on yellow on hover/focus.
- **Search History Navigation (Back / Next):** Integrates precise history stack track buffers. Back and Next navigation triggers a specialized state-safety queue bypass (`skipHistoryRef`) to prevent redundant duplicate API calls and double click scrollbacks.
- **Popup Presentation Isolation:** Dropdowns remain hidden on initial component mount and state update cycles, opening only on explicit user click, down-arrow toggles, or input focus events.

### E. MSISelector Component
Performs Medical Staff Index clinician queries.
- **Endpoint:** `https://www.shadesofpale.net/MSISearch?st={query}` with auth credentials `dhcw:dhcw` on port 443.
- **UI Structure:** Dropdown popup (width `45rem`, outer padding `0.2rem`) sits directly under parent controls, bypassing redundant inner wrapper lists or title banners. Clinician details are extracted from the `ie.line` property of matching objects.
- **Label & Required Asterisk Indication:** Supports an optional boolean `hasLabel` prop (defaulting to `true`). If a label is rendered externally (e.g. standard field questions, Senior responsible clinician), `hasLabel` is omitted or `true`, avoiding double required asterisks. If the control is rendered as a nested sub-question without a label (e.g. named clinician clinician name list selection), `hasLabel` is explicitly set to `false`, appending the required red `*` asterisk right-aligned to the input with zero line breaks.
- **Typing Controls:** Executes real-time search queries under keyboard controls (Arrows, Enter, Escape). Applies a `200ms` blur closure delay to allow clicks to register selections cleanly. No fallback dummy datasets are utilized; if nothing matches, render *No results* in italics.
- **Deterministic Validation Paradigm with Parent-Led State Persistence (`coded` flag tracking):**
  Rather than standard client-only dirty flags or complex comparing effects that reset upon switching forms, the validated status is explicitly synchronized and stored in the form state parent container:
  - **Data Persistence Strategy:** Custom keys (`seniorClinician_coded`, `listedBy_coded` in `formState`, and `procedure_coded` on each row dictionary inside `procedures`) store whether the field values represent a selected/coded terminology match (boolean true/false). This guarantees identical status restoration across view transitions, unmount cycles, and Edit/Read-Only modes.
  - **No Indicator:** When the input value is empty.
  - **Confirmed (Coded) Status:** Displays a green tick icon (`check_circle_outline` from Material Icons, colored `#008000`) only when the `coded` prop (or state) is `true` (updated only when explicitly confirming selections from search dropdown matches via lists, buttons, or Enter keys).
  - **Unconfirmed (Uncoded) Status:** Displays an orange warning icon (`warning` from Material Icons, colored `#fd8a10`) if the input has typed text but `coded !== true`. Manually editing or typing immediately flags the field as unconfirmed and sets the persistence keys to false.
  - **Read-Only View (RoV) Mirroring:** The verified green ticks and orange warning triangles are displayed in the exact same manner in read-only tables and text fields to give instant validation feedback without editing.

### F. Username and Password Controls
Renders credential parameters in form footers.
- **Username Input:** Borderless input within a `0.1rem solid silver` wrapper (`borderRadius 0.4rem`, height `2.0rem`, Roboto font, yellow `#ffffcc` highlight focus). Initialized with `"demoUser"`. Always visible.
- **Password Input:** Appears only when `formChanged === true`. Utilizes `type="password"`, height `2.0rem`. Enforces a strict `2000ms` auto-clear timer on blur, completely purging values to safeguard active clinical workstations.

### G. Draft Badge and Popup Modules
- **DraftBadge:** Bold white text `"Draft"` on solid red background (`#d50000`). Custom padding `0.2rem` top/bottom, `0.4rem` left/right. High-contrast square corners (zero border radius).
  - **Read-Only View Alignment:** Styled above page headers in RoV (separated only by a `<br />` under search blocks). Both title and badge form a single typography paragraph vertically centered with the Addressograph panel on the right.
- **DraftPopup:** Model screen block (`zIndex: 2000`) shown if saving un-finalized documents. Displays a white frame with a blue border (`0.2rem solid rgb(27, 110, 194)`), asking to close as a draft. Features custom buttons built with `fbButton` component: a success (green) button for `"Save as draft"` and a danger (red) button for `"Return to form"`. Supports both standard prop signatures (`onSaveAsDraft` / `onReturnToForm`) and event hooks (`onSaveDraft` / `onCancel`) for universal form compatibility.
- **PasswordPopup:** Enforces credentials if passwords are missing when attempting to save. Renders an interactive password entry field (`type="password"`) with helper text (e.g., `'You must re-enter your password to complete this action.'` / `'You must re-enter your password to save.'`), sentence-cased labels (e.g. `"Password"`), and inline error indicators. To maintain a fluid user experience:
  - **Custom Controls Mirroring:** The input's style matches standard questionnaire inputs with a `height: '2.0rem'`, `lineHeight: '2rem'`, `padding: '0 0.5rem'`, Roboto-font, and a transition supporting the yellow active hover and focus background highlighting (`#ffffcc`).
  - **Standardized Button Actions:** Features custom button actions built with the `fbButton` component: a success (green) button for `"Save"` (replacing `"Confirm"`) and a danger (red) button for `"Return to form"`. Falls back safely to simple close handlers if confirmation functions are omitted.

---

## 6. Architectural State Snapshotting and Transition Engine

Both EV and RoV views enforce deep snapshotted change validation. Rather than relying on simple state dirty flags that can trigger false positives, forms store a pristine representation in `initialSnapshot` on mount (or upon successful submission). A reactive state hook executes deep equality checks to evaluate the current state against this snapshot:

```tsx
const isStateEqual = (snap: any, current: any) => {
  if (!snap || !current) return false;

  // Compile a unique list of keys present in both targets
  const allKeys = Array.from(new Set([...Object.keys(snap.formState || {}), ...Object.keys(current.formState || {})]));
  
  // 1) Evaluate the core dictionary values (normalizing nil/undefined items to basic strings)
  for (const key of allKeys) {
    const v1 = snap.formState?.[key] === null || snap.formState?.[key] === undefined ? "" : snap.formState[key];
    const v2 = current.formState?.[key] === null || current.formState?.[key] === undefined ? "" : current.formState[key];
    if (String(v1) !== String(v2)) {
      return false;
    }
  }

  // 2) Validate dynamic database table configurations (e.g. procedures array)
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

  // 3) Validate Boolean toggles (e.g. anticoagChecked, highlySensitive, finalChecked)
  if (JSON.stringify(snap.anticoagChecked) !== JSON.stringify(current.anticoagChecked)) return false;
  if (Boolean(snap.highlySensitive) !== Boolean(current.highlySensitive)) return false;
  if (Boolean(snap.finalChecked) !== Boolean(current.finalChecked)) return false;

  return true;
};
```

### Transition to RoV
- When transition is invoked via the bottom "RoV" action button, the state comparison logic is applied. If changes are detected (`formChanged === true`), the user is prompted with authentication or draft confirmations.
- All unsaved state changes (including dynamically updated inputs like `anticoagChecked`) are fully merged and passed into the `formState` prop sent to the RoV component:
  ```tsx
  formState={{ ...formState, anticoagChecked }}
  ```
  This ensures that user changes are accurately shown in RoV without needing to save to the database first.

---

## 7. Medical Button Styling Rules

Every core action control (Save, Cancel, Edit, Back, etc.) follows rigid constraints:
- **No Outer Borders:** Borders are suppressed (`border: none`) on all primary buttons, including bottom RoV/EV triggers.
- **Action Proportions:** Standard heights `2.0rem`, rounded borders `0.4rem`. Roboto (`font-family: "'Roboto', sans-serif"`, size `1rem`, weight `500` UI metrics).
- **Core Action Colors:**
  - **Cancel / Danger:** White text on solid red (`backgroundColor: '#d50000'`, `color: 'white'`). Used across cancel and close triggers.
  - **Save / Confirm:** White text on green (`backgroundColor: '#008000'`, `color: 'white'`).
  - **Neutral / Interactive (RoV/EV):** White text on royal blue (`#1b6ec2`).
- **Interactive Highlighting:** All footer action items (excluding disabled states) transition smoothly to solid black text on yellow (`#fee715`) upon hovered or focused triggers.
- **Dynamic AddButton:** Labeled `"Add procedure"` or `"Add specimen"`. Blue-on-white outlines (`color: '#1b6ec2'`, background white, border `0.2rem solid #1b6ec2`). Excludes any plus symbol prefixes. Transitions instantly to full black-on-yellow under hover states.

---

## 8. Common Form Elements & Spacing Grid Preservation

### A. Spacing Grid Preservation in Read-Only View (RoV)
When compiling RoV layouts, empty parameters are omitted. However, layout positions must remain intact to prevent layout collapse. Spacing grids are preserved using **outer conditional block divisions** wrapping internal renders:

```tsx
// WRONG - element collapses causing adjacent columns to shift left
{formState.field && (
  <div className="space-y-2 question-container">
    <label>Field</label>
    <div>{formState.field}</div>
  </div>
)}

// CORRECT - outer block is preserved, maintaining columns while suppressing labels if empty
<div>
  {formState.field && (
    <div className="space-y-2 question-container">
      <label style={{ fontWeight: 300, fontSize: '0.8rem' }}>Field</label>
      <div style={{ fontWeight: 500 }}>{formState.field}</div>
    </div>
  )}
</div>
```

- For multi-column spans, the column definitions are applied to the outer grid block (`className="md:col-span-2"`), maintaining layout proportions.
- **Radio / Checkbox rendering in RoV:** Checked statuses simply render selected labels as plain text strings (`fontWeight: 500`) with no checkbox frames, checkmarks, or bullets. Unselected items are fully omitted. 
- **Lookup Tables mapping:** Select dropdown values (e.g. `cwm-taf`) are mapped in RoV through dedicated lookup configurations to print complete readable text names (e.g. `Cwm Taf Morgannwg`).

### B. Fields with Units
Quantitative indicators (such as hospitalization days or medication doses) must separate labels and units:
- Unit descriptors (e.g. `days`, `mg`, `nights`) are strictly forbidden inside label strings themselves.
- Instead, they are passed as distinct parameters to render helpers:

```tsx
// WRONG - unit embedded in label text
{renderField('Admit before surgery (days)', formState.admitBefore)}

// CORRECT - unit passed separately
{renderField('Admit before surgery', formState.admitBefore, undefined, 'days')}
```

Outputs:
```
Admit before surgery
5 days
```
with both quantity and unit printed in bold (`fontWeight: 500`).
- **In Edit View:** Combined numerical inputs use `.input-with-units` wrappers. Border is assigned to the container block. Sibling `<input>` components suppress all borders (`border: none`, `border-width: 0px`) to prevent visual double-border clashes. A simple vertical divider (`border-left: 0.1rem solid silver`) is aligned between input and unit labels.

### C. Sidebar Navigation Panels (RoV vs. EV)
- **Edit View Navigation:** Features completed checkbox tick states and active ◄► locator icons. Contains flexible badge counter heights inside the block list. Outer right gray boundaries are completely suppressed.
- **Read-Only View Navigation:** Standardized links pointing to scrolling group layouts. All locators, checkbox indicators, and counter badges are omitted in RoV.
- In Outpatient Outcomes, sidebar navs are fully suppressed across both EV and RoV, as it uses Groups instead of standard Anchor Sections.
- **Section Level Validation and Counter Boxes:** Every active section in EV compiles its completeness status via `getSectionStatus(sectionId)`. The counter box displays the number of incomplete required fields, showing a green checkmark check-circle symbol `✓` when complete (`0`).
- **Dynamic Display-Conditional Sub-questions:** When display-conditional sub-questions are active (e.g., `namedClinicianName` nested under `"named_clinician"`; `riskOtherDetail` under risks `"other"`; DOAC drug name `doac-name` under DOAC; or other anticoagulant fields `anticoag-other-med` and `anticoag-other-indication`), they dynamically count toward their section's incomplete required fields. If those sub-fields are hidden, they do not block completion check or increment counters.
- **Unified Form-Wide Validity:** Completeness checks evaluate if all section statuses are fully valid, enabling or disabling final submission options (e.g. `disabled={!areRequiredFieldsComplete()}`).

### D. Reusable Question and Input Components
To ensure consistency across clinical forms, basic question-type fields are factored into modern, independent React components implementing standardized properties:
1. **fbQuestion (`/src/components/fbQuestion.tsx`):**
   - Standardizes the structural wrapper of questions.
   - Automatically handles required asterisk formatting, ensuring asterisks are styled deep red (`#d50000`) and grouped with label strings securely to prevent orphan wrapping on small displays.
2. **fbTextInput (`/src/components/fbTextInput.tsx`):**
   - Renders alphanumeric text single-line fields.
   - Props include: `id`, `name`, `label`, `required`, `value`, `onChange`, `placeholder`, and `subfield` (enables light-weight font rendering tailored for nested sub-questions).
   - If `label` is omitted (offering cleaner nested sub-field structures), and the field is marked as `required`, it places a visual `*` directly to the right of the input, perfectly top-aligned, and guarantees zero line breaks across screen resizes.
3. **fbDropdown (`/src/components/fbDropdown.tsx`):**
   - Renders a styled drop-down native selection control.
   - Props include: `id`, `name`, `label`, `required`, `value`, `onChange`, `placeholder`, `options` (`{ value, label }[]`), and optional `selectStyle` overrides.
4. **fbNumberInput (`/src/components/fbNumberInput.tsx`):**
   - Standardizes combined quantity-with-units numerical fields.
   - Props include: `id`, `name`, `label`, `required`, `value`, `onChange`, `units` (e.g. `days`), `min` bounds, and `max` bounds.
   - Implements borderless internal state inputs nestled seamlessly in double-border unit containers.
   - **Control Typography**: Labels and values use `'Roboto', sans-serif`, `fontSize: '1rem'`, with bold labels (`fontWeight: 500`) and normal numbers (`fontWeight: 400`). Spacing, padding, and vertical margins are kept identical to other questionnaire containers using `.question-container`.
5. **fbTextArea (`/src/components/fbTextArea.tsx`):**
   - Standardizes multi-line auto-expanding textarea fields.
   - Wraps the auto-expanding textarea element seamlessly with dynamic label controls and focus styles.
   - If `label` is omitted (offering cleaner nested sub-field structures), and the field is marked as `required`, it places a visual `*` directly to the right of the input, perfectly top-aligned, and guarantees zero line breaks across screen resizes.
6. **fbSection (`/src/components/fbSection.tsx`):**
   - Implements section layouts consistently. Encapsulates form sections within labeled modules featuring the standard royal blue (`rgb(27, 110, 194)`) header.
7. **fbQuestionRow (`/src/components/fbQuestionRow.tsx`):**
   - Flexibly drives responsive multi-column layout arrangements. Translates specified responsive grid numbers (e.g. `cols={3}`, `cols={4}`) into robust Tailwind grids.
8. **fbRadio (`/src/components/fbRadio.tsx`):**
   - Direct option selection element for single-choice lists. Safely exposes key inputs and labels with lightweight styling. Support declarative rendering of conditional `children` fields (subquestions) under active items.
9. **fbCheck (`/src/components/fbCheck.tsx`):**
   - Multi-option checkboxes with the same custom behavior and nested declarative `children` support as `fbRadio`.
10. **fbGroup (`/src/components/fbGroup.tsx`):**
    - High-level container orchestrating and aligning nested lists of radio and checkbox items perfectly under descriptive labels.

These components are fully integrated with the hierarchical yellow active hover highlights (`#ffffcc` and `#fee715`) for visual precision.

### E. Global Shared Helper and Parser Utilities
To optimize modular scalability and reduce redundant code bases:
1. **Shades Of Pale Server Response Parser (`/src/utils/shadesOfPaleParser.ts`):** Makes available `parseServerResponse(text)` to standardize complex response extractions. It strips custom header/footer punctuation (e.g., `!` and `~`), maps Boolean representations, and securely isolates matching clinical lists, satisfying SCTDiagnosis, SCTProcedureSelector, and MSISelector integration points from a single clean code location.
2. **Form State Normalization & Comparison Utility (`/src/utils/formStateUtils.ts`):** 
   - `compareFormStatesObj(obj1, obj2)`: Normalizes and compares nested form state values, bypassing auto-generated record IDs/UUID keys, mapping null/undef values to standard empty strings, and sorting dynamic input lists for order-agnostic equality.
   - `cleanArrayOfObjects(array, keys)`: Selectively maps and scrubs key subfields on dynamic lists (e.g. procedure lists, medical records, or checkbox values), mapping empty entries uniformly to avoid false dirty-state triggers.

### F. Form Interception Rules
- **Enter Key Form Submission Overrides:**
  To safeguard clinical workflows where Enter keys are used inside selectors, drop-downs, or text fields, the forms incorporate a global `onKeyDown` hook intercepts on the main `<form>` elements. Pressing `<Enter>` while focusing any element in the form is explicitly prevented from triggering standard form submission or save requests, unless the targeted focus is explicitly an interactive button of `type="submit"` (representing the save button). This ensures that popups (like the SCTProcedure autocomplete dropdown or MSISelector dropdown queries) handle their selections with `Enter` correctly without triggering unwanted saves.

### G. Textarea and Notes Line Break Preservation in Read-Only View (RoV)
To ensure that typed user descriptions, medical notes, anticoagulant instructions, and problem details printed into multi-line textareas preserve user-entered line breaks and carriage returns, the rendering divs are styled with:
- `whiteSpace: 'pre-line'`
This styling parses raw newlines (`\n`) and returns (`\r`) as actual display wrap blocks while safely collapsing excessive spacing and wrapping nicely across different container dimension ranges. This layout standard is used inside the global `renderField` helper as well as inline-rendered custom textarea details.

---

## 9. Form Specifications

### I. Waiting List Card (`src/WaitingListCard.tsx` / `src/WaitingListCardRoV.tsx`)

#### Layout & Navigation
- **Sidebar Nav:** Left vertical panel (`w-64`, 16rem width). Fully styled in royal blue with zero right margins or gray border bars.
- **Section Headers:** Standard `<h3>` cards styled identically to sidebar menus (`fontSize: "1rem"`, `fontWeight: 500`, `lineHeight: "1.1rem"`, padding: `"0.2rem 0.2rem 0.2rem 0.4rem"`).

#### Form Sections Schema
- **Section 1: From**
  - **Organisation** (select, required, default: `cwm-taf`)
  - **Speciality** (select, required)
  - **Hospital** (select, required, default: `princess-wales`)
  - **Senior responsible clinician** (MSISelector, required, key: `seniorClinician`)
- **Section 2: Listing and priority** (Single desktop row, 4-column grid `grid-cols-1 md:grid-cols-4`)
  - **Row 1:**
    - **Date listed** (DateControl, required, key: `dateListed`, default: today).
    - **Listed by** (MSISelector, spans 2 columns, key: `listedBy`).
    - *Empty Column* (preserves grid constraints).
  - **Row 2:**
    - **Urgency** (radio, required: Routine, Urgent, USC - Urgent Suspected Cancer).
    - **Operating surgeon** (radio: Any grade with supervision, Discuss with consultant, Consultant only, Named clinician, Unknown). If "Named clinician" is selected, displays indented text input (**Clinician name**, required, key: `namedClinicianName` styled using the `MSISelector` medical staff index component with label omitted, displaying the required `*` indicator to its right, top-aligned with the control with zero line breaks) nested immediately beneath the "Named clinician" radio option as a subquestion.
    - **Patient available at short notice** (radio, default: Unknown or not recorded, key: `shortNotice`).
    - **Royal College of Surgeons priority** (radio, default: Unknown or not recorded, key: `rcsPriority`).
  *Conflict Resolved:* The historic `targetDate` field is deprecated and not included anywhere in the Waiting List Card schema, maintaining clinical compatibility.
- **Section 3: Planned procedure(s)**
  - **In Edit View:** Editable Table showing **Side** (select), **Procedure** (SCTProcedureSelector), and **Additional information** (text input).
    - Drag handle column is the left-most column, utilizing material icon `swap_vertical_circle` (royal blue, hover tooltip: "Drag up or down to order list").
    - Table row delete column is placed on the far right, utilizing a styled `highlight_off` button with hover tooltip "Delete row".
    - Hovering/focusing tabular options highlights the target `<td>` container with the active yellow background (`#ffffcc`).
    - Add Procedure button styled using `AddButton` parameters. Omitted in RoV.
  - **In Read-Only View:** Displayed as a clean, space-optimized read-only HTML table with headers **Side** and **Procedure**, removing repetitive repeating field-name rows. Additional information text is rendered cleanly inline under the procedure name.
- **Section 4: Specific operative risks** (Single row, 3-column layout `grid-cols-1 md:grid-cols-3`)
  - **Column 1: Risks** (checkbox group: Diabetic, Latex allergy, MRSA, Pacemaker, Blood transfusion refusal, Previous anaesthetic reactions (details textarea, key: `riskReactionsDetail`), Other (details textarea, key: `riskOtherDetail`, with label omitted, displaying the required `*` indicator to its right, top-aligned with the control with zero line breaks)).
  - **Column 2: Anticoagulants & antiplatelet agents** (checkbox group with dynamic subfields DOAC [Drug name, Indication [AF, Other...]], Warfarin [Indication], Aspirin [Indication, Dose], Clopidogrel, Other anticoagulant [Medication, Indication]).
  - **Column 3: Surgeon's specific anticoagulant instructions** (textarea, key: `anticoagInstructions`).
- **Section 5: Pre-operative** (Single desktop row, 4-column layout `grid-cols-1 md:grid-cols-4`)
  - **Intended management** (radio, required: Outpatient, Daycase, Inpatient, Unknown, default: Unknown, key: `intendedManagement`).
  - **Admit before surgery** (number input, key: `admitBefore`, unit: "days", default: 0). Input is inside an unitbox with double-border overrides.
  - **Estimated date of admission** (DateControl, key: `estimatedAdmission`).
  - **Pre-operative imaging required** (radio: Yes, No, Unknown, default: Unknown, key: `imagingRequired`). If "Yes", displays details textarea (**Details**).
- **Section 6: Anaesthesia** (Single row, 3-column layout `grid-cols-1 md:grid-cols-3`)
  - **Planned anaesthetic type** (radio: General, Regional, Local, None, Unknown, default: Unknown, key: `anaestheticType`).
  - **Anaesthesia requirements** (textarea, spans 2 columns, key: `anaesthesiaRequirements`).
- **Section 7: Post-op** (Single row, 3-column layout `grid-cols-1 md:grid-cols-3`)
  - **Planned length of post-op stay** (number input, key: `postopStay`, units: "days"). Nested input border overrides.
  - **Bed requirement** (radio: ITU, HDU, PACU, Ward bed, Unknown, default: Unknown, key: `bedRequirement`).
  - **Post-operative requirements** (textarea, key: `postopRequirements`).
- **Section 8: Other** (Single row, 3-column layout `grid-cols-1 md:grid-cols-3`)
  - **Could this case be outsourced?** (radio: Yes, No, Unknown, default: Unknown, key: `outsourcing`).
  - **Any other information** (textarea, spans 2 columns, key: `otherInfo`).

#### Bottom Controls
- Uses the **fbBottomControlsRow** component to standardise the footer action bar.
- Features a **white background** (`backgroundColor: "white"`) and is separated from the form contents above by a **0.2rem solid royal blue line** (`borderTop: "0.2rem solid rgb(27, 110, 194)"`).
- Displays **RoV** toggle anchors on the bottom-left in EV.
- Flex spacing aligns security parameters and actions on the right: **Highly sensitive**, **Final checkbox** (conditional white background when complete, silver when incomplete), **Username, Password** (Credential fields featuring a 2-second blur-timer auto-clear safety purge), **Save and close** (enabled only when modified, white-on-green), and **Cancel** (white-on-red).
- **Disabled Uniformity**: When disabled, both the **fbFinalControl** and the **Save and close** button use identical solid **silver** (`#c0c0c0`) backgrounds, white text, and `opacity: 1` to guarantee cohesive visual aesthetics.

---

### II. Operation Note (`src/OperationNote.tsx` / `src/OperationNoteRoV.tsx`)

#### Layout & Navigation
- **Sidebar Nav:** Left vertical panel (`w-64`, 16rem width). Displays tick marks and locator indicators in EV, and clean lists in RoV.
- **Section Headers:** Styled identically to sidebar links (`fontSize: "1rem"`, `fontWeight: 500`).

#### Form Sections Schema
- **Section 1: Basic information** (4-column layout `grid-cols-1 md:grid-cols-4`)
  - **Organisation** (select, required, default: `cwm-taf`)
  - **Speciality** (select, required)
  - **Hospital** (select, required, default: `princess-wales`)
  - **Date of operation** (DateControl, required, default: today, key: `opDate`)
- **Section 2: Surgeons and anaesthetists** (2-column layout `grid-cols-1 md:grid-cols-2`)
  - **Lead surgeon** (MSISelector, required, key: `leadSurgeon`) with **Grade** (select, default: consultant).
  - **Anaesthetist** (MSISelector, required, key: `anaesthetist`) with **Grade** (select, default: consultant).
- **Section 3: Prophylaxis and other medication** (3-column layout `grid-cols-1 md:grid-cols-3`)
  - **Thromboprophylaxis instructions** (radio, default: none)
  - **Antibiotic prophylaxis instructions** (radio, default: none)
  - **Other preop or intraop meds** (textarea, key: `otherMeds`)
- **Section 4: Procedure(s)**
  - Dynamic table showing **Side** (select), **Procedure** (SCTProcedureSelector), and **Additional information** (text input). Uses identical drag-and-drop icon markup and highlight styles of WLC table.
- **Section 5: Detail** (Single column vertical alignment)
  - **Operative findings** (textarea, key: `findings`)
  - **Details of procedure** (textarea, key: `procDetails`)
  - **Post-operative instructions** (textarea, key: `postopInstructions`)
- **Section 6: Tissue removed and pathological specimens**
  - Editable specimens table with column headings in Roboto `0.8rem` italic 300, styled drag handles, and "Delete row" tooltips.
- **Section 7: Images**
  - Dynamic thumbnail cells showing captured clinical graphs or photos. Includes an **fbAddButton** styled as "Upload image" (currently acts as an interactive button skeleton).
- **Section 8: Implants - Scan for safety**
  - Coded implant parameters tracking, barcode details scanner field, and batch configurations.

---

### III. Outpatient Outcome (`src/OutpatientOutcome.tsx` / `src/OutpatientOutcomeRoV.tsx`)

#### Layout & Navigation
- **Unified fbLayout Integration:** Outpatient Outcome integrates and re-uses the global `fbLayout` component for both layout structure, keyboard intercept overrides (Enter key prevention on non-textarea fields), and action controls, aligning it with Operation Note and Waiting List Card.
- **Architecture Structure:** Outpatient Outcome is structured around **Groups** instead of Sections. It suppresses sidebar navigation in EV (as groups are shorter and don't standardly require nav panels), but integrates standard full-width scrollable workspaces seamlessly.
- **RoV Sidebar:** Includes the classic sidebar navigation (`w-64` / 16rem scrolling panel) pointing to group layout anchors.
- **RoV Spacing:** Containers feature a 50% vertical spacing reduction in RoV (down from `0.4rem` to `0.2rem`), achieving excellent aesthetic layout density.

#### Form Groups Schema
- **Group 1: Appointment** (4-column layout `grid-cols-1 md:grid-cols-4`)
  - Organisation, Speciality, Site, and Senior clinician displayed in bold (fontWeight: 500) read-only containers.
  - Clinic name, Date, and Time displayed below.
- **Group 2: Consultation Outcome** (Single column vertical alignment)
  - **Attendance** (radio group, required: Attended, Did not attend, Could not attend - patient, Could not attend - hospital).
  - **Did not attend dynamic subquestions:** Displays checkboxes and action branches (**Was not brought**, **Send another appointment**, **No further appointment** [Gives options to Send GP letter, or Letter done]).
  - **Could not attend dynamic subquestions:** Displays rescheduled actions (**Send another appointment**, **No further appointment**).
- **Group 3: Status / Referrals** (Single column vertical checkbox options)
  - **Discharged** (checkbox)
  - **SOS: See on symptom** (checkbox, dynamic subquestions: timeframe, reason)
  - **PIFU: Patient initiated follow-up** (checkbox, dynamic subquestions: timeframe, reason)
  - **Remote monitoring** (checkbox, dynamic subquestion: details)
  - **Tests required** (checkbox, dynamic subquestion: details)
  - **Wait listed** (checkbox, dynamic subquestion: Speciality, Urgency, Surgeon)
  - **Operation planned** (checkbox, dynamic subquestion: details)
  - **Admitted** (checkbox, dynamic subquestion: details)
  - **MDT Review** (checkbox, dynamic subquestion: details)
  - **Prescription given** (checkbox, dynamic subquestion: details)
  - **Referral to therapies** (checkbox, dynamic subquestion: details)
  - **Referral to consultant** (checkbox, dynamic subquestion: details)
  - **Follow-up Outpatient Appointment** (checkbox, dynamic subquestions: urgency, timeframe)

---

## 10. Global Routing & Navigation Matrix

The bottom action footer bar includes standard actions:
- **Routing Context Resolution (Home vs Patient Record):**
  1. **Accessed from App Home Page:** If the form was reached from the app home page (i.e. state parameters such as `openInRoV` are undefined), clicking **Cancel** (Edit View) or **Back** (Read-Only View) **MUST** immediately navigate the user back to the App Home page (`'/'`). This is robustly determined by checking that `location.state.openInRoV` is undefined (i.e., `typeof state.openInRoV === 'undefined'`), ensuring mock patients loaded during workspace listing from the dashboard correctly return to the homepage when cancelled.
  2. **Accessed from Patient Record:** If navigated directly from a patient record page, clicking Cancel or Back **STRICTLY** returns the user cleanly back to the Patient Record screen, passing the active `patientUuid` as state parameter context to maintain record synchronization.
- **RoV Toggling Button Filter:** If the read-only view was entered by clicking the bottom "RoV" toggle button within an open draft form, ONLY the "EV" button is displayed to return to edit mode, and both "Edit" and "Back" buttons are hidden. If the read-only view was loaded directly as a verified form from the patient's record, it displays the standard "Edit" and "Back" navigation buttons and hides the "EV" toggle.

---

## 11. Database Schema and Supabase Integration

The application integrates with Supabase (using an immutable versioned record structure to track changes over time) using five main tables. Every edit save operation is written as an event-log insert with an incremented version number, preserving previous states (event-sourcing philosophy).

### A. Database Table Schemas

#### 1. Table: `patients`
Stores primary demographic and health identifier details.
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
```

#### 2. Table: `forms_index`
Acts as a global audit journal and fast lookup catalog of clinical events.
```sql
CREATE TABLE forms_index (
  id BIGSERIAL PRIMARY KEY,
  form_uuid UUID NOT NULL,
  form_version INT NOT NULL,
  form_type VARCHAR(50) NOT NULL, -- 'waiting_list_card' | 'operation_note' | 'outpatient_outcome'
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  document_datetime TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  form_status VARCHAR(20) NOT NULL, -- 'draft' | 'final'
  speciality VARCHAR(100),
  organisation VARCHAR(100),
  hospital VARCHAR(100),
  senior_clinician VARCHAR(150),
  details TEXT
);
```

#### 3. View: `forms_index_current`
A dynamic database view or query abstraction filtering the latest version of each document:
```sql
CREATE VIEW forms_index_current AS
SELECT DISTINCT ON (form_uuid) *
FROM forms_index
ORDER BY form_uuid, form_version DESC;
```

#### 4. Clinical Document Tables
The three medical documents (`waiting_list_cards`, `operation_notes`, and `outpatient_outcomes`) implement the same normalized schema structure, isolating the rich clinical payload in a jsonb field:
```sql
CREATE TABLE waiting_list_cards (
  uuid UUID NOT NULL,
  version INT NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  form_status VARCHAR(20) NOT NULL, -- 'draft' | 'final'
  form_data JSONB NOT NULL,
  PRIMARY KEY (uuid, version)
);

CREATE TABLE operation_notes (
  uuid UUID NOT NULL,
  version INT NOT NULL,
  patient_uuid UUID REFERENCES patients(uuid) ON DELETE CASCADE,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  form_status VARCHAR(20) NOT NULL,
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
  PRIMARY KEY (uuid, version)
);
```

---

### B. Core Database Queries and Operations

The application leverages standard query patterns utilizing the `@supabase/supabase-js` client SDK:

#### 1. Retrieving Patient Demographics
Fetches a single patient identifier block to populate the clinical Addressograph:
```typescript
const { data, error } = await supabase
  .from("patients")
  .select("*")
  .eq("uuid", patientUuid)
  .single();
```

#### 2. Loading the Latest Version of a Clinical Document
Queries the clinical tables for the highest matching version number associated with a document's UUID:
```typescript
const { data, error } = await supabase
  .from("waiting_list_cards" | "operation_notes" | "outpatient_outcomes")
  .select("*")
  .eq("uuid", formUuid)
  .order("version", { ascending: false })
  .limit(1)
  .single();
```

#### 3. Saving clinical Drafts or Final forms (Event-Sourcing Append)
Saves forms by appending a brand-new row in both the corresponding document table and the global `forms_index`, incrementing the version:
```typescript
// Insert clinical document payload
const { error: insertError } = await supabase
  .from("waiting_list_cards" | "operation_notes" | "outpatient_outcomes")
  .insert({
    uuid: formUuid,
    version: nextVersion,
    patient_uuid: patientUuid,
    event_datetime: eventDate,
    form_status: status, // 'draft' | 'final'
    form_data: clinicalPayloadData
  });

// Insert indexing metadata
const { error: indexError } = await supabase
  .from("forms_index")
  .insert({
    form_uuid: formUuid,
    form_version: nextVersion,
    form_type: "waiting_list_card" | "operation_note" | "outpatient_outcome",
    patient_uuid: patientUuid,
    event_datetime: eventDate,
    document_datetime: new Date().toISOString(),
    form_status: status,
    speciality: clinicalPayloadData.speciality,
    organisation: clinicalPayloadData.organisation,
    hospital: clinicalPayloadData.hospital,
    senior_clinician: clinicalPayloadData.seniorClinician,
    details: descriptiveDetailsString
  });
```

---

## 9. Linguistic and Localization Standards

To ensure consistent UI vocabulary across all clinical application modules:
- **Sentence Case:** All form labels, placeholder prompts, headings, buttons, and system messages must use sentence case (e.g., `"Confirm password"`, `"Password"`, `"Save"`, `"Return to form"`, `"Type to search staff index"`). Do not capitalize every word or use title case unless referring to proper nouns, standard acronyms (e.g., SNOMED CT, DOAC, MRSA), or standard short abbreviations.
- **UK English Spellings:** Use British terminology and spelling conventions exclusively (e.g., use `"authorisation"`, `"speciality"`, `"programme"`, `"anaesthesia"`, `"colour"`, `"minimise"`, `"characterise"`). Never use US variants such as "authorization" or "specialty" unless specifically specified inside physical URL pathnames or API endpoints requiring distinct formatting.

---

## 10. Refactored Modular Forms Architecture

To guarantee maximum styling consistency, minimize code duplication, and ensure seamless state checking, all clinical forms utilize a standardized setup:
- **Centralized Snapshot Comparison:** The dirty-state and form changed checking is delegated to `/src/utils/formStateUtils.ts` via helper functions `compareFormStatesObj` and `cleanArrayOfObjects`. This ensures array sorting order-independence and handles null/undefined values uniformly.
- **Unified Custom Control Components:** Standard forms transition away from native inputs towards custom design-compliant elements:
  - `fbDropdown` is used for all dropdown selections (such as organisations, specialities, or hospital names).
  - `fbTextInput` replaces single-line text boxes, supporting standard padding, focus styles, and `subfield` indent layouts (such as `testsOnArrival` inside `OutpatientOutcome.tsx`).
  - `fbTextArea` replaces all multi-line text boxes (such as `testsRequested`, `treatmentPlanned`, `oprxTreatmentPlanned`, `treatmentGiven`, `therapyDetails`, and `notes`).
  - `fbNumberInput` provides neat unit indicators in double-silver border shells.
- **Parent-Led State Persistence:** Staff selections rendered via `MSISelector` components explicitly bind the server-coded search result status directly under the parent's form state using the suffix `_coded` (e.g. `leadSurgeon_coded`). This ensures checkmarks are preserved across all dynamic interactive sessions and rendering transitions.

---

## 11. Subquestion Conditioning and State Binding

All subquestions and nested conditional question groups (such as the Urgency Routine/Urgent/USC hierarchy nested under the Elective selection in the Operation Note) are subject to strict visual and state constraints:
- **Conditional Visibility:** Subquestion fields and nested groups (e.g., Routine, Urgent, and USC) must be enclosed directly in client-side logical `&&` conditional render blocks (e.g., `{urgencyType === 'elective' && (...) }`) rather than relying solely on class hiding. This guarantees that unselected path fields are never mistakenly displayed when forms are first initialized or newly opened.
- **Visual Indentation & Alignment:** Rendered conditional groups must be styled with standard subfield alignment classes (e.g., `className="subfield pl-6 space-y-2 mt-1"`) to maintain consistent indented structure without cluttering labels.
- **Dynamic State Resetting:** Changing the parent option (e.g., switching from `Elective` to `Emergency`) must explicitly reset the stored state of any child inputs to empty strings, ensuring irrelevant secondary responses are not mistakenly validated or written to the backend database.
- **Two-Way Binding (Checked Attribute):** Every checkbox, radio button, and input element must explicitly define its `checked` or `value` attribute mapped directly to the active React state or formState (e.g., `checked={urgencyType === 'elective'}`), ensuring the layout is completely deterministic upon draft restoration.

---

## 12. Keyboard Event Interception and Textarea Line Breaks
 
To guarantee a fluid and consistent typing interaction across all clinical forms while preventing accidental submit-on-enter actions:
- **Form-wide Key Blocking:** The central `fbLayout` wrapper (and custom form views like `OutpatientOutcome.tsx` via custom `onKeyDown={handleKeyDown}` binders) intercepts KeyDown events. If the `Enter` key is pressed, it prevents the default form submission action EXCEPT when the user's focus is on a `<textarea>` element. This prevents accidental submissions on plain text boxes or other interactive elements.
- **Dual-Layer Interception & Encapsulation:** To keep components beautifully encapsulated, our custom `AutoExpandingTextarea.tsx` component hooks into `onKeyDown` and calls `e.stopPropagation()` when the `Enter` key is pressed. This protects it under any standard React form, while the form-level layout's native `<textarea>` check serves as a global fallback shield for standard native textareas across other views.
- **Line Break Preservation:** Enter keys inside a `<textarea>` or auto-expanding textarea control MUST trigger a default browser carriage return (`\n`), enabling nurses and doctors to format structured notes with newlines.
- **Pristine Input & Focus Styling & Dense Spacing:** To ensure a flawless high-contrast theme layout with excellent density for clinical data, all custom controls (inputs, selects, dropdowns, dates, and textareas) standardise on the `'Roboto', sans-serif` font family, `1rem` font size, and `400` font weight. They have a white background (`background-color: white !important`) and a clean solid silver border when not focused (`border: 0.1rem solid silver`, `border-radius: 0.4rem` configured directly in custom wrapper components like `fbTextInput` and `fbTextArea`). This removes ugly black outlines and makes the UI perfectly consistent. On focus, a clean silver border is enforced (`border: 0.1rem solid silver !important`), with standard black outlines completely disabled (`outline: none !important; box-shadow: none !important`). Under the edit views, standard sections headings (`h3`), sidebar menu selectors (`.nav-section-name`), and badge counts utilize a dense `1.1rem` line height. The overall form layouts enforce a tighter line height of `1.1` (`lineHeight: 1.1` / `line-height: 1.1` instead of `1.2`) to eliminate excessive spacing and ensure high data density.
- **Read-Only View Roundtripping:** All multi-line fields rendered inside Read-Only Views (`OperationNoteRoV.tsx`, `OutpatientOutcomeRoV.tsx`, etc.) must apply CSS styles containing `whiteSpace: 'pre-line'`. This ensures that newlines and carriage returns survive database-to-view roundtrips perfectly and are formatted legibly for clinicians.

---

## 13. SNOMED CT and Staff Index Search Autocomplete Stability
 
To avoid disruptive and unprompted dropdown display when switching clinical views or loading records:
- **Interaction-Driven Dropdown Expansion (`hasInteracted`):** Search results returned from the database or background lookups of SNOMED CT tags (either disorders or procedures) or staff indices must NOT trigger dropdown view expansion automatically on load. To achieve this, `SCTDiagnosis`, `SCTProcedureSelector`, and `MSISelector` maintain a local `hasInteracted` state flag initialized to `false` and set to `true` upon active user actions (input typing, active component focusing, or clicking the toggle control). The dropdown remains hidden until `hasInteracted` is enabled, preventing unprompted flashes on background database loads and view mode switching, while retaining complete, smooth interactive functionality.
- **Dynamic Term-Prop Sync:** Both `SCTDiagnosis.tsx` and `SCTProcedureSelector.tsx` must maintain a `useEffect` hook to gracefully updates their local `searchTerm` state if the parent's `value` changes dynamically (e.g. following draft loads or resets), ensuring no split-state or empty-view bugs occur upon view restorations or switching view modes (RoV to EV).
- **Pristine Autocomplete Input Borders:** Autocomplete input elements within `SCTDiagnosis`, `SCTProcedureSelector`, and `MSISelector` are styled with a solid silver border when not focused (`border: 0.1rem solid silver !important`), a standard `0.4rem` border-radius, a solid white background, a height of `2rem`, and are configured with `boxSizing: 'border-box'` to guarantee perfect pixel-aligned uniformity across all clinical form selectors.

---

## 14. Codebase Styling and Structural Quality Analysis

A comprehensive review of the codebase was conducted to identify redundant styles, duplicate CSS rules, superfluous layout structures, and opportunities for structural factorization.

### A. Redundant Styling Information
- **Font Face Overrides (`fontFamily`):** In `index.css`, we established a global font family policy where everything (selectors like `body`, `input`, `textarea`, `div`, `span`, `p`, etc.) is strictly targeted under `font-family: 'Roboto', sans-serif !important;` (except specific `.addressograph-card` scopes which target Arial). Because of this global rule, inline React styles specifying `fontFamily: "Roboto", sans-serif"` or `'Roboto'` are entirely redundant. They are safely handled, but are candidates for removal in next-phase refactor passes.
- **Double Styling declarations in Read Only Views:** In components like `OperationNoteRoV.tsx` and `OutpatientOutcomeRoV.tsx`, subquestions and nested item labels specify `font-family: 'Roboto'` or `line-height` attributes that are already matched by parent containers.

### B. Redundant CSS Classes and Rules
- **Component-Level `<style>` Proliferation:** The massive forms (`WaitingListCard.tsx`, `OutpatientOutcome.tsx`, and `OperationNote.tsx`) duplicate nearly 100 lines of `<style>` tags each inside their components. Classes like `.bottom-control-item`, `.input-with-units`, `.subfield-wrapper`, and focus-state modifiers are duplicated across all three files. Moving these to the global `index.css` enables excellent CSS reuse, thinner component footprints, and faster build/parsing times.
- **Table Spec Overrides:** The table header styling rule (`.edit-view-form table th`) is declared redundantly inside each of the three clinical editors.

### C. Redundant `<div>` Elements (Optimization Implemented)
- **Layout Double-Wrapping (Fixed):** In both `OperationNoteRoV.tsx` and `OutpatientOutcomeRoV.tsx`, the outer rendering structure has been refactored to collapse the double nesting of `div` containers and eliminate redundant fontFamily style overrides:
  ```tsx
  // Collapsed to a clean, single-depth flex container:
  <div className="bg-white flex flex-col h-screen" style={{ height: '100vh', fontWeight: 300, lineHeight: 1.1 }}>
  ```

### D. Architectural Opportunities for Refactoring
1. **Centralized Form State Hook (`useClinicalFormState`):** 
   - *Current State:* Each of the three clinical editors duplicates identical draft listing, draft fetching from localStorage, password popup gating, changes dirty checks (`compareFormStatesObj`), and active navigation section tracking.
   - *Optimization:* Creating a custom hook like `useClinicalFormState` inside `src/hooks/useClinicalFormState.ts` could completely encapsulate and unify form loading, authorization validation, dirty status, and drafting logic across all clinical forms.
2. **Unified Patient Addressograph Component (`PatientAddressograph`):**
   - *Current State:* Mapping separate field parameters (e.g. `nhsNumber={patient.nhs_number}`, etc.) and rendering fallback containers is duplicated across `PatientRegistry.tsx`, `OperationNote.tsx`, `OutpatientOutcome.tsx`, `WaitingListCard.tsx`, and others.
   - *Optimization:* Creating a `<PatientAddressograph patient={patient} />` wrapper component under `/src/components` would eliminate repetitive mapping lines and cleanly handle null fallbacks centrally.
3. **Terminology Popups Unification:**
   - *Current State:* Although they pull from different endpoints (`findProcedure` vs `findDisorder`), `fbSCTProcedureSelector.tsx` and `fbSCTDiagnosis.tsx` share over 90% of their layout code, panel geometry, pagination behaviors, hover style hooks (`.sct-popup-hoverable`), and search synchronization effects.
   - *Optimization:* They could easily be refactored into a single parameterized component, `<fbTerminologySelector endpoint="procedure | diagnosis" />`. 

---

## 15. Isolated Table Cell Interaction-Highlighting (`fbTableCell`)

To prevent the entire table row from flashing or highlighting with a yellow background (`#ffffcc`) when a nested control (such as a dropdown, checkbox, or input field) is hovered or focused:
- **Component-Scoped Interactivity (`fbTableCell`):** Cell containers for structured user-interactive clinical tabular lists (e.g., procedures lists, specimens, and implants) utilize the `<FbTableCell>` component (`/src/components/fbTableCell.tsx`). It inherits all React standard `<td>` properties while cleanly applying hover and `focus-within` transitions.
- **Visual Segregation & Class Precedence Fix:** Highlighting is confined completely to the active element's cell. Because standard inline styles override CSS class declarations, the component's base state is styled using the Tailwind `bg-white` class instead of an inline `backgroundColor: 'white'` style. This enables the CSS-defined cell hover state (`hover:bg-[#ffffcc]`) and active form input focus-within state (`focus-within:bg-[#ffffcc]`) to cleanly override the default color, keeping hover and input focus highlights active in both clinical tabular editors under full desktop or mobile rendering.
- **Encapsulated Typography and Margins:** Enforces robust default spacing (`padding: '0.4rem'`), a clean grey divider (`border-bottom: 1px solid silver`), and a crisp white background.

---

## 16. Custom Global Tooltips Interface (`fbToolTip`)

To present clinical rules, definitions, and contextual tooltips with absolute consistency and precise close buttons across different editors (such as `OutpatientOutcome` and `OperationNote`):
- **Encapsulated Overlay Control (`fbToolTip`):** Renders floating context boxes securely above targeted label elements using absolute screen coordinates (`x`, `y` coordinates dynamically calculated relative to targeted label's bounds).
- **Close Action Solid Outline:** The manual tooltip close buttons utilize the standardized `<FbToolTip>` component (`/src/components/fbToolTip.tsx`). Its close action button specifically enforces a high-contrast boundary styled with:
  ```css
  border: 0.1rem solid black;
  border-radius: 0.2rem;
  background-color: transparent;
  ```
  This guarantees accessibility and crisp button definition against the soft light blue background (`#8cd2e7`) of the tooltip shell.

---

## 17. Material Icons Font Family Protection

To resolve the issue where standard Google Material Icons displayed as raw text ligature tags (e.g., `check_circle_outline`, `swap_vertical_circle`) instead of visual icons:
- **Exclusion of `.material-icons` from Global Directives:** Inside `src/index.css`, the global layout rule enforcing the Google Roboto font-family (`font-family: 'Roboto', sans-serif !important;`) previously styled standard text tags such as `span` or `i` without distinguishing terminology symbols. We refactored the global span selector to explicitly exclude vector elements: `span:not(.material-icons):not(.material-icons-outlined)`.
- **Enforced Icon Font Priority:** Added a specific higher-specificity class pairing declaration globally:
  ```css
  .material-icons, .material-icons-outlined {
    font-family: 'Material Icons' !important;
  }
  ```
- **Outcome:** This ensures the font engine preserves "Material Icons" for clinical badges and glyphs across all interactive panels and summaries immediately.

---

## 18. Robust Empty Procedures Table Warning Row

To ensure the "Enter at least one procedure" notice displays correctly when procedures are absent inside both clinical tabular editors:
- **Comprehensive Empty State Equation:** Both the Waiting List Card (`src/WaitingListCard.tsx`) and the Operation Note (`src/OperationNote.tsx`) previously used a brittle validation check (`procedures.every(p => !p.procedure)`) which failed to consistently gauge uninitialized fields or draft loading anomalies. This was replaced with an all-inclusive validation rule:
  ```typescript
  (procedures.length === 0 || procedures.every(p => !p.procedure || String(p.procedure).trim() === ''))
  ```
- **Unified Placeholder Insertion:** 
  - **Operation Note (`OperationNote.tsx`):** Spans across 5 table columns (`colSpan={5}`).
  - **Waiting List Card (`WaitingListCard.tsx`):** Spans across 4 table columns (`colSpan={4}`) inside the Planned Procedure(s) card list.
- **Visual Separation and Read-Only Filtering:** In edit view, these conditional rows print the required bold italic instruction in Deep Red (`#d50000`). In read-only views, empty structures are cleanly omitted from rendering by pre-filtering elements (`procedures.filter(p => p.procedure)`), avoiding any visual clutter.

---

## 19. Non-Sticky Focus Highlight Behavior (`fbAddButton`)

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

---

## 20. Tooltip Close Button Compact Styling

To improve target density and visual cohesion inside the custom blue tooltips (`fbToolTip.tsx`):
- **Compact Padding Sizing:** Decreased the top and bottom padding of the manual Close button by `0.1rem` (changing from `padding: '0.1rem 0.3rem'` to `padding: '0rem 0.3rem'`).
- **Outcome:** This ensures a slimmer, more elegant button fit that preserves the tooltip's negative space and layout symmetry perfectly, without encroaching on nearby text.

---

## 21. Highlight Support for Inner Form Table-Cell Radios

To resolve the issue where the Yes/No radio options in the Implants grid/table would not visually pop or dynamically highlight with the darker yellow styling:
- **Nesting Level Compensation for Cells (`TD`):** The nesting level highlight logic (located in `src/components/fbLayout.tsx`) calculates the hierarchical nesting level of each form element to alternate between `#ffffcc` (light yellow) and `#fee715` (darker yellow) on hover or focus-within. Since the table cells (`FbTableCell`) are inherently styled/hovered with `#ffffcc`, standard radios inside it (nesting level 0) turned the exact same color, rendering their individual hover boundaries invisible.
- **Table-Cell Detection Integration:** We explicitly expanded `getNestingLevel` to detect HTML table-cell parents:
  ```typescript
  if (
    current.classList.contains("question-container") ||
    current.classList.contains("radio-checkbox-item") ||
    current.classList.contains("subfield") ||
    current.tagName === "TD"
  ) {
    level++;
  }
  ```
- **Outcome:** By counting `TD` towards the nesting boundary, nested radio containers inside tables dynamically evaluate with an odd nesting depth (level 1). They correctly transition to the rich darker yellow highlight color (`#fee715`) on hover or focus, contrasting beautifully against the lighter yellow background of the active table cell and ensuring robust visual feedback.

 





