<script lang="ts">
  import type { Snippet } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';
  import { matchSmartDropdownOptions, normaliseSmartDropdownOptions, type SmartDropdownOption } from '$lib/utils/smartDropdown';

  let {
    label,
    value = $bindable(''),
    options,
    required = false,
    requiredForAudit = false,
    placeholder = 'Type here to search',
    subfield = false,
    valueError = '',
    id,
    name,
    children,
    noWidthConstraint = false,
    fullWidth = false,
    readonly = false,
    onChange
  }: {
    label?: string;
    value?: string;
    options: Array<SmartDropdownOption | string>;
    required?: boolean;
    requiredForAudit?: boolean;
    placeholder?: string;
    subfield?: boolean;
    valueError?: string;
    id?: string;
    name?: string;
    children?: Snippet;
    noWidthConstraint?: boolean;
    fullWidth?: boolean;
    readonly?: boolean;
    onChange?: (value: string) => void;
  } = $props();

  const parsedOptions = $derived(normaliseSmartDropdownOptions(options));
  const selected = $derived(parsedOptions.find((option) => option.value === value));
  let inputValue = $state(selected?.label || value || '');
  let open = $state(false);
  let highlightedIndex = $state(-1);
  let wrapperElement = $state<HTMLDivElement | undefined>();
  let popupTop = $state(0);
  let popupLeft = $state(0);
  let popupWidth = $state(0);
  let popupMaxHeight = $state(256);
  let scrollParents: Array<Window | HTMLElement> = [];
  let popupListenersAttached = false;
  const generatedInputId = `fb-smart-dropdown-${Math.random().toString(36).slice(2)}`;
  const matches = $derived(matchSmartDropdownOptions(parsedOptions, inputValue, 20));
  const inputId = $derived(id || name || generatedInputId);
  const listboxId = $derived(`${inputId}-listbox`);

  $effect(() => {
    inputValue = selected?.label || value || '';
  });

  $effect(() => {
    if (!open || matches.length === 0) highlightedIndex = -1;
    else if (highlightedIndex >= matches.length) highlightedIndex = matches.length - 1;
  });

  $effect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperElement?.contains(event.target as Node)) open = false;
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  });

  function updatePopupPosition() {
    if (!wrapperElement) return;
    const rect = wrapperElement.getBoundingClientRect();
    const edgeGap = 12;
    const preferredHeight = 256;
    const spaceBelow = window.innerHeight - rect.bottom - edgeGap;
    const spaceAbove = rect.top - edgeGap;
    popupWidth = Math.min(rect.width, window.innerWidth - (edgeGap * 2));
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
    if (popupListenersAttached || !wrapperElement) return;
    scrollParents = collectScrollParents(wrapperElement);
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

  function openDropdown() {
    if (readonly) return;
    open = true;
    requestAnimationFrame(updatePopupPosition);
  }

  function closeDropdown() {
    open = false;
    highlightedIndex = -1;
  }

  $effect(() => {
    if (open && matches.length > 0) {
      updatePopupPosition();
      attachPopupListeners();
    } else {
      detachPopupListeners();
    }
  });

  function setValue(nextValue: string) {
    if (readonly) return;
    value = nextValue;
    onChange?.(nextValue);
  }

  function selectOption(option: SmartDropdownOption) {
    setValue(option.value);
    inputValue = option.label;
    closeDropdown();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (readonly) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) openDropdown();
      highlightedIndex = matches.length ? Math.min(highlightedIndex + 1, matches.length - 1) : -1;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openDropdown();
      highlightedIndex = matches.length ? Math.max(highlightedIndex - 1, 0) : -1;
    } else if (event.key === 'Enter' && open && highlightedIndex >= 0 && matches[highlightedIndex]) {
      event.preventDefault();
      selectOption(matches[highlightedIndex]);
    } else if (event.key === 'Escape') {
      closeDropdown();
    }
  }
</script>

{#snippet control()}
  <div bind:this={wrapperElement} class="fb-smart-dropdown" class:no-width-constraint={fullWidth || noWidthConstraint}>
    <input
      id={inputId}
      {name}
      type="text"
      role="combobox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-activedescendant={open && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
      aria-autocomplete="list"
      bind:value={inputValue}
      {placeholder}
      {required}
      {readonly}
      onfocus={openDropdown}
      oninput={(event) => {
        inputValue = event.currentTarget.value;
        setValue(event.currentTarget.value);
        highlightedIndex = -1;
        openDropdown();
      }}
      onkeydown={handleKeydown}
    />
    <button
      type="button"
      class="fb-smart-dropdown-arrow"
      aria-label={open ? 'Hide options' : 'Show options'}
      disabled={readonly}
      onmousedown={(event) => event.preventDefault()}
      onclick={() => open ? closeDropdown() : openDropdown()}
    >{open ? '\u25b2' : '\u25bc'}</button>
    {#if open && matches.length > 0}
      <div id={listboxId} role="listbox" class="fb-smart-dropdown-list" style={`top: ${popupTop}px; left: ${popupLeft}px; width: ${popupWidth}px; max-height: ${popupMaxHeight}px;`}>
        {#each matches as option, index}
          <button
            id={`${listboxId}-option-${index}`}
            type="button"
            role="option"
            aria-selected={option.value === value}
            class:selected={option.value === value || highlightedIndex === index}
            onmouseenter={() => highlightedIndex = index}
            onclick={() => {
              selectOption(option);
            }}
          >
            {option.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
  {#if children}{@render children()}{/if}
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} {subfield} {valueError}>
    {@render control()}
  </FbQuestion>
{:else}
  {@render control()}
{/if}

<style>
  .fb-smart-dropdown {
    position: relative;
    width: 100%;
    max-width: 35rem;
  }

  .fb-smart-dropdown.no-width-constraint {
    max-width: none;
  }

  input {
    width: 100%;
    height: 2rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-sizing: border-box;
    padding: 0.2rem 1.7rem 0.2rem 0.4rem;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
  }

  .fb-smart-dropdown-arrow {
    position: absolute;
    right: 0.25rem;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: #666;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0.1rem;
  }

  .fb-smart-dropdown-list {
    position: fixed;
    z-index: 1000;
    overflow-y: auto;
    background-color: white;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  }

  .fb-smart-dropdown-list button {
    display: block;
    width: 100%;
    border: none;
    background-color: white;
    padding: 0.25rem 0.4rem;
    text-align: left;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    cursor: pointer;
  }

  .fb-smart-dropdown-list button:hover,
  .fb-smart-dropdown-list button:focus,
  .fb-smart-dropdown-list button.selected {
    background-color: #ffffcc;
  }
</style>
