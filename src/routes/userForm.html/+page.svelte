<script lang="ts">
  import { onMount } from 'svelte';
  import { getPatient, getPublicDesign } from '$lib/api/legacy';
  import FbAuthAndSensitivity from '$lib/components/fb/fbAuthAndSensitivity.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbHeader from '$lib/components/fb/fbHeader.svelte';
  import FbLayout from '$lib/components/fb/fbLayout.svelte';
  import FbModal from '$lib/components/fb/fbModal.svelte';
  import FbModalDraft from '$lib/components/fb/fbModalDraft.svelte';
  import FbModalPassword from '$lib/components/fb/fbModalPassword.svelte';
  import FbSaveCancelButtons from '$lib/components/fb/fbSaveCancelButtons.svelte';
  import GeneratedEditForm from '$lib/components/generated/GeneratedEditForm.svelte';
  import GeneratedReadOnlyForm from '$lib/components/generated/GeneratedReadOnlyForm.svelte';
  import type { DesignerFormSpec } from '$lib/data/treatmentSummarySpec';
  import type { Patient, SectionSpec } from '$lib/types';
  import { defaultFormState, designerSections, type FormState } from '$lib/utils/generatedForm';

  const defaultPatientUuid = 'fd55880a-7ada-47a8-adbb-65850af6f7e2';

  let publicId = $state('');
  let design = $state<DesignerFormSpec | null>(null);
  let patient = $state<Patient | null>(null);
  let formState = $state<FormState>({});
  let tableRowsByComponent = $state<Record<string, Array<{ id?: string }>>>({});
  type PublicFormSnapshot = { formState: FormState; finalChecked: boolean; highlySensitive: boolean };

  let cleanSnapshot = $state<PublicFormSnapshot>({ formState: {}, finalChecked: false, highlySensitive: false });
  let activeSection = $state('');
  let isReadOnlyView = $state(false);
  let loading = $state(true);
  let loadError = $state('');
  let username = $state('demoUser');
  let password = $state('');
  let finalChecked = $state(false);
  let highlySensitive = $state(false);
  let showDraftPopup = $state(false);
  let showPasswordPopup = $state(false);
  let showPrototypeWarning = $state(false);

  const sectionsConfig: SectionSpec[] = $derived(design ? designerSections(design) : []);
  const currentSnapshot = $derived({ formState, finalChecked, highlySensitive });
  const formChanged = $derived(JSON.stringify(currentSnapshot) !== JSON.stringify(cleanSnapshot));

  onMount(() => {
    publicId = window.location.hash.replace(/^#/, '').trim();
    void loadPublicDesign();
  });

  function normalisePublicDesign(input: any): DesignerFormSpec {
    return {
      ...input,
      id: input?.id || input?.uuid || 'public-generated-form',
      publicId: input?.publicId || publicId,
      title: input?.title || 'Generated form',
      patientUuid: input?.patientUuid || defaultPatientUuid,
      components: Array.isArray(input?.components) ? input.components : []
    };
  }

  async function loadPublicDesign() {
    loading = true;
    loadError = '';
    try {
      if (!publicId) {
        loadError = 'Missing public form identifier.';
        return;
      }
      const loadedDesign = normalisePublicDesign(await getPublicDesign(publicId));
      design = loadedDesign;
      formState = defaultFormState(loadedDesign);
      tableRowsByComponent = {};
      cleanSnapshot = { formState: { ...formState }, finalChecked, highlySensitive };
      activeSection = designerSections(loadedDesign)[0]?.id || '';
      try {
        patient = await getPatient(loadedDesign.patientUuid || defaultPatientUuid);
      } catch {
        patient = null;
      }
    } catch (error) {
      loadError = error instanceof Error ? error.message : String(error);
    } finally {
      loading = false;
    }
  }

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
  }

  function setTableRows(componentId: string, rows: Array<{ id?: string }>) {
    tableRowsByComponent = { ...tableRowsByComponent, [componentId]: rows };
  }

  function requestSave() {
    if (!finalChecked) {
      showDraftPopup = true;
      return;
    }
    completePrototypeSave();
  }

  function completePrototypeSave() {
    if (!password.trim()) {
      showPasswordPopup = true;
      return;
    }
    password = '';
    showPrototypeWarning = true;
  }

  function resetPrototypeForm() {
    if (!design) return;
    formState = defaultFormState(design);
    tableRowsByComponent = {};
    finalChecked = false;
    highlySensitive = false;
    password = '';
    cleanSnapshot = { formState: { ...formState }, finalChecked, highlySensitive };
  }
</script>

{#if loading}
  <main class="public-generated-message">Loading form...</main>
{:else if loadError}
  <main class="public-generated-message public-generated-error" role="alert">{loadError}</main>
{:else if design}
  <FbLayout sections={sectionsConfig} bind:activeSection {formState} isReadOnlyView={isReadOnlyView}>
    {#snippet header()}
      <FbHeader title={design.title} {patient} formStatus="draft" />
    {/snippet}

    {#if isReadOnlyView}
      <div class="public-generated-rov-body">
        <GeneratedReadOnlyForm spec={design} {formState} {tableRowsByComponent} />
      </div>
    {:else}
      <GeneratedEditForm spec={design} {formState} onChange={setField} {tableRowsByComponent} onTableRowsChange={setTableRows} />
    {/if}

    {#snippet bottomControls()}
      <div class="public-generated-footer">
        <FbButton type="button" variant="primary" onclick={() => isReadOnlyView = !isReadOnlyView}>
          {isReadOnlyView ? 'EV' : 'RoV'}
        </FbButton>
        {#if !isReadOnlyView}
          <FbAuthAndSensitivity
            bind:username
            bind:password
            bind:finalChecked
            bind:highlySensitive
            {formChanged}
            requiredFieldsComplete={true}
          />
          <FbSaveCancelButtons
            {formChanged}
            showRov={false}
            onSave={requestSave}
            onCancel={resetPrototypeForm}
          />
        {/if}
      </div>
    {/snippet}
  </FbLayout>
{/if}

{#if showDraftPopup}
  <FbModalDraft
    onSaveDraft={() => {
      showDraftPopup = false;
      completePrototypeSave();
    }}
    onCancel={() => (showDraftPopup = false)}
  />
{/if}

{#if showPasswordPopup}
  <FbModalPassword
    on:confirm={(event) => {
      password = event.detail;
      showPasswordPopup = false;
      completePrototypeSave();
    }}
    on:cancel={() => (showPasswordPopup = false)}
  />
{/if}

{#if showPrototypeWarning}
  <FbModal title="Warning">
    <p>This is a prototype / demo. Data won't actually be saved.</p>
    <div class="public-generated-modal-actions">
      <FbButton type="button" variant="success" onclick={() => (showPrototypeWarning = false)}>Ok</FbButton>
    </div>
  </FbModal>
{/if}

<style>
  .public-generated-message {
    padding: 1rem;
    font-family: 'Roboto', sans-serif;
  }

  .public-generated-error {
    color: #d50000;
    font-weight: 500;
  }

  .public-generated-rov-body {
    padding: 0.4rem;
  }

  .public-generated-footer {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
    min-height: 2.8rem;
    padding: 0.4rem;
    border-top: 0.2rem solid #1b6ec2;
    box-sizing: border-box;
  }

  .public-generated-modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
</style>
