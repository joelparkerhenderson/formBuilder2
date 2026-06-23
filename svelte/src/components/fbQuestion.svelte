<script lang="ts">
  import { fbRed } from '../lib/constants';
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';
  import FbValueError from './fbValueError.svelte';
  import FbToolTip from './fbToolTip.svelte';

  export let label = '';
  export let required = false;
  export let requiredForAudit = false;
  export let subfield = false;
  export let valueError = '';
  export let tooltip = '';

  function renderLabelParts(text: string) {
    const trimmed = text.trim().replace(/\s+/g, ' ');
    if (!required && !requiredForAudit) return { text: trimmed, prefix: '', lastWord: '', single: true };
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace === -1) return { text: trimmed, prefix: '', lastWord: trimmed, single: true };
    return {
      text: trimmed,
      prefix: trimmed.substring(0, lastSpace),
      lastWord: trimmed.substring(lastSpace + 1),
      single: false,
    };
  }

  $: labelParts = renderLabelParts(label);
  $: questionClassName = `fb-question-container${subfield ? ' subfield' : ''}`;
</script>

<FbToolTip text={tooltip} as="div" className={questionClassName}>
  <FbValueError message={valueError} />
  {#if label}
    <div class="fb-question-label">
      {#if required || requiredForAudit}
        {#if labelParts.single}
          <span class="required-word">{labelParts.lastWord}{#if requiredForAudit}<FbRequiredForAudit />{/if}{#if required}<span class="required" style="color: {fbRed};">*</span>{/if}</span>
        {:else}
          {labelParts.prefix} <span class="required-word">{labelParts.lastWord}{#if requiredForAudit}<FbRequiredForAudit />{/if}{#if required}<span class="required" style="color: {fbRed};">*</span>{/if}</span>
        {/if}
      {:else}
        {labelParts.text}
      {/if}
    </div>
  {/if}
  <div class="fb-question-control" class:no-label-required={!label && (required || requiredForAudit)}>
    <div class:no-label-required-control={!label && (required || requiredForAudit)}><slot /></div>
    {#if !label && (required || requiredForAudit)}
      <span class="no-label-required-markers">
        {#if requiredForAudit}<FbRequiredForAudit />{/if}
        {#if required}<span class="required no-label-required-star" style="color: {fbRed};">*</span>{/if}
      </span>
    {/if}
  </div>
</FbToolTip>

<style>
  :global(.fb-question-container) {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.2rem;
    border-radius: 0.4rem;
    box-sizing: border-box;
  }

  .fb-question-label {
    display: block;
    color: black;
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
  }

  :global(.fb-question-container.subfield) .fb-question-label {
    font-weight: 300;
  }

  .required {
    white-space: nowrap;
    margin-left: 0.1rem;
    font-weight: 500;
  }

  .required-word {
    display: inline-block;
    white-space: nowrap;
  }

  .fb-question-control {
    width: 100%;
  }

  .fb-question-control.no-label-required {
    display: flex;
    align-items: flex-start;
    gap: 0.2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .no-label-required-control {
    flex: 1 1 auto;
    min-width: 0;
  }

  .no-label-required-star {
    line-height: 1.2rem;
    user-select: none;
  }

  .no-label-required-markers {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.1rem;
    flex: 0 0 auto;
    margin-top: 0.15rem;
  }
</style>
