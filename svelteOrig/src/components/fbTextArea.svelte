<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { fbRed } from '../lib/constants';
  import FbQuestion from './fbQuestion.svelte';
  import FbValueError from './fbValueError.svelte';

  export let id = '';
  export let name = '';
  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let required = false;
  export let requiredForAudit = false;
  export let subfield = false;
  export let rows = 2;
  export let fullWidth = false;
  export let valueError = '';
  export let tooltip = '';
  export let readonly = false;
  export let onChange: (value: string) => void = () => {};
  export let change: (value: string) => void = () => {};

  const dispatch = createEventDispatcher<{ change: string }>();
  let textarea: HTMLTextAreaElement;

  $: minimumHeight = Math.max(44, rows * 24 + 10);

  function resize() {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(minimumHeight, textarea.scrollHeight)}px`;
  }

  async function emitValue(nextValue: string) {
    value = nextValue;
    onChange(value);
    change(value);
    dispatch('change', value);
    await tick();
    resize();
  }

  $: if (textarea) resize();
</script>

{#snippet textareaControl()}
  <textarea
    bind:this={textarea}
    {id}
    {name}
    {placeholder}
    {rows}
    {readonly}
    value={value || ''}
    class:full-width={fullWidth}
    style:min-height={`${minimumHeight}px`}
    oninput={(event) => emitValue((event.currentTarget as HTMLTextAreaElement).value)}
  ></textarea>
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} {subfield} {valueError} {tooltip}>
    {@render textareaControl()}
  </FbQuestion>
{:else}
  <FbValueError message={valueError} />
  {#if required || requiredForAudit}
    <div class="fb-unlabelled-textarea-required">
      <div class="fb-unlabelled-textarea-control">{@render textareaControl()}</div>
      <span class="no-label-required-markers">
        {#if requiredForAudit}<span class="fb-required-for-audit">RfA</span>{/if}
        {#if required}<span class="required no-label-required-star" style="color: {fbRed};">*</span>{/if}
      </span>
    </div>
  {:else}
    {@render textareaControl()}
  {/if}
{/if}

<style>
  textarea {
    width: 100%;
    max-width: 37rem;
    min-height: 44px;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.3rem 0.4rem;
    resize: none;
    box-sizing: border-box;
    font-size: 1rem;
    overflow: hidden;
  }

  textarea.full-width {
    max-width: none;
  }

  .fb-unlabelled-textarea-required {
    display: flex;
    align-items: flex-start;
    gap: 0.2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .fb-unlabelled-textarea-control {
    flex: 1 1 auto;
    min-width: 0;
  }

  .no-label-required-star {
    line-height: 1.2rem;
    user-select: none;
  }

  .no-label-required-markers {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.1rem;
    flex: 0 0 auto;
    margin-top: 0.15rem;
  }

  .fb-required-for-audit {
    display: inline-block;
    padding: 0.05rem 0.2rem;
    background: var(--fb-orange);
    color: white;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }
</style>
