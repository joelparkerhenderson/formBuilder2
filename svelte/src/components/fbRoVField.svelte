<script lang="ts">
  import FbToolTip from './fbToolTip.svelte';
  export let label = '';
  export let value: any = '';
  export let lookupTable: Record<string, string> | undefined = undefined;
  export let units = '';
  export let coded: boolean | undefined = undefined;
  export let tooltip = '';
  export let preserveGridSpace = false;
  $: displayValue = lookupTable && value ? lookupTable[value] || value : value;
</script>

<FbToolTip text={tooltip} as="div" className="fb-question-container">
  {#if preserveGridSpace || (value !== undefined && value !== null && value !== '')}
    <div class="fb-rov-field-label">{label}</div>
    <div class="fb-rov-field-value-inline">
      <div class="fb-rov-field-value">{displayValue || ''}{displayValue && units ? ` ${units}` : ''}</div>
      {#if coded !== undefined}
        <span class="material-icons fb-rov-coded-icon" title={coded ? 'Coded' : 'Not coded'}>{coded ? 'check_circle_outline' : 'warning'}</span>
      {/if}
    </div>
  {/if}
</FbToolTip>
