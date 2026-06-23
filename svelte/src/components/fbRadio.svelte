<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FbToolTip from './fbToolTip.svelte';
  export let name = '';
  export let value = '';
  export let checked = false;
  export let label = '';
  export let required = false;
  export let requiredForAudit = false;
  export let tooltip = '';
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};
  const dispatch = createEventDispatcher<{ change: string }>();

  function emitValue() {
    onChange(value);
    change(value);
    dispatch('change', value);
  }
</script>

<div class="fb-subquestion-wrapper">
  <FbToolTip text={tooltip} as="label" className="fb-radio-checkbox-item">
    <input
      type="radio"
      {name}
      {value}
      checked={checked}
      onchange={emitValue}
    />
    <span class="choice-label">{label}{#if requiredForAudit}<span class="fb-required-for-audit">RfA</span>{/if}{#if required}<span class="required">*</span>{/if}</span>
  </FbToolTip>
  {#if checked}
    <div class="fb-subquestion-wrapper"><slot /></div>
  {/if}
</div>

<style>
  .fb-subquestion-wrapper {
    padding: 0;
  }

  :global(.fb-radio-checkbox-item) {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    width: 100%;
    padding: 0 0.2rem;
    margin: 0;
    border-radius: 0.4rem;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.2;
    user-select: none;
  }

  input {
    margin: 0;
  }

  .choice-label {
    font-weight: 300;
  }

  .fb-required-for-audit {
    display: inline-block;
    margin-left: 0.1rem;
    padding: 0.05rem 0.2rem;
    background: var(--fb-orange);
    color: white;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }

  .required {
    margin-left: 0.1rem;
    color: var(--fb-red);
    font-weight: 500;
  }

  .fb-subquestion-wrapper .fb-subquestion-wrapper {
    padding-left: 1.5rem;
  }
</style>
