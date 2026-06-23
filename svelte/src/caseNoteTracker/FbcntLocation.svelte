<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import FbQuestion from '../components/fbQuestion.svelte';
  import FbToolTip from '../components/fbToolTip.svelte';
  import type { CntLocation, CntStore } from './cntStore';
  import { locationLabel } from './cntStore';

  export let label = '';
  export let store: CntStore;
  export let value = '';
  export let onChange: (value: string) => void = () => {};
  export let allowBlank = false;

  let searchTerm = '';
  let showDropdown = false;
  let highlightedIndex = -1;
  let inputWrap: HTMLDivElement | undefined;
  let openAbove = false;
  let maxHeight = 300;

  $: selectedLabel = store ? locationLabel(store, value) : '';
  $: if (!showDropdown && searchTerm !== selectedLabel) searchTerm = selectedLabel;
  $: results = locationResults(store, searchTerm);
  $: selected = store?.locations.find((location) => location.uuid === value);
  $: coded = !searchTerm.trim() ? allowBlank : !!selected && searchTerm === selectedLabel;

  function locationResults(storeValue: CntStore, termValue: string) {
    const term = termValue.trim().toLowerCase();
    return storeValue.locations
      .map((location) => ({ location, label: locationLabel(storeValue, location.uuid) }))
      .filter((item) => !term || item.label.toLowerCase().includes(term) || item.location.code.toLowerCase().includes(term))
      .slice(0, 50);
  }

  function updateDropdownPosition() {
    if (!inputWrap) return;
    const rect = inputWrap.getBoundingClientRect();
    const preferredHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom - 20;
    const spaceAbove = rect.top - 20;
    maxHeight = Math.min(preferredHeight, Math.max(120, spaceBelow >= spaceAbove ? spaceBelow : spaceAbove));
    openAbove = !(spaceBelow >= preferredHeight || spaceBelow >= spaceAbove);
  }

  async function openDropdown() {
    showDropdown = true;
    await tick();
    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
  }

  function closeDropdown() {
    showDropdown = false;
    highlightedIndex = -1;
    window.removeEventListener('resize', updateDropdownPosition);
    window.removeEventListener('scroll', updateDropdownPosition, true);
  }

  onDestroy(closeDropdown);

  function selectLocation(location: CntLocation) {
    searchTerm = locationLabel(store, location.uuid);
    onChange(location.uuid);
    closeDropdown();
  }

  function clear() {
    searchTerm = '';
    if (allowBlank) onChange('');
    closeDropdown();
  }

  function handleInput(event: Event) {
    searchTerm = (event.currentTarget as HTMLInputElement).value;
    onChange('');
    highlightedIndex = -1;
    openDropdown();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeDropdown();
      return;
    }
    if (!showDropdown || !results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlightedIndex = Math.min(highlightedIndex + 1, results.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
    } else if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      selectLocation(results[highlightedIndex].location);
    }
  }
</script>

<FbQuestion {label}>
  <div class="control-row">
    <div class="input-wrap" bind:this={inputWrap}>
      <input
        type="text"
        value={searchTerm}
        oninput={handleInput}
        onfocus={openDropdown}
        onblur={() => window.setTimeout(closeDropdown, 150)}
        onkeydown={handleKeydown}
        placeholder="Type to search locations"
        autocomplete="off"
      />
      <div class="input-buttons">
        {#if searchTerm}
          <button type="button" class="icon-button" onmousedown={(event) => event.preventDefault()} onclick={clear}>✕</button>
        {/if}
        <button
          type="button"
          class="toggle-button"
          onmousedown={(event) => event.preventDefault()}
          onclick={() => showDropdown ? closeDropdown() : openDropdown()}
        >{showDropdown ? '▲' : '▼'}</button>
      </div>
      {#if showDropdown && results.length}
        <div class="dropdown" class:open-above={openAbove} style={`max-height: ${maxHeight}px`}>
          {#each results as result, index (result.location.uuid)}
            <div
              class="result"
              class:highlighted={highlightedIndex === index}
              onmousedown={() => selectLocation(result.location)}
              onmouseenter={() => highlightedIndex = index}
            >
              <div>{result.label}</div>
              <div class="result-code">{result.location.code}</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    {#if searchTerm && coded}
      <FbToolTip as="span" className="material-icons coded-icon" text="Coded" tabindex={0}>check_circle_outline</FbToolTip>
    {:else if searchTerm && !coded}
      <FbToolTip as="span" className="material-icons warning-icon" text="Not coded" tabindex={0}>warning</FbToolTip>
    {/if}
  </div>
</FbQuestion>

<style>
  .control-row { display: flex; align-items: center; width: 100%; gap: 0.3rem; }
  .input-wrap { position: relative; flex: 1; }
  input {
    width: 100%;
    height: 2rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.35rem 2.5rem 0.35rem 0.45rem;
    box-sizing: border-box;
    background-color: white;
    font-family: 'Roboto', sans-serif;
  }
  .input-buttons {
    position: absolute;
    right: 0.2rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 0.1rem;
  }
  .icon-button,
  .toggle-button {
    border: 0;
    background: transparent;
    color: #666;
    cursor: pointer;
    padding: 0.1rem;
    line-height: 1;
  }
  .icon-button { font-size: 0.9rem; }
  .toggle-button { font-size: 1rem; }
  .dropdown {
    position: absolute;
    left: 0;
    top: calc(100% + 0.2rem);
    width: 45rem;
    max-width: calc(100vw - 40px);
    overflow-y: auto;
    overflow-x: auto;
    background-color: white;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  .dropdown.open-above {
    top: auto;
    bottom: calc(100% + 0.2rem);
  }
  .result {
    padding: 0.125rem 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    line-height: 1.1;
    white-space: nowrap;
  }
  .result.highlighted,
  .result:hover {
    background-color: #ffffcc;
  }
  .result-code { font-size: 0.75rem; color: #555; }
  :global(.coded-icon) { color: #008000; font-size: 1.2rem; }
  :global(.warning-icon) { color: #fd8a10; font-size: 1.2rem; }
</style>
