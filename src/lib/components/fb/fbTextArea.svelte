<script lang="ts">
  import { tick } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';

  let {
    label,
    value = $bindable(''),
    required = false,
    requiredForAudit = false,
    placeholder = '',
    id,
    name,
    class: className = '',
    subfield = false,
    rows = 2,
    fullWidth = false,
    valueError = '',
    readonly = false,
    onChange,
    change
  }: {
    label?: string;
    value?: string;
    required?: boolean;
    requiredForAudit?: boolean;
    placeholder?: string;
    id?: string;
    name?: string;
    class?: string;
    subfield?: boolean;
    rows?: number;
    fullWidth?: boolean;
    valueError?: string;
    readonly?: boolean;
    onChange?: (value: string) => void;
    change?: (value: string) => void;
  } = $props();

  let textAreaElement = $state<HTMLTextAreaElement | undefined>();

  function resize() {
    if (!textAreaElement) return;
    textAreaElement.style.height = 'auto';
    textAreaElement.style.height = `${textAreaElement.scrollHeight}px`;
  }

  async function update(nextValue: string) {
    if (readonly) return;
    value = nextValue;
    onChange?.(nextValue);
    change?.(nextValue);
    await tick();
    resize();
  }

  $effect(() => {
    value;
    tick().then(resize);
  });
</script>

{#snippet textAreaControl()}
  <textarea
    bind:this={textAreaElement}
    {id}
    {name}
    bind:value
    oninput={(event) => update(event.currentTarget.value)}
    {placeholder}
    {required}
    {rows}
    {readonly}
    class="w-full text-black font-sans"
    class:full-width={fullWidth}
    data-lily-reference-component="textarea"
  ></textarea>
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} class={className} {subfield} {valueError}>
    {@render textAreaControl()}
  </FbQuestion>
{:else if required || requiredForAudit}
  <div class="fb-unlabelled-required-control">
    <div>{@render textAreaControl()}</div>
    <span class="fb-unlabelled-required-markers">
      {#if requiredForAudit}<FbRequiredForAudit />{/if}
      {#if required}<span class="fb-required-marker">*</span>{/if}
    </span>
  </div>
{:else}
  {@render textAreaControl()}
{/if}

<style>
  textarea {
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
    padding: 0.3rem 0.5rem;
    font-size: 1rem;
    min-height: 2rem;
    max-width: 37rem;
    background-color: white;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-sizing: border-box;
    resize: none;
    overflow: hidden;
    width: 100%;
  }

  textarea.full-width {
    max-width: none;
  }

  .fb-unlabelled-required-control {
    display: flex;
    align-items: flex-start;
    gap: 0.2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .fb-unlabelled-required-control > div {
    flex: 1;
    width: 100%;
  }

  .fb-unlabelled-required-markers {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.1rem;
    margin-top: 0.15rem;
  }

  .fb-required-marker {
    color: #d50000;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.2rem;
    display: inline-block;
    user-select: none;
  }
</style>
