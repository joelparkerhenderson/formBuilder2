<script lang="ts">
  import FbQuestion from './fbQuestion.svelte';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';
  import FbValueError from './fbValueError.svelte';

  let {
    label,
    value = $bindable(''),
    units,
    type = 'number',
    required = false,
    requiredForAudit = false,
    placeholder = '',
    min,
    max,
    id,
    name,
    class: className = '',
    subfield = false,
    valueError = '',
    style = '',
    inputStyle = '',
    unitLabelStyle = '',
    readonly = false,
    onChange,
    change,
    onBadInputChange
  }: {
    label?: string;
    value?: string | number;
    units: string;
    type?: 'number' | 'text';
    required?: boolean;
    requiredForAudit?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    id?: string;
    name?: string;
    class?: string;
    subfield?: boolean;
    valueError?: string;
    style?: string;
    inputStyle?: string;
    unitLabelStyle?: string;
    readonly?: boolean;
    onChange?: (value: string) => void;
    change?: (value: string) => void;
    onBadInputChange?: (badInput: boolean) => void;
  } = $props();

  let hasBadInput = $state(false);
  const currentValue = $derived(String(value ?? ''));
  const automaticValueError = $derived(hasBadInput || (currentValue.trim() && !Number.isFinite(Number(currentValue))) ? 'Enter a number' : '');
  const displayedValueError = $derived(valueError || automaticValueError);

  function update(event: Event) {
    if (readonly) return;
    const target = event.currentTarget as HTMLInputElement;
    hasBadInput = target.validity.badInput;
    onBadInputChange?.(hasBadInput);
    value = target.value;
    onChange?.(target.value);
    change?.(target.value);
  }
</script>

{#snippet unitControl()}
  <div class="fb-number-input-with-units-outer">
    <div class="fb-number-input-with-units" style={style}>
      <input
        class="fb-number-input-with-units-input"
        {type}
        {id}
        {name}
        bind:value
        oninput={update}
        {placeholder}
        {min}
        {max}
        {required}
        {readonly}
        style={inputStyle}
        data-lily-reference-component="number-input"
      />
      <span class="fb-number-input-with-units-label" style={unitLabelStyle}>{units}</span>
    </div>
  </div>
{/snippet}

{#if label}
  <FbQuestion {label} {required} {requiredForAudit} class={className} {subfield} valueError={displayedValueError}>
    {@render unitControl()}
  </FbQuestion>
{:else if required || requiredForAudit}
  <div class={`fb-unlabelled-required-control ${className}`.trim()}>
    <div>
      <FbValueError message={displayedValueError} />
      {@render unitControl()}
    </div>
    <span class="fb-unlabelled-required-markers">
      {#if requiredForAudit}<FbRequiredForAudit />{/if}
      {#if required}<span class="fb-required-marker">*</span>{/if}
    </span>
  </div>
{:else}
  <div class={className}>
    <FbValueError message={displayedValueError} />
    {@render unitControl()}
  </div>
{/if}

<style>
  .fb-number-input-with-units-outer {
    display: inline-flex;
    flex-direction: column;
    gap: 0.2rem;
    width: 100%;
  }

  .fb-number-input-with-units {
    display: inline-flex;
    align-items: center;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    height: 2rem;
    width: 100%;
    max-width: calc(10ch + 5rem);
    background-color: white;
    overflow: hidden;
    box-sizing: border-box;
  }

  .fb-number-input-with-units-input {
    border: none;
    border-width: 0;
    outline: none;
    box-shadow: none;
    height: 100%;
    flex: 1;
    min-width: 0;
    padding: 0 0.5rem;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    background-color: transparent;
    box-sizing: border-box;
  }

  .fb-number-input-with-units-input:focus,
  .fb-number-input-with-units-input:focus-visible {
    border: none;
    outline: none;
    box-shadow: none;
  }

  .fb-number-input-with-units-label {
    padding: 0 0.6rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    font-weight: 400;
    color: #555;
    border-left: 0.1rem solid silver;
    height: 100%;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    user-select: none;
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
