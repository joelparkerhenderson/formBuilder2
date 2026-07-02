<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, setContext } from 'svelte';
  import { fbGroupRequiredMarkerContextKey, fbQuestionRequiredMarkerContextKey, fbSubfieldContextKey } from './context';
  import FbAnimatedSubquestion from './fbAnimatedSubquestion.svelte';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';

  let {
    id,
    name,
    value,
    checked = $bindable(false),
    label,
    required = false,
    requiredForAudit = false,
    showRequiredMarkers = true,
    disabled = false,
    children,
    onChange,
    change
  }: {
    id?: string;
    name: string;
    value: string;
    checked?: boolean;
    label: string;
    required?: boolean;
    requiredForAudit?: boolean;
    showRequiredMarkers?: boolean;
    disabled?: boolean;
    children?: Snippet;
    onChange?: (value: string, event: Event) => void;
    change?: (value: string, event: Event) => void;
  } = $props();

  const groupContext = getContext<{ value: boolean } | undefined>(fbGroupRequiredMarkerContextKey);
  const questionContext = getContext<{ value: boolean } | undefined>(fbQuestionRequiredMarkerContextKey);
  const renderRequiredMarkers = $derived(showRequiredMarkers && !groupContext?.value && !questionContext?.value);
  setContext(fbSubfieldContextKey, { value: true });

  function update(event: Event) {
    if (disabled) return;
    checked = (event.currentTarget as HTMLInputElement).checked;
    onChange?.(value, event);
    change?.(value, event);
  }
</script>

<div class="fb-subquestion-wrapper">
  <label class="flex items-start gap-2 fb-radio-checkbox-item w-full">
    <input
      {id}
      type="radio"
      {name}
      {value}
      {checked}
      onchange={update}
      {required}
      {disabled}
      data-lily-reference-component="radio"
    />
    <span>
      {label}
      {#if renderRequiredMarkers && requiredForAudit}<FbRequiredForAudit />{/if}
      {#if renderRequiredMarkers && required}<span class="fb-required-marker">*</span>{/if}
    </span>
  </label>
  {#if children}
    <FbAnimatedSubquestion open={checked}>
      {@render children()}
    </FbAnimatedSubquestion>
  {/if}
</div>

<style>
  .fb-radio-checkbox-item {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 300;
    user-select: none;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    border-radius: 0.4rem;
    box-sizing: border-box;
  }

  input {
    cursor: pointer;
    flex-shrink: 0;
    outline: none;
    box-shadow: none;
  }

  span {
    font-weight: 300;
  }

  .fb-required-marker {
    color: #d50000;
    margin-left: 0.1rem;
    font-weight: 500;
  }
</style>
