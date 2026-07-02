<script lang="ts">
  import { onMount } from 'svelte';

  export let id = '';
  export let label = 'Search for';
  export let value = '';
  export let placeholder = '';
  export let autoFocus = false;
  export let onChange: (value: string) => void = () => {};
  let inputElement: HTMLInputElement;

  function emitValue(nextValue: string) {
    value = nextValue;
    onChange(value);
  }

  onMount(() => {
    if (autoFocus) inputElement?.focus();
  });
</script>

<label class="fb-search-input" for={id}>
  <span>{label}</span>
  <input
    {id}
    bind:this={inputElement}
    type="search"
    bind:value
    {placeholder}
    oninput={(event) => emitValue((event.currentTarget as HTMLInputElement).value)}
  />
</label>

<style>
  .fb-search-input {
    display: grid;
    grid-template-columns: max-content 1fr;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    font-size: 1rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    height: 2rem;
    padding: 0 0.5rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    font-size: 1rem;
    font-weight: 300;
    box-sizing: border-box;
  }

  input:hover,
  input:focus {
    background: var(--fb-active-darker-yellow);
    outline: none;
  }
</style>
