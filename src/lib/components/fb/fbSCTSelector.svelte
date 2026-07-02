<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';
  import { parseServerResponse } from '$lib/utils/shadesOfPaleParser';

  type SearchCommand = 'findProcedure' | 'findDisorder';
  type SelectorMode = 'procedure' | 'diagnosis';

  let {
    id = '',
    name = '',
    label = '',
    value = $bindable(''),
    required = false,
    requiredForAudit = false,
    coded,
    valueError = '',
    subfield = false,
    placeholder = 'Type to search SNOMED CT',
    searchCommand,
    mode,
    inputClassName = '',
    readonly = false,
    onChange,
    change
  }: {
    id?: string;
    name?: string;
    label?: string;
    value?: string;
    required?: boolean;
    requiredForAudit?: boolean;
    coded?: boolean;
    valueError?: string;
    subfield?: boolean;
    placeholder?: string;
    searchCommand: SearchCommand;
    mode: SelectorMode;
    inputClassName?: string;
    readonly?: boolean;
    onChange?: (value: string, coded: boolean) => void;
    change?: (value: string, coded: boolean) => void;
  } = $props();

  type ParsedSct = {
    orderedMatches?: unknown[];
    parents?: Array<{ pt?: string }>;
    children?: Array<{ pt?: string }>;
    synonyms?: string[];
    pt?: string;
    fst?: string;
    id?: string;
  };

  let searchText = $state(value || '');
  let localCoded = $state(Boolean(value));
  let isOpen = $state(false);
  let isSearching = $state(false);
  let error = $state('');
  let results = $state<string[]>([]);
  let fullData = $state<ParsedSct | null>(null);
  let highlightedIndex = $state(-1);
  let searchHistory = $state<string[]>([]);
  let historyIndex = $state(-1);
  let selectorElement = $state<HTMLDivElement | undefined>();
  let popupTop = $state(0);
  let popupLeft = $state(0);
  let popupMaxHeight = $state(300);
  let searchTimer: number | undefined = undefined;
  let blurTimer: number | undefined = undefined;
  let scrollParents: Array<Window | HTMLElement> = [];
  let popupListenersAttached = false;

  const effectiveCoded = $derived(coded !== undefined ? coded : localCoded);
  const selectableConcept = $derived(fullData?.pt || fullData?.fst || searchText);
  const inputId = $derived(id || `${name || mode}-sct-input`);
  const popupId = $derived(`${inputId}-results`);
  const activeOptionId = $derived(isOpen && highlightedIndex >= 0 ? `${popupId}-option-${highlightedIndex}` : undefined);

  $effect(() => {
    if (value !== searchText && !isOpen) {
      searchText = value || '';
      localCoded = Boolean(value);
    }
  });

  function updatePopupPosition() {
    if (!selectorElement) return;
    const rect = selectorElement.getBoundingClientRect();
    const preferredHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom - 20;
    const spaceAbove = rect.top - 20;
    const nextMaxHeight = Math.min(preferredHeight, Math.max(100, spaceBelow >= spaceAbove ? spaceBelow : spaceAbove));
    popupMaxHeight = nextMaxHeight;
    popupTop = spaceBelow >= preferredHeight || spaceBelow >= spaceAbove ? rect.bottom + 2 : rect.top - nextMaxHeight - 2;
    const width = Math.min(45 * 16, window.innerWidth - 40);
    const nextLeft = Math.min(rect.left, window.innerWidth - width - 20);
    popupLeft = nextLeft < 20 ? 20 : nextLeft;
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
      untrack(() => {
        updatePopupPosition();
        attachPopupListeners();
      });
    } else {
      detachPopupListeners();
    }
  });

  onDestroy(() => {
    window.clearTimeout(searchTimer);
    window.clearTimeout(blurTimer);
    detachPopupListeners();
  });

  function emit(nextValue: string, nextCoded: boolean) {
    onChange?.(nextValue, nextCoded);
    change?.(nextValue, nextCoded);
  }

  function matchText(item: unknown) {
    if (typeof item === 'string') return item;
    const record = item as { pt?: string; term?: string; display?: string };
    return record?.pt || record?.term || record?.display || '';
  }

  async function searchSct(term: string, addToHistory = true) {
    if (readonly) return;
    const trimmed = term.trim();
    if (trimmed.length < 1) {
      results = [];
      fullData = null;
      isOpen = false;
      return;
    }

    try {
      isSearching = true;
      isOpen = true;
      error = '';
      const url = `https://www.shadesofpale.net/SCTSearch?cmd=${searchCommand}&st=${encodeURIComponent(trimmed)}&count=30`;
      const response = await fetch(url);
      const text = await response.text();
      const parsed = parseServerResponse(text) as ParsedSct;
      const matches = parsed?.orderedMatches || [];
      results = Array.isArray(matches) ? matches.map(matchText).filter(Boolean) : [];
      fullData = parsed;
      highlightedIndex = -1;
      updatePopupPosition();
      if (addToHistory) {
        const nextHistory = searchHistory.slice(0, historyIndex + 1);
        if (nextHistory[nextHistory.length - 1] !== trimmed) {
          searchHistory = [...nextHistory, trimmed];
          historyIndex = searchHistory.length - 1;
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      results = [];
      fullData = null;
    } finally {
      isSearching = false;
    }
  }

  function queueSearch(nextText: string) {
    if (readonly) return;
    searchText = nextText;
    localCoded = false;
    isOpen = nextText.trim().length > 0;
    emit(nextText, false);
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => searchSct(nextText), 250);
  }

  function selectValue(nextValue: string) {
    if (readonly) return;
    searchText = nextValue;
    localCoded = true;
    isOpen = false;
    emit(nextValue, true);
  }

  function handleMatchClick(conceptName: string) {
    if (readonly) return;
    searchText = conceptName;
    localCoded = false;
    emit(searchText, false);
    searchSct(conceptName);
  }

  function handleBack() {
    if (readonly) return;
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    searchText = searchHistory[historyIndex];
    searchSct(searchText, false);
  }

  function handleNext() {
    if (readonly) return;
    if (historyIndex >= searchHistory.length - 1) return;
    historyIndex += 1;
    searchText = searchHistory[historyIndex];
    searchSct(searchText, false);
  }

  function clearValue() {
    if (readonly) return;
    searchText = '';
    localCoded = false;
    results = [];
    fullData = null;
    highlightedIndex = -1;
    emit('', false);
  }

  function toggleOpen() {
    if (readonly) return;
    isOpen = !isOpen;
    if (isOpen) {
      updatePopupPosition();
      searchSct(searchText);
    }
  }

  function closeAfterBlur() {
    window.clearTimeout(blurTimer);
    blurTimer = window.setTimeout(() => isOpen = false, 200);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (readonly) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      isOpen = false;
      highlightedIndex = -1;
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        isOpen = true;
        updatePopupPosition();
        if (searchText.trim()) searchSct(searchText);
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
      selectValue(results[highlightedIndex]);
    }
  }
</script>

{#snippet selectorControl()}
  <div class="fb-selector" bind:this={selectorElement}>
    <div class="fb-selector-input-wrap">
      <input
        id={inputId}
        {name}
        class={inputClassName}
        bind:value={searchText}
        {placeholder}
        autocomplete="off"
        {readonly}
        onfocus={() => { if (!readonly) { window.clearTimeout(blurTimer); isOpen = true; } }}
        oninput={(event) => queueSearch(event.currentTarget.value)}
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
      <div id={popupId} class="fb-selector-popup" style={`top: ${popupTop}px; left: ${popupLeft}px; max-height: ${popupMaxHeight}px;`}>
        {#if isSearching && results.length === 0}
          <div class="fb-selector-empty">Searching...</div>
        {:else if error}
          <div class="fb-selector-empty">Search unavailable</div>
        {:else if results.length === 0}
          <div class="fb-selector-empty">No matches</div>
        {:else}
          <div class="fb-selector-results">
            <div class="fb-selector-left" role="listbox">
              {#each results as result, index}
                <button
                  type="button"
                  class:highlighted={highlightedIndex === index}
                  class="fb-selector-result"
                  id={`${popupId}-option-${index}`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onmouseenter={() => highlightedIndex = index}
                  onmousedown={(event) => event.preventDefault()}
                  onclick={() => mode === 'procedure' ? selectValue(result) : handleMatchClick(result)}
                >
                  {result}
                </button>
              {/each}
            </div>
            <div class="fb-selector-detail">
              {#if fullData?.parents?.length}
                <div class="fb-detail-block">
                  <div class="fb-detail-heading">Parent concepts</div>
                  <div class="fb-detail-links">
                    {#each fullData.parents as parent, index}
                      {#if index > 0}<span> | </span>{/if}
                      <button type="button" class="fb-detail-link fb-sct-popup-hoverable" onmousedown={(event) => event.preventDefault()} onclick={() => parent.pt && handleMatchClick(parent.pt)}>{parent.pt}</button>
                    {/each}
                  </div>
                </div>
              {/if}
              {#if fullData?.fst}
                <div class="fb-detail-block">
                  <div class="fb-detail-heading">Concept</div>
                  <div class="fb-detail-concept">{fullData.fst}</div>
                </div>
              {/if}
              <div class="fb-detail-actions">
                <button type="button" disabled={historyIndex <= 0} onmousedown={(event) => event.preventDefault()} onclick={handleBack}>&lt;</button>
                <button type="button" disabled={historyIndex >= searchHistory.length - 1} onmousedown={(event) => event.preventDefault()} onclick={handleNext}>&gt;</button>
                <button type="button" class="select" onmousedown={(event) => event.preventDefault()} onclick={() => selectValue(selectableConcept)}>Select</button>
                <button type="button" class="close" onmousedown={(event) => event.preventDefault()} onclick={() => isOpen = false}>Close</button>
              </div>
              <div class="fb-detail-scroll">
                {#if fullData?.synonyms?.length}
                  <div class="fb-detail-block">
                    <div class="fb-detail-heading">Synonyms</div>
                    <div>
                      {#each fullData.synonyms as synonym, index}
                        {#if index > 0}<span> | </span>{/if}
                        <span class="fb-sct-popup-hoverable">{synonym}</span>
                      {/each}
                    </div>
                  </div>
                {/if}
                {#if fullData?.children?.length}
                  <div class="fb-detail-block">
                    <div class="fb-detail-heading">Child concepts</div>
                    {#each fullData.children as child}
                      <div><button type="button" class="fb-detail-link fb-sct-popup-hoverable" onmousedown={(event) => event.preventDefault()} onclick={() => child.pt && handleMatchClick(child.pt)}>{child.pt}</button></div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          </div>
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
    background: white;
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
  }

  .fb-coded-icon.coded {
    color: #008000;
  }

  .fb-selector-popup {
    position: fixed;
    z-index: 10000;
    width: 45rem;
    max-width: 100vw;
    overflow: hidden;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background: white;
    box-shadow: 0 0.2rem 0.5rem rgb(0 0 0 / 20%);
  }

  .fb-selector-empty {
    padding: 0.5rem;
    color: #666;
  }

  .fb-selector-results {
    display: flex;
    width: 100%;
    max-height: 19rem;
  }

  .fb-selector-left {
    width: 33.333%;
    border-right: 0.1rem solid silver;
    overflow: auto;
  }

  .fb-selector-detail {
    width: 66.667%;
    padding: 0.25rem;
    overflow: hidden;
    font-size: 0.9rem;
    line-height: 1.2;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .fb-selector-result,
  .fb-selector-empty {
    display: block;
    width: 100%;
    padding: 0.2rem 0.5rem;
    border: none;
    border-bottom: 0.1rem solid #eee;
    background: white;
    color: #111;
    text-align: left;
    font-size: 0.9rem;
    line-height: 1.2;
    white-space: nowrap;
    font-family: 'Roboto', sans-serif;
  }

  .fb-selector-result {
    cursor: pointer;
  }

  .fb-selector-result:hover,
  .fb-selector-result.highlighted {
    background: #ffffcc;
  }

  .fb-detail-block {
    margin-bottom: 0.25rem;
  }

  .fb-detail-heading {
    background: #8cd2e7;
    color: black;
    font-size: 0.6rem;
    padding: 0.2rem 0.5rem;
  }

  .fb-detail-concept {
    font-size: 1.5rem;
    margin: 0.25rem 0;
    font-weight: 500;
  }

  .fb-detail-link {
    border: none;
    background: none;
    color: #1b6ec2;
    padding: 0;
    cursor: pointer;
    text-align: left;
    text-decoration: underline;
    font: inherit;
  }

  .fb-sct-popup-hoverable {
    display: inline-block;
    padding: 0.1rem 0.3rem;
    margin: 0.1rem;
    border-radius: 0.2rem;
  }

  .fb-sct-popup-hoverable:hover,
  .fb-sct-popup-hoverable:focus,
  .fb-sct-popup-hoverable:focus-visible {
    background-color: #ffffcc;
    outline: none;
  }

  .fb-detail-actions {
    display: flex;
    gap: 0.3rem;
    margin: 0.25rem 0;
  }

  .fb-detail-actions button {
    border: none;
    border-radius: 0.25rem;
    background: #1b6ec2;
    color: white;
    cursor: pointer;
    font-weight: 500;
    padding: 0.2rem 0.5rem;
  }

  .fb-detail-actions button:disabled {
    background: silver;
    cursor: not-allowed;
  }

  .fb-detail-actions button.select {
    background: #008000;
  }

  .fb-detail-actions button.close {
    background: #d50000;
    color: white;
  }

  .fb-detail-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
