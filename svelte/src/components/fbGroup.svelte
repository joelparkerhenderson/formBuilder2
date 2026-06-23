<script lang="ts">
  import FbRequiredForAudit from './fbRequiredForAudit.svelte';
  import FbToolTip from './fbToolTip.svelte';

  export let label = '';
  export let className = '';
  export let valueError = '';
  export let subfield = false;
  export let required = false;
  export let requiredForAudit = false;
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

  $: classTokens = className.split(/\s+/).filter(Boolean);
  $: isSubfield = subfield || classTokens.includes('fb-subquestion');
  $: groupClassName = classTokens.filter((token) => token !== 'fb-subquestion').join(' ');
  $: labelParts = renderLabelParts(label);
  $: wrapperClassName = `fb-question-container fb-radio-checkbox-group-container ${groupClassName}${isSubfield ? ' subfield' : ''}`.trim();
</script>

<FbToolTip
  text={tooltip}
  as="div"
  className={wrapperClassName}
  role="group"
  ariaLabel={label || undefined}
>
  {#if valueError}
    <span class="fb-value-error" role="alert" aria-live="polite">
      <span class="material-icons" aria-hidden="true">error</span>
      <span>{valueError}</span>
    </span>
  {/if}
  {#if label}
    <div class="fb-group-label">
      {#if required || requiredForAudit}
        {#if labelParts.single}
          <span class="required-word">{labelParts.lastWord}{#if requiredForAudit}<FbRequiredForAudit />{/if}{#if required}<span class="required">*</span>{/if}</span>
        {:else}
          {labelParts.prefix} <span class="required-word">{labelParts.lastWord}{#if requiredForAudit}<FbRequiredForAudit />{/if}{#if required}<span class="required">*</span>{/if}</span>
        {/if}
      {:else}
        {labelParts.text}
      {/if}
    </div>
  {/if}
  <slot />
</FbToolTip>

<style>
  :global(.fb-radio-checkbox-group-container) {
    padding: 0.2rem;
    margin: 0.2rem 0 0.4rem 0;
    border-radius: 0.4rem;
    box-sizing: border-box;
  }

  .fb-group-label {
    font-weight: 500;
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }

  .required {
    color: var(--fb-red);
    margin-left: 0.1rem;
    font-weight: 500;
  }

  .required-word {
    display: inline-block;
    white-space: nowrap;
  }

  :global(.fb-radio-checkbox-group-container.subfield) .fb-group-label {
    font-weight: 300;
  }

  :global(.fb-radio-checkbox-group-container.subfield) {
    margin-top: 0;
  }

  .fb-value-error {
    color: var(--fb-red);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .fb-value-error .material-icons {
    color: var(--fb-red);
    background: white;
    font-size: 1rem;
    vertical-align: text-bottom;
    margin-right: 0.2rem;
  }
</style>
