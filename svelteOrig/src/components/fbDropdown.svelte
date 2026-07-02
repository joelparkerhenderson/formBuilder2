<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';

  export let id = '';
  export let name = '';
  export let label = '';
  export let value = '';
  export let required = false;
  export let requiredForAudit = false;
  export let placeholder = '';
  export let options: Array<{ value: string; label: string }> = [];
  export let valueError = '';
  export let tooltip = '';
  export let subfield = false;
  export let noWidthConstraint = false;
  export let fullWidth = false;
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};

  const dispatch = createEventDispatcher<{ change: string }>();

  function emitValue() {
    onChange(value);
    change(value);
    dispatch('change', value);
  }
</script>

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} {subfield} {valueError} {tooltip}>
    <select
      {id}
      {name}
      bind:value
      class:unconstrained={noWidthConstraint || fullWidth}
      onchange={emitValue}
    >
      {#if placeholder}
        <option value="">{placeholder}</option>
      {/if}
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    <slot selectedValue={value} />
  </FbQuestion>
{:else}
  <FbQuestion label="" {required} {requiredForAudit}>
    <select
      {id}
      {name}
      bind:value
      class:unconstrained={noWidthConstraint || fullWidth}
      onchange={emitValue}
    >
      {#if placeholder}
        <option value="">{placeholder}</option>
      {/if}
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    <slot selectedValue={value} />
  </FbQuestion>
{/if}

<style>
  select {
    width: 100%;
    max-width: 35rem;
    height: 2rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.2rem 0.4rem;
    font-size: 1rem;
  }

  select.unconstrained {
    max-width: none;
  }
</style>
