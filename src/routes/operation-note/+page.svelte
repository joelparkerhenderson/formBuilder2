<script lang="ts">
  import SpecDrivenForm from '$lib/components/specDriven/SpecDrivenForm.svelte';
  import { operationNoteSpec } from '$lib/data/specDrivenFormSpecs';
  import type { Patient } from '$lib/types';

  type PageData = {
    patient: Patient | null;
    patientUuid: string;
    formUuid: string;
    savedForm: Record<string, any> | null;
    openInRoV: boolean;
    readOnlyBackOnly: boolean;
    loadError: string;
  };

  let { data }: { data: PageData } = $props();
</script>

{#if data.loadError}
  <main class="operation-note-error" role="alert">{data.loadError}</main>
{:else}
  <SpecDrivenForm
    spec={operationNoteSpec}
    patient={data.patient}
    patientUuid={data.patientUuid}
    formUuid={data.formUuid}
    savedForm={data.savedForm}
    openInRoV={data.openInRoV}
    readOnlyBackOnly={data.readOnlyBackOnly}
  />
{/if}

<style>
  .operation-note-error {
    padding: 1rem;
    color: #d50000;
    font-family: 'Roboto', sans-serif;
  }
</style>
