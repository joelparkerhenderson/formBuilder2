<script lang="ts">
  import GeneratedEditComponent from './GeneratedEditComponent.svelte';
  import type { DesignerFormSpec } from '$lib/data/treatmentSummarySpec';
  import type { FormState } from '$lib/utils/generatedForm';

  let {
    spec,
    formState,
    onChange,
    tableRowsByComponent = {},
    onTableRowsChange
  }: {
    spec: DesignerFormSpec;
    formState: FormState;
    onChange: (fieldName: string, value: any, coded?: boolean, nadexId?: string) => void;
    tableRowsByComponent?: Record<string, Array<{ id?: string }>>;
    onTableRowsChange?: (componentId: string, rows: Array<{ id?: string }>) => void;
  } = $props();
</script>

{#each spec.components as component (component.id)}
  <GeneratedEditComponent {component} {formState} {onChange} {tableRowsByComponent} {onTableRowsChange} />
{/each}
