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
    showRequiredMarkers = true,
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
    valueError?: string;
    showRequiredMarkers?: boolean;
    readonly?: boolean;
    onChange?: (value: string) => void;
    change?: (value: string) => void;
  } = $props();

  function update(nextValue: string) {
    if (readonly) return;
    value = nextValue;
    onChange?.(nextValue);
    change?.(nextValue);
  }
</script>

{#snippet inputControl()}
  <input
    type="text"
    {id}
    {name}
    bind:value
    oninput={(event) => update(event.currentTarget.value)}
    {placeholder}
    {required}
    {readonly}
    class="w-full text-black font-sans"
    data-lily-reference-component="text-input"
  />
{/snippet}

{#if label}
  <FbQuestion
    {label}
    required={showRequiredMarkers && required}
    requiredForAudit={showRequiredMarkers && requiredForAudit}
    class={className}
    {subfield}
    {valueError}
  >
    {@render inputControl()}
  </FbQuestion>
{:else if (required || requiredForAudit) && showRequiredMarkers}
  <div class="fb-unlabelled-required-control">
    <div>{@render inputControl()}</div>
    <span class="fb-unlabelled-required-markers">
      {#if requiredForAudit}<FbRequiredForAudit />{/if}
      {#if required}<span class="fb-required-marker">*</span>{/if}
    </span>
  </div>
{:else}
  {@render inputControl()}
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
    width: 100%;
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
