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
  export let searchCommand: 'findProcedure' | 'findDisorder' = 'findProcedure';
  export let onChange: (value: string, coded: boolean) => void = () => {};
  export let change: (value: string, coded: boolean) => void = () => {};

  const dispatch = createEventDispatcher<{ change: { value: string; coded: boolean } }>();

  let searchText = value;
  let localCoded = Boolean(value);
  let isOpen = false;
  let isSearching = false;
  let error = '';
  let results: string[] = [];
  let fullData: any = null;
  let highlightedIndex = -1;
  let searchHistory: string[] = [];
  let historyIndex = -1;
  let selectorElement: HTMLDivElement;
  let popupTop = 0;
  let popupLeft = 0;
  let popupMaxHeight = 300;
  let searchTimer: number | undefined;
  let blurTimer: number | undefined;

  $: if (value !== searchText && !isOpen) {
    searchText = value || '';
    localCoded = Boolean(value);
  }

  async function searchSct(term: string, addToHistory = true) {
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
      const parsed = parseServerResponse(text);
      const matches = parsed?.orderedMatches || [];
      results = Array.isArray(matches) ? matches.map((item: any) => typeof item === 'string' ? item : item?.pt || item?.term || item?.display || '').filter(Boolean) : [];
      fullData = parsed;
      highlightedIndex = -1;
      isOpen = true;
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

  function queueSearch() {
    localCoded = false;
    isOpen = searchText.trim().length > 0;
    onChange(searchText, false);
    change(searchText, false);
    dispatch('change', { value: searchText, coded: false });
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => searchSct(searchText), 250);
  }

  function selectValue(nextValue: string) {
    searchText = nextValue;
    localCoded = true;
    isOpen = false;
    onChange(nextValue, true);
    change(nextValue, true);
    dispatch('change', { value: nextValue, coded: true });
  }

  function handleMatchClick(conceptName: string) {
    searchText = conceptName;
    localCoded = false;
    onChange(searchText, false);
    change(searchText, false);
    dispatch('change', { value: searchText, coded: false });
    searchSct(conceptName);
  }

  function handleBack() {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    searchText = searchHistory[historyIndex];
    searchSct(searchText, false);
  }

  function handleNext() {
    if (historyIndex >= searchHistory.length - 1) return;
    historyIndex += 1;
    searchText = searchHistory[historyIndex];
    searchSct(searchText, false);
  }

  function clearValue() {
    searchText = '';
    localCoded = false;
    results = [];
    fullData = null;
    onChange('', false);
    change('', false);
    dispatch('change', { value: '', coded: false });
  }

  function toggleOpen() {
    isOpen = !isOpen;
    if (isOpen) {
      updatePopupPosition();
      searchSct(searchText);
    }
  }

  function closeAfterBlur() {
    window.clearTimeout(blurTimer);
    blurTimer = window.setTimeout(() => (isOpen = false), 200);
  }

  $: effectiveCoded = coded !== undefined ? coded : localCoded;
  $: selectableConcept = fullData?.pt || fullData?.fst || searchText;

  function updatePopupPosition() {
    if (!selectorElement) return;
    const rect = selectorElement.getBoundingClientRect();
    const preferredHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom - 20;
    const spaceAbove = rect.top - 20;
    popupMaxHeight = Math.min(preferredHeight, Math.max(100, spaceBelow >= spaceAbove ? spaceBelow : spaceAbove));
    popupTop = spaceBelow >= preferredHeight || spaceBelow >= spaceAbove ? rect.bottom + 2 : rect.top - popupMaxHeight - 2;
    const width = Math.min(45 * 16, window.innerWidth - 40);
    popupLeft = Math.min(rect.left, window.innerWidth - width - 20);
    if (popupLeft < 20) popupLeft = 20;
  }
</script>

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} {valueError} {tooltip} {subfield}>
    <div class="fb-selector" bind:this={selectorElement}>
      <div class="fb-selector-input-wrap">
        <input
          {id}
          {name}
          bind:value={searchText}
          placeholder="Type to search SNOMED CT"
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
        <div class="fb-selector-popup" style={`top: ${popupTop}px; left: ${popupLeft}px; max-height: ${popupMaxHeight}px;`}>
          {#if isSearching && results.length === 0}
            <div class="fb-selector-empty">Searching...</div>
          {:else if error}
            <div class="fb-selector-empty">Search unavailable</div>
          {:else if results.length === 0}
            <div class="fb-selector-empty">No matches</div>
          {:else}
            <div class="fb-selector-results">
              <div class="fb-selector-left">
                {#each results as result, index}
                  <button
                    type="button"
                    class:highlighted={highlightedIndex === index}
                    class="fb-selector-result"
                    onmouseenter={() => (highlightedIndex = index)}
                    onmousedown={(event) => event.preventDefault()}
                    onclick={() => handleMatchClick(result)}
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
                        <button type="button" class="fb-detail-link fb-sct-popup-hoverable" onmousedown={(event) => event.preventDefault()} onclick={() => handleMatchClick(parent.pt)}>{parent.pt}</button>
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
                  <button type="button" class="close" onmousedown={(event) => event.preventDefault()} onclick={() => (isOpen = false)}>Close</button>
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
                        <div><button type="button" class="fb-detail-link fb-sct-popup-hoverable" onmousedown={(event) => event.preventDefault()} onclick={() => handleMatchClick(child.pt)}>{child.pt}</button></div>
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
  </FbQuestion>
{:else}
  <FbQuestion label="" {required} {requiredForAudit} {subfield}>
  <div class="fb-selector" bind:this={selectorElement}>
    <div class="fb-selector-input-wrap">
      <input
        {id}
        {name}
        bind:value={searchText}
        placeholder="Type to search SNOMED CT"
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
      <div class="fb-selector-popup" style={`top: ${popupTop}px; left: ${popupLeft}px; max-height: ${popupMaxHeight}px;`}>
        {#if isSearching && results.length === 0}
          <div class="fb-selector-empty">Searching...</div>
        {:else if error}
          <div class="fb-selector-empty">Search unavailable</div>
        {:else if results.length === 0}
          <div class="fb-selector-empty">No matches</div>
          {:else}
          <div class="fb-selector-results">
            <div class="fb-selector-left">
              {#each results as result, index}
                <button
                  type="button"
                  class:highlighted={highlightedIndex === index}
                  class="fb-selector-result"
                  onmouseenter={() => (highlightedIndex = index)}
                  onmousedown={(event) => event.preventDefault()}
                  onclick={() => handleMatchClick(result)}
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
                      <button type="button" class="fb-detail-link fb-sct-popup-hoverable" onmousedown={(event) => event.preventDefault()} onclick={() => handleMatchClick(parent.pt)}>{parent.pt}</button>
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
                <button type="button" class="close" onmousedown={(event) => event.preventDefault()} onclick={() => (isOpen = false)}>Close</button>
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
                      <div><button type="button" class="fb-detail-link fb-sct-popup-hoverable" onmousedown={(event) => event.preventDefault()} onclick={() => handleMatchClick(child.pt)}>{child.pt}</button></div>
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
  </FbQuestion>
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
    position: fixed;
    z-index: 50;
    width: 45rem;
    max-width: 100vw;
    overflow: hidden;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background: white;
    box-shadow: 0 0.2rem 0.5rem rgb(0 0 0 / 20%);
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
  }

  .fb-selector-result {
    cursor: pointer;
  }

  .fb-selector-result:hover,
  .fb-selector-result:focus,
  .fb-selector-result.highlighted {
    background: #ffffcc;
  }

  .fb-detail-heading {
    background: #8cd2e7;
    color: black;
    font-size: 0.6rem;
    padding: 0.2rem 0.5rem;
  }

  .fb-detail-block {
    margin-bottom: 0.25rem;
  }

  .fb-detail-concept {
    font-size: 1.5rem;
    margin: 0.25rem 0;
    font-weight: 500;
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

  .fb-detail-actions .select {
    background: #008000;
  }

  .fb-detail-actions .close {
    background: #d50000;
  }

  .fb-detail-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .fb-detail-link {
    border: none;
    background: none;
    color: #1b6ec2;
    cursor: pointer;
    padding: 0;
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
</style>
