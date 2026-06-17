import fs from 'node:fs';

const patientComponents = sortByName([
  component('fbAddButton', 'src/components/fbAddButton.tsx', 'svelte/src/components/fbAddButton.svelte', 'Inline add control for adding rows/items to clinical tables and repeatable lists.', '`label`, `onClick`, optional disabled state.', '<button type="button" class="fb-add-button">...', cssBlock('.fb-add-button {\n  border: 0.1rem solid var(--fb-blue);\n  border-radius: 0.4rem;\n  color: var(--fb-blue);\n  background: white;\n  font-family: "Roboto", sans-serif;\n  font-weight: 500;\n}'), 'Native button; accessible name is the visible label.'),
  component('fbBloodPressure', 'src/components/fbBloodPressure.tsx', 'svelte/src/components/fbBloodPressure.svelte', 'Two-part systolic/diastolic blood-pressure input.', '`label`, `systolic`, `diastolic`, `onChange`, `required`, `valueError`, `tooltip`.', '<span class="fb-blood-pressure-control"><input class="fb-blood-pressure-input">...</span>', cssBlock('.fb-blood-pressure-control {\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n  padding: 0.2rem;\n  display: inline-grid;\n  grid-template-columns: auto auto;\n}\n.fb-blood-pressure-input,\n.fb-blood-pressure-input:focus {\n  border: none !important;\n  box-shadow: none !important;\n  outline: none !important;\n}'), 'Label handled by fbQuestion; inner numeric inputs use standard input semantics.'),
  component('fbBoxedAlert', 'src/components/fbBoxedMessage.tsx', 'svelte/src/components/fbBoxedAlert.svelte', 'Full-width red boxed clinical alert.', '`text` or children.', '<div class="fb-boxed-message" role="alert"><span class="material-icons" aria-hidden="true">error</span>...</div>', cssBlock('.fb-boxed-message {\n  width: 100%;\n  border: 0.2rem solid currentColor;\n  border-radius: 0.4rem;\n  color: var(--fb-red);\n  font-weight: 500;\n}'), '`role="alert"`; icon is decorative.'),
  component('fbBoxedInfo', 'src/components/fbBoxedMessage.tsx', 'svelte/src/components/fbBoxedInfo.svelte', 'Full-width blue boxed information message.', '`text` or children.', '<div class="fb-boxed-message" role="note"><span class="material-icons" aria-hidden="true">info</span>...</div>', cssBlock('.fb-boxed-message {\n  width: 100%;\n  border: 0.2rem solid currentColor;\n  border-radius: 0.4rem;\n  color: var(--fb-blue);\n  font-weight: 500;\n}'), '`role="note"`; icon is decorative.'),
  component('fbBoxedWarning', 'src/components/fbBoxedMessage.tsx', 'svelte/src/components/fbBoxedWarning.svelte', 'Full-width orange boxed warning message.', '`text` or children.', '<div class="fb-boxed-message" role="alert"><span class="material-icons" aria-hidden="true">warning</span>...</div>', cssBlock('.fb-boxed-message {\n  width: 100%;\n  border: 0.2rem solid currentColor;\n  border-radius: 0.4rem;\n  color: var(--fb-orange);\n  font-weight: 500;\n}'), '`role="alert"`; icon is decorative.'),
  component('fbCheck', 'src/components/fbCheck.tsx', 'svelte/src/components/fbCheck.svelte', 'Checkbox option with optional conditional subquestions.', '`label`, `checked`, `onChange`, `required`, `children`, `tooltip`.', '<label class="fb-radio-checkbox-item"><input type="checkbox">...</label>', cssBlock('.fb-radio-checkbox-item {\n  display: block;\n  padding: 0.1rem;\n}\n.fb-radio-checkbox-item:hover,\n.fb-radio-checkbox-item:focus-within {\n  background: var(--fb-active-lighter-yellow);\n}'), 'Native checkbox; wrapper label provides accessible name.'),
  component('fbDropdown', 'src/components/fbDropdown.tsx', 'svelte/src/components/fbDropdown.svelte', 'Fixed-option selector.', '`label`, `value`, `options`, `onChange`, `required`, `tooltip`.', '<select class="fb-dropdown">...</select>', cssBlock('.fb-dropdown {\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n  height: 2rem;\n  font-family: "Roboto", sans-serif;\n  font-size: 1rem;\n}'), 'Native select; label is supplied by fbQuestion.'),
  component('fbExactDate', 'src/components/fbExactDate.tsx', 'svelte/src/components/fbExactDate.svelte', 'Complete-date control with picker dropdown.', '`label`, `value`, `onChange`, `required`, `tooltip`.', '<div class="fb-date-control"><input class="fb-date-control-input">...</div>', cssBlock('.fb-date-control-input {\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n}\n.fb-date-dropdown .button-row {\n  display: flex;\n  width: 100%;\n}\n.fb-date-dropdown .button-row button {\n  flex: 1 1 0;\n}'), 'Input remains keyboard editable; picker buttons are native buttons.'),
  component('fbGridCell', 'src/components/fbGridCell.tsx', 'svelte/src/components/fbGridCell.svelte', 'Grid cell inside a row.', '`colSpan`, children.', '<div class="fb-grid-cell">...</div>', cssBlock('.fb-grid-cell {\n  min-width: 0;\n  box-sizing: border-box;\n}'), 'Structural grouping only.'),
  component('fbGridRow', 'src/components/fbGridRow.tsx', 'svelte/src/components/fbGridRow.svelte', 'Responsive horizontal row of grid cells.', '`cols`, children.', '<div class="fb-grid-row">...</div>', cssBlock('.fb-grid-row {\n  display: grid;\n  gap: 0.4rem;\n  width: 100%;\n}\n@media (max-width: 767px) {\n  .fb-grid-row { grid-template-columns: 1fr !important; }\n}'), 'Structural grouping only.'),
  component('fbGroup', 'src/components/fbGroup.tsx', 'svelte/src/components/fbGroup.svelte', 'Labelled group for radio/check options and subquestions.', '`label`, `required`, `valueError`, `tooltip`, children.', '<div class="fb-radio-checkbox-group-container" role="group">...</div>', cssBlock('.fb-radio-checkbox-group-container {\n  border-radius: 0.4rem;\n  padding: 0.2rem;\n}\n.fb-radio-checkbox-group-container:hover,\n.fb-radio-checkbox-group-container:focus-within {\n  background: var(--fb-active-lighter-yellow);\n}'), '`role="group"` with visible label.'),
  component('fbMSISelector', 'src/components/fbMSISelector.tsx', 'svelte/src/components/fbMSISelector.svelte', 'Clinician autocomplete selector with coded/not-coded indicator.', '`label`, `value`, `coded`, `onChange`, `valueError`, `tooltip`, `acceptUncodedValues`.', '<div class="fb-msi-selector"><input role="combobox">...</div>', cssBlock('.fb-msi-selector input {\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n  height: 2rem;\n}\n.fb-msi-dropdown {\n  position: absolute;\n  z-index: 1000;\n  background: white;\n  border: 0.1rem solid silver;\n}'), 'Search input behaves as a combobox-style text field; coded icons use visible/title text and decorative Material icons.'),
  component('fbNumberInput', 'src/components/fbNumberInput.tsx', 'svelte/src/components/fbNumberInput.svelte', 'Numeric input without units.', '`label`, `value`, `onChange`, `min`, `max`, `required`, `valueError`, `tooltip`.', '<input type="number">', cssBlock('input[type="number"].fb-number-input {\n  max-width: 10ch;\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n}'), 'Native number input labelled by fbQuestion.'),
  component('fbNumberInputWithUnits', 'src/components/fbNumberInputWithUnits.tsx', 'svelte/src/components/fbNumberInput.svelte', 'Numeric input with a fixed or editable units label.', '`value`, `onChange`, `units`, `min`, `max`, `unitEditable`.', '<span class="fb-number-input-with-units"><input class="fb-number-input-with-units-input"><span class="units">...</span></span>', cssBlock('.fb-number-input-with-units {\n  display: inline-flex;\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n  overflow: hidden;\n}\n.fb-number-input-with-units-input,\n.fb-number-input-with-units-input:focus {\n  border: none !important;\n  outline: none !important;\n  box-shadow: none !important;\n}\n.fb-number-input-with-units .units {\n  border-left: 0.1rem solid silver;\n}'), 'Native number input; units span may be `role="textbox"` only when editable.'),
  component('fbPartialDate', 'src/components/fbPartialDate.tsx', 'svelte/src/components/fbPartialDate.svelte', 'Partial date control accepting exact, month-only, or year-only dates.', '`label`, `value`, `onChange`, `required`, `tooltip`.', '<div class="fb-date-control"><input class="fb-date-control-input">...</div>', cssBlock('.fb-date-control-input {\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n}\n.fb-date-mode-buttons {\n  display: flex;\n  width: 100%;\n}\n.fb-date-mode-buttons button {\n  flex: 1 1 0;\n}'), 'Input plus native button picker controls.'),
  component('fbRadio', 'src/components/fbRadio.tsx', 'svelte/src/components/fbRadio.svelte', 'Radio option with optional conditional subquestions.', '`label`, `checked`, `name`, `onChange`, `children`, `tooltip`.', '<label class="fb-radio-checkbox-item"><input type="radio">...</label>', cssBlock('.fb-radio-checkbox-item {\n  display: block;\n  padding: 0.1rem;\n}\n.fb-radio-checkbox-item:hover,\n.fb-radio-checkbox-item:focus-within {\n  background: var(--fb-active-lighter-yellow);\n}'), 'Native radio; wrapper label provides accessible name.'),
  component('fbSCTDiagnosis', 'src/components/fbSCTDiagnosis.tsx', 'svelte/src/components/fbSCTDiagnosis.svelte', 'SNOMED CT diagnosis selector.', '`label`, `value`, `coded`, `onChange`, `valueError`, `tooltip`, `acceptUncodedValues`.', '<div class="fb-sct-selector"><input role="combobox">...</div>', cssBlock('.fb-sct-dropdown {\n  position: absolute;\n  width: 45rem;\n  display: flex;\n  background: white;\n  border: 0.1rem solid silver;\n}\n.fb-sct-results { width: 33.333%; }\n.fb-sct-details { width: 66.667%; font-size: 0.9rem; line-height: 1.2; }\n.fb-sct-popup-hoverable:hover,\n.fb-sct-popup-hoverable:focus-visible {\n  background: var(--fb-active-lighter-yellow);\n}'), 'Search input plus buttons/links for selection and navigation.'),
  component('fbSCTProcedure', 'src/components/fbSCTProcedure.tsx', 'svelte/src/components/fbSCTProcedure.svelte', 'SNOMED CT procedure selector.', 'Same as fbSCTDiagnosis with procedure search mode.', '<div class="fb-sct-selector"><input role="combobox">...</div>', cssBlock('.fb-sct-dropdown {\n  position: absolute;\n  width: 45rem;\n  display: flex;\n  background: white;\n  border: 0.1rem solid silver;\n}\n.fb-sct-results { width: 33.333%; }\n.fb-sct-details { width: 66.667%; font-size: 0.9rem; line-height: 1.2; }\n.fb-sct-popup-hoverable:hover,\n.fb-sct-popup-hoverable:focus-visible {\n  background: var(--fb-active-lighter-yellow);\n}'), 'Search input plus buttons/links for selection and navigation.'),
  component('fbTable', 'src/components/fbTable.tsx', 'svelte/src/components/fbTable.svelte', 'Clinical table shell.', '`children`, optional `className`, `style`.', '<table class="fb-table">...</table>', cssBlock('.fb-table {\n  border-collapse: collapse;\n  width: 100%;\n}\n.fb-table th,\n.fb-table td {\n  border-bottom: 0.1rem solid silver;\n  padding: 0.2rem;\n}'), 'Native table element with headers/cells.'),
  component('fbTextArea', 'src/components/fbTextArea.tsx', 'svelte/src/components/fbTextArea.svelte', 'Auto-expanding multi-line text input.', '`label`, `value`, `onChange`, `rows`, `fullWidth`, `required`, `tooltip`.', '<textarea class="fb-textarea">...</textarea>', cssBlock('.fb-textarea {\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n  resize: none;\n  overflow: hidden;\n  max-width: 37rem;\n}\n.fb-textarea.full-width { max-width: none; width: 100%; }'), 'Native textarea labelled by fbQuestion.'),
  component('fbTextInput', 'src/components/fbTextInput.tsx', 'svelte/src/components/fbTextInput.svelte', 'Standard one-line text input.', '`label`, `value`, `onChange`, `placeholder`, `required`, `tooltip`.', '<input type="text" class="fb-text-input">', cssBlock('.fb-text-input {\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n  height: 2rem;\n  font-family: "Roboto", sans-serif;\n}'), 'Native text input labelled by fbQuestion.'),
  component('fbTime', 'src/components/fbTime.tsx', 'svelte/src/components/fbTime.svelte', 'Native time input.', '`label`, `value`, `onChange`, `required`, `tooltip`.', '<input type="time" class="fb-time-input">', cssBlock('.fb-time-input {\n  border: 0.1rem solid silver;\n  border-radius: 0.4rem;\n  height: 2rem;\n}'), 'Native time input labelled by fbQuestion.'),
  component('fbValueError', 'src/components/fbValueError.tsx', 'svelte/src/components/fbValueError.svelte', 'Internal value-error indicator above a question label.', '`message`.', '<span class="fb-value-error"><span class="material-icons" aria-hidden="true">error</span><span>message</span></span>', cssBlock('.fb-value-error {\n  color: var(--fb-red);\n  font-family: "Roboto", sans-serif;\n  font-size: 0.8rem;\n  font-weight: 500;\n}'), '`role="alert"` may be used where immediate announcement is desired.')
]);

const otherComponents = sortByName([
  ['fbAddressograph', 'Patient identity card shown top right in headers.', 'src/components/fbAddressograph.tsx', 'svelte/src/components/fbAddressograph.svelte'],
  ['fbAuthAndSensitivity', 'Highly sensitive/final controls and authentication wrapper.', 'src/components/fbAuthAndSensitivity.tsx', 'svelte/src/components/fbAuthAndSensitivity.svelte'],
  ['fbAuthControls', 'Footer authentication controls.', 'src/components/fbAuthControls.tsx', 'svelte/src/components/fbAuthControls.svelte'],
  ['fbBottomControlsRow', 'Fixed footer content row.', 'src/components/fbBottomControlsRow.tsx', 'svelte/src/components/fbBottomControlsRow.svelte'],
  ['fbButton', 'Standard patient-form command button.', 'src/components/fbButton.tsx', 'svelte/src/components/fbButton.svelte'],
  ['fbCancelPopup', 'Cancel confirmation popup.', 'src/components/fbCancelPopup.tsx', 'svelte/src/components/fbCancelPopup.svelte'],
  ['fbDraftPopup', 'Save-as-draft confirmation popup.', 'src/components/fbDraftPopup.tsx', 'svelte/src/components/fbDraftPopup.svelte'],
  ['fbFinalControl', 'Final/draft state selector.', 'src/components/fbFinalControl.tsx', 'svelte/src/components/fbFinalControl.svelte'],
  ['fbFormHistoryMenu', 'Version-history menu for existing forms.', 'src/components/fbFormHistoryMenu.tsx', 'No Svelte equivalent yet'],
  ['fbFormTile', 'Patient-record form summary tile.', 'src/components/fbFormTile.tsx', 'svelte/src/components/fbFormTile.svelte'],
  ['fbHeader', 'Fixed form header container.', 'src/components/fbHeader.tsx', 'svelte/src/components/fbHeader.svelte'],
  ['fbLayout', 'Standard fixed header/footer and scrolling form shell.', 'src/components/fbLayout.tsx', 'svelte/src/components/fbLayout.svelte'],
  ['fbLayoutNav', 'Left section navigation panel.', 'src/components/fbLayoutNav.tsx', 'svelte/src/components/fbLayoutNav.svelte'],
  ['fbPasswordPopup', 'Second-stage save password popup.', 'src/components/fbPasswordPopup.tsx', 'svelte/src/components/fbPasswordPopup.svelte'],
  ['fbPopup', 'Generic modal/popup shell.', 'src/components/fbPopup.tsx', 'svelte/src/components/fbPopup.svelte'],
  ['fbQuestion', 'Question label/value wrapper and highlight participant.', 'src/components/fbQuestion.tsx', 'svelte/src/components/fbQuestion.svelte'],
  ['fbRoVField', 'Read-only view field display.', 'src/components/fbRoVField.tsx', 'svelte/src/components/fbRoVField.svelte'],
  ['fbSaveCancelButtons', 'Footer save/cancel/save-and-close controls.', 'src/components/fbSaveCancelButtons.tsx', 'svelte/src/components/fbSaveCancelButtons.svelte'],
  ['fbSavedPopup', 'Saved confirmation popup.', 'src/components/fbSavedPopup.tsx', 'svelte/src/components/fbSavedPopup.svelte'],
  ['fbSaveErrorPopup', 'Save-error popup.', 'src/components/fbSaveErrorPopup.tsx', 'svelte/src/components/fbSaveErrorPopup.svelte'],
  ['fbSavingPopup', 'Saving progress popup.', 'src/components/fbSavingPopup.tsx', 'svelte/src/components/fbSavingPopup.svelte'],
  ['fbSearchInput', 'Reusable search input with clear/search affordances.', 'src/components/fbSearchInput.tsx', 'svelte/src/components/fbSearchInput.svelte'],
  ['fbSection', 'Section block with blue title bar and content body.', 'src/components/fbSection.tsx', 'svelte/src/components/fbSection.svelte'],
  ['fbToolTip', 'Tooltip popup and trigger wrapper.', 'src/components/fbToolTip.tsx', 'svelte/src/components/fbToolTip.svelte'],
  ['fbUserName', 'Logged-in user display.', 'src/components/fbUserName.tsx', 'svelte/src/components/fbUserName.svelte']
]);

const colours = sortByName([
  ['fbActiveDarkerYellow', '#fee715', 'Nested/inner hover/focus highlight.'],
  ['fbActiveLighterYellow', '#ffffcc', 'Outer hover/focus highlight.'],
  ['fbBlack', '#000000', 'Body text, modal borders, disabled text.'],
  ['fbBlue', '#1b6ec2', 'Headers, section bars, navigation, primary buttons, info boxes.'],
  ['fbFaintGreen', '#C5E1A5', 'Subtle saved/complete backgrounds where specified.'],
  ['fbGreen', '#008000', 'Success, coded state, complete counters, saved state.'],
  ['fbLightBlue', '#8cd2e7', 'Secondary light-blue accents.'],
  ['fbOrange', '#fd8a10', 'Warnings, incomplete counters, saving state.'],
  ['fbRed', '#d50000', 'Errors, required stars, danger actions, alert boxes.'],
  ['fbSilver', '#c0c0c0', 'Standard borders, table lines, separators.'],
  ['fbWhite', '#ffffff', 'Form background and button text.']
]);

const icons = sortByName([
  ['check', 'Material Icons', 'Complete nav counters.'],
  ['check_circle', 'Material Icons', 'Coded/confirmed status indicators.'],
  ['check_circle_outline', 'Material Icons', 'Coded/confirmed status indicators in some older surfaces.'],
  ['error', 'Material Icons', 'Alert boxes and fbValueError.'],
  ['highlight_off', 'Material Icons', 'Delete/remove row actions.'],
  ['info', 'Material Icons', 'Information boxes.'],
  ['swap_vertical_circle', 'Material Icons', 'Clinical-table drag handles.'],
  ['visibility', 'Material Icons', 'Password show control.'],
  ['visibility_off', 'Material Icons', 'Password hide control.'],
  ['warning', 'Material Icons', 'Warning boxes and not-coded indicators.']
]);

const sections = [
  ['implementations', 'Implementations'],
  ['overview', 'Design and functionality overview'],
  ['accessibility', 'Accessibility'],
  ['colours', 'Colours'],
  ['fonts', 'Fonts'],
  ['icons', 'Icons'],
  ['patient-components', 'Components for specifying patient forms'],
  ['other-components', 'Other components'],
  ['component-specs', 'Component specifications detail'],
  ['date-controls', 'Date controls detail'],
  ['msi-selector', 'fbMSISelector detail'],
  ['sct-selectors', 'fbSCTXxx selectors detail'],
  ['shared-css', 'Shared CSS rules not owned by one component'],
  ['feature-details', 'Feature implementation details']
];

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WCP eForms design system specification</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.45; margin: 2rem; max-width: 92rem; color: #111; }
    h1, h2, h3 { color: #1b6ec2; }
    code, pre { font-family: Consolas, "Roboto Mono", monospace; }
    pre { background: #f7f7f7; border: 1px solid #ccc; padding: 1rem; overflow: auto; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #bbb; padding: 0.45rem; vertical-align: top; }
    th { background: #eee; text-align: left; }
    .note { border-left: 0.25rem solid #1b6ec2; padding-left: 0.8rem; }
    .small { font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>WCP eForms design system specification</h1>
  <p class="note">The WCP eForms design system defines a high-contrast clinical form language made from reusable <code>fbXxx</code> components, fixed form shells, patient context, editable and read-only views, and consistent save/versioning behaviour. This public specification is implementation-aware but form-agnostic: it describes the intended visual and behavioural contract rather than local development recipes.</p>

  <h2 id="contents">Contents</h2>
  <ul>
    ${sections.map(([id, title]) => `<li><a href="#${id}">${title}</a></li>`).join('\n    ')}
  </ul>

  <h2 id="implementations">Implementations</h2>
  <table><thead><tr><th>Implementation</th><th>Home</th><th>Component library</th><th>Composer</th></tr></thead><tbody>
    <tr><td>formBuilder1 reference</td><td><a href="https://www.shadesofpale.net/formBuilder1/">formBuilder1</a></td><td>Not published in this package</td><td>Not published in this package</td></tr>
    <tr><td>React formBuilder2</td><td><a href="https://www.shadesofpale.net/formBuilder2/index.html">React home</a></td><td><a href="https://www.shadesofpale.net/formBuilder2/components.html">React component library</a></td><td><a href="https://www.shadesofpale.net/formBuilder2/composer.html">React Composer</a></td></tr>
    <tr><td>Svelte formBuilder2</td><td><a href="https://www.shadesofpale.net/formBuilder2/svelte/index.html">Svelte home</a></td><td><a href="https://www.shadesofpale.net/formBuilder2/svelte/componentLibrary.html">Svelte component library</a></td><td><a href="https://www.shadesofpale.net/formBuilder2/svelte/composer.html">Svelte Composer</a></td></tr>
  </tbody></table>

  <h2 id="overview">Design and functionality overview</h2>
  <ul>
    <li><strong>Addressograph:</strong> any page or form that is about a specific patient shows an <code>fbAddressograph</code> at the top right unless there is a page-specific clinical safety reason to omit it. The addressograph uses an NHS card style and preserves Arial/Helvetica typography rather than global Roboto.</li>
    <li><strong>Date controls:</strong> <code>fbExactDate</code> requires complete dates; <code>fbPartialDate</code> accepts exact, month-only, or year-only dates. Dropdown button rows fill the dropdown width.</li>
    <li><strong>Fixed header and footer:</strong> patient forms use <code>fbLayout</code>, with a fixed white header, fixed white bottom controls/footer, and a scrolling central workspace. Header and footer are separated from the body by <code>0.2rem solid fbBlue</code>.</li>
    <li><strong>formState:</strong> editable forms store a normalised form-state object. Save is enabled only when normalised content differs from the clean snapshot; undoing all edits disables save again.</li>
    <li><strong>Highlighting:</strong> question-like containers, groups, subquestions, radios, and checks join a hierarchy of hover/focus highlights. Outer levels use <code>fbActiveLighterYellow</code>; nested/inner levels use <code>fbActiveDarkerYellow</code>. Radio/check highlighting is attached to the visible option row.</li>
    <li><strong>Nav panel:</strong> sectioned forms show a left <code>fbLayoutNav</code> panel on desktop. Section-name buttons are white on blue, active sections show paired triangles, editable views show required counters, and RoVs hide the counters.</li>
    <li><strong>Required fields:</strong> required labels show a red <code>*</code> grouped with the final label word so the star cannot wrap to a line by itself.</li>
    <li><strong>RoVs:</strong> read-only views show current saved content without editable controls. Sectioned RoVs keep navigation panels without counters and do not show Save/Save and close. Form-specific RoV launch rules control whether Edit, Close, Back, or EV buttons appear.</li>
    <li><strong>Save as draft:</strong> draft/final controls and save popups use shared components. Where password confirmation is required, saving includes a second-stage password popup.</li>
    <li><strong>SNOMED and MSI selectors:</strong> <code>fbSCTProcedure</code>, <code>fbSCTDiagnosis</code>, and <code>fbMSISelector</code> use searchable dropdowns, coded/not-coded indicators, clear buttons, and stable dropdown visibility while typing.</li>
    <li><strong>Structure:</strong> forms are nested as <code>fbSection</code> &gt; <code>fbGridRow</code> &gt; <code>fbGridCell</code> &gt; question components. Conditional subquestions are emitted by <code>fbRadio</code> and <code>fbCheck</code> and are indented beneath the selected option.</li>
    <li><strong>Tooltips:</strong> <code>fbToolTip</code> opens when the visible control container, label, or actual control is hovered or focused. Clicking anywhere inside an open tooltip closes it.</li>
    <li><strong>Value errors:</strong> <code>fbValueError</code> appears above labels only when an error message exists. Number controls automatically show it for non-numeric input.</li>
  </ul>

  <h2 id="accessibility">Accessibility</h2>
  <p>The design uses native HTML controls wherever possible, semantic landmarks for form shells, real buttons for actions, real tables for tabular clinical data, visible focus/hover affordances, labelled controls, ARIA group/alert/note roles where custom grouping or status messaging needs them, and decorative icons marked as hidden from assistive technology. The intended target is WCAG 2.2 AA, but final conformance requires keyboard, screen-reader, zoom/reflow, and clinical workflow testing for each deployed form.</p>

  <h2 id="colours">Colours</h2>
  <table><thead><tr><th>Key</th><th>Code</th><th>Purpose</th></tr></thead><tbody>
    ${colours.map(([k,c,p]) => `<tr><td><code>${k}</code></td><td><code>${c}</code></td><td>${p}</td></tr>`).join('\n    ')}
  </tbody></table>

  <h2 id="fonts">Fonts</h2>
  <table><thead><tr><th>Font</th><th>Provenance / URL</th><th>Use</th></tr></thead><tbody>
    <tr><td>Arial / Helvetica</td><td>System fonts</td><td>NHS addressograph card styling.</td></tr>
    <tr><td>Consolas / Roboto Mono</td><td>System font / Google Fonts where available</td><td>Code and specification examples only.</td></tr>
    <tr><td>Material Icons</td><td>Google Fonts, <a href="https://fonts.googleapis.com/icon?family=Material+Icons">fonts.googleapis.com/icon?family=Material+Icons</a></td><td>Icon ligatures. Explicitly excluded from Roboto overrides.</td></tr>
    <tr><td>Roboto</td><td>Google Fonts, <a href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&amp;display=swap">fonts.googleapis.com/css2?family=Roboto</a></td><td>Global form, button, input, label, popup, and navigation typography. Main weights: 300, 400, 500, 700.</td></tr>
  </tbody></table>

  <h2 id="icons">Icons</h2>
  <table><thead><tr><th>Icon</th><th>Provenance / URL</th><th>Use</th></tr></thead><tbody>
    ${icons.map(([i,p,u]) => `<tr><td><code>${i}</code></td><td>${p}, <a href="https://fonts.google.com/icons">fonts.google.com/icons</a></td><td>${u}</td></tr>`).join('\n    ')}
  </tbody></table>

  <h2 id="patient-components">Components for specifying patient forms</h2>
  <table><thead><tr><th>Component</th><th>Purpose</th></tr></thead><tbody>
    ${patientComponents.map(({ name, purpose }) => `<tr><td><code>${name}</code></td><td>${purpose}</td></tr>`).join('\n    ')}
  </tbody></table>

  <h2 id="other-components">Other components</h2>
  <table><thead><tr><th>Component</th><th>Purpose</th></tr></thead><tbody>
    ${otherComponents.map(([n,p]) => `<tr><td><code>${n}</code></td><td>${p}</td></tr>`).join('\n    ')}
  </tbody></table>

  <h2 id="component-specs">Component specifications detail</h2>
  ${patientComponents.map((item) => `<h3 id="component-${item.name.toLowerCase()}">${item.name}</h3>
  <p>${item.purpose}</p>
  <p><strong>Source files:</strong> React <code>${item.react}</code>; Svelte <code>${item.svelte}</code>.</p>
  <p><strong>Parameters:</strong> ${item.params}</p>
  <p><code>${escapeHtml(item.html)}</code></p>
  ${item.css}
  <p><strong>ARIA/semantics:</strong> ${item.aria}</p>`).join('\n  ')}
  ${otherComponents.map(([name, purpose, react, svelte]) => `<h3 id="component-${name.toLowerCase()}">${name}</h3>
  <p>${purpose}</p>
  <p><strong>Source files:</strong> React <code>${react}</code>; Svelte <code>${svelte}</code>.</p>
  <p><strong>Parameters:</strong> implementation-specific props matching the component purpose and the shared form layout conventions.</p>`).join('\n  ')}

  <h2 id="date-controls">Date controls detail</h2>
  <p><code>fbExactDate</code> and <code>fbPartialDate</code> share the same visible date-control shell. Exact date mode accepts only complete dates. Partial date mode accepts exact dates, month-year values, and year-only values. The dropdown panel is an absolutely positioned white panel below the input. It has a header/navigation area, mode buttons where applicable, and a calendar/month/year body. All rows of buttons inside the dropdown fill the panel width, and buttons expand horizontally to divide the available space. The panel must remain open while a user changes mode or navigates months/years.</p>
  <pre><code>${escapeHtml(`<div class="fb-date-control">
  <input class="fb-date-control-input" type="text" aria-haspopup="dialog" aria-expanded={open}>
  <button type="button" class="fb-date-toggle">&#9660;</button>
  <div class="fb-date-dropdown" role="dialog">
    <div class="fb-date-mode-buttons">
      <button type="button">Select exact date</button>
      <button type="button">Select month</button>
      <button type="button">Select year</button>
    </div>
    <div class="fb-date-calendar-header">
      <button type="button">Previous</button>
      <span>June 2026</span>
      <button type="button">Next</button>
    </div>
    <div class="fb-date-calendar-grid" role="grid">
      <button type="button" role="gridcell">1</button>
      <button type="button" role="gridcell">2</button>
    </div>
  </div>
</div>`)}</code></pre>
  <pre><code>${escapeHtml(`.fb-date-control {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.fb-date-control-input {
  border: 0.1rem solid silver;
  border-radius: 0.4rem;
  height: 2rem;
}
.fb-date-dropdown {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 0.1rem solid silver;
  min-width: 18rem;
  padding: 0.3rem;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.2);
}
.fb-date-dropdown .button-row,
.fb-date-mode-buttons,
.fb-date-calendar-header {
  display: flex;
  width: 100%;
}
.fb-date-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.1rem;
}
.fb-date-dropdown button {
  flex: 1 1 0;
}`)}</code></pre>
  <pre><code>${escapeHtml(`function parseDateInput(text, exactOnly) {
  const value = text.trim();
  if (exactOnly && !isCompleteClinicalDate(value)) return { error: 'Complete date required' };
  if (isCompleteClinicalDate(value)) return { kind: 'exact', value: toIsoDate(value) };
  if (!exactOnly && isClinicalMonth(value)) return { kind: 'month', value: toIsoMonth(value) };
  if (!exactOnly && /^\\d{4}$/.test(value)) return { kind: 'year', value };
  return { error: 'Date not recognised' };
}`)}</code></pre>

  <h2 id="msi-selector">fbMSISelector detail</h2>
  <p><code>fbMSISelector</code> is a clinician autocomplete. User edits invalidate any previous coded selection. A confirmed selection shows a green coded icon; unconfirmed typed text shows an orange warning icon. The clear control uses a text cross and the dropdown toggle uses text up/down triangles matching the React size.</p>
  <pre><code>${escapeHtml(`<div class="fb-msi-selector">
  <input type="text" role="combobox" aria-expanded={open} aria-autocomplete="list">
  <button type="button" aria-label="Clear clinician">&times;</button>
  <button type="button" aria-label="Show clinician matches">&#9660;</button>
  <span class="material-icons" title="Coded" aria-hidden="true">check_circle</span>
  <div class="fb-msi-dropdown" role="listbox">
    <button type="button" role="option">Clinician name</button>
  </div>
</div>`)}</code></pre>
  <pre><code>${escapeHtml(`.fb-msi-selector {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.fb-msi-selector input {
  border: 0.1rem solid silver;
  border-radius: 0.4rem;
  height: 2rem;
  font-family: 'Roboto', sans-serif;
}
.fb-msi-dropdown {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 0.1rem solid silver;
  max-height: 16rem;
  overflow-y: auto;
}
.fb-msi-dropdown [role="option"]:hover,
.fb-msi-dropdown [role="option"]:focus {
  background: var(--fb-active-lighter-yellow);
}`)}</code></pre>
  <pre><code>${escapeHtml(`async function searchMsi(query) {
  const url = 'https://www.shadesofpale.net/MSISearch?st=' + encodeURIComponent(query);
  const response = await fetch(url);
  return parseClinicianMatches(await response.text());
}
function onMsiInput(value) {
  state.value = value;
  state.coded = false;
  state.selectedClinicianId = '';
  state.open = value.trim().length > 1;
}`)}</code></pre>

  <h2 id="sct-selectors">fbSCTXxx selectors detail</h2>
  <p><code>fbSCTProcedure</code> and <code>fbSCTDiagnosis</code> are public wrappers around the shared SNOMED CT selector. Procedure mode calls <code>findProcedure</code>; diagnosis mode calls <code>findDisorder</code>. The popup is a stable two-pane dropdown: matches on the left and concept details on the right. The left pane is a compact selectable result list. The right pane shows parent concepts, selected concept details, Select/Close/navigation buttons, synonyms, and child concepts. Parent concepts, synonyms, and child concepts highlight with <code>fbActiveLighterYellow</code> on hover or keyboard focus. Typing in the input must update results without closing and reopening the dropdown.</p>
  <pre><code>${escapeHtml(`<div class="fb-sct-selector">
  <input type="text" role="combobox" aria-expanded={open} aria-autocomplete="list">
  <button type="button" aria-label="Clear SNOMED CT concept">&times;</button>
  <button type="button" aria-label="Show SNOMED CT matches">&#9660;</button>
  <div class="fb-sct-dropdown">
    <div class="fb-sct-results" role="listbox">...</div>
    <div class="fb-sct-details">
      <section class="fb-sct-parent-concepts">
      <button class="fb-sct-popup-hoverable" type="button">Parent concept</button>
      </section>
      <section class="fb-sct-selected-concept">Selected concept details</section>
      <section class="fb-sct-actions">
      <button type="button">Select</button>
      <button type="button">Close</button>
      </section>
      <section class="fb-sct-child-concepts">
      <button class="fb-sct-popup-hoverable" type="button">Child concept</button>
      </section>
    </div>
  </div>
</div>`)}</code></pre>
  <pre><code>${escapeHtml(`.fb-sct-dropdown {
  position: absolute;
  z-index: 1000;
  width: 45rem;
  display: flex;
  background: white;
  border: 0.1rem solid silver;
}
.fb-sct-results {
  width: 33.333%;
  overflow-y: auto;
}
.fb-sct-details {
  width: 66.667%;
  font-size: 0.9rem;
  line-height: 1.2;
}
.fb-sct-details p {
  margin: 0.25rem 0;
}
.fb-sct-popup-hoverable:hover,
.fb-sct-popup-hoverable:focus-visible {
  background: var(--fb-active-lighter-yellow);
}`)}</code></pre>
  <pre><code>${escapeHtml(`const command = mode === 'procedure' ? 'findProcedure' : 'findDisorder';
const url = 'https://www.shadesofpale.net/SCTSearch?cmd=' + command
  + '&st=' + encodeURIComponent(query)
  + '&count=30';

function onSctInput(value) {
  state.value = value;
  state.coded = false;
  state.open = true;
  scheduleSearchWithoutClosingDropdown(value);
}

function selectConcept(concept) {
  state.value = concept.term;
  state.conceptId = concept.id;
  state.coded = true;
  state.open = false;
}`)}</code></pre>

  <h2 id="shared-css">Shared CSS rules not owned by one component</h2>
  <pre><code>${escapeHtml(`@import "tailwindcss";

:root {
  --fb-active-darker-yellow: #fee715;
  --fb-active-lighter-yellow: #ffffcc;
  --fb-black: #000000;
  --fb-blue: #1b6ec2;
  --fb-faint-green: #C5E1A5;
  --fb-green: #008000;
  --fb-light-blue: #8cd2e7;
  --fb-orange: #fd8a10;
  --fb-red: #d50000;
  --fb-silver: #c0c0c0;
  --fb-white: #ffffff;
}

body,
input,
textarea,
select,
button,
label,
div,
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
::placeholder {
  font-family: 'Roboto', sans-serif !important;
}

.material-icons,
.material-icons-outlined {
  font-family: 'Material Icons' !important;
}

textarea:focus,
input:not([type="radio"]):not([type="checkbox"]):not(.fb-blood-pressure-input):not(.fb-number-input-with-units-input):not(.fbcp-text-input):focus,
select:focus {
  outline: none !important;
  border: 0.1rem solid silver !important;
  box-shadow: none !important;
}

.fb-number-input-with-units input:focus,
.fb-blood-pressure-control input:focus {
  border: none !important;
  border-width: 0 !important;
  outline: none !important;
  box-shadow: none !important;
}`)}</code></pre>

  <h2 id="feature-details">Feature implementation details</h2>
  <h3>Label equalisation and textarea expansion</h3>
  <p>Rows scan first-level <code>.fb-question-label</code> and <code>.fb-group-label</code> elements, calculate the row maximum label height on desktop, and apply extra space above shorter labels using <code>padding-top</code>. Textareas resize on input by resetting height to auto and then assigning <code>scrollHeight</code>.</p>
  <pre><code>${escapeHtml(`for (const row of document.querySelectorAll('.fb-grid-row')) {
  const labels = row.querySelectorAll(':scope > .fb-grid-cell .fb-question-label, :scope > .fb-grid-cell .fb-group-label');
  const max = Math.max(...Array.from(labels, (label) => label.scrollHeight));
  for (const label of labels) {
    label.style.paddingTop = Math.max(0, max - label.scrollHeight) + 'px';
  }
}

function resizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}`)}</code></pre>

  <h3>Highlight Hierarchy</h3>
  <p>Question-like containers use <code>.fb-question-container</code>; groups use <code>.fb-radio-checkbox-group-container</code>; visible radio/check rows use <code>.fb-radio-checkbox-item</code>. Focus-within and hover apply alternating yellow levels. Indentation wrappers around conditional children must not themselves join the highlight hierarchy unless they are the actual subquestion target.</p>

  <h3>Required-Label Rendering</h3>
  <pre><code>${escapeHtml(`function renderRequiredLabel(label) {
  const words = label.trim().split(/\\s+/);
  const lastWord = words.pop();
  return prefixText(words) + ' ' +
    '<span class="required-word">' + lastWord +
    '<span class="required">*</span></span>';
}`)}</code></pre>

  <h3>RoV Rules</h3>
  <p>Read-only views preserve patient context and section navigation, hide edit-only inputs and save controls, and follow form-specific footer rules. Sectioned RoVs keep the nav panel but hide required counters.</p>

  <h3>Tooltip Behaviour</h3>
  <p>The tooltip wrapper opens on hover or focus-within of the whole visible control container and closes when focus leaves, hover ends after the configured delay, or the user clicks anywhere in the tooltip body.</p>

  <h3>Value Errors</h3>
  <pre><code>${escapeHtml(`<span class="fb-value-error" role="alert">
  <span class="material-icons" aria-hidden="true">error</span>
  <span>Enter a number</span>
</span>`)}</code></pre>
</body>
</html>`;

function component(name, react, svelte, purpose, params, html, css, aria) {
  return { name, react, svelte, purpose, params, html, css, aria };
}

function cssBlock(css) {
  return `<pre><code>${escapeHtml(css)}</code></pre>`;
}

function sortByName(items) {
  return [...items].sort((a, b) => {
    const left = Array.isArray(a) ? a[0] : a.name;
    const right = Array.isArray(b) ? b[0] : b.name;
    return left.localeCompare(right, 'en', { sensitivity: 'base' });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

fs.writeFileSync('docs/wcp-eForms-designSystem-specification.html', html, 'utf8');
console.log('Wrote docs/wcp-eForms-designSystem-specification.html');
