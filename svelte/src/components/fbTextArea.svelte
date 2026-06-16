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
  <FbQuestion {label} {required} {subfield} {valueError} {tooltip}>
    {@render textareaControl()}
  </FbQuestion>
{:else}
  <FbValueError message={valueError} />
  {#if required}
    <div class="fb-unlabelled-textarea-required">
      <div class="fb-unlabelled-textarea-control">{@render textareaControl()}</div>
      <span class="required no-label-required-star" style="color: {fbRed};">*</span>
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
    flex: 0 0 auto;
    line-height: 1.2rem;
    margin-top: 0.15rem;
    user-select: none;
  }
</style>
