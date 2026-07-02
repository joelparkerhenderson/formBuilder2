<script lang="ts">
  import FbBloodPressure from '$lib/components/fb/fbBloodPressure.svelte';
  import FbBoxedMessage from '$lib/components/fb/fbBoxedMessage.svelte';
  import FbDateExact from '$lib/components/fb/fbDateExact.svelte';
  import FbDateHeightWeightBMIRow from '$lib/components/fb/fbDateHeightWeightBMIRow.svelte';
  import FbDatePartial from '$lib/components/fb/fbDatePartial.svelte';
  import FbDropdown from '$lib/components/fb/fbDropdown.svelte';
  import FbGridCell from '$lib/components/fb/fbGridCell.svelte';
  import FbGridRow from '$lib/components/fb/fbGridRow.svelte';
  import FbGroup from '$lib/components/fb/fbGroup.svelte';
  import FbInverseSubq from '$lib/components/fb/fbInverseSubq.svelte';
  import FbMSISelector from '$lib/components/fb/fbMSISelector.svelte';
  import FbNotificationTypeGroup from '$lib/components/fb/fbNotificationTypeGroup.svelte';
  import FbNumberInput from '$lib/components/fb/fbNumberInput.svelte';
  import FbQuestion from '$lib/components/fb/fbQuestion.svelte';
  import FbRadio from '$lib/components/fb/fbRadio.svelte';
  import FbReadOnly from '$lib/components/fb/fbReadOnly.svelte';
  import FbSCTDiagnosis from '$lib/components/fb/fbSCTDiagnosis.svelte';
  import FbSCTProcedure from '$lib/components/fb/fbSCTProcedure.svelte';
  import FbSection from '$lib/components/fb/fbSection.svelte';
  import FbCheck from '$lib/components/fb/fbCheck.svelte';
  import FbTableCell from '$lib/components/fb/fbTableCell.svelte';
  import FbTableRow from '$lib/components/fb/fbTableRow.svelte';
  import FbSmartDropdown from '$lib/components/fb/fbSmartDropdown.svelte';
  import FbTextArea from '$lib/components/fb/fbTextArea.svelte';
  import FbTextInput from '$lib/components/fb/fbTextInput.svelte';
  import FbTime from '$lib/components/fb/fbTime.svelte';
  import GeneratedEditComponent from './GeneratedEditComponent.svelte';
  import GeneratedTableShell from './GeneratedTableShell.svelte';
  import type { DesignerComponentSpec } from '$lib/data/treatmentSummarySpec';
  import { asOptions, bmiKeys, cleanDesignerLabel, componentType, rowScopedComponent, tableCellTemplates, tableColumns, tableRows, tableRowScope, type FormState } from '$lib/utils/generatedForm';

  let {
    component,
    formState,
    onChange,
    tableRowsByComponent = {},
    onTableRowsChange,
    subfield = false
  }: {
    component: DesignerComponentSpec;
    formState: FormState;
    onChange: (fieldName: string, value: any, coded?: boolean, nadexId?: string) => void;
    tableRowsByComponent?: Record<string, Array<{ id?: string }>>;
    onTableRowsChange?: (componentId: string, rows: Array<{ id?: string }>) => void;
    subfield?: boolean;
  } = $props();

  const label = $derived(cleanDesignerLabel(component.label));
  const type = $derived(componentType(component));
  const children = $derived(component.children || []);
  const options = $derived(asOptions(component.options));
  const gridCols = $derived(Math.max(1, Math.min(12, children.reduce((sum, child) => sum + Math.max(1, Number(child.colSpan || 1)), 0))) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12);
  const bmiFieldKeys = $derived(bmiKeys(component));
  let localTableRows = $state<Array<{ id?: string }>>([]);
  let localTableRowsKey = $state('');
  let draggedTableRowIndex = $state<number | null>(null);
  const visibleTableRows = $derived(tableRowsByComponent[component.id] || localTableRows);

  $effect(() => {
    if (type !== 'fbTable') return;
    const key = `${component.id}:${JSON.stringify(component.tableRows || '')}`;
    const sharedRows = tableRowsByComponent[component.id];
    if (sharedRows) {
      localTableRowsKey = key;
      localTableRows = sharedRows;
      return;
    }
    if (key !== localTableRowsKey) {
      const initialRows = tableRows(component);
      localTableRowsKey = key;
      localTableRows = initialRows;
      onTableRowsChange?.(component.id, initialRows);
    }
  });

  function setTableRows(rows: Array<{ id?: string }>) {
    localTableRows = rows;
    onTableRowsChange?.(component.id, rows);
  }

  function normalChildren(child: DesignerComponentSpec) {
    return (child.children || []).filter((grandChild) => grandChild.type !== 'fbInverseSubq');
  }

  function inverseChildren(child: DesignerComponentSpec) {
    return (child.children || []).filter((grandChild) => grandChild.type === 'fbInverseSubq');
  }

  function subquestionsForSelectedValue() {
    return children.filter((child) => child.type !== 'fbSubqForOption' || child.optionValue === (formState[component.id] || ''));
  }

  function moveLocalTableRow(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= visibleTableRows.length || toIndex >= visibleTableRows.length) return;
    const nextRows = [...visibleTableRows];
    const [moved] = nextRows.splice(fromIndex, 1);
    nextRows.splice(toIndex, 0, moved);
    setTableRows(nextRows);
  }

  function deleteLocalTableRow(rowIndex: number) {
    if (visibleTableRows.length <= 1) return;
    setTableRows(visibleTableRows.filter((_row, index) => index !== rowIndex));
  }

  function addLocalTableRow() {
    setTableRows([...visibleTableRows, { id: `${component.id}-row${Date.now().toString(36)}-${visibleTableRows.length + 1}` }]);
  }

  const childSubfield = $derived(subfield || type === 'fbInverseSubq' || type === 'fbSubqForOption');
</script>

{#if type === 'fbSection'}
  <FbSection id={component.id} title={label}>
    {#each children as child (child.id)}
      <GeneratedEditComponent component={child} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} {subfield} />
    {/each}
  </FbSection>
{:else if type === 'fbGridRow'}
  <FbGridRow cols={gridCols}>
    {#each children as child (child.id)}
      <GeneratedEditComponent component={child} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} {subfield} />
    {/each}
  </FbGridRow>
{:else if type === 'fbGridCell'}
  <FbGridCell id={component.id} span={component.colSpan || 1}>
    {#each children as child (child.id)}
      <GeneratedEditComponent component={child} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} {subfield} />
    {/each}
  </FbGridCell>
{:else if type === 'fbTable'}
  {@const columns = tableColumns(component)}
  {@const templates = tableCellTemplates(component)}
  <GeneratedTableShell
    {label}
    {columns}
    useFullWidth={component.useFullWidth !== false}
    includeDragHandles={!!component.includeDragHandles}
    includeRowDeleteButtons={!!component.includeRowDeleteButtons}
    requireAtLeastOneRow={!!component.requireAtLeastOneRow}
    requireAtLeastOneRowText={component.requireAtLeastOneRowText || 'Enter at least one row'}
    includeAddButton={!!component.includeAddButton}
    addButtonLabel={component.addButtonLabel || 'Add row'}
    onAddRow={addLocalTableRow}
  >
        {#each visibleTableRows as row, rowIndex (row.id || rowIndex)}
          <FbTableRow
            draggable={!!component.includeDragHandles}
            ondragstart={(event) => {
              if (!component.includeDragHandles) return;
              draggedTableRowIndex = rowIndex;
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/generated-table-row', String(rowIndex));
            }}
            ondragover={(event) => {
              if (draggedTableRowIndex !== null) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }
            }}
            ondrop={(event) => {
              event.preventDefault();
              if (draggedTableRowIndex !== null) moveLocalTableRow(draggedTableRowIndex, rowIndex);
              draggedTableRowIndex = null;
            }}
            ondragend={() => (draggedTableRowIndex = null)}
          >
            {#if component.includeDragHandles}
              <FbTableCell width="2rem" style="text-align: center;">
                <span class="material-icons table-drag-icon" aria-hidden="true" title="Drag up or down to order list">swap_vertical_circle</span>
              </FbTableCell>
            {/if}
            {#each columns as column, columnIndex (column.id)}
              <FbTableCell style="min-width: 6rem;">
                {#if templates[columnIndex]}
                  <GeneratedEditComponent component={rowScopedComponent(templates[columnIndex]!, tableRowScope(row, rowIndex))} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} />
                {:else}
                  {column.label}
                {/if}
              </FbTableCell>
            {/each}
            {#if component.includeRowDeleteButtons}
              <FbTableCell width="2rem" style="text-align: center;">
                <button type="button" class="table-delete-button" aria-label="Delete row" title="Delete row" disabled={visibleTableRows.length <= 1} onclick={() => deleteLocalTableRow(rowIndex)}>
                  <span class="material-icons" aria-hidden="true">highlight_off</span>
                </button>
              </FbTableCell>
            {/if}
          </FbTableRow>
        {/each}
  </GeneratedTableShell>
{:else if type === 'fbInverseSubq' || type === 'fbSubqForOption'}
  {#each children as child (child.id)}
    <GeneratedEditComponent component={child} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} subfield={childSubfield} />
  {/each}
{:else if type === 'fbGroup'}
  <FbGroup
    {label}
    required={component.required}
    requiredForAudit={component.requiredForAudit}
    valueError={component.valueError}
    {subfield}
  >
    {#each children as child (child.id)}
      {@const checked = child.type === 'fbCheck' ? formState[child.id] === 'checked' : formState[component.id] === child.id}
      {#if child.type === 'fbCheck'}
        {#if normalChildren(child).length > 0 || inverseChildren(child).length > 0}
          <FbCheck
            id={child.id}
            name={child.id}
            value={child.id}
            {checked}
            label={cleanDesignerLabel(child.label)}
            required={component.required}
            requiredForAudit={component.requiredForAudit}
            showRequiredMarkers={false}
            onChange={(checked) => onChange(child.id, checked ? 'checked' : '')}
          >
            {#each normalChildren(child) as grandChild (grandChild.id)}
              <GeneratedEditComponent component={grandChild} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} subfield={true} />
            {/each}
            {#if inverseChildren(child).length > 0}
              <FbInverseSubq open={!checked}>
                {#each inverseChildren(child) as grandChild (grandChild.id)}
                  <GeneratedEditComponent component={grandChild} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} subfield={true} />
                {/each}
              </FbInverseSubq>
            {/if}
          </FbCheck>
        {:else}
          <FbCheck
            id={child.id}
            name={child.id}
            value={child.id}
            {checked}
            label={cleanDesignerLabel(child.label)}
            required={component.required}
            requiredForAudit={component.requiredForAudit}
            showRequiredMarkers={false}
            onChange={(checked) => onChange(child.id, checked ? 'checked' : '')}
          />
        {/if}
      {:else}
        {#if normalChildren(child).length > 0 || inverseChildren(child).length > 0}
          <FbRadio
            id={child.id}
            name={component.id}
            value={child.id}
            {checked}
            label={cleanDesignerLabel(child.label)}
            required={component.required}
            requiredForAudit={component.requiredForAudit}
            showRequiredMarkers={false}
            onChange={() => onChange(component.id, child.id)}
          >
            {#each normalChildren(child) as grandChild (grandChild.id)}
              <GeneratedEditComponent component={grandChild} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} subfield={true} />
            {/each}
            {#if inverseChildren(child).length > 0}
              <FbInverseSubq open={!checked}>
                {#each inverseChildren(child) as grandChild (grandChild.id)}
                  <GeneratedEditComponent component={grandChild} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} subfield={true} />
                {/each}
              </FbInverseSubq>
            {/if}
          </FbRadio>
        {:else}
          <FbRadio
            id={child.id}
            name={component.id}
            value={child.id}
            {checked}
            label={cleanDesignerLabel(child.label)}
            required={component.required}
            requiredForAudit={component.requiredForAudit}
            showRequiredMarkers={false}
            onChange={() => onChange(component.id, child.id)}
          />
        {/if}
      {/if}
    {/each}
  </FbGroup>
{:else if component.type === 'fbBoxedWarning'}
  <FbBoxedMessage text={label} variant="warning" />
{:else if component.type === 'fbBoxedAlert'}
  <FbBoxedMessage text={label} variant="alert" />
{:else if component.type === 'fbBoxedInfo'}
  <FbBoxedMessage text={label} variant="info" />
{:else if component.type === 'fbBloodPressure'}
  {@const bloodPressureValue = formState[component.id] || {}}
  <FbBloodPressure
    id={component.id}
    {label}
    systolic={bloodPressureValue.systolic || ''}
    diastolic={bloodPressureValue.diastolic || ''}
    required={component.required}
    requiredForAudit={component.requiredForAudit}
    valueError={component.valueError}
    {subfield}
    onChange={(value) => onChange(component.id, value)}
  />
{:else if component.type === 'fbDateHeightWeightBMIRow'}
  <FbDateHeightWeightBMIRow
    dateRecorded={formState[bmiFieldKeys.dateRecorded] || ''}
    heightCm={formState[bmiFieldKeys.heightCm] || ''}
    weightKg={formState[bmiFieldKeys.weightKg] || ''}
    onDateRecordedChange={(value) => onChange(bmiFieldKeys.dateRecorded, value)}
    onHeightCmChange={(value) => onChange(bmiFieldKeys.heightCm, value)}
    onWeightKgChange={(value) => onChange(bmiFieldKeys.weightKg, value)}
  />
{:else if component.type === 'fbNotificationTypeGroup'}
  <FbNotificationTypeGroup name={component.id} value={formState[component.id] || ''} onChange={(value) => onChange(component.id, value)} {subfield} />
{:else if component.type === 'fbDropdown'}
  <FbDropdown
    id={component.id}
    name={component.id}
    {label}
    value={formState[component.id] || ''}
    onChange={(value) => onChange(component.id, value)}
    {options}
    required={component.required}
    requiredForAudit={component.requiredForAudit}
    valueError={component.valueError}
    placeholder=""
    fullWidth={component.fullWidth}
    noWidthConstraint={component.noWidthConstraint}
    {subfield}
  >
    {#each subquestionsForSelectedValue() as child (child.id)}
      <GeneratedEditComponent component={child} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} subfield={true} />
    {/each}
  </FbDropdown>
{:else if component.type === 'fbSmartDropdown'}
  <FbSmartDropdown
    id={component.id}
    name={component.id}
    {label}
    value={formState[component.id] || ''}
    onChange={(value) => onChange(component.id, value)}
    {options}
    required={component.required}
    requiredForAudit={component.requiredForAudit}
    placeholder={component.placeholder || undefined}
    fullWidth={component.fullWidth}
    noWidthConstraint={component.noWidthConstraint}
    valueError={component.valueError}
    {subfield}
  >
    {#each subquestionsForSelectedValue() as child (child.id)}
      <GeneratedEditComponent component={child} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} subfield={true} />
    {/each}
  </FbSmartDropdown>
{:else if component.type === 'fbReadOnly'}
  <FbReadOnly label={label} value={component.defaultValue || formState[component.id] || ''} units={component.units} preserveGridSpace bigLabel={!!component.bigLabel} boldLabel={!!component.boldLabel} />
{:else if component.type === 'fbTextArea'}
  <FbTextArea id={component.id} name={component.id} {label} value={formState[component.id] || ''} onChange={(value) => onChange(component.id, value)} required={component.required} requiredForAudit={component.requiredForAudit} placeholder={component.placeholder || ''} fullWidth={component.fullWidth} valueError={component.valueError} {subfield} />
{:else if component.type === 'fbTextInput'}
  <FbTextInput id={component.id} name={component.id} {label} value={formState[component.id] || ''} onChange={(value) => onChange(component.id, value)} required={component.required} requiredForAudit={component.requiredForAudit} placeholder={component.placeholder || ''} valueError={component.valueError} {subfield} />
{:else if component.type === 'fbNumberInput' || component.type === 'fbNumberInputWithUnits'}
  <FbNumberInput id={component.id} name={component.id} {label} value={formState[component.id] || ''} onChange={(value) => onChange(component.id, value)} required={component.required} requiredForAudit={component.requiredForAudit} placeholder={component.placeholder || ''} units={component.type === 'fbNumberInputWithUnits' ? component.units : undefined} valueError={component.valueError} {subfield} />
{:else if component.type === 'fbTime'}
  <FbTime id={component.id} name={component.id} {label} value={formState[component.id] || ''} onChange={(value) => onChange(component.id, value)} required={component.required} requiredForAudit={component.requiredForAudit} placeholder={component.placeholder || ''} valueError={component.valueError} {subfield} />
{:else if component.type === 'fbDatePartial'}
  <FbQuestion {label} required={component.required} requiredForAudit={component.requiredForAudit} valueError={component.valueError} {subfield}>
    <FbDatePartial name={component.id} value={formState[component.id] || ''} onChange={(value) => onChange(component.id, value)} required={component.required} requiredForAudit={component.requiredForAudit} showRequiredMarkers={false} placeholder={component.placeholder || undefined} />
  </FbQuestion>
{:else if component.type === 'fbDateExact'}
  <FbQuestion {label} required={component.required} requiredForAudit={component.requiredForAudit} valueError={component.valueError} {subfield}>
    <FbDateExact name={component.id} value={formState[component.id] || ''} onChange={(value) => onChange(component.id, value)} required={component.required} requiredForAudit={component.requiredForAudit} showRequiredMarkers={false} />
  </FbQuestion>
{:else if component.type === 'fbMSISelector'}
  <FbMSISelector label={label} name={component.id} value={formState[component.id] || ''} coded={!!formState[`${component.id}_coded`]} onChange={(value, coded, nadexId) => onChange(component.id, value, coded, nadexId)} required={component.required} requiredForAudit={component.requiredForAudit} valueError={component.valueError} {subfield} />
{:else if component.type === 'fbSCTDiagnosis'}
  <FbSCTDiagnosis label={label} name={component.id} value={formState[component.id] || ''} coded={!!formState[`${component.id}_coded`]} onChange={(value, coded) => onChange(component.id, value, coded)} required={component.required} requiredForAudit={component.requiredForAudit} valueError={component.valueError} {subfield} />
{:else if component.type === 'fbSCTProcedure'}
  <FbSCTProcedure label={label} name={component.id} value={formState[component.id] || ''} coded={!!formState[`${component.id}_coded`]} onChange={(value, coded) => onChange(component.id, value, coded)} required={component.required} requiredForAudit={component.requiredForAudit} valueError={component.valueError} {subfield} />
{/if}

<style>
  .table-drag-icon {
    color: #1b6ec2;
    cursor: grab;
    font-size: 1.2rem;
    line-height: 1;
  }

  .table-delete-button {
    border: 0;
    background: transparent;
    color: #d50000;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .table-delete-button:disabled {
    color: silver;
    cursor: not-allowed;
  }

</style>
