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
  .fb-question-container {
    padding: 0.4rem;
    border-radius: 0.4rem;
    transition: background-color 0.5s ease-out;
    display: flex;
    flex-direction: column;
  }

  .fb-question-container:hover,
  .fb-question-container:focus-within {
    background-color: #ffffcc;
  }

  .fb-question-container label {
    flex-shrink: 0;
  }

  /* Override Tailwind space-y to remove unwanted spacing */
  .space-y-2.fb-question-container {
    gap: 0;
  }

  .space-y-2.fb-question-container > * + * {
    margin-top: 0 !important;
  }

  .space-y-2.fb-question-container > label {
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
  .grid .fb-question-container > label:not(.fb-radio-checkbox-item) {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding-top: 0;
  }

  .fb-radio-checkbox-item {
    padding: 0 0.2rem;
    border-radius: 0.4rem;
    transition: background-color 0.5s ease-out;
    margin-bottom: 0 !important;
    margin-top: 0 !important;
    line-height: 1.2;
    align-items: flex-start;
  }

  .fb-radio-checkbox-item input[type="radio"],
  .fb-radio-checkbox-item input[type="checkbox"] {
    margin-top: 0.1rem;
  }

  label {
    line-height: 1.2;
  }

  .fb-bottom-control-item {
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

  .fb-bottom-control-item:hover {
    background-color: #ffffcc;
  }

  /* Hide elements in read-only view */
  .fb-hide-in-rov {
    /* Will be controlled by JavaScript */
  }

  .fb-hide-border-in-rov {
    /* Will be controlled by JavaScript */
  }

  .fb-zero-width-in-rov {
    /* Will be controlled by JavaScript */
  }

  .fb-plain-in-rov {
    /* Will be controlled by JavaScript */
  }

  .fb-bold-in-rov {
    font-weight: 300 !important;
  }

  .fb-rov-field-value-inline {
    display: flex !important;
    align-items: flex-start !important;
    gap: 0.4rem;
  }

  .fb-rov-coded-icon {
    align-self: flex-start !important;
    display: inline-flex !important;
    flex: 0 0 auto !important;
    line-height: 1 !important;
    vertical-align: top !important;
  }

  textarea {
    resize: none;
    overflow: hidden;
  }

  .fb-layout-nav-grid {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.1rem;
    padding: 0;
    align-items: center;
  }

  .fb-layout-nav-section-name {
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
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 1.8rem;
  }

  .fb-layout-nav-section-name:hover,
  .fb-layout-nav-section-name:focus {
    background-color: #fee715;
    color: black;
  }

  .fb-layout-nav-counter-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fd8a10;
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

  .fb-layout-nav-counter-box.complete {
    background-color: #008000;
  }

  .fb-layout-nav-counter-box.incomplete {
    background-color: #fd8a10;
  }

  .fb-layout-nav-counter-box:hover,
  .fb-layout-nav-counter-box:focus {
    background-color: #fee715;
    color: black;
  }

  .fb-layout-nav-indicator {
    font-size: 1.2rem;
    color: rgb(27, 110, 194);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
  }

  .fb-layout-nav-indicator.hidden {
    visibility: hidden;
  }

  .fb-input-with-units {
    display: inline-flex;
    align-items: center;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    overflow: hidden;
    background-color: white;
  }

  .fb-input-with-units input[type="number"],
  .fb-input-with-units input[type="text"] {
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

  .fb-input-with-units input[type="number"]:focus,
  .fb-input-with-units input[type="text"]:focus {
    outline: none;
  }

  .fb-input-with-units .unit-label {
    padding: 0.5rem;
    background-color: #f5f5f5;
    white-space: nowrap;
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    font-size: 1rem;
  }

  .fb-input-with-units .unit-value-display {
    padding: 0.5rem;
    background-color: white;
    white-space: nowrap;
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    font-size: 1rem;
    border-right: 0.1rem solid silver;
  }

  .fb-date-control-input,
  .fb-date-control-input:focus,
  .fb-layout-edit-view-form .fb-date-control-input,
  .fb-layout-edit-view-form .fb-date-control-input:focus,
  .fb-layout-edit-view-form input.fb-date-control-input,
  .fb-layout-edit-view-form input.fb-date-control-input:focus {
    border: 0.1rem solid silver !important;
    border-radius: 0.4rem !important;
    outline: none !important;
    box-shadow: none !important;
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

  .fb-msi-selector-label-subfield {
    font-size: 1rem;
    font-weight: 300;
    margin-bottom: 0.2rem;
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

  body.read-only-view .fb-hide-border-in-rov {
    border: none !important;
  }

  body.read-only-view .fb-zero-width-in-rov {
    width: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  body.read-only-view input[type="radio"],
  body.read-only-view input[type="checkbox"] {
    pointer-events: none !important;
    user-select: none !important;
  }

  body.read-only-view .fb-radio-checkbox-item {
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
  body.read-only-view button[type="button"].fb-bottom-control-item {
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

  body.read-only-view-from-record .fb-hide-border-in-rov {
    border: none !important;
  }

  body.read-only-view-from-record .fb-zero-width-in-rov {
    width: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  body.read-only-view-from-record input[type="radio"],
  body.read-only-view-from-record input[type="checkbox"] {
    pointer-events: none !important;
    user-select: none !important;
  }

  body.read-only-view-from-record .fb-radio-checkbox-item {
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

  body.read-only-view-from-record .fb-input-with-units {
    border: none !important;
    background-color: transparent !important;
    gap: 0.25rem;
  }

  body.read-only-view-from-record .fb-input-with-units .unit-label {
    border-left: none !important;
    font-weight: 500 !important;
    padding-left: 0 !important;
  }

  body.read-only-view-from-record tr td[colspan="5"] {
    display: none !important;
  }

  /* Hide unit separators and borders */
  body.read-only-view .fb-input-with-units {
    border: none !important;
    background-color: transparent !important;
    gap: 0.25rem;
  }

  body.read-only-view .fb-input-with-units .unit-label {
    border-left: none !important;
    font-weight: 500 !important;
    padding-left: 0 !important;
  }

  /* Hide elements in read-only view */
  /* Hide "Enter at least one procedure" row */
  body.read-only-view tr td[colspan="5"] {
    display: none !important;
  }

`;
if (!document.querySelector('style[data-form-styles]')) {
  styleSheet.setAttribute('data-form-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default function App() {
  return <RouterProvider router={router} />;
}
