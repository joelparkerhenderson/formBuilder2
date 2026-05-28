import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

// Add Google Fonts - load multiple weights including italics
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,500&display=swap';
fontLink.rel = 'stylesheet';
if (!document.querySelector('link[href*="Roboto"]')) {
  document.head.appendChild(fontLink);
}

// Add Material Icons
const materialIconsLink = document.createElement('link');
materialIconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
materialIconsLink.rel = 'stylesheet';
if (!document.querySelector('link[href*="Material+Icons"]')) {
  document.head.appendChild(materialIconsLink);
}

// Add form styling
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .question-container {
    padding: 0.4rem;
    border-radius: 0.4rem;
    transition: background-color 0.5s ease-out;
    display: flex;
    flex-direction: column;
  }

  .question-container:hover,
  .question-container:focus-within {
    background-color: #ffffcc;
  }

  .question-container label {
    flex-shrink: 0;
  }

  /* Override Tailwind space-y to remove unwanted spacing */
  .space-y-2.question-container {
    gap: 0;
  }

  .space-y-2.question-container > * + * {
    margin-top: 0 !important;
  }

  .space-y-2.question-container > label {
    margin-bottom: 0 !important;
  }

  /* Prevent required asterisk from wrapping alone - keep it with preceding word */
  label {
    overflow-wrap: normal;
    word-wrap: normal;
  }

  label span[style*="#d50000"] {
    display: inline-block;
    margin-left: -0.15em;
    padding-left: 0.35em;
  }

  /* Align grid items at the top when labels have different heights */
  .grid {
    align-items: start;
  }

  /* Align label text to bottom so they can be height-matched dynamically */
  /* Only apply to field labels, not radio/checkbox labels */
  .grid .question-container > label:not(.radio-checkbox-item) {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding-top: 0;
  }

  .radio-checkbox-item {
    padding: 0;
    border-radius: 0.4rem;
    transition: background-color 0.5s ease-out;
    margin-bottom: 0 !important;
    margin-top: 0 !important;
    line-height: 1.2;
    align-items: flex-start;
  }

  .radio-checkbox-item input[type="radio"],
  .radio-checkbox-item input[type="checkbox"] {
    margin-top: 0.1rem;
  }

  label {
    line-height: 1.2;
  }

  .bottom-control-item {
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.4rem;
    background-color: white;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    font-size: 1rem;
    transition: background-color 0.5s ease-out;
  }

  .bottom-control-item:hover {
    background-color: #ffffcc;
  }

  .bottom-control-button-green {
    border: 0.1rem solid rgb(76, 175, 80);
    border-radius: 0.4rem;
    padding: 0.4rem;
    background-color: rgb(76, 175, 80);
    color: white;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.5s ease-out;
  }

  .bottom-control-button-green:hover {
    background-color: rgb(56, 142, 60);
  }

  .bottom-control-button-disabled {
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    display: inline-block;
    height: 2.0rem;
    line-height: 2rem;
    margin-left: 0.2rem;
    padding: 0 0.5rem;
    background-color: silver;
    color: white;
    cursor: not-allowed;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 1rem;
  }

  .bottom-control-button-red {
    border: 0.1rem solid rgb(244, 67, 54);
    border-radius: 0.4rem;
    padding: 0.4rem;
    background-color: rgb(244, 67, 54);
    color: white;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.5s ease-out;
  }

  .bottom-control-button-red:hover {
    background-color: rgb(211, 47, 47);
  }

  .bottom-control-button-amber {
    border: 0.1rem solid rgb(255, 193, 7);
    border-radius: 0.4rem;
    padding: 0.4rem;
    background-color: rgb(255, 193, 7);
    color: black;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.5s ease-out;
  }

  .bottom-control-button-amber:hover {
    background-color: rgb(255, 179, 0);
  }

  /* Hide elements in read-only view */
  .hideInRoV {
    /* Will be controlled by JavaScript */
  }

  .hideBorderInRoV {
    /* Will be controlled by JavaScript */
  }

  .zeroWidthInRoV {
    /* Will be controlled by JavaScript */
  }

  .plainInRoV {
    /* Will be controlled by JavaScript */
  }

  .boldInRoV {
    font-weight: 300 !important;
  }

  textarea {
    resize: none;
    overflow: hidden;
  }

  .nav-grid {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.1rem;
    padding: 0;
    align-items: center;
  }

  .nav-section-name {
    margin: 0.1rem;
    margin-top: 0;
    margin-bottom: 0;
    padding: 0.1rem;
    padding-left: 0.6rem;
    padding-right: 0.6rem;
    border: 0.2rem solid transparent;
    border-top-left-radius: 0.8rem;
    border-bottom-left-radius: 0.8rem;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background-color 0.5s ease-out;
    background-color: rgb(27, 110, 194);
    color: white;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 1.8rem;
  }

  .nav-section-name:hover,
  .nav-section-name:focus {
    background-color: #fee715;
    color: black;
  }

  .nav-counter-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(27, 110, 194);
    color: white;
    font-weight: 500;
    border: 0.2rem solid transparent;
    padding: 0.1rem;
    margin: 0.1rem;
    margin-left: 0;
    margin-right: 0;
    transition: background-color 0.5s ease-out;
    height: 1.8rem;
    min-width: 1.8rem;
  }

  .nav-counter-box:hover,
  .nav-counter-box:focus {
    background-color: #fee715;
    color: black;
  }

  .nav-go-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(27, 110, 194);
    color: white;
    font-weight: 500;
    border: 0.2rem solid transparent;
    border-top-right-radius: 0.8rem;
    border-bottom-right-radius: 0.8rem;
    padding: 0.1rem;
    padding-left: 0.6rem;
    padding-right: 0.6rem;
    margin: 0.1rem;
    margin-left: 0;
    transition: background-color 0.5s ease-out;
    cursor: pointer;
    height: 1.8rem;
  }

  .nav-go-button:hover,
  .nav-go-button:focus {
    background-color: #fee715;
    color: black;
  }

  .nav-indicator {
    font-size: 1.2rem;
    color: rgb(27, 110, 194);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
  }

  .nav-indicator.hidden {
    visibility: hidden;
  }

  .input-with-units {
    display: inline-flex;
    align-items: center;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    overflow: hidden;
    background-color: white;
  }

  .input-with-units input[type="number"],
  .input-with-units input[type="text"] {
    border: none;
    border-right: 0.1rem solid silver;
    border-radius: 0;
    padding: 0.5rem;
    flex: 1;
    min-width: 0;
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    font-size: 1rem;
  }

  .input-with-units input[type="number"]:focus,
  .input-with-units input[type="text"]:focus {
    outline: none;
  }

  .input-with-units .unit-label {
    padding: 0.5rem;
    background-color: #f5f5f5;
    white-space: nowrap;
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    font-size: 1rem;
  }

  .input-with-units .unit-value-display {
    padding: 0.5rem;
    background-color: white;
    white-space: nowrap;
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    font-size: 1rem;
    border-right: 0.1rem solid silver;
  }

  /* Prevent Chrome from adding spinner arrows to number inputs */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }

  .procedure-row {
    display: contents;
  }

  .procedure-row > * {
    background-color: white;
  }

  .procedure-row.dragging > * {
    opacity: 0.5;
  }

  .addButton {
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.4rem;
    background-color: white;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    font-size: 1rem;
    transition: background-color 0.5s ease-out;
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    width: auto;
  }

  .addButton:hover {
    background-color: #ffffcc;
  }

  .addButton .material-icons {
    font-size: 1.2rem;
  }

  .msi-selector-label-subfield {
    font-size: 1rem;
    font-weight: 300;
    margin-bottom: 0.2rem;
  }

  .section-content {
    padding: 0.4rem;
  }

  .section-header {
    cursor: pointer;
    user-select: none;
  }

  .draft-section {
    opacity: 0.6;
  }

  /* Popup overlay */
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .popup-content {
    background-color: white;
    padding: 2rem;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 1.6rem rgba(0, 0, 0, 0.2);
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
  }

  .popup-buttons {
    display: flex;
    gap: 0.4rem;
    margin-top: 1rem;
    justify-content: flex-end;
  }

  /* Read-only view styles */
  body.read-only-view input:not([type="radio"]):not([type="checkbox"]),
  body.read-only-view textarea,
  body.read-only-view select {
    border: none !important;
    background-color: transparent !important;
  }

  /* Hide placeholders in read-only view */
  body.read-only-view input::placeholder,
  body.read-only-view textarea::placeholder,
  body.read-only-view select option[value=""] {
    color: transparent !important;
    opacity: 0 !important;
  }

  body.read-only-view .hideBorderInRoV {
    border: none !important;
  }

  body.read-only-view .zeroWidthInRoV {
    width: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  body.read-only-view input[type="radio"],
  body.read-only-view input[type="checkbox"] {
    pointer-events: none !important;
    user-select: none !important;
  }

  body.read-only-view .radio-checkbox-item {
    pointer-events: none !important;
    user-select: none !important;
  }

  /* Hide select dropdown arrows */
  body.read-only-view select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: none;
    padding-right: 0.5rem;
  }

  /* Hide custom control borders and buttons */
  body.read-only-view input[type="text"].border {
    padding-right: 0.5rem !important;
  }

  /* Show only the RoV/EV toggle button */
  body.read-only-view button[type="button"].bottom-control-item {
    display: inline-block !important;
  }

  /* RoV opened from patient record - show Edit and Back buttons instead */
  body.read-only-view-from-record button[type="button"] {
    display: none !important;
  }

  body.read-only-view-from-record button[type="button"].patient-record-nav-button {
    display: inline-block !important;
  }

  /* Apply all read-only styles to read-only-view-from-record as well */
  body.read-only-view-from-record input:not([type="radio"]):not([type="checkbox"]),
  body.read-only-view-from-record textarea,
  body.read-only-view-from-record select {
    border: none !important;
    background-color: transparent !important;
  }

  body.read-only-view-from-record input::placeholder,
  body.read-only-view-from-record textarea::placeholder,
  body.read-only-view-from-record select option[value=""] {
    color: transparent !important;
    opacity: 0 !important;
  }

  body.read-only-view-from-record .hideBorderInRoV {
    border: none !important;
  }

  body.read-only-view-from-record .zeroWidthInRoV {
    width: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  body.read-only-view-from-record input[type="radio"],
  body.read-only-view-from-record input[type="checkbox"] {
    pointer-events: none !important;
    user-select: none !important;
  }

  body.read-only-view-from-record .radio-checkbox-item {
    pointer-events: none !important;
    user-select: none !important;
  }

  body.read-only-view-from-record select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: none;
    padding-right: 0.5rem;
  }

  body.read-only-view-from-record input[type="text"].border {
    padding-right: 0.5rem !important;
  }

  body.read-only-view-from-record .input-with-units {
    border: none !important;
    background-color: transparent !important;
    gap: 0.25rem;
  }

  body.read-only-view-from-record .input-with-units .unit-label {
    border-left: none !important;
    font-weight: 500 !important;
    padding-left: 0 !important;
  }

  body.read-only-view-from-record .cancel-btn,
  body.read-only-view-from-record .draft-section {
    display: none !important;
  }

  body.read-only-view-from-record .empty-field {
    display: none !important;
  }

  body.read-only-view-from-record tr td[colspan="5"] {
    display: none !important;
  }

  body.read-only-view-from-record .nested-content :is(input:not([type="radio"]):not([type="checkbox"]), textarea, select) {
    border: none !important;
    background-color: transparent !important;
  }

  body.read-only-view-from-record .nested-content :is(input[type="radio"], input[type="checkbox"]) {
    pointer-events: none !important;
  }

  body.read-only-view-from-record .nested-content select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

  /* Hide unit separators and borders */
  body.read-only-view .input-with-units {
    border: none !important;
    background-color: transparent !important;
    gap: 0.25rem;
  }

  body.read-only-view .input-with-units .unit-label {
    border-left: none !important;
    font-weight: 500 !important;
    padding-left: 0 !important;
  }

  /* Hide elements in read-only view */
  body.read-only-view .cancel-btn,
  body.read-only-view .draft-section {
    display: none !important;
  }

  body.read-only-view .empty-field {
    display: none !important;
  }

  /* Hide "Enter at least one procedure" row */
  body.read-only-view tr td[colspan="5"] {
    display: none !important;
  }

  /* Apply styles to nested-content (subqs) */
  body.read-only-view .nested-content :is(input:not([type="radio"]):not([type="checkbox"]), textarea, select) {
    border: none !important;
    background-color: transparent !important;
  }

  body.read-only-view .nested-content :is(input[type="radio"], input[type="checkbox"]) {
    pointer-events: none !important;
    user-select: none !important;
  }

  body.read-only-view .nested-content select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: none;
    padding-right: 0.5rem;
  }
`;
if (!document.querySelector('style[data-form-styles]')) {
  styleSheet.setAttribute('data-form-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default function App() {
  return <RouterProvider router={router} />;
}
