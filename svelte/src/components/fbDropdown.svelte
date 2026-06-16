<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';

  export let id = '';
  export let name = '';
  export let label = '';
  export let value = '';
  export let required = false;
  export let placeholder = '';
  export let options: Array<{ value: string; label: string }> = [];
  export let valueError = '';
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

{#if label}
  <FbQuestion {label} {required} {valueError} {tooltip}>
    <select
      {id}
      {name}
      bind:value
      onchange={emitValue}
    >
      {#if placeholder}
        <option value="">{placeholder}</option>
      {/if}
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </FbQuestion>
{:else}
  <select
    {id}
    {name}
    bind:value
    onchange={emitValue}
  >
    {#if placeholder}
      <option value="">{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
{/if}

<style>
  select {
    width: 100%;
    max-width: 24rem;
    height: 2rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.2rem 0.4rem;
    font-size: 1rem;
  }
</style>
