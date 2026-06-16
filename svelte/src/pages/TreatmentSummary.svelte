<script lang="ts">
  import { onMount } from 'svelte';
  import FbAuthAndSensitivity from '../components/fbAuthAndSensitivity.svelte';
  import FbBottomControlsRow from '../components/fbBottomControlsRow.svelte';
  import FbButton from '../components/fbButton.svelte';
  import FbCancelPopup from '../components/fbCancelPopup.svelte';
  import FbDraftPopup from '../components/fbDraftPopup.svelte';
  import FbDropdown from '../components/fbDropdown.svelte';
  import FbGridCell from '../components/fbGridCell.svelte';
  import FbGridRow from '../components/fbGridRow.svelte';
  import FbGroup from '../components/fbGroup.svelte';
  import FbHeader from '../components/fbHeader.svelte';
  import FbLayout from '../components/fbLayout.svelte';
  import FbMSISelector from '../components/fbMSISelector.svelte';
  import FbRadio from '../components/fbRadio.svelte';
  import FbRoVField from '../components/fbRoVField.svelte';
  import FbSCTDiagnosis from '../components/fbSCTDiagnosis.svelte';
  import FbSaveCancelButtons from '../components/fbSaveCancelButtons.svelte';
  import FbSaveErrorPopup from '../components/fbSaveErrorPopup.svelte';
  import FbSavedPopup from '../components/fbSavedPopup.svelte';
  import FbSavingPopup from '../components/fbSavingPopup.svelte';
  import FbSection from '../components/fbSection.svelte';
  import FbTextArea from '../components/fbTextArea.svelte';
  import FbTextInput from '../components/fbTextInput.svelte';
  import { getLatestVersion, getPatient, insertForm, insertFormsIndex } from '../lib/api';
  import { formatClinicalDate, generateUUID } from '../lib/dateFormat';
  import { compareFormStatesObj } from '../lib/formStateUtils';
  import type { Patient, SectionSpec } from '../lib/types';

  type SaveStatus = 'final' | 'draft';

  const params = new URLSearchParams(window.location.search);
  const patientUuid = params.get('patientUuid') || 'fd55880a-7ada-47a8-adbb-65850af6f7e2';

  const yesNoUnknownOptions = [
    { value: 'field6', label: 'Yes' },
    { value: 'field7', label: 'No' },
    { value: 'field8', label: 'Unknown or not recorded' },
  ];

  const patientSeenOptions = [
    { value: 'field13', label: 'Yes' },
    { value: 'field14', label: 'No' },
    { value: 'field15', label: 'Unknown or not recorded' },
  ];

  const specialityOptions = [
    { value: 'option1', label: 'Option 1' },
  ];

  const treatmentAimOptions = [
    { value: 'option1', label: 'Curative' },
    { value: 'option2', label: 'Palliative / disease control' },
    { value: 'option3', label: 'Adjuvant' },
    { value: 'option4', label: 'Neo-adjuvant' },
    { value: 'option5', label: 'To achieve or maintain remission (haematology only)' },
    { value: 'option6', label: 'Unknown' },
  ];

  const prognosisOptions = [
    { value: 'option1', label: 'Active monitoring' },
    { value: 'option2', label: 'Life not expected to be shortened by cancer' },
    { value: 'option3', label: 'Life not expected to be shortened, but long-term physical effects' },
    { value: 'option4', label: 'Life may be shortened by cancer, may have symptoms of cancer or treatment side effects' },
    { value: 'option5', label: 'Life expectancy significantly reduced, <12 months' },
    { value: 'option6', label: 'Advanced disease, life shortened to weeks/months' },
    { value: 'option7', label: 'Final days/weeks of life' },
    { value: 'option8', label: 'Cancer is not the life-limiting condition' },
  ];

  const prognosisCertaintyOptions = [
    { value: 'option1', label: 'Not at all certain' },
    { value: 'option2', label: 'Reasonably certain' },
    { value: 'option3', label: 'Beyond reasonable doubt' },
  ];

  const followUpPlanOptions = [
    { value: 'option1', label: 'Consultant led' },
    { value: 'option2', label: 'Nurse led' },
    { value: 'option3', label: 'PIFU: Patient-initiated follow-up' },
    { value: 'option4', label: 'Primary care' },
    { value: 'option5', label: 'Palliative care' },
    { value: 'option6', label: 'Not yet determined' },
  ];

  const optionLookups: Record<string, Record<string, string>> = {
    group5: Object.fromEntries(yesNoUnknownOptions.map((option) => [option.value, option.label])),
    field9: Object.fromEntries(patientSeenOptions.map((option) => [option.value, option.label])),
    field19: Object.fromEntries(specialityOptions.map((option) => [option.value, option.label])),
    field38: Object.fromEntries(treatmentAimOptions.map((option) => [option.value, option.label])),
    field42: Object.fromEntries(prognosisOptions.map((option) => [option.value, option.label])),
    field44: Object.fromEntries(prognosisCertaintyOptions.map((option) => [option.value, option.label])),
    field52: Object.fromEntries(followUpPlanOptions.map((option) => [option.value, option.label])),
  };

  let patient: Patient | null = null;
  let loadingData = true;
  let activeSection = 'section1';
  let isReadOnlyView = false;
  let formChanged = false;
  let finalChecked = false;
  let highlySensitive = false;
  let username = 'demoUser';
  let password = '';
  let showDraftPopup = false;
  let showCancelPopup = false;
  let isSaving = false;
  let showSavedPopup = false;
  let saveError = '';
  let cleanSnapshot: Record<string, any> | null = null;

  let formState: Record<string, any> = {
    group5: 'field8',
    field9: 'field15',
    field19: '',
    field21: '',
    field23: '',
    field25: '',
    field27: '',
    field30: '',
    field32: '',
    field34: '',
    field36: '',
    field37: '',
    field38: '',
    field39: '',
    field40: '',
    field42: '',
    field44: '',
    field46: '',
    field49: '',
    field50: '',
    field52: '',
    field54: '',
    dateCreated: formatClinicalDate(new Date()),
  };

  const sectionsConfig: SectionSpec[] = [
    { id: 'section1', name: 'Details', requiredFields: ['group5', 'field9', 'field19', 'field21', 'field23', 'field25', 'field27', 'field30'] },
    { id: 'section2', name: 'Diagnosis', requiredFields: ['field32'] },
    { id: 'section3', name: 'Treatment', requiredFields: ['field37', 'field38'] },
    { id: 'section4', name: 'Prognosis', requiredFields: ['field42', 'field44'] },
    { id: 'section47', name: 'Referrals' },
    { id: 'section48', name: 'Follow-up' },
  ];

  function setField(field: string, value: any, coded?: boolean) {
    formState = { ...formState, [field]: value };
    if (coded !== undefined) formState = { ...formState, [`${field}_coded`]: coded };
  }

  function displayValue(field: string) {
    const value = formState[field];
    return optionLookups[field]?.[value] || value;
  }

  $: requiredFieldsIncomplete = sectionsConfig.some((section) => {
    const requiredFields = section.requiredFields || [];
    return requiredFields.some((field) => !formState[field] || formState[field] === '');
  });
  $: formChanged = !loadingData && cleanSnapshot !== null && !compareFormStatesObj(cleanSnapshot, {
    ...formState,
    finalChecked,
    highlySensitive,
  });
  $: saveDisabled = !formChanged || requiredFieldsIncomplete;

  function handleFormActivity() {
    formState = { ...formState };
  }

  async function saveTreatmentSummary(formStatus: SaveStatus) {
    try {
      isSaving = true;
      saveError = '';
      const formUuid = formState.uuid || generateUUID();
      const latest = formState.uuid ? await getLatestVersion('treatment_summary', formUuid) : { version: null };
      const version = latest.version === null ? 0 : latest.version + 1;
      const now = new Date().toISOString();
      const formData = {
        ...formState,
        uuid: formUuid,
        password,
        username,
        finalChecked: formStatus === 'final',
        highlySensitive,
      };

      await insertForm('treatment_summary', {
        uuid: formUuid,
        version,
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: now,
        form_status: formStatus,
        form_data: formData,
      });

      await insertFormsIndex({
        form_uuid: formUuid,
        form_version: version,
        form_type: 'treatment_summary',
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: now,
        document_datetime: now,
        form_status: formStatus,
        event_or_document: 'Document',
        details: username,
      });

      formState = { ...formData };
      cleanSnapshot = { ...formState, finalChecked, highlySensitive };
      showSavedPopup = true;
      window.setTimeout(() => {
        showSavedPopup = false;
        window.location.href = 'index.html';
      }, 1000);
    } catch (err) {
      saveError = err instanceof Error ? err.message : String(err);
    } finally {
      isSaving = false;
    }
  }

  function requestSave() {
    if (!finalChecked) {
      showDraftPopup = true;
      return;
    }
    saveTreatmentSummary('final');
  }

  function cancel() {
    if (formChanged) showCancelPopup = true;
    else window.location.href = 'index.html';
  }

  onMount(async () => {
    try {
      patient = await getPatient(patientUuid);
    } finally {
      loadingData = false;
      cleanSnapshot = { ...formState, finalChecked, highlySensitive };
    }
  });
</script>

{#if loadingData}
  <p style="padding: 0.8rem;">Loading treatment summary...</p>
{:else if isReadOnlyView}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection isReadOnlyView={true}>
    <svelte:fragment slot="header"><FbHeader title="Treatment summary" {patient} /></svelte:fragment>
    <div style="padding: 0.4rem;">
      <FbSection id="section1" title="Details">
        <FbGridRow cols={3}>
          <FbRoVField label="Has the patient received a copy of this document?" value={displayValue('group5')} />
          <FbRoVField label="Has the patient seen this document?" value={displayValue('field9')} />
          <span></span>
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbRoVField label="Speciality" value={displayValue('field19')} />
          <FbRoVField label="Senior responsible clinician" value={formState.field21} coded={formState.field21_coded} />
          <FbRoVField label="Clinical nurse specialist" value={formState.field23} coded={formState.field23_coded} />
        </FbGridRow>
        <FbGridRow cols={3}>
          <FbRoVField label="Daytime 'phone number" value={formState.field25} />
          <FbRoVField label="Out of hours 'phone number" value={formState.field27} />
          <FbRoVField label="Carer or emergency contact" value={formState.field30} />
        </FbGridRow>
      </FbSection>

      <FbSection id="section2" title="Diagnosis">
        <FbGridRow cols={3}>
          <FbRoVField label="Diagnosis" value={formState.field32} coded={formState.field32_coded} />
          <FbRoVField label="Staging" value={formState.field34} />
          <span></span>
        </FbGridRow>
        <FbRoVField label="Diagnosis comments" value={formState.field36} />
      </FbSection>

      <FbSection id="section3" title="Treatment">
        <FbRoVField label="Treatment" value={formState.field37} />
        <FbRoVField label="Treatment aim" value={displayValue('field38')} />
        <FbRoVField label="Treatment aim comments" value={formState.field39} />
        <FbRoVField label="Other important information (effects of the disease, side effects of treatment)" value={formState.field40} />
      </FbSection>

      <FbSection id="section4" title="Prognosis">
        <FbGridRow cols={3}>
          <FbGridCell span={2}><FbRoVField label="Prognosis" value={displayValue('field42')} /></FbGridCell>
          <FbRoVField label="Prognosis certainty" value={displayValue('field44')} />
        </FbGridRow>
        <FbRoVField label="Alert symptoms that require referral back to specialist team" value={formState.field46} />
      </FbSection>

      <FbSection id="section47" title="Referrals">
        <FbRoVField label="Primary care actions requested" value={formState.field49} />
        <FbRoVField label="Onward referrals made" value={formState.field50} />
      </FbSection>

      <FbSection id="section48" title="Follow-up">
        <FbGridRow cols={3}>
          <FbRoVField label="Follow-up plan" value={displayValue('field52')} />
          <FbGridCell span={2}><FbRoVField label="Comments" value={formState.field54} /></FbGridCell>
        </FbGridRow>
      </FbSection>
    </div>
    <svelte:fragment slot="bottomControls">
      <FbBottomControlsRow>
        <FbButton type="button" onClick={() => (isReadOnlyView = false)}>EV</FbButton>
        <div style="flex: 1;"></div>
        <FbButton type="button" onClick={() => (window.location.href = 'index.html')}>Back</FbButton>
      </FbBottomControlsRow>
    </svelte:fragment>
  </FbLayout>
{:else}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection onFormActivity={handleFormActivity}>
    <svelte:fragment slot="header"><FbHeader title="Treatment summary" {patient} /></svelte:fragment>

    <FbSection id="section1" title="Details">
      <FbGridRow cols={3}>
        <FbGroup label="Has the patient received a copy of this document?" required>
          {#each yesNoUnknownOptions as option}
            <FbRadio name="group5" value={option.value} checked={formState.group5 === option.value} label={option.label} change={(value) => setField('group5', value)} />
          {/each}
        </FbGroup>
        <FbGroup label="Has the patient seen this document?" required>
          {#each patientSeenOptions as option}
            <FbRadio name="field9" value={option.value} checked={formState.field9 === option.value} label={option.label} change={(value) => setField('field9', value)} />
          {/each}
        </FbGroup>
        <span></span>
      </FbGridRow>
      <FbGridRow cols={3}>
        <FbDropdown id="field19" name="field19" label="Speciality" required value={formState.field19 || ''} options={specialityOptions} change={(value) => setField('field19', value)} />
        <FbMSISelector id="field21" name="field21" label="Senior responsible clinician" required value={formState.field21 || ''} coded={formState.field21_coded} change={(value, coded) => setField('field21', value, coded)} />
        <FbMSISelector id="field23" name="field23" label="Clinical nurse specialist" required value={formState.field23 || ''} coded={formState.field23_coded} change={(value, coded) => setField('field23', value, coded)} />
      </FbGridRow>
      <FbGridRow cols={3}>
        <FbTextInput id="field25" name="field25" label="Daytime 'phone number" required value={formState.field25 || ''} change={(value) => setField('field25', value)} />
        <FbTextInput id="field27" name="field27" label="Out of hours 'phone number" required value={formState.field27 || ''} change={(value) => setField('field27', value)} />
        <FbTextArea id="field30" name="field30" label="Carer or emergency contact" required value={formState.field30 || ''} change={(value) => setField('field30', value)} />
      </FbGridRow>
    </FbSection>

    <FbSection id="section2" title="Diagnosis">
      <FbGridRow cols={3}>
        <FbSCTDiagnosis id="field32" name="field32" label="Diagnosis" required value={formState.field32 || ''} coded={formState.field32_coded} change={(value, coded) => setField('field32', value, coded)} />
        <FbTextInput id="field34" name="field34" label="Staging" value={formState.field34 || ''} change={(value) => setField('field34', value)} />
        <span></span>
      </FbGridRow>
      <FbTextArea id="field36" name="field36" label="Diagnosis comments" value={formState.field36 || ''} change={(value) => setField('field36', value)} />
    </FbSection>

    <FbSection id="section3" title="Treatment">
      <FbTextArea id="field37" name="field37" label="Treatment" required value={formState.field37 || ''} change={(value) => setField('field37', value)} />
      <FbDropdown id="field38" name="field38" label="Treatment aim" required value={formState.field38 || ''} options={treatmentAimOptions} change={(value) => setField('field38', value)} />
      <FbTextArea id="field39" name="field39" label="Treatment aim comments" value={formState.field39 || ''} change={(value) => setField('field39', value)} />
      <FbTextArea id="field40" name="field40" label="Other important information (effects of the disease, side effects of treatment)" value={formState.field40 || ''} change={(value) => setField('field40', value)} />
    </FbSection>

    <FbSection id="section4" title="Prognosis">
      <FbGridRow cols={3}>
        <FbGridCell span={2}><FbDropdown id="field42" name="field42" label="Prognosis" required value={formState.field42 || ''} options={prognosisOptions} change={(value) => setField('field42', value)} /></FbGridCell>
        <FbDropdown id="field44" name="field44" label="Prognosis certainty" required value={formState.field44 || ''} options={prognosisCertaintyOptions} change={(value) => setField('field44', value)} />
      </FbGridRow>
      <FbTextArea id="field46" name="field46" label="Alert symptoms that require referral back to specialist team" value={formState.field46 || ''} change={(value) => setField('field46', value)} />
    </FbSection>

    <FbSection id="section47" title="Referrals">
      <FbTextArea id="field49" name="field49" label="Primary care actions requested" value={formState.field49 || ''} change={(value) => setField('field49', value)} />
      <FbTextArea id="field50" name="field50" label="Onward referrals made" value={formState.field50 || ''} change={(value) => setField('field50', value)} />
    </FbSection>

    <FbSection id="section48" title="Follow-up">
      <FbGridRow cols={3}>
        <FbDropdown id="field52" name="field52" label="Follow-up plan" value={formState.field52 || ''} options={followUpPlanOptions} change={(value) => setField('field52', value)} />
        <FbGridCell span={2}><FbTextArea id="field54" name="field54" label="Comments" value={formState.field54 || ''} change={(value) => setField('field54', value)} /></FbGridCell>
      </FbGridRow>
    </FbSection>

    <svelte:fragment slot="bottomControls">
      <FbBottomControlsRow>
        <FbButton type="button" onClick={() => (isReadOnlyView = true)}>RoV</FbButton>
        <div style="flex: 1;"></div>
        <FbAuthAndSensitivity
          bind:username
          bind:password
          bind:highlySensitive
          bind:finalChecked
          {formChanged}
          finalDisabled={requiredFieldsIncomplete}
        />
        <FbSaveCancelButtons saveDisabled={saveDisabled} {formChanged} saving={isSaving} showRov={false} onSave={requestSave} onCancel={cancel} />
      </FbBottomControlsRow>
    </svelte:fragment>
  </FbLayout>
{/if}

{#if showDraftPopup}
  <FbDraftPopup onSaveDraft={() => { showDraftPopup = false; saveTreatmentSummary('draft'); }} onCancel={() => (showDraftPopup = false)} />
{/if}

{#if showCancelPopup}
  <FbCancelPopup onDiscard={() => (window.location.href = 'index.html')} onReturnToForm={() => (showCancelPopup = false)} />
{/if}

{#if isSaving}
  <FbSavingPopup />
{/if}

{#if showSavedPopup}
  <FbSavedPopup />
{/if}

{#if saveError}
  <FbSaveErrorPopup error={saveError} onReturnToForm={() => (saveError = '')} />
{/if}
