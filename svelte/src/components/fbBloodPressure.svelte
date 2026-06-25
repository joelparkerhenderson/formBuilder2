<script lang="ts">
  import FbQuestion from './fbQuestion.svelte';

  export let id = '';
  export let name = '';
  export let label = '';
  export let systolic: string | number = '';
  export let diastolic: string | number = '';
  export let required = false;
  export let requiredForAudit = false;
  export let valueError = '';
  export let tooltip = '';
  export let subfield = false;
  export let onChange: (value: { systolic: string; diastolic: string }) => void = () => {};

  $: controlName = name || id || 'blood-pressure';

  function setSystolic(nextValue: string) {
    systolic = nextValue;
    onChange({ systolic: nextValue, diastolic: String(diastolic ?? '') });
  }

  function setDiastolic(nextValue: string) {
    diastolic = nextValue;
    onChange({ systolic: String(systolic ?? ''), diastolic: nextValue });
  }
</script>

<FbQuestion {label} {required} {requiredForAudit} {valueError} {tooltip} {subfield}>
  <div class="fb-blood-pressure-control">
    <input
      class="fb-blood-pressure-input"
      id={id ? `${id}-systolic` : undefined}
      name={`${controlName}_systolic`}
      type="number"
      value={systolic}
      required={required}
      aria-label={label ? `${label} systolic` : 'Systolic blood pressure'}
      oninput={(event) => setSystolic((event.currentTarget as HTMLInputElement).value)}
    />
    <span class="unit" aria-hidden="true">mmHg</span>
    <span class="separator" aria-hidden="true"></span>
    <input
      class="fb-blood-pressure-input"
      id={id ? `${id}-diastolic` : undefined}
      name={`${controlName}_diastolic`}
      type="number"
      value={diastolic}
      required={required}
      aria-label={label ? `${label} diastolic` : 'Diastolic blood pressure'}
      oninput={(event) => setDiastolic((event.currentTarget as HTMLInputElement).value)}
    />
  </div>
</FbQuestion>

<style>
  .fb-blood-pressure-control {
    display: inline-grid;
    grid-template-columns: 4.5ch auto;
    grid-template-rows: 1.4rem 0.2rem 1.4rem;
    column-gap: 0.5rem;
    align-items: center;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background: white;
    padding: 0.2rem;
    box-sizing: border-box;
  }

  input,
  input:focus,
  input:focus-visible {
    width: 4.5ch;
    height: 1.4rem;
    border: none !important;
    border-radius: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    padding: 0;
    text-align: center;
    box-sizing: border-box;
    background: white !important;
  }

  .unit {
    grid-column: 2;
    grid-row: 1 / 4;
    align-self: center;
    font-size: 0.8rem;
    font-weight: 400;
  }

  .separator {
    grid-column: 1;
    grid-row: 2;
    height: 0.2rem;
    background: silver;
  }
</style>
