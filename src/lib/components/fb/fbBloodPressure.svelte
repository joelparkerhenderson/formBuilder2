<script lang="ts">
  import FbQuestion from './fbQuestion.svelte';

  let {
    label,
    systolic = $bindable(''),
    diastolic = $bindable(''),
    required = false,
    requiredForAudit = false,
    id,
    name,
    class: className = '',
    valueError = '',
    subfield = false,
    onChange
  }: {
    label?: string;
    systolic?: string | number;
    diastolic?: string | number;
    required?: boolean;
    requiredForAudit?: boolean;
    id?: string;
    name?: string;
    class?: string;
    valueError?: string;
    subfield?: boolean;
    onChange?: (value: { systolic: string; diastolic: string }) => void;
  } = $props();

  const systolicId = $derived(id ? `${id}-systolic` : undefined);
  const diastolicId = $derived(id ? `${id}-diastolic` : undefined);
  const controlName = $derived(name || id || 'blood-pressure');

  function emit() {
    onChange?.({ systolic: String(systolic ?? ''), diastolic: String(diastolic ?? '') });
  }
</script>

{#snippet control()}
  <div class="fb-blood-pressure-control">
    <input
      class="fb-blood-pressure-input"
      id={systolicId}
      name={`${controlName}_systolic`}
      type="number"
      bind:value={systolic}
      oninput={emit}
      {required}
      aria-label={label ? `${label} systolic` : 'Systolic blood pressure'}
    />
    <div class="fb-blood-pressure-units" aria-hidden="true">mmHg</div>
    <div class="fb-blood-pressure-divider" aria-hidden="true"></div>
    <input
      class="fb-blood-pressure-input"
      id={diastolicId}
      name={`${controlName}_diastolic`}
      type="number"
      bind:value={diastolic}
      oninput={emit}
      {required}
      aria-label={label ? `${label} diastolic` : 'Diastolic blood pressure'}
    />
  </div>
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} class={className} {subfield} {valueError}>
    {@render control()}
  </FbQuestion>
{:else}
  {@render control()}
{/if}

<style>
  .fb-blood-pressure-control {
    display: inline-grid;
    grid-template-columns: 4.5ch auto;
    grid-template-rows: 1.4rem 0.2rem 1.4rem;
    column-gap: 0.5rem;
    align-items: center;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background-color: white;
    padding: 0.2rem;
    box-sizing: border-box;
  }

  .fb-blood-pressure-input {
    width: 4.5ch;
    height: 1.4rem;
    border: none;
    border-width: 0;
    border-radius: 0;
    padding: 0;
    text-align: center;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    background-color: white;
    box-sizing: border-box;
    outline: none;
    box-shadow: none;
  }

  .fb-blood-pressure-units {
    grid-column: 2;
    grid-row: 1 / 4;
    align-self: center;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    font-size: 0.8rem;
    font-weight: 400;
    color: black;
  }

  .fb-blood-pressure-divider {
    grid-column: 1;
    grid-row: 2;
    height: 0.2rem;
    background-color: silver;
  }
</style>
