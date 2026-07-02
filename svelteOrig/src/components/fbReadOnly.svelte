<script lang="ts">
  import FbToolTip from './fbToolTip.svelte';
  export let label = '';
  export let value: any = '';
  export let lookupTable: Record<string, string> | undefined = undefined;
  export let units = '';
  export let coded: boolean | undefined = undefined;
  export let tooltip = '';
  export let preserveGridSpace = false;
  export let bigLabel = false;
  export let boldLabel = false;
  $: displayValue = lookupTable && value ? lookupTable[value] || value : value;
</script>

<FbToolTip text={tooltip} as="div" className="fb-question-container">
  {#if preserveGridSpace || (value !== undefined && value !== null && value !== '')}
    <div class="fb-read-only-label" class:fb-read-only-big-label={bigLabel} class:fb-read-only-bold-label={boldLabel}>{label}</div>
    <div class="fb-read-only-value-inline">
      <div class="fb-read-only-value">{displayValue || ''}{displayValue && units ? ` ${units}` : ''}</div>
      {#if coded !== undefined}
        <span class="material-icons fb-read-only-coded-icon" title={coded ? 'Coded' : 'Not coded'}>{coded ? 'check_circle_outline' : 'warning'}</span>
      {/if}
    </div>
  {/if}
</FbToolTip>

<style>
  .fb-read-only-big-label {
    font-size: 1rem;
  }

  .fb-read-only-bold-label {
    font-weight: 500;
  }
</style>
