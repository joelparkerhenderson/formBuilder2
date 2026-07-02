<script lang="ts">
  import type { Snippet } from 'svelte';
  import FbQuestion from './fbQuestion.svelte';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';

  interface DropdownOption {
    value: string;
    label: string;
  }

  let {
    label,
    value = $bindable(''),
    options,
    required = false,
    requiredForAudit = false,
    id,
    name,
    class: className = '',
    placeholder,
    subfield = false,
    valueError = '',
    noWidthConstraint = false,
    fullWidth = false,
    readonly = false,
    children,
    onChange,
    change
  }: {
    label?: string;
    value?: string;
    options: Array<DropdownOption | string>;
    required?: boolean;
    requiredForAudit?: boolean;
    id?: string;
    name?: string;
    class?: string;
    placeholder?: string;
    subfield?: boolean;
    valueError?: string;
    noWidthConstraint?: boolean;
    fullWidth?: boolean;
    readonly?: boolean;
    children?: Snippet;
    onChange?: (value: string) => void;
    change?: (value: string) => void;
  } = $props();

  const parsedOptions = $derived(options.map((option) => typeof option === 'string' ? { value: option, label: option } : option));

  function update(nextValue: string) {
    value = nextValue;
    onChange?.(nextValue);
    change?.(nextValue);
  }
</script>

{#snippet selectControl()}
  <select
    {id}
    {name}
    bind:value
    onchange={(event) => update(event.currentTarget.value)}
    {required}
    disabled={readonly}
    class="w-full text-black"
    class:no-width-constraint={noWidthConstraint || fullWidth}
    data-lily-reference-component="select"
  >
    {#if placeholder !== undefined}
      <option value="">{placeholder}</option>
    {/if}
    {#each parsedOptions as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  {#if children}{@render children()}{/if}
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} class={className} {subfield} {valueError}>
    {@render selectControl()}
  </FbQuestion>
{:else if required || requiredForAudit}
  <div class="fb-unlabelled-required-control">
    <div>{@render selectControl()}</div>
    <span class="fb-unlabelled-required-markers">
      {#if requiredForAudit}<FbRequiredForAudit />{/if}
      {#if required}<span class="fb-required-marker">*</span>{/if}
    </span>
  </div>
{:else}
  {@render selectControl()}
{/if}

<style>
  select {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-sizing: border-box;
    height: 2rem;
    padding: 0.2rem 0.4rem;
    background-color: white;
    width: 100%;
    max-width: 35rem;
  }

  select.no-width-constraint {
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
