<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';

  type DatePrecision = 'day' | 'month' | 'year';

  let {
    name = '',
    value = $bindable(''),
    placeholder = 'dd-Mmm-yyyy',
    required = false,
    requiredForAudit = false,
    showRequiredMarkers = true,
    exactOnly = false,
    readonly = false,
    children,
    onChange,
    change
  }: {
    name?: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    requiredForAudit?: boolean;
    showRequiredMarkers?: boolean;
    exactOnly?: boolean;
    readonly?: boolean;
    children?: Snippet;
    onChange?: (value: string) => void;
    change?: (value: string) => void;
  } = $props();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let inputValue = $state(value || '');
  let showCalendar = $state(false);
  let error = $state('');
  let selectedDate = $state<Date | null>(null);
  let displayMonth = $state(new Date().getMonth());
  let displayYear = $state(new Date().getFullYear());
  let container = $state<HTMLDivElement | undefined>();
  let popupTop = $state(0);
  let popupLeft = $state(0);
  let popupMaxHeight = $state(320);
  let popupWidth = $state(320);
  let scrollParents: Array<Window | HTMLElement> = [];
  let popupListenersAttached = false;

  $effect(() => {
    if (value !== inputValue && !showCalendar) inputValue = value || '';
  });

  function parseDate(dateStr: string): { date: Date | null; precision: DatePrecision | null } {
    const str = dateStr.trim();
    if (!str) return { date: null, precision: null };

    let match = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
    if (match) {
      const day = Number.parseInt(match[1], 10);
      const monthIndex = monthNames.findIndex((month) => month.toLowerCase() === match?.[2].toLowerCase());
      let year = Number.parseInt(match[3], 10);
      if (year < 100) year += 2000;
      if (monthIndex >= 0 && day >= 1 && day <= 31) return { date: new Date(year, monthIndex, day), precision: 'day' };
    }

    match = str.match(/^([A-Za-z]{3})-(\d{2,4})$/);
    if (match) {
      const monthIndex = monthNames.findIndex((month) => month.toLowerCase() === match?.[1].toLowerCase());
      let year = Number.parseInt(match[2], 10);
      if (year < 100) year += 2000;
      if (monthIndex >= 0) return { date: new Date(year, monthIndex, 1), precision: 'month' };
    }

    match = str.match(/^(\d{2,4})$/);
    if (match) {
      let year = Number.parseInt(match[1], 10);
      if (year < 100) year += 2000;
      return { date: new Date(year, 0, 1), precision: 'year' };
    }

    match = str.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})$/);
    if (match) {
      const day = Number.parseInt(match[1], 10);
      const month = Number.parseInt(match[2], 10) - 1;
      let year = Number.parseInt(match[3], 10);
      if (year < 100) year += 2000;
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) return { date: new Date(year, month, day), precision: 'day' };
    }

    match = str.match(/^(\d{1,2})[/.](\d{2,4})$/);
    if (match) {
      const month = Number.parseInt(match[1], 10) - 1;
      let year = Number.parseInt(match[2], 10);
      if (year < 100) year += 2000;
      if (month >= 0 && month <= 11) return { date: new Date(year, month, 1), precision: 'month' };
    }

    return { date: null, precision: null };
  }

  function formatDate(date: Date, precision: DatePrecision) {
    if (precision === 'day') return `${date.getDate().toString().padStart(2, '0')}-${monthNames[date.getMonth()]}-${date.getFullYear()}`;
    if (precision === 'month') return `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
    return String(date.getFullYear());
  }

  function emitValue(nextValue: string) {
    if (readonly) return;
    inputValue = nextValue;
    value = nextValue;
    onChange?.(nextValue);
    change?.(nextValue);
  }

  function commitTypedValue() {
    if (readonly) return;
    const parsed = parseDate(inputValue);
    if (inputValue && !parsed.date) {
      error = 'Invalid date';
      return;
    }
    if (parsed.date && parsed.precision) {
      if (exactOnly && parsed.precision !== 'day') {
        error = 'Complete date required';
        return;
      }
      selectedDate = parsed.date;
      displayMonth = parsed.date.getMonth();
      displayYear = parsed.date.getFullYear();
      error = '';
      emitValue(formatDate(parsed.date, parsed.precision));
    } else {
      error = '';
    }
  }

  function selectDate(date: Date, precision: DatePrecision = 'day', close = false) {
    if (readonly) return;
    selectedDate = date;
    displayMonth = date.getMonth();
    displayYear = date.getFullYear();
    error = '';
    emitValue(formatDate(date, precision));
    if (close) showCalendar = false;
  }

  function daysForCalendar() {
    const first = new Date(displayYear, displayMonth, 1);
    const firstDay = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const days: Array<{ date: Date; muted: boolean }> = [];
    const prevMonthDays = new Date(displayYear, displayMonth, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i -= 1) days.push({ date: new Date(displayYear, displayMonth - 1, prevMonthDays - i), muted: true });
    for (let day = 1; day <= daysInMonth; day += 1) days.push({ date: new Date(displayYear, displayMonth, day), muted: false });
    while (days.length < 42) days.push({ date: new Date(displayYear, displayMonth + 1, days.length - firstDay - daysInMonth + 1), muted: true });
    return days;
  }

  function isSameDay(a: Date | null, b: Date) {
    return Boolean(a && a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear());
  }

  function updatePopupPosition() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const preferredWidth = 20 * 16;
    const preferredHeight = 330;
    const edgeGap = 12;
    const spaceBelow = window.innerHeight - rect.bottom - edgeGap;
    const spaceAbove = rect.top - edgeGap;
    popupWidth = Math.min(preferredWidth, Math.max(220, window.innerWidth - (edgeGap * 2)));
    popupMaxHeight = Math.min(preferredHeight, Math.max(180, spaceBelow >= spaceAbove ? spaceBelow : spaceAbove));
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
    if (popupListenersAttached || !container) return;
    scrollParents = collectScrollParents(container);
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

  function openCalendar() {
    if (readonly) return;
    showCalendar = true;
    requestAnimationFrame(updatePopupPosition);
  }

  function addDays(days: number) {
    if (readonly) return;
    const date = selectedDate ? new Date(selectedDate) : new Date();
    date.setDate(date.getDate() + days);
    selectDate(date);
  }

  onMount(() => {
    const closeIfOutside = (event: FocusEvent | MouseEvent) => {
      if (container && event.target instanceof Node && !container.contains(event.target)) {
        commitTypedValue();
        showCalendar = false;
      }
    };
    document.addEventListener('focusin', closeIfOutside);
    document.addEventListener('mousedown', closeIfOutside);
    return () => {
      document.removeEventListener('focusin', closeIfOutside);
      document.removeEventListener('mousedown', closeIfOutside);
      detachPopupListeners();
    };
  });

  $effect(() => {
    if (showCalendar) {
      updatePopupPosition();
      attachPopupListeners();
    } else {
      detachPopupListeners();
    }
  });
</script>

<div class="fb-partial-date" bind:this={container}>
  <div class="fb-date-input-row">
    <div class="fb-date-input-wrap">
      <input
        class="fb-date-control-input"
        {name}
        {placeholder}
        {required}
        {readonly}
        value={inputValue || ''}
        autocomplete="off"
        onfocus={openCalendar}
        onclick={openCalendar}
        oninput={(event) => { if (!readonly) { inputValue = event.currentTarget.value; error = ''; } }}
        onblur={() => window.setTimeout(() => { commitTypedValue(); showCalendar = false; }, 200)}
        onkeydown={(event) => { if (event.key === 'ArrowDown' && !readonly) { event.preventDefault(); openCalendar(); } }}
        data-lily-reference-component="date-input"
      />
      {#if inputValue && !readonly}
        <button type="button" class="fb-date-clear" aria-label="Clear date" onmousedown={(event) => event.preventDefault()} onclick={() => { selectedDate = null; error = ''; emitValue(''); }}>{'\u2715'}</button>
      {/if}
    </div>
    {#if showRequiredMarkers && (required || requiredForAudit)}
      <span class="no-label-required-markers">
        {#if requiredForAudit}<FbRequiredForAudit />{/if}
        {#if required}<span class="required">*</span>{/if}
      </span>
    {/if}
  </div>
  {#if error}<div class="fb-date-error">{error}</div>{/if}
  {#if showCalendar}
    <div class="fb-date-popup" style={`top: ${popupTop}px; left: ${popupLeft}px; width: ${popupWidth}px; max-height: ${popupMaxHeight}px;`}>
      <div class="fb-date-quick-row">
        <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => addDays(-1)}>Yesterday</button>
        <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => selectDate(new Date(), 'day', true)}>Today</button>
        <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => addDays(1)}>Tomorrow</button>
      </div>
      <div class="fb-date-quick-row">
        <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => addDays(7)}>Next week</button>
        <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => addDays(42)}>+Six weeks</button>
        <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => { const date = selectedDate ? new Date(selectedDate) : new Date(); date.setMonth(date.getMonth() + 3); selectDate(date); }}>+Three months</button>
        <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => { const date = selectedDate ? new Date(selectedDate) : new Date(); date.setFullYear(date.getFullYear() + 1); selectDate(date); }}>+1 year</button>
      </div>
      <div class="fb-date-step-row">
        <div class="fb-date-stepper">
          <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => { displayMonth = displayMonth === 0 ? 11 : displayMonth - 1; if (displayMonth === 11) displayYear -= 1; }}>-</button>
          <span>{monthNames[displayMonth]}</span>
          <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => { displayMonth = displayMonth === 11 ? 0 : displayMonth + 1; if (displayMonth === 0) displayYear += 1; }}>+</button>
        </div>
        <div class="fb-date-stepper">
          <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => displayYear -= 1}>-</button>
          <span>{displayYear}</span>
          <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => displayYear += 1}>+</button>
        </div>
      </div>
      <div class="fb-date-grid">
        {#each ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as day}
          <div class="fb-date-weekday">{day}</div>
        {/each}
        {#each daysForCalendar() as day}
          <button
            type="button"
            class:muted={day.muted}
            class:selected={isSameDay(selectedDate, day.date)}
            onmousedown={(event) => event.preventDefault()}
            onclick={() => selectDate(day.date)}
          >
            {day.date.getDate()}
          </button>
        {/each}
      </div>
      <div class="fb-date-quick-row">
        {#if !exactOnly}
          <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => selectedDate && selectDate(selectedDate, 'day')}>Select exact date</button>
          <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => selectedDate && selectDate(selectedDate, 'month')}>Select month</button>
          <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => selectedDate && selectDate(selectedDate, 'year')}>Select year</button>
        {/if}
        <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => showCalendar = false}>Close</button>
      </div>
    </div>
  {/if}
</div>
{#if inputValue && children}
  <div class="fb-subquestion fb-date-subquestion">
    {@render children()}
  </div>
{/if}

<style>
  .fb-partial-date {
    position: relative;
    width: 100%;
  }

  .fb-date-subquestion {
    padding-left: 1.5rem;
  }

  .fb-date-input-wrap {
    position: relative;
    width: 100%;
    max-width: 11rem;
  }

  .fb-date-input-row {
    display: flex;
    align-items: flex-start;
    gap: 0.2rem;
    width: 100%;
  }

  input {
    width: 100%;
    height: 2rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.2rem 0.5rem;
    box-sizing: border-box;
    font-size: 1rem;
    font-weight: 400;
  }

  .fb-date-clear {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: none;
    color: #666;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
    padding: 0.1rem;
  }

  .fb-date-error {
    margin-top: 0.2rem;
    color: #d50000;
    font-size: 0.8rem;
  }

  .fb-date-popup {
    position: fixed;
    z-index: 10000;
    overflow-y: auto;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.5rem;
    background: white;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  }

  .fb-date-quick-row,
  .fb-date-step-row {
    display: flex;
    width: 100%;
  }

  .fb-date-popup button {
    min-height: 1rem;
    margin: 0.2rem;
    border: 0.1rem solid #1b6ec2;
    border-radius: 0.4rem;
    padding: 0 0.5rem;
    background: white;
    color: #1b6ec2;
    font-size: 0.6rem;
    font-weight: 300;
    cursor: pointer;
  }

  .fb-date-quick-row > button {
    flex: 1 1 0;
  }

  .fb-date-popup button:hover,
  .fb-date-popup button:focus {
    background: #ffffcc;
  }

  .fb-date-step-row {
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .fb-date-stepper {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.2rem;
  }

  .fb-date-stepper span {
    padding: 0 0.3rem;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .fb-date-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.1rem;
    margin: 0.2rem;
  }

  .fb-date-weekday {
    border-bottom: 0.1rem solid silver;
    color: silver;
    font-size: 0.8rem;
    font-weight: 300;
    line-height: 1rem;
    padding: 0.2rem;
    text-align: center;
  }

  .fb-date-grid button {
    margin: 0;
    border-color: transparent;
    color: black;
    font-size: 0.8rem;
    line-height: 1rem;
    padding: 0.2rem;
  }

  .fb-date-grid button.muted {
    color: silver;
  }

  .fb-date-grid button.selected {
    border-color: #008000;
    background: #008000;
    color: white;
    font-weight: bold;
  }

  .no-label-required-markers {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.1rem;
    flex: 0 0 auto;
    margin-top: 0.15rem;
  }

  .required {
    color: #d50000;
    font-weight: 500;
    line-height: 1.2rem;
  }
</style>
