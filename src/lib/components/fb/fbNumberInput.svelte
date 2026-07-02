<script lang="ts">
  import FbQuestion from './fbQuestion.svelte';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';

  let {
    label,
    value = $bindable(''),
    required = false,
    requiredForAudit = false,
    units,
    placeholder = '',
    min,
    max,
    id,
    name,
    class: className = '',
    subfield = false,
    valueError = '',
    readonly = false,
    onChange,
    change
  }: {
    label?: string;
    value?: string | number;
    required?: boolean;
    requiredForAudit?: boolean;
    units?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    id?: string;
    name?: string;
    class?: string;
    subfield?: boolean;
    valueError?: string;
    readonly?: boolean;
    onChange?: (value: string) => void;
    change?: (value: string) => void;
  } = $props();

  let hasBadInput = $state(false);
  const currentValue = $derived(String(value ?? ''));
  const automaticValueError = $derived(hasBadInput || (currentValue.trim() && !Number.isFinite(Number(currentValue))) ? 'Enter a number' : '');
  const displayedValueError = $derived(valueError || automaticValueError);

  function update(event: Event) {
    if (readonly) return;
    const target = event.currentTarget as HTMLInputElement;
    hasBadInput = target.validity.badInput;
    value = target.value;
    onChange?.(target.value);
    change?.(target.value);
  }
</script>

{#snippet numberControl()}
  <span class:fb-number-input-with-units={!!units}>
    <input
      type="number"
      {id}
      {name}
      bind:value
      oninput={update}
      {placeholder}
      {min}
      {max}
      {required}
      {readonly}
      class="w-full text-black"
      data-lily-reference-component="number-input"
    />
    {#if units}<span class="fb-number-input-units">{units}</span>{/if}
  </span>
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} class={className} {subfield} valueError={displayedValueError}>
    {@render numberControl()}
  </FbQuestion>
{:else if required || requiredForAudit}
  <div class="fb-unlabelled-required-control">
    <div>{@render numberControl()}</div>
    <span class="fb-unlabelled-required-markers">
      {#if requiredForAudit}<FbRequiredForAudit />{/if}
      {#if required}<span class="fb-required-marker">*</span>{/if}
    </span>
  </div>
{:else}
  {@render numberControl()}
{/if}

<style>
  input {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    box-sizing: border-box;
    height: 2rem;
    max-width: 10ch;
    padding: 0.2rem 0.4rem;
    background-color: white;
  }

  .fb-number-input-with-units {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    max-width: calc(10ch + 5rem);
  }

  .fb-number-input-units {
    font-weight: 400;
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
