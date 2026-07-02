<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';
  import { matchSmartDropdownOptions, normaliseSmartDropdownOptions, type SmartDropdownOption } from '../lib/smartDropdown';

  export let id = '';
  export let name = '';
  export let label = '';
  export let value = '';
  export let options: Array<SmartDropdownOption | string> = [];
  export let required = false;
  export let requiredForAudit = false;
  export let placeholder = 'Type here to search';
  export let subfield = false;
  export let valueError = '';
  export let noWidthConstraint = false;
  export let fullWidth = false;
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};

  const dispatch = createEventDispatcher<{ change: string }>();
  let wrapper: HTMLDivElement;
  let inputValue = '';
  let open = false;
  $: listId = `${id || name || 'fb-smart-dropdown'}-list`;

  $: parsedOptions = normaliseSmartDropdownOptions(options);
  $: selected = parsedOptions.find((option) => option.value === value);
  $: if (!open) inputValue = selected?.label || value || '';
  $: matches = matchSmartDropdownOptions(parsedOptions, inputValue, 20);

  function emitValue(nextValue: string) {
    value = nextValue;
    onChange(nextValue);
    change(nextValue);
    dispatch('change', nextValue);
  }

  function choose(option: SmartDropdownOption) {
    inputValue = option.label;
    emitValue(option.value);
    open = false;
  }

  onMount(() => {
    const close = (event: PointerEvent) => {
      if (wrapper && event.target instanceof Node && !wrapper.contains(event.target)) open = false;
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  });
</script>

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} {subfield} {valueError}>
    <div class="fb-smart-dropdown" class:unconstrained={noWidthConstraint || fullWidth} bind:this={wrapper}>
      <input
        {id}
        {name}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        {placeholder}
        {required}
        value={inputValue}
        onfocus={() => (open = true)}
        oninput={(event) => {
          inputValue = (event.currentTarget as HTMLInputElement).value;
          emitValue(inputValue);
          open = true;
        }}
      />
      {#if open && matches.length > 0}
        <div id={listId} class="fb-smart-dropdown-list" role="listbox">
          {#each matches as option}
            <button type="button" role="option" aria-selected={option.value === value} class:selected={option.value === value} onmousedown={(event) => event.preventDefault()} onclick={() => choose(option)}>
              {option.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>
    <slot selectedValue={value} />
  </FbQuestion>
{:else}
  <div class="fb-smart-dropdown" class:unconstrained={noWidthConstraint || fullWidth} bind:this={wrapper}>
    <input
      {id}
      {name}
      type="text"
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-autocomplete="list"
      {placeholder}
      {required}
      value={inputValue}
      onfocus={() => (open = true)}
      oninput={(event) => {
        inputValue = (event.currentTarget as HTMLInputElement).value;
        emitValue(inputValue);
        open = true;
      }}
    />
    {#if open && matches.length > 0}
      <div id={listId} class="fb-smart-dropdown-list" role="listbox">
        {#each matches as option}
          <button type="button" role="option" aria-selected={option.value === value} class:selected={option.value === value} onmousedown={(event) => event.preventDefault()} onclick={() => choose(option)}>
            {option.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
  <slot selectedValue={value} />
{/if}

<style>
  .fb-smart-dropdown {
    position: relative;
    width: 100%;
    max-width: 35rem;
  }

  .fb-smart-dropdown.unconstrained {
    max-width: none;
  }

  input {
    width: 100%;
    height: 2rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-sizing: border-box;
    padding: 0.2rem 0.4rem;
    font-size: 1rem;
    font-weight: 400;
  }

  .fb-smart-dropdown-list {
    position: absolute;
    z-index: 1000;
    top: 2.1rem;
    left: 0;
    right: 0;
    max-height: 16rem;
    overflow-y: auto;
    background: white;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  }

  .fb-smart-dropdown-list button {
    display: block;
    width: 100%;
    border: 0;
    background: white;
    padding: 0.25rem 0.4rem;
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
  }

  .fb-smart-dropdown-list button:hover,
  .fb-smart-dropdown-list button:focus,
  .fb-smart-dropdown-list button.selected {
    background: var(--fb-active-lighter-yellow);
  }
</style>
