<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';

  export let id = '';
  export let name = '';
  export let label = '';
  export let value: number | string = '';
  export let units = '';
  export let placeholder = '';
  export let min: number | undefined = undefined;
  export let required = false;
  export let readonly = false;
  export let subfield = false;
  export let valueError = '';
  export let tooltip = '';
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};
  export let unitEditable = false;
  export let onUnitBlur: (value: string) => void = () => {};
  export let onUnitFocus: () => void = () => {};
  export let onUnitClick: (event: MouseEvent) => void = () => {};

  const dispatch = createEventDispatcher<{ change: string }>();

  function emitValue(nextValue: string) {
    value = nextValue;
    onChange(nextValue);
    change(nextValue);
    dispatch('change', nextValue);
  }
</script>

<FbQuestion {label} {required} {subfield} {tooltip} valueError={valueError || (value !== '' && Number.isNaN(Number(value)) ? 'Enter a number' : '')}>
    <span class="fb-number-input-with-units">
    <input
      class="fb-number-input-with-units-input"
      type="number"
      {id}
      {name}
      {min}
      {required}
      {readonly}
      {placeholder}
      value={value}
      oninput={(event) => emitValue((event.currentTarget as HTMLInputElement).value)}
    />
    {#if units}
      <span
        class="units"
        class:editable={unitEditable}
        contenteditable={unitEditable}
        role={unitEditable ? 'textbox' : undefined}
        onclick={(event) => {
          if (unitEditable) onUnitClick(event);
        }}
        onfocus={() => {
          if (unitEditable) onUnitFocus();
        }}
        onblur={(event) => {
          if (unitEditable) onUnitBlur(event.currentTarget.textContent?.trim() || 'units');
        }}
        onkeydown={(event) => {
          if (unitEditable && event.key === 'Escape') event.currentTarget.blur();
        }}
      >{units}</span>
    {/if}
  </span>
</FbQuestion>

<style>
  .fb-number-input-with-units {
    display: inline-flex;
    align-items: center;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    height: 2rem;
    width: 100%;
    max-width: calc(10ch + 5rem);
    overflow: hidden;
    background: white;
    box-sizing: border-box;
  }

  input {
    width: 10ch;
    height: 100%;
    flex: 1;
    border: none !important;
    border-width: 0 !important;
    border-radius: 0 !important;
    padding: 0 0.5rem;
    box-sizing: border-box;
    font-size: 1rem;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
  }

  input:focus,
  input:focus-visible {
    border: none !important;
    border-width: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    outline: none !important;
  }

  .units {
    display: inline-flex;
    align-items: center;
    border-left: 0.1rem solid silver;
    height: 100%;
    padding: 0 0.6rem;
    background: #f5f5f5;
    color: #555;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 1rem;
    font-weight: 400;
    user-select: none;
  }

  .units.editable {
    cursor: text;
    outline: none;
    user-select: text;
  }
</style>
