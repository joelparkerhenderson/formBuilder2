<script lang="ts">
  import { base } from '$app/paths';
  import { createApiClient } from '$lib/api/client';
  import FbBottomControlsRow from '$lib/components/fb/fbBottomControlsRow.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbHeader from '$lib/components/fb/fbHeader.svelte';
  import FbLayout from '$lib/components/fb/fbLayout.svelte';
  import GeneratedEditForm from '$lib/components/generated/GeneratedEditForm.svelte';
  import GeneratedReadOnlyForm from '$lib/components/generated/GeneratedReadOnlyForm.svelte';
  import { treatmentSummarySpec } from '$lib/data/treatmentSummarySpec';
  import type { Patient, SectionSpec } from '$lib/types';
  import { formatFormDate, generateUUID } from '$lib/utils/dateFormat';
  import { returnByHref } from '$lib/utils/fbHrefNavigation';
  import { defaultFormState, designerSections, type FormState } from '$lib/utils/generatedForm';

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

  const api = createApiClient();
  const defaultState = defaultFormState(treatmentSummarySpec);
  const sectionsConfig: SectionSpec[] = designerSections(treatmentSummarySpec);
  const savedFormData = data.savedForm?.form_data || {};

  let activeSection = $state(sectionsConfig[0]?.id || '');
  let isReadOnlyView = $state(data.openInRoV);
  let formChanged = $state(false);
  let finalChecked = $state(data.savedForm?.form_status === 'final');
  let highlySensitive = $state(Boolean(data.savedForm?.highly_sensitive ?? savedFormData.highlySensitive));
  let username = $state(savedFormData.username || 'demoUser');
  let password = $state('');
  let isSaving = $state(false);
  let saveError = $state('');
  let formUuid = $state(data.formUuid || data.savedForm?.uuid || savedFormData.uuid || generateUUID());
  let currentVersion = $state(Number(data.savedForm?.version) || 0);
  let formState = $state<FormState>({
    ...defaultState,
    dateCreated: formatFormDate(new Date()),
    ...savedFormData,
    uuid: formUuid
  });

  const formStatus = $derived(finalChecked ? 'final' : 'draft');
  const requiredFieldsComplete = $derived(sectionsConfig.every((section) => {
    const requiredCount = (section.requiredFields || []).filter((field) => !formState[field]).length;
    const dynamicCount = section.getIncompleteCount ? section.getIncompleteCount(formState) : 0;
    return requiredCount + dynamicCount === 0;
  }));

  function setField(fieldName: string, value: any, coded?: boolean, nadexId?: string) {
    formState = { ...formState, [fieldName]: value };
    if (coded !== undefined) {
      formState = {
        ...formState,
        [`${fieldName}_coded`]: coded,
        [`${fieldName}_text`]: value,
        [`${fieldName}_NADEXId`]: nadexId || ''
      };
    }
    formChanged = true;
  }

  function backToRecord() {
    returnByHref(data.readOnlyBackOnly ? `${base}/patient-record/${encodeURIComponent(data.patientUuid || treatmentSummarySpec.patientUuid || '')}` : `${base}/`);
  }

  async function saveTreatmentSummary(event?: SubmitEvent) {
    event?.preventDefault();
    saveError = '';
    if (!password) {
      saveError = 'Enter password before saving.';
      return;
    }

    isSaving = true;
    try {
      const now = new Date().toISOString();
      const nextVersion = currentVersion + 1;
      const formDataToSave = {
        ...formState,
        uuid: formUuid,
        username,
        finalChecked,
        highlySensitive
      };

      await api.post('/forms/treatment_summary', {
        uuid: formUuid,
        version: nextVersion,
        patient_uuid: data.patientUuid || treatmentSummarySpec.patientUuid,
        event_datetime: now,
        document_datetime: now,
        form_status: formStatus,
        highly_sensitive: highlySensitive,
        form_data: formDataToSave
      });
      await api.post('/forms-index', {
        form_uuid: formUuid,
        form_version: nextVersion,
        form_type: 'treatment_summary',
        patient_uuid: data.patientUuid || treatmentSummarySpec.patientUuid,
        event_datetime: now,
        document_datetime: now,
        form_status: formStatus,
        highly_sensitive: highlySensitive,
        event_or_document: 'Document',
        details: username
      });

      currentVersion = nextVersion;
      formChanged = false;
      password = '';
      isReadOnlyView = true;
    } catch (error) {
      saveError = error instanceof Error ? error.message : String(error);
    } finally {
      isSaving = false;
    }
  }
</script>

{#if data.loadError}
  <main class="treatment-summary-error" role="alert">{data.loadError}</main>
{:else if isReadOnlyView}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection isReadOnlyView={true}>
    {#snippet header()}
      <FbHeader title="Treatment summary" patient={data.patient} formStatus={formStatus} highlySensitive={highlySensitive} />
    {/snippet}

    <div class="treatment-summary-rov-body">
      <GeneratedReadOnlyForm spec={treatmentSummarySpec} {formState} />
    </div>

    {#snippet bottomControls()}
      <div class="treatment-summary-footer">
        {#if !data.readOnlyBackOnly && formStatus !== 'final'}
          <FbButton type="button" variant="primary" onclick={() => isReadOnlyView = false}>EV</FbButton>
        {/if}
        <div class="treatment-summary-footer-spacer"></div>
        <FbButton type="button" variant="primary" onclick={backToRecord}>Back</FbButton>
      </div>
    {/snippet}
  </FbLayout>
{:else}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection onSubmit={saveTreatmentSummary}>
    {#snippet header()}
      <FbHeader title="Treatment summary" patient={data.patient} formStatus="draft" highlySensitive={highlySensitive} />
    {/snippet}

    <GeneratedEditForm spec={treatmentSummarySpec} {formState} onChange={setField} />

    {#if saveError}<div class="treatment-summary-save-error" role="alert">{saveError}</div>{/if}

    {#snippet bottomControls()}
      <FbBottomControlsRow
        openedFromPatientRecord={data.readOnlyBackOnly}
        bind:highlySensitive
        bind:finalChecked
        {requiredFieldsComplete}
        bind:username
        bind:password
        {formChanged}
        {isSaving}
        onRoVClick={() => isReadOnlyView = true}
        onCancel={backToRecord}
      />
    {/snippet}
  </FbLayout>
{/if}

<style>
  .treatment-summary-error {
    padding: 1rem;
    color: #d50000;
    font-family: 'Roboto', sans-serif;
  }

  .treatment-summary-rov-body {
    padding: 0.4rem;
  }

  .treatment-summary-footer {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-height: 2.8rem;
    padding: 0.4rem;
    border-top: 0.2rem solid #1b6ec2;
    box-sizing: border-box;
  }

  .treatment-summary-footer-spacer {
    flex: 1;
  }

  .treatment-summary-save-error {
    color: #d50000;
    font-weight: 500;
    margin: 0.6rem;
  }
</style>
