<script lang="ts">
  let {
    label,
    value,
    lookupTable,
    units,
    coded,
    bigLabel = false,
    boldLabel = false,
    emptyValues = ['', 'select', 'Select side'],
    preserveGridSpace = true
  }: {
    label: string;
    value: unknown;
    lookupTable?: Record<string, string>;
    units?: string;
    coded?: boolean;
    bigLabel?: boolean;
    boldLabel?: boolean;
    emptyValues?: unknown[];
    preserveGridSpace?: boolean;
  } = $props();

  const empty = $derived(value === undefined || value === null || emptyValues.includes(value));
  const displayValue = $derived.by(() => {
    const key = String(value ?? '');
    return lookupTable && lookupTable[key] ? lookupTable[key] : value;
  });
  const hasInlineDetails = $derived(!!units || coded !== undefined);
  const containerStyle = 'margin: 0.5rem 0;';
  const labelStyle = $derived(
    [
      `font-weight: ${boldLabel ? '500' : '300'}`,
      `font-size: ${bigLabel ? '1rem' : '0.8rem'}`,
      'margin-bottom: 0.2rem'
    ].join('; ')
  );
  const valueStyle = 'font-weight: 500; margin-left: 0.4rem; white-space: pre-line;';
  const inlineValueStyle = `${valueStyle} display: flex; align-items: flex-start; gap: 0.4rem;`;
  const unitsStyle = 'font-weight: 500;';
  const codedIconStyle = $derived(
    [
      'font-size: 1.2rem',
      'flex: 0 0 auto',
      'line-height: 1',
      'margin-top: 0',
      'vertical-align: top',
      'align-self: flex-start',
      'display: inline-flex',
      `color: ${coded ? '#008000' : '#fd8a10'}`
    ].join('; ')
  );
</script>

{#if empty && preserveGridSpace}
  <div></div>
{:else if !empty}
  <div class="space-y-2 fb-question-container fb-read-only" style={containerStyle} data-lily-reference-component="readonly-field">
    <div class="fb-read-only-label" class:big-label={bigLabel} class:bold-label={boldLabel} style={labelStyle}>{label}</div>
    <div class={hasInlineDetails ? 'fb-read-only-value fb-read-only-value-inline' : 'fb-read-only-value'} style={hasInlineDetails ? inlineValueStyle : valueStyle}>
      <span>{displayValue}</span>
      {#if units}<span class="fb-read-only-units" style={unitsStyle}> {units}</span>{/if}
      {#if coded !== undefined}
        <span
          class="material-icons fb-read-only-coded-icon"
          title={coded ? 'Coded' : 'Not coded'}
          aria-label={coded ? 'Coded' : 'Not coded'}
          style={codedIconStyle}
        >
          {coded ? 'check_circle_outline' : 'warning'}
        </span>
      {/if}
    </div>
  </div>
{/if}
