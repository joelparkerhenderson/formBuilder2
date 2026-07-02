<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, setContext } from 'svelte';
  import { fbQuestionRequiredMarkerContextKey, fbSubfieldContextKey } from './context';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';
  import FbValueError from './fbValueError.svelte';

  let {
    label,
    required = false,
    requiredForAudit = false,
    children,
    class: className = '',
    subfield = false,
    valueError = ''
  }: {
    label: string;
    required?: boolean;
    requiredForAudit?: boolean;
    children: Snippet;
    class?: string;
    subfield?: boolean;
    valueError?: string;
  } = $props();

  setContext(fbQuestionRequiredMarkerContextKey, {
    get value() {
      return required || requiredForAudit;
    }
  });

  const inheritedSubfield = getContext<{ value: boolean } | undefined>(fbSubfieldContextKey);
  const labelIsSubfield = $derived(subfield || !!inheritedSubfield?.value);

  const firstPart = $derived.by(() => {
    if (!required && !requiredForAudit) return label;
    const trimmed = label.trim();
    const lastSpaceIndex = trimmed.lastIndexOf(' ');
    return lastSpaceIndex === -1 ? '' : trimmed.substring(0, lastSpaceIndex + 1);
  });

  const lastWord = $derived.by(() => {
    if (!required && !requiredForAudit) return '';
    const trimmed = label.trim();
    const lastSpaceIndex = trimmed.lastIndexOf(' ');
    return lastSpaceIndex === -1 ? trimmed : trimmed.substring(lastSpaceIndex + 1);
  });
</script>

<div class={`fb-question-container ${className}`.trim()}>
  <FbValueError message={valueError} />
  <label class:subfield={labelIsSubfield}>
    {#if required || requiredForAudit}
      {firstPart}
      <span class="fb-question-label-last-word">
        {lastWord}
        {#if requiredForAudit}<FbRequiredForAudit />{/if}
        {#if required}<span class="fb-required-marker">*</span>{/if}
      </span>
    {:else}
      {label}
    {/if}
  </label>
  <div class="fb-question-child">
    {@render children()}
  </div>
</div>

<style>
  .fb-question-container {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.2rem;
    border-radius: 0.4rem;
    box-sizing: border-box;
    transition: background-color 0.1s ease-out;
  }

  label {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    color: black;
    margin: 0;
    display: block;
    flex-shrink: 0;
  }

  label.subfield {
    font-weight: 300;
    font-size: 1rem;
  }

  .fb-question-label-last-word {
    display: inline-block;
    white-space: nowrap;
  }

  .fb-required-marker {
    color: #d50000;
    margin-left: 0.1rem;
  }

  .fb-question-child {
    width: 100%;
  }
</style>
