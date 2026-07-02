<script lang="ts">
  import { onMount } from 'svelte';

  type Props = {
    id?: string;
    label?: string;
    value?: string;
    placeholder?: string;
    autoFocus?: boolean;
    subfield?: boolean;
    onChange?: (value: string) => void;
  };

  let {
    id = '',
    label = '',
    value = $bindable(''),
    placeholder = '',
    autoFocus = false,
    subfield = false,
    onChange = () => {}
  }: Props = $props();

  let inputElement: HTMLInputElement | undefined = $state();

  function emitValue(nextValue: string) {
    value = nextValue;
    onChange(nextValue);
  }

  function clearValue(event: MouseEvent) {
    event.preventDefault();
    emitValue('');
    inputElement?.focus();
  }

  onMount(() => {
    if (autoFocus) inputElement?.focus();
  });
</script>

{#if label}
  <label class="fb-search-input fb-question-container" class:fb-search-input-subfield={subfield} for={id}>
    <span class="fb-question-label">{label}</span>
    <span class="fb-search-input-control">
      <input
        bind:this={inputElement}
        {id}
        type="text"
        bind:value
        {placeholder}
        oninput={(event) => emitValue((event.currentTarget as HTMLInputElement).value)}
      />
      {#if value}
        <button type="button" class="fb-search-input-clear" onmousedown={clearValue} onclick={clearValue} aria-label="Clear search">x</button>
      {/if}
    </span>
  </label>
{:else}
  <span class="fb-search-input-control">
    <input
      bind:this={inputElement}
      {id}
      type="text"
      bind:value
      {placeholder}
      oninput={(event) => emitValue((event.currentTarget as HTMLInputElement).value)}
    />
    {#if value}
      <button type="button" class="fb-search-input-clear" onmousedown={clearValue} onclick={clearValue} aria-label="Clear search">x</button>
    {/if}
  </span>
{/if}

<style>
  .fb-search-input {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .fb-search-input-subfield .fb-question-label {
    font-weight: 300;
    font-size: 1rem;
  }

  .fb-question-label {
    font-weight: 500;
    font-size: 1rem;
  }

  .fb-search-input-control {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  input {
    width: 100%;
    height: 2rem;
    box-sizing: border-box;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.3rem 2.2rem 0.3rem 0.5rem;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    background: white;
    color: black;
  }

  .fb-search-input-clear {
    position: absolute;
    right: 0.5rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: silver;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
    padding: 0.1rem;
  }
</style>
