<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, setContext } from 'svelte';
  import { fbGroupRequiredMarkerContextKey, fbSubfieldContextKey } from './context';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';
  import FbValueError from './fbValueError.svelte';

  let {
    label,
    direction = 'col',
    children,
    class: className = '',
    valueError = '',
    required = false,
    requiredForAudit = false,
    showRequiredMarkers = true,
    subfield = false,
    tooltip
  }: {
    label?: string;
    direction?: 'row' | 'col';
    children?: Snippet;
    class?: string;
    valueError?: string;
    required?: boolean;
    requiredForAudit?: boolean;
    showRequiredMarkers?: boolean;
    subfield?: boolean;
    tooltip?: string;
  } = $props();

  setContext(fbGroupRequiredMarkerContextKey, {
    get value() {
      return showRequiredMarkers && (required || requiredForAudit);
    }
  });

  const inheritedSubfield = getContext<{ value: boolean } | undefined>(fbSubfieldContextKey);
  const labelIsSubfield = $derived(subfield || !!inheritedSubfield?.value);

  const firstPart = $derived.by(() => {
    if (!label || !showRequiredMarkers || (!required && !requiredForAudit)) return label || '';
    const trimmed = label.trim().replace(/\s+/g, ' ');
    const lastSpaceIndex = trimmed.lastIndexOf(' ');
    return lastSpaceIndex === -1 ? '' : trimmed.substring(0, lastSpaceIndex + 1);
  });

  const lastWord = $derived.by(() => {
    if (!label || !showRequiredMarkers || (!required && !requiredForAudit)) return '';
    const trimmed = label.trim().replace(/\s+/g, ' ');
    const lastSpaceIndex = trimmed.lastIndexOf(' ');
    return lastSpaceIndex === -1 ? trimmed : trimmed.substring(lastSpaceIndex + 1);
  });
</script>

<div
  class={`fb-question-container fb-radio-checkbox-group-container ${className}`.trim()}
  title={tooltip}
  aria-label={label}
>
  <FbValueError message={valueError} />
  {#if label}
    <label class:subfield={labelIsSubfield}>
      {#if showRequiredMarkers && (required || requiredForAudit)}
        {firstPart}
        <span class="fb-group-label-last-word">
          {lastWord}
          {#if requiredForAudit}<FbRequiredForAudit />{/if}
          {#if required}<span class="fb-required-marker">*</span>{/if}
        </span>
      {:else}
        {label}
      {/if}
    </label>
  {/if}
  <div class:row={direction === 'row'} class="fb-group-children">
    {#if children}{@render children()}{/if}
  </div>
</div>

<style>
  .fb-radio-checkbox-group-container {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-top: 0.2rem;
    margin-bottom: 0.4rem;
  }

  label {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    color: black;
    margin: 0;
    display: block;
  }

  label.subfield {
    font-weight: 300;
    font-size: 1rem;
  }

  .fb-group-label-last-word {
    display: inline-block;
    white-space: nowrap;
  }

  .fb-required-marker {
    color: #d50000;
    margin-left: 0.1rem;
    font-weight: 500;
  }

  .fb-group-children {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .fb-group-children.row {
    flex-direction: row;
    gap: 1rem;
  }
</style>
