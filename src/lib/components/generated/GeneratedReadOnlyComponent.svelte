<script lang="ts">
  import FbBoxedMessage from '$lib/components/fb/fbBoxedMessage.svelte';
  import FbGridCell from '$lib/components/fb/fbGridCell.svelte';
  import FbGridRow from '$lib/components/fb/fbGridRow.svelte';
  import FbReadOnly from '$lib/components/fb/fbReadOnly.svelte';
  import FbTableCell from '$lib/components/fb/fbTableCell.svelte';
  import FbTableRow from '$lib/components/fb/fbTableRow.svelte';
  import GeneratedReadOnlyComponent from './GeneratedReadOnlyComponent.svelte';
  import GeneratedTableShell from './GeneratedTableShell.svelte';
  import type { DesignerComponentSpec } from '$lib/data/treatmentSummarySpec';
  import { calculateBmi } from '$lib/utils/bmi';
  import {
    bmiKeys,
    cleanDesignerLabel,
    componentType,
    fieldTypes,
    hasRoVData,
    optionLookup,
    rowScopedComponent,
    tableCellTemplates,
    tableColumns,
    tableRows,
    tableRowScope,
    type FormState
  } from '$lib/utils/generatedForm';

  let {
    component,
    formState,
    tableRowsByComponent = {}
  }: {
    component: DesignerComponentSpec;
    formState: FormState;
    tableRowsByComponent?: Record<string, Array<{ id?: string }>>;
  } = $props();

  const label = $derived(cleanDesignerLabel(component.label));
  const type = $derived(componentType(component));
  const children = $derived(component.children || []);
  const gridCols = $derived(Math.max(1, Math.min(6, children.reduce((sum, child) => sum + Math.max(1, Number(child.colSpan || 1)), 0))) as 1 | 2 | 3 | 4 | 5 | 6);
  const bmiFieldKeys = $derived(bmiKeys(component));
  const componentHasRoVData = $derived(hasRoVData(component, formState));
  const coded = $derived(component.type === 'fbMSISelector' || component.type === 'fbSCTDiagnosis' || component.type === 'fbSCTProcedure'
    ? !!formState[`${component.id}_coded`]
    : undefined);
  const bloodPressureDisplay = $derived.by(() => {
    const value = formState[component.id];
    if (!value || typeof value !== 'object') return value;
    const display = [value.systolic, value.diastolic].filter(Boolean).join('/');
    return display ? `${display} mmHg` : '';
  });
  const calculatedBmi = $derived(calculateBmi(formState[bmiFieldKeys.heightCm] || '', formState[bmiFieldKeys.weightKg] || ''));

  function tableHasRoVData(rows: Array<{ id?: string }>, templates: Array<DesignerComponentSpec | null>) {
    return rows.some((row, rowIndex) => templates.some((template) => template ? hasRoVData(rowScopedComponent(template, tableRowScope(row, rowIndex)), formState) : false));
  }
</script>

{#if type === 'fbSection'}
  {#if componentHasRoVData}
    <div id={component.id} class="fb-generated-rov-section">
      <h3>{label}</h3>
      <div class="fb-generated-rov-section-body">
        {#each children as child (child.id)}
          <GeneratedReadOnlyComponent component={child} {formState} {tableRowsByComponent} />
        {/each}
      </div>
    </div>
  {/if}
{:else if type === 'fbGridRow'}
  <FbGridRow cols={gridCols}>
    {#each children as child (child.id)}
      <GeneratedReadOnlyComponent component={child} {formState} {tableRowsByComponent} />
    {/each}
  </FbGridRow>
{:else if type === 'fbGridCell'}
  <FbGridCell id={component.id} span={component.colSpan || 1}>
    {#each children as child (child.id)}
      <GeneratedReadOnlyComponent component={child} {formState} {tableRowsByComponent} />
    {/each}
  </FbGridCell>
{:else if type === 'fbTable'}
  {@const columns = tableColumns(component)}
  {@const rows = tableRowsByComponent[component.id] || tableRows(component)}
  {@const templates = tableCellTemplates(component)}
  {#if componentHasRoVData || tableHasRoVData(rows, templates)}
    <GeneratedTableShell {label} {columns} useFullWidth={component.useFullWidth !== false}>
          {#each rows as row, rowIndex (row.id || rowIndex)}
            {@const scopedTemplates = templates.map((template) => template ? rowScopedComponent(template, tableRowScope(row, rowIndex)) : null)}
            {#if scopedTemplates.some((template) => template ? hasRoVData(template, formState) : false)}
              <FbTableRow>
                {#each columns as column, columnIndex (column.id)}
                  <FbTableCell style="min-width: 6rem;">
                    {#if scopedTemplates[columnIndex]}
                      <GeneratedReadOnlyComponent component={scopedTemplates[columnIndex]!} {formState} {tableRowsByComponent} />
                    {:else}
                      {column.label}
                    {/if}
                  </FbTableCell>
                {/each}
              </FbTableRow>
            {/if}
          {/each}
    </GeneratedTableShell>
  {/if}
{:else if type === 'fbInverseSubq' || type === 'fbSubqForOption'}
  {#each children as child (child.id)}
    <GeneratedReadOnlyComponent component={child} {formState} {tableRowsByComponent} />
  {/each}
{:else if type === 'fbGroup'}
  <FbReadOnly label={label} value={formState[component.id]} lookupTable={optionLookup(component)} preserveGridSpace />
{:else if component.type === 'fbBoxedWarning'}
  <FbBoxedMessage text={label} variant="warning" />
{:else if component.type === 'fbBoxedAlert'}
  <FbBoxedMessage text={label} variant="alert" />
{:else if component.type === 'fbBoxedInfo'}
  <FbBoxedMessage text={label} variant="info" />
{:else if component.type === 'fbBloodPressure'}
  <FbReadOnly label={label} value={bloodPressureDisplay} preserveGridSpace />
{:else if component.type === 'fbDateHeightWeightBMIRow'}
  <FbGridRow cols={4}>
    <FbGridCell>
      <FbReadOnly label="Date recorded" value={formState[bmiFieldKeys.dateRecorded]} preserveGridSpace />
    </FbGridCell>
    <FbGridCell>
      <FbReadOnly label="Height" value={formState[bmiFieldKeys.heightCm]} units="cm" preserveGridSpace />
    </FbGridCell>
    <FbGridCell>
      <FbReadOnly label="Weight" value={formState[bmiFieldKeys.weightKg]} units="kg" preserveGridSpace />
    </FbGridCell>
    <FbGridCell>
      <FbReadOnly label="Uncertified calculated BMI (kg/m2)" value={calculatedBmi === null ? '' : String(calculatedBmi)} preserveGridSpace bigLabel />
    </FbGridCell>
  </FbGridRow>
{:else if component.type === 'fbReadOnly'}
  <FbReadOnly label={label} value={component.defaultValue || formState[component.id] || ''} units={component.units} preserveGridSpace bigLabel={!!component.bigLabel} boldLabel={!!component.boldLabel} />
{:else if fieldTypes.has(component.type)}
  <FbReadOnly label={label} value={formState[component.id]} lookupTable={optionLookup(component)} units={component.type === 'fbNumberInputWithUnits' ? component.units : undefined} {coded} preserveGridSpace bigLabel={!!component.bigLabel} boldLabel={!!component.boldLabel} />
{:else if children.length > 0}
  {#each children as child (child.id)}
    <GeneratedReadOnlyComponent component={child} {formState} {tableRowsByComponent} />
  {/each}
{/if}

<style>
  .fb-generated-rov-section {
    margin-bottom: 0.8rem;
  }

  .fb-generated-rov-section h3 {
    background-color: rgb(27 110 194);
    color: white;
    font-weight: 500;
    padding: 0.2rem 0.2rem 0.2rem 0.4rem;
    margin: 0;
    font-size: 1.17rem;
  }

  .fb-generated-rov-section-body {
    margin-top: 0.4rem;
  }

</style>
