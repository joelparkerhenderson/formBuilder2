<script lang="ts">
  import FbQuestion from './fbQuestion.svelte';
  import { parseServerResponse } from '$lib/utils/shadesOfPaleParser';

  type StaffResult = {
    display?: string;
    name?: string;
    fullName?: string;
    id?: string;
    code?: string;
    jobTitle?: string;
    specialty?: string;
    ie?: { line?: string };
    nadexId?: string;
    NADEXId?: string;
  };

  let {
    id = '',
    name,
    label = '',
    value = $bindable(''),
    required = false,
    requiredForAudit = false,
    coded,
    valueError = '',
    subfield = false,
    placeholder = 'Type to search staff index',
    readonly = false,
    onChange,
    change
  }: {
    id?: string;
    name: string;
    label?: string;
    value?: string;
    required?: boolean;
    requiredForAudit?: boolean;
    coded?: boolean;
    valueError?: string;
    subfield?: boolean;
    placeholder?: string;
    readonly?: boolean;
    onChange?: (value: string, coded: boolean, nadexId?: string) => void;
    change?: (value: string, coded: boolean, nadexId?: string) => void;
  } = $props();

  let searchText = $state(value || '');
  let localCoded = $state(Boolean(value));
  let isOpen = $state(false);
  let isSearching = $state(false);
  let error = $state('');
  let results = $state<StaffResult[]>([]);
  let highlightedIndex = $state(-1);
  let selectorElement = $state<HTMLDivElement | undefined>();
  let popupTop = $state(0);
  let popupLeft = $state(0);
  let popupWidth = $state(0);
  let popupMaxHeight = $state(320);
  let scrollParents: Array<Window | HTMLElement> = [];
  let popupListenersAttached = false;
  let searchTimer: number | undefined = undefined;
  let blurTimer: number | undefined = undefined;

  const effectiveCoded = $derived(coded !== undefined ? coded : localCoded);
  const inputId = $derived(id || `${name}-msi-input`);
  const popupId = $derived(`${inputId}-results`);
  const activeOptionId = $derived(isOpen && highlightedIndex >= 0 ? `${popupId}-option-${highlightedIndex}` : undefined);

  $effect(() => {
    if (value !== searchText && !isOpen) {
      searchText = value || '';
      localCoded = Boolean(value);
    }
  });

  function displayFor(result: StaffResult) {
    return result.display || result.name || result.fullName || result.ie?.line || result.id || result.code || '';
  }

  function nadexIdFor(result: StaffResult) {
    const direct = result.id || result.code || result.nadexId || result.NADEXId || '';
    if (direct) return direct;
    const line = displayFor(result);
    const nadexMatch = line.match(/\bNADEX\s*:?\s*([A-Za-z0-9._-]+)/i);
    if (nadexMatch) return nadexMatch[1];
    const bracketedId = line.match(/\(([A-Za-z]{1,6}\d{2,})\)/);
    return bracketedId ? bracketedId[1] : '';
  }

  function detailFor(result: StaffResult) {
    return [result.jobTitle, result.specialty, result.code || result.id].filter(Boolean).join(' - ');
  }

  function emit(nextValue: string, nextCoded: boolean, nadexId = '') {
    value = nextValue;
    onChange?.(nextValue, nextCoded, nadexId);
    change?.(nextValue, nextCoded, nadexId);
  }

  function updatePopupPosition() {
    if (!selectorElement) return;
    const rect = selectorElement.getBoundingClientRect();
    const edgeGap = 12;
    const preferredWidth = 45 * 16;
    const preferredHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom - edgeGap;
    const spaceAbove = rect.top - edgeGap;
    popupWidth = Math.min(preferredWidth, Math.max(rect.width, window.innerWidth - (edgeGap * 2)));
    popupMaxHeight = Math.min(preferredHeight, Math.max(120, spaceBelow >= spaceAbove ? spaceBelow : spaceAbove));
    popupTop = spaceBelow >= preferredHeight || spaceBelow >= spaceAbove ? rect.bottom + 2 : Math.max(edgeGap, rect.top - popupMaxHeight - 2);
    popupLeft = Math.min(rect.left, window.innerWidth - popupWidth - edgeGap);
    if (popupLeft < edgeGap) popupLeft = edgeGap;
  }

  function collectScrollParents(element: HTMLElement) {
    const parents: Array<Window | HTMLElement> = [window];
    let current = element.parentElement;
    while (current) {
      const style = window.getComputedStyle(current);
      if (/(auto|scroll|overlay)/.test(`${style.overflow}${style.overflowY}${style.overflowX}`)) parents.push(current);
      current = current.parentElement;
    }
    return parents;
  }

  function attachPopupListeners() {
    if (popupListenersAttached || !selectorElement) return;
    scrollParents = collectScrollParents(selectorElement);
    for (const parent of scrollParents) parent.addEventListener('scroll', updatePopupPosition, { passive: true });
    window.addEventListener('resize', updatePopupPosition);
    popupListenersAttached = true;
  }

  function detachPopupListeners() {
    if (!popupListenersAttached) return;
    for (const parent of scrollParents) parent.removeEventListener('scroll', updatePopupPosition);
    window.removeEventListener('resize', updatePopupPosition);
    scrollParents = [];
    popupListenersAttached = false;
  }

  $effect(() => {
    if (isOpen) {
      updatePopupPosition();
      attachPopupListeners();
    } else {
      detachPopupListeners();
    }
  });

  async function searchStaff(term: string) {
    if (readonly) return;
    const trimmed = term.trim();
    if (trimmed.length < 1) {
      results = [];
      isOpen = false;
      return;
    }

    try {
      isSearching = true;
      isOpen = true;
      updatePopupPosition();
      error = '';
      const response = await fetch(`https://www.shadesofpale.net/MSISearch?st=${encodeURIComponent(trimmed)}`, {
        headers: { Authorization: `Basic ${btoa('dhcw:dhcw')}` }
      });
      const text = await response.text();
      const parsed = parseServerResponse(text) as unknown;
      results = Array.isArray(parsed)
        ? parsed as StaffResult[]
        : Array.isArray((parsed as { results?: unknown[] })?.results)
          ? (parsed as { results: StaffResult[] }).results
          : [];
      highlightedIndex = results.length ? 0 : -1;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      results = [];
    } finally {
      isSearching = false;
    }
  }

  function queueSearch() {
    if (readonly) return;
    localCoded = false;
    isOpen = searchText.trim().length > 0;
    emit(searchText, false, '');
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => searchStaff(searchText), 250);
  }

  function selectResult(result: StaffResult) {
    if (readonly) return;
    const nextValue = displayFor(result);
    const nadexId = nadexIdFor(result);
    searchText = nextValue;
    localCoded = true;
    isOpen = false;
    highlightedIndex = -1;
    emit(nextValue, true, nadexId);
  }

  function clearValue() {
    if (readonly) return;
    searchText = '';
    localCoded = false;
    results = [];
    highlightedIndex = -1;
    emit('', false, '');
  }

  function toggleOpen() {
    if (readonly) return;
    isOpen = !isOpen;
    if (isOpen) searchStaff(searchText);
  }

  function closeAfterBlur() {
    window.clearTimeout(blurTimer);
    blurTimer = window.setTimeout(() => isOpen = false, 200);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (readonly) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        isOpen = true;
        updatePopupPosition();
        if (searchText.trim()) searchStaff(searchText);
      }
      highlightedIndex = results.length ? Math.min(highlightedIndex + 1, results.length - 1) : -1;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        isOpen = true;
        updatePopupPosition();
      }
      highlightedIndex = results.length ? Math.max(highlightedIndex - 1, 0) : -1;
    } else if (event.key === 'Enter' && isOpen && highlightedIndex >= 0 && results[highlightedIndex]) {
      event.preventDefault();
      selectResult(results[highlightedIndex]);
    } else if (event.key === 'Escape') {
      isOpen = false;
      highlightedIndex = -1;
    }
  }
</script>

{#snippet selectorControl()}
  <div class="fb-selector" bind:this={selectorElement}>
    <div class="fb-selector-input-wrap">
      <input
        id={inputId}
        {name}
        bind:value={searchText}
        {placeholder}
        autocomplete="off"
        {readonly}
        onfocus={() => { if (!readonly) { window.clearTimeout(blurTimer); isOpen = true; updatePopupPosition(); } }}
        oninput={queueSearch}
        onkeydown={handleKeydown}
        onblur={closeAfterBlur}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen && !readonly}
        aria-controls={popupId}
        aria-activedescendant={activeOptionId}
        data-lily-reference-component="combobox"
      />
      <div class="fb-selector-actions">
        {#if searchText && !readonly}
          <button type="button" class="fb-selector-button fb-clear" aria-label="Clear" onmousedown={(event) => event.preventDefault()} onclick={clearValue}>{'\u2715'}</button>
        {/if}
        {#if !readonly}
          <button type="button" class="fb-selector-button fb-arrow" aria-label="Search" onmousedown={(event) => event.preventDefault()} onclick={toggleOpen}>{isOpen ? '\u25b2' : '\u25bc'}</button>
        {/if}
      </div>
    </div>
    {#if searchText}
      <span class="material-icons fb-coded-icon" class:coded={effectiveCoded} aria-hidden="true">{effectiveCoded ? 'check_circle_outline' : 'warning'}</span>
    {/if}
    {#if isOpen && !readonly}
      <div id={popupId} class="fb-selector-popup" style={`top: ${popupTop}px; left: ${popupLeft}px; width: ${popupWidth}px; max-height: ${popupMaxHeight}px;`} role="listbox">
        {#if isSearching && results.length === 0}
          <div class="fb-selector-empty">Searching...</div>
        {:else if error}
          <div class="fb-selector-empty">Search unavailable</div>
        {:else if results.length === 0}
          <div class="fb-selector-empty">No matches</div>
        {:else}
          {#each results as result, index}
            <button type="button" id={`${popupId}-option-${index}`} class="fb-selector-result" class:highlighted={highlightedIndex === index} role="option" aria-selected={highlightedIndex === index} onmouseenter={() => highlightedIndex = index} onclick={() => selectResult(result)}>
              <span>{displayFor(result)}</span>
              {#if detailFor(result)}<small>{detailFor(result)}</small>{/if}
            </button>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} {valueError} {subfield}>
    {@render selectorControl()}
  </FbQuestion>
{:else}
  {@render selectorControl()}
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

  .fb-selector-actions {
    position: absolute;
    right: 0.2rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 0.1rem;
  }

  .fb-selector-button {
    border: 0;
    background: transparent;
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
  }

  .fb-coded-icon.coded {
    color: #008000;
  }

  .fb-selector-popup {
    position: fixed;
    z-index: 10000;
    overflow-y: auto;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background: white;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  }

  .fb-selector-empty {
    padding: 0.5rem;
    color: #666;
  }

  .fb-selector-result {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 0;
    background: white;
    cursor: pointer;
    padding: 0.4rem 0.5rem;
    text-align: left;
    font-family: 'Roboto', sans-serif;
  }

  .fb-selector-result:hover,
  .fb-selector-result:focus,
  .fb-selector-result.highlighted {
    background: #ffffcc;
  }

  small {
    color: #666;
    font-size: 0.75rem;
  }
</style>
