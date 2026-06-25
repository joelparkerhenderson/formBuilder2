<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';
  import { parseServerResponse } from '../lib/shadesOfPaleParser';

  export let id = '';
  export let name = '';
  export let label = '';
  export let value = '';
  export let required = false;
  export let requiredForAudit = false;
  export let coded: boolean | undefined = undefined;
  export let valueError = '';
  export let tooltip = '';
  export let subfield = false;
  export let onChange: (value: string, coded: boolean) => void = () => {};
  export let change: (value: string, coded: boolean) => void = () => {};

  type StaffResult = {
    display?: string;
    name?: string;
    fullName?: string;
    id?: string;
    code?: string;
    jobTitle?: string;
    specialty?: string;
  };

  const dispatch = createEventDispatcher<{ change: { value: string; coded: boolean } }>();

  let searchText = value;
  let localCoded = Boolean(value);
  let isOpen = false;
  let isSearching = false;
  let error = '';
  let results: StaffResult[] = [];
  let searchTimer: number | undefined;
  let blurTimer: number | undefined;

  $: if (value !== searchText && !isOpen) {
    searchText = value || '';
    localCoded = Boolean(value);
  }

  function displayFor(result: StaffResult) {
    return result.display || result.name || result.fullName || (result as any).ie?.line || result.id || result.code || '';
  }

  function detailFor(result: StaffResult) {
    return [result.jobTitle, result.specialty, result.code || result.id].filter(Boolean).join(' - ');
  }

  async function searchStaff(term: string) {
    const trimmed = term.trim();
    if (trimmed.length < 1) {
      results = [];
      isOpen = false;
      return;
    }

    try {
      isSearching = true;
      isOpen = true;
      error = '';
      const response = await fetch(`https://www.shadesofpale.net/MSISearch?st=${encodeURIComponent(trimmed)}`, {
        headers: { Authorization: `Basic ${btoa('dhcw:dhcw')}` },
      });
      const text = await response.text();
      const parsed = parseServerResponse(text);
      results = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.results) ? parsed.results : [];
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      results = [];
    } finally {
      isSearching = false;
    }
  }

  function queueSearch() {
    localCoded = false;
    isOpen = searchText.trim().length > 0;
    onChange(searchText, false);
    change(searchText, false);
    dispatch('change', { value: searchText, coded: false });
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => searchStaff(searchText), 250);
  }

  function selectResult(result: StaffResult) {
    searchText = displayFor(result);
    localCoded = true;
    isOpen = false;
    onChange(searchText, true);
    change(searchText, true);
    dispatch('change', { value: searchText, coded: true });
  }

  function clearValue() {
    searchText = '';
    localCoded = false;
    results = [];
    onChange('', false);
    change('', false);
    dispatch('change', { value: '', coded: false });
  }

  function toggleOpen() {
    isOpen = !isOpen;
    if (isOpen) searchStaff(searchText);
  }

  function closeAfterBlur() {
    window.clearTimeout(blurTimer);
    blurTimer = window.setTimeout(() => (isOpen = false), 200);
  }

  $: effectiveCoded = coded !== undefined ? coded : localCoded;
</script>

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} {valueError} {tooltip} {subfield}>
    <div class="fb-selector">
      <div class="fb-selector-input-wrap">
        <input
          {id}
          {name}
          bind:value={searchText}
          placeholder="Type to search staff index"
          autocomplete="off"
          onfocus={() => { window.clearTimeout(blurTimer); isOpen = true; }}
          oninput={queueSearch}
          onblur={closeAfterBlur}
        />
        <div class="fb-selector-actions">
          {#if searchText}
            <button type="button" class="fb-selector-button fb-clear" aria-label="Clear" onmousedown={(event) => event.preventDefault()} onclick={clearValue}>✕</button>
          {/if}
          <button type="button" class="fb-selector-button fb-arrow" aria-label="Search" onmousedown={(event) => event.preventDefault()} onclick={toggleOpen}>{isOpen ? '▲' : '▼'}</button>
        </div>
      </div>
      {#if searchText}
        <span class="material-icons fb-coded-icon" class:coded={effectiveCoded} aria-hidden="true">{effectiveCoded ? 'check_circle_outline' : 'warning'}</span>
      {/if}
      {#if isOpen}
        <div class="fb-selector-popup">
          {#if isSearching && results.length === 0}
            <div class="fb-selector-empty">Searching...</div>
          {:else if error}
            <div class="fb-selector-empty">Search unavailable</div>
          {:else if results.length === 0}
            <div class="fb-selector-empty">No matches</div>
          {:else}
            {#each results as result}
              <button type="button" class="fb-selector-result" onclick={() => selectResult(result)}>
                <span>{displayFor(result)}</span>
                {#if detailFor(result)}<small>{detailFor(result)}</small>{/if}
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  </FbQuestion>
{:else}
  <FbQuestion label="" {required} {requiredForAudit} {subfield}>
  <div class="fb-selector">
    <div class="fb-selector-input-wrap">
      <input
        {id}
        {name}
        bind:value={searchText}
        placeholder="Type to search staff index"
        autocomplete="off"
        onfocus={() => { window.clearTimeout(blurTimer); isOpen = true; }}
        oninput={queueSearch}
        onblur={closeAfterBlur}
      />
      <div class="fb-selector-actions">
        {#if searchText}
          <button type="button" class="fb-selector-button fb-clear" aria-label="Clear" onmousedown={(event) => event.preventDefault()} onclick={clearValue}>✕</button>
        {/if}
        <button type="button" class="fb-selector-button fb-arrow" aria-label="Search" onmousedown={(event) => event.preventDefault()} onclick={toggleOpen}>{isOpen ? '▲' : '▼'}</button>
      </div>
    </div>
    {#if searchText}
      <span class="material-icons fb-coded-icon" class:coded={effectiveCoded} aria-hidden="true">{effectiveCoded ? 'check_circle_outline' : 'warning'}</span>
    {/if}
    {#if isOpen}
      <div class="fb-selector-popup">
        {#if isSearching && results.length === 0}
          <div class="fb-selector-empty">Searching...</div>
        {:else if error}
          <div class="fb-selector-empty">Search unavailable</div>
        {:else if results.length === 0}
          <div class="fb-selector-empty">No matches</div>
        {:else}
          {#each results as result}
            <button type="button" class="fb-selector-result" onclick={() => selectResult(result)}>
              <span>{displayFor(result)}</span>
              {#if detailFor(result)}<small>{detailFor(result)}</small>{/if}
            </button>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
  </FbQuestion>
{/if}

<style>
  .fb-selector {
    position: relative;
    display: flex;
    gap: 0.3rem;
    align-items: center;
    width: 100%;
    max-width: 30rem;
  }

  .fb-selector-input-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  input {
    width: 100%;
    height: 2rem;
    min-width: 0;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.2rem 2.5rem 0.2rem 0.4rem;
    font-size: 1rem;
    font-weight: 400;
    box-sizing: border-box;
  }

  input::placeholder {
    color: #777;
    font-weight: 400;
    opacity: 1;
  }

  .fb-selector-actions {
    position: absolute;
    right: 0.2rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 0.1rem;
    align-items: center;
  }

  .fb-selector-button {
    border: none;
    background: none;
    color: #666;
    cursor: pointer;
    line-height: 1;
    padding: 0.1rem;
  }

  .fb-clear {
    font-size: 0.9rem;
  }

  .fb-arrow {
    font-size: 1rem;
  }

  .fb-coded-icon {
    color: #fd8a10;
    font-size: 1.2rem;
    text-align: center;
  }

  .fb-coded-icon.coded {
    color: #008000;
  }

  .fb-selector-popup {
    position: absolute;
    z-index: 50;
    top: 2.1rem;
    left: 0;
    width: 45rem;
    max-width: 100vw;
    max-height: 16rem;
    overflow: auto;
    border: 0.1rem solid silver;
    background: white;
    box-shadow: 0 0.2rem 0.5rem rgb(0 0 0 / 20%);
  }

  .fb-selector-result,
  .fb-selector-empty {
    display: block;
    width: 100%;
    padding: 0.35rem 0.5rem;
    border: none;
    border-bottom: 0.1rem solid #eee;
    background: white;
    color: #111;
    text-align: left;
    font-size: 0.95rem;
  }

  .fb-selector-result {
    cursor: pointer;
  }

  .fb-selector-result:hover,
  .fb-selector-result:focus {
    background: #ffffcc;
  }

  small {
    display: block;
    color: #555;
    font-size: 0.75rem;
  }
</style>
