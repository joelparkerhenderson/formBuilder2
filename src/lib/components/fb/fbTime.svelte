<script lang="ts">
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
    valueError = '',
    readonly = false,
    onChange
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
    valueError?: string;
    readonly?: boolean;
    onChange?: (value: string) => void;
  } = $props();

  function update(nextValue: string) {
    value = nextValue;
    onChange?.(nextValue);
  }
</script>

{#snippet timeControl()}
  <input
    type="time"
    {id}
    {name}
    bind:value
    oninput={(event) => update(event.currentTarget.value)}
    {placeholder}
    {required}
    {readonly}
    class="w-full text-black font-sans"
    data-lily-reference-component="time-input"
  />
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} class={className} {subfield} {valueError}>
    {@render timeControl()}
  </FbQuestion>
{:else if required || requiredForAudit}
  <div class="fb-unlabelled-required-control">
    <div>{@render timeControl()}</div>
    <span class="fb-unlabelled-required-markers">
      {#if requiredForAudit}<FbRequiredForAudit />{/if}
      {#if required}<span class="fb-required-marker">*</span>{/if}
    </span>
  </div>
{:else}
  {@render timeControl()}
{/if}

<style>
  input {
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.3rem 0.5rem;
    font-size: 1rem;
    box-sizing: border-box;
    height: 2rem;
    background-color: white;
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
