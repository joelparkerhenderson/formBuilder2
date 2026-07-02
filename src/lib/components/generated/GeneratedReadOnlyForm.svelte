<script lang="ts">
  import GeneratedReadOnlyComponent from './GeneratedReadOnlyComponent.svelte';
  import type { DesignerFormSpec } from '$lib/data/treatmentSummarySpec';
  import { hasRoVData, isFbReadOnlyEmptyValue, type FormState } from '$lib/utils/generatedForm';

  let {
    spec,
    formState,
    tableRowsByComponent = {}
  }: {
    spec: DesignerFormSpec;
    formState: FormState;
    tableRowsByComponent?: Record<string, Array<{ id?: string }>>;
  } = $props();

  const hasAnyValue = $derived(Object.values(formState).some((value) => !isFbReadOnlyEmptyValue(value)) || spec.components.some((component) => hasRoVData(component, formState)));
</script>

{#if hasAnyValue}
  {#each spec.components as component (component.id)}
    <GeneratedReadOnlyComponent {component} {formState} {tableRowsByComponent} />
  {/each}
{:else}
  <div class="fb-generated-empty">No form values recorded.</div>
{/if}

<style>
  .fb-generated-empty {
    color: #666;
    font-style: italic;
  }
</style>
