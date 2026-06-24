<script lang="ts">
  import { onMount } from 'svelte';
  import FbAuthAndSensitivity from '../components/fbAuthAndSensitivity.svelte';
  import FbBottomControlsRow from '../components/fbBottomControlsRow.svelte';
  import FbBoxedWarning from '../components/fbBoxedWarning.svelte';
  import FbButton from '../components/fbButton.svelte';
  import FbCheck from '../components/fbCheck.svelte';
  import FbDateExact from '../components/fbDateExact.svelte';
  import FbDateHeightWeightBMIRow from '../components/fbDateHeightWeightBMIRow.svelte';
  import FbDropdown from '../components/fbDropdown.svelte';
  import FbGridCell from '../components/fbGridCell.svelte';
  import FbGridRow from '../components/fbGridRow.svelte';
  import FbGroup from '../components/fbGroup.svelte';
  import FbHeader from '../components/fbHeader.svelte';
  import FbInverseSubq from '../components/fbInverseSubq.svelte';
  import FbLayout from '../components/fbLayout.svelte';
  import FbMSISelector from '../components/fbMSISelector.svelte';
  import FbModalCancel from '../components/fbModalCancel.svelte';
  import FbModalDraft from '../components/fbModalDraft.svelte';
  import FbModalSaveError from '../components/fbModalSaveError.svelte';
  import FbModalSaved from '../components/fbModalSaved.svelte';
  import FbModalSaving from '../components/fbModalSaving.svelte';
  import FbNotificationTypeGroup from '../components/fbNotificationTypeGroup.svelte';
  import FbQuestion from '../components/fbQuestion.svelte';
  import FbRadio from '../components/fbRadio.svelte';
  import FbRoVField from '../components/fbRoVField.svelte';
  import FbSaveCancelButtons from '../components/fbSaveCancelButtons.svelte';
  import FbSection from '../components/fbSection.svelte';
  import FbSmartDropdown from '../components/fbSmartDropdown.svelte';
  import FbTextArea from '../components/fbTextArea.svelte';
  import FbTextInput from '../components/fbTextInput.svelte';
  import { facilities, facilitiesForHealthBoard, healthBoards, patientLocations, specialityValuesForFacility } from '../lib/clinicalDestinations';
  import { getForm, getFormHistory, getFormVersion, getLatestVersion, getPatient, insertForm, insertFormsIndex } from '../lib/api';
  import { generateUUID } from '../lib/dateFormat';
  import { compareFormStatesObj } from '../lib/formStateUtils';
  import type { Patient, SectionSpec } from '../lib/types';

  type SaveStatus = 'final' | 'draft';
  type FormState = Record<string, any>;

  const params = new URLSearchParams(window.location.search);
  export let patientUuid = params.get('patientUuid') || sessionStorage.getItem('fb_prev_patient_uuid') || 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
  export let formUuid = params.get('formUuid') || '';
  export let formVersion = Number(params.get('formVersion') || '') || null;
  export let openInRoV = params.get('openInRoV') === 'true';
  export let inline = false;
  export let onClose: () => void = () => {};

  const specialities = [
    { value: 'acute-internal-medicine', label: 'Acute internal medicine' },
    { value: 'anaesthetics', label: 'Anaesthetics' },
    { value: 'breast', label: 'Breast surgery' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'endocrine-surgery', label: 'Endocrine surgery' },
    { value: 'general-internal-medicine', label: 'General internal medicine' },
    { value: 'general-medical-practice', label: 'General medical practice' },
    { value: 'general-surgery', label: 'General Surgery' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'mental-health', label: 'Mental health' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'paediatric-cardiology', label: 'Paediatric cardiology' },
    { value: 'paediatrics', label: 'Paediatrics' },
    { value: 'physiology', label: 'Physiology' },
    { value: 'respiratory-medicine', label: 'Respiratory medicine' },
    { value: 'stroke-medicine', label: 'Stroke medicine' },
    { value: 'trauma-and-orthopaedics', label: 'Trauma and orthopaedics' },
  ];
  const organisationLabels = Object.fromEntries(healthBoards.map((item) => [item.value, item.label]));
  const hospitalLabels = Object.fromEntries(facilities.map((item) => [item.value, item.label]));
  const specialityLabels = Object.fromEntries(specialities.map((item) => [item.value, item.label]));
  const implantCentreOptions = facilities.filter((facility) => ['ysbyty-abermawr', 'llanawel-general', 'tref-afon-hospital'].includes(facility.value));
  const manufacturerOptions = ['Abbott', 'Biotronik', 'Boston Scientific', 'Medtronic', 'MicroPort', 'Other'];

  const sectionsConfig: SectionSpec[] = [
    { id: 'to', name: 'To', requiredFields: ['organisation', 'hospital'] },
    { id: 'from', name: 'From', requiredFields: ['fromOrganisation', 'fromSpeciality', 'fromHospital'] },
    { id: 'requestType', name: 'Request type', requiredFields: ['requestType', 'capacity'] },
    { id: 'testsRequired', name: 'Tests required', getIncompleteCount: (state) => selectedTests(state).length ? 0 : 1 },
    { id: 'pastMedicalHistory', name: 'Past medical history', requiredFields: ['cardiacDevice', 'previousCardiacSurgery'] },
    { id: 'otherPatientInformation', name: 'Other patient information' },
    { id: 'requestor', name: 'Requestor', requiredFields: ['requestor', 'requestorContact'] },
  ];

  const defaultState: FormState = {
    organisation: '',
    hospital: '',
    forAttentionOf: '',
    fromOrganisation: 'cwm-hafan',
    fromHospital: 'llanawel-general',
    fromSpeciality: 'cardiology',
    seniorResponsibleClinician: '',
    requestType: '',
    urgency: 'routine',
    appointmentType: '',
    capacity: 'unknown',
    deferTests: 'no',
    notificationType: 'routine',
    cardiacDevice: 'unknown',
    previousCardiacSurgery: 'unknown',
    preferredLanguage: 'english',
  };

  const testFields = [
    ['testAbpm', 'Ambulatory BP monitoring'],
    ['testAecg', 'Ambulatory ECG'],
    ['testEtt', 'Exercise tolerance test'],
    ['testIlrDownload', 'Implantable loop recorder (ILR) download'],
    ['testCiedCheck', 'Cardiac implanted electronic device (CIED) check'],
    ['testTilt', 'Tilt test'],
    ['testTte', 'Transthoracic echocardiogram'],
  ] as const;

  let patient: Patient | null = null;
  let loadingData = true;
  let activeSection = 'to';
  let isReadOnlyView = openInRoV;
  let formState: FormState = { ...defaultState };
  let cleanSnapshot: FormState | null = null;
  let finalChecked = false;
  let highlySensitive = false;
  let username = 'demoUser';
  let password = '';
  let showDraftPopup = false;
  let showCancelPopup = false;
  let showSavingPopup = false;
  let showSavedPopup = false;
  let saveError = '';
  let formHistory: any[] = [];
  let showHistoryMenu = false;

  $: filteredSpecialities = (specialityValuesForFacility(formState.fromHospital || formState.hospital).length
    ? specialities.filter((item) => specialityValuesForFacility(formState.fromHospital || formState.hospital).includes(item.value))
    : specialities);
  $: formChanged = cleanSnapshot !== null && !compareFormStatesObj(cleanState({ ...formState, finalChecked, highlySensitive }), cleanState(cleanSnapshot));
  $: requiredFieldsIncomplete = sectionsConfig.some((section) => {
    const required = section.requiredFields?.filter((field) => !formState[field]).length || 0;
    return required + (section.getIncompleteCount?.(formState) || 0) > 0;
  });
  $: formStatus = finalChecked ? 'final' : 'draft';

  function selectedTests(state: FormState) {
    return testFields.filter(([key]) => !!state[key]).map(([, label]) => label);
  }

  function cleanState(state: FormState) {
    return Object.fromEntries(Object.entries(state).filter(([, value]) => value !== undefined && value !== null && value !== ''));
  }

  function setField(field: string, value: any) {
    formState = { ...formState, [field]: value };
  }

  function displayValue(value: string, labels?: Record<string, string>) {
    return labels?.[value] || value;
  }

  function closeForm() {
    if (inline) onClose();
    else window.location.href = 'index.html';
  }

  async function saveCardiology(status: SaveStatus) {
    try {
      showSavingPopup = true;
      saveError = '';
      const uuid = formState.uuid || formUuid || generateUUID();
      let version = 0;
      if (uuid && (formState.uuid || formUuid)) {
        const latest = await getLatestVersion('cardiology_test_requests', uuid);
        version = latest.version === null ? 0 : Number(latest.version) + 1;
      }
      const now = new Date().toISOString();
      const formData = {
        ...cleanState(formState),
        uuid,
        username,
        password,
        finalChecked: status === 'final',
        highlySensitive,
      };
      await insertForm('cardiology_test_requests', {
        uuid,
        version,
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: now,
        form_status: status,
        highly_sensitive: highlySensitive,
        organisation: formState.fromOrganisation || formState.organisation || null,
        hospital: formState.hospital || formState.fromHospital || null,
        senior_responsible_clinician: formState.seniorResponsibleClinician || null,
        speciality: formState.fromSpeciality || 'cardiology',
        form_data: formData,
      });
      await insertFormsIndex({
        form_uuid: uuid,
        form_version: version,
        form_type: 'cardiology_test_request',
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: now,
        document_datetime: now,
        form_status: status,
        event_or_document: 'Document',
        organisation: formState.fromOrganisation || formState.organisation || null,
        hospital: formState.hospital || formState.fromHospital || null,
        senior_responsible_clinician: formState.seniorResponsibleClinician || null,
        speciality: formState.fromSpeciality || 'cardiology',
        highly_sensitive: highlySensitive,
        details: selectedTests(formState).join(', ') || 'Cardiology test request',
      });
      formUuid = uuid;
      formVersion = version;
      formState = { ...formData };
      finalChecked = status === 'final';
      cleanSnapshot = cleanState({ ...formState, finalChecked, highlySensitive });
      showSavedPopup = true;
      window.setTimeout(closeForm, 800);
    } catch (error) {
      saveError = error instanceof Error ? error.message : String(error);
    } finally {
      showSavingPopup = false;
    }
  }

  function requestSave() {
    if (!finalChecked) showDraftPopup = true;
    else void saveCardiology('final');
  }

  onMount(async () => {
    try {
      patient = await getPatient(patientUuid);
      if (formUuid) {
        const saved = formVersion ? await getFormVersion('cardiology_test_requests', formUuid, formVersion) : await getForm('cardiology_test_requests', formUuid);
        const savedData = saved?.form_data || {};
        formState = { ...defaultState, ...savedData, uuid: formUuid };
        finalChecked = saved?.form_status === 'final' || Boolean(savedData.finalChecked);
        highlySensitive = Boolean(saved?.highly_sensitive || savedData.highlySensitive);
        formHistory = await getFormHistory(formUuid);
      }
      isReadOnlyView = openInRoV;
    } catch (error) {
      saveError = error instanceof Error ? error.message : String(error);
    } finally {
      loadingData = false;
      cleanSnapshot = cleanState({ ...formState, finalChecked, highlySensitive });
    }
  });
</script>

{#snippet radio(field: string, value: string, label: string)}
  <FbRadio name={field} {value} checked={formState[field] === value} {label} onChange={() => setField(field, value)} />
{/snippet}

{#snippet statusRadios(field: string)}
  <FbGroup subfield>
    {@render radio(field, 'Confirmed', 'Confirmed')}
    {@render radio(field, 'Suspected', 'Suspected')}
  </FbGroup>
{/snippet}

{#snippet cardiologyIndications(prefix: string)}
  <FbGroup label="Indications" subfield>
    <FbCheck name={`${prefix}Symptoms`} checked={!!formState[`${prefix}Symptoms`]} label="Symptoms" onChange={(checked) => setField(`${prefix}Symptoms`, checked)} />
    <FbCheck name={`${prefix}Surveillance`} checked={!!formState[`${prefix}Surveillance`]} label="Surveillance" onChange={(checked) => setField(`${prefix}Surveillance`, checked)} />
    <FbCheck name={`${prefix}Medication review`} checked={!!formState[`${prefix}Medication review`]} label="Medication review" onChange={(checked) => setField(`${prefix}Medication review`, checked)} />
    <FbCheck name={`${prefix}Other`} checked={!!formState[`${prefix}Other`]} label="Other" onChange={(checked) => setField(`${prefix}Other`, checked)}>
      <FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState[`${prefix}OtherDetails`] || ''} onChange={(value) => setField(`${prefix}OtherDetails`, value)} required subfield />
    </FbCheck>
  </FbGroup>
{/snippet}

{#if loadingData}
  <p style="padding: 0.8rem;">Loading cardiology test request...</p>
{:else if isReadOnlyView}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection isReadOnlyView={true}>
    <svelte:fragment slot="header"><FbHeader title="Cardiology test request" {patient} {formStatus} {highlySensitive} /></svelte:fragment>
    <div style="padding: 0.4rem;">
      <FbSection id="to" title="To">
        <FbGridRow cols={3}>
          <FbRoVField label="Health board" value={displayValue(formState.organisation, organisationLabels)} />
          <FbRoVField label="Hospital / Department" value={displayValue(formState.hospital, hospitalLabels)} />
          <FbRoVField label="For attention of" value={formState.forAttentionOf} />
        </FbGridRow>
      </FbSection>
      <FbSection id="from" title="From">
        <FbGridRow cols={4}>
          <FbRoVField label="Health board" value={displayValue(formState.fromOrganisation, organisationLabels)} />
          <FbRoVField label="Hospital" value={displayValue(formState.fromHospital, hospitalLabels)} />
          <FbRoVField label="Speciality" value={displayValue(formState.fromSpeciality, specialityLabels)} />
          <FbRoVField label="Senior responsible clinician" value={formState.seniorResponsibleClinician} />
        </FbGridRow>
      </FbSection>
      <FbSection id="requestType" title="Request type">
        <FbRoVField label="Request type" value={formState.requestType} />
        <FbRoVField label="Patient location" value={formState.patientLocation} />
        <FbRoVField label="Transport" value={formState.transport} />
        <FbRoVField label="Urgency" value={formState.urgency} />
        <FbRoVField label="Capacity" value={formState.capacity} />
        <FbRoVField label="Report required by" value={formState.reportRequiredBy} />
        <FbRoVField label="Reason required by" value={formState.reportRequiredByReason} />
      </FbSection>
      <FbSection id="testsRequired" title="Tests required"><FbRoVField label="Tests required" value={selectedTests(formState).join(', ')} /></FbSection>
      <FbSection id="pastMedicalHistory" title="Past medical history">
        <FbRoVField label="Cardiac implanted device" value={formState.cardiacDevice} />
        <FbRoVField label="Previous cardiac surgery" value={formState.previousCardiacSurgery} />
        <FbRoVField label="Other relevant history" value={formState.pmhOtherDetails} />
      </FbSection>
      <FbSection id="otherPatientInformation" title="Other patient information">
        <FbRoVField label="Preferred language" value={formState.preferredLanguage} />
        <FbRoVField label="Clinical trial" value={formState.clinicalTrial} />
        <FbRoVField label="Other relevant information" value={formState.otherRelevantInformation} />
        <FbRoVField label="Any infection control issues" value={formState.infectionControlIssues} />
        <FbRoVField label="Height" value={formState.heightCm} units="cm" />
        <FbRoVField label="Weight" value={formState.weightKg} units="kg" />
      </FbSection>
      <FbSection id="requestor" title="Requestor">
        <FbRoVField label="Requestor" value={formState.requestor} coded={!!formState.requestorCoded} />
        <FbRoVField label="Contact details" value={formState.requestorContact} />
      </FbSection>
    </div>
    <svelte:fragment slot="bottomControls">
      <FbBottomControlsRow>
        <FbButton type="button" onClick={() => (isReadOnlyView = false)}>EV</FbButton>
        {#if formUuid}<FbButton type="button" onClick={() => (showHistoryMenu = true)}>History</FbButton>{/if}
        {#if showHistoryMenu && formHistory.length}
          <select onchange={(event) => {
            const version = Number((event.currentTarget as HTMLSelectElement).value);
            if (version >= 0) {
              void getFormVersion('cardiology_test_requests', formUuid, version).then((saved) => {
                formState = { ...defaultState, ...(saved?.form_data || {}), uuid: formUuid };
                finalChecked = saved?.form_status === 'final' || Boolean(saved?.form_data?.finalChecked);
                highlySensitive = Boolean(saved?.highly_sensitive || saved?.form_data?.highlySensitive);
                cleanSnapshot = cleanState({ ...formState, finalChecked, highlySensitive });
              });
            }
          }}>
            <option value="">Version</option>
            {#each formHistory as item}<option value={item.form_version}>v{item.form_version}</option>{/each}
          </select>
        {/if}
        <div style="flex: 1;"></div>
        <FbButton type="button" onClick={closeForm}>Back</FbButton>
      </FbBottomControlsRow>
    </svelte:fragment>
  </FbLayout>
{:else}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection onFormActivity={() => (formState = { ...formState })}>
    <svelte:fragment slot="header"><FbHeader title="Cardiology test request" {patient} {formStatus} {highlySensitive} /></svelte:fragment>
    <FbSection id="to" title="To">
      <FbGridRow cols={3}>
        <FbGridCell><FbDropdown label="Health board" value={formState.organisation || ''} onChange={(value) => { setField('organisation', value); setField('hospital', ''); }} options={healthBoards} required /></FbGridCell>
        <FbGridCell><FbDropdown label="Hospital / Department" value={formState.hospital || ''} onChange={(value) => setField('hospital', value)} options={facilitiesForHealthBoard(formState.organisation || '')} placeholder="Select" required /></FbGridCell>
        <FbGridCell><FbTextInput label="For attention of" value={formState.forAttentionOf || ''} onChange={(value) => setField('forAttentionOf', value)} /></FbGridCell>
      </FbGridRow>
    </FbSection>
    <FbSection id="from" title="From (requesting organisation and clinician)">
      <FbGridRow cols={4}>
        <FbGridCell><FbDropdown label="Health board" value={formState.fromOrganisation || ''} onChange={(value) => { setField('fromOrganisation', value); setField('fromHospital', ''); }} options={healthBoards} required /></FbGridCell>
        <FbGridCell><FbDropdown label="Hospital" value={formState.fromHospital || ''} onChange={(value) => setField('fromHospital', value)} options={facilitiesForHealthBoard(formState.fromOrganisation || '')} placeholder="Select" required /></FbGridCell>
        <FbGridCell><FbDropdown label="Speciality" value={formState.fromSpeciality || ''} onChange={(value) => setField('fromSpeciality', value)} options={filteredSpecialities} placeholder="Select" required /></FbGridCell>
        <FbGridCell><FbTextInput label="Senior responsible clinician" value={formState.seniorResponsibleClinician || ''} onChange={(value) => setField('seniorResponsibleClinician', value)} /></FbGridCell>
      </FbGridRow>
    </FbSection>
    <FbSection id="requestType" title="Request type">
      <FbGroup label="Request type" required>
        <FbRadio name="requestType" value="inpatient-ed" checked={formState.requestType === 'inpatient-ed'} label="Inpatient / ED" onChange={() => setField('requestType', 'inpatient-ed')}>
          <FbSmartDropdown label="Patient location" value={formState.patientLocation || ''} onChange={(value) => setField('patientLocation', value)} options={patientLocations} required subfield />
          <FbCheck name="uscPathway" checked={!!formState.uscPathway} label="USC pathway" onChange={(checked) => setField('uscPathway', checked)} />
          <FbCheck name="wardTest" checked={!!formState.wardTest} label="Test(s) required on ward" onChange={(checked) => setField('wardTest', checked)} />
          <FbInverseSubq open={!formState.wardTest}>
            <FbGroup label="Transport" required subfield>
              {@render radio('transport', 'walking', 'Walking')}{@render radio('transport', 'chair', 'Chair')}{@render radio('transport', 'trolley', 'Trolley')}{@render radio('transport', 'bed', 'Bed')}
            </FbGroup>
          </FbInverseSubq>
          <FbGroup label="Additional information" subfield>
            <FbCheck name="hasDripStand" checked={!!formState.hasDripStand} label="Has drip stand" onChange={(checked) => setField('hasDripStand', checked)} />
            <FbCheck name="onOxygen" checked={!!formState.onOxygen} label="On oxygen" onChange={(checked) => setField('onOxygen', checked)} />
            <FbCheck name="requiresHoist" checked={!!formState.requiresHoist} label="Requires hoist" onChange={(checked) => setField('requiresHoist', checked)} />
            <FbCheck name="barrierNursing" checked={!!formState.barrierNursing} label="Barrier nursing" onChange={(checked) => setField('barrierNursing', checked)} />
          </FbGroup>
          <FbNotificationTypeGroup value={formState.notificationType || ''} onChange={(value) => setField('notificationType', value)} subfield />
        </FbRadio>
        <FbRadio name="requestType" value="outpatient" checked={formState.requestType === 'outpatient'} label="Outpatient" onChange={() => setField('requestType', 'outpatient')}>
          <FbGroup label="Urgency" required subfield>
            {@render radio('urgency', 'routine', 'Routine')}
            <FbRadio name="urgency" value="urgent" checked={formState.urgency === 'urgent'} label="Urgent" onChange={() => setField('urgency', 'urgent')}>
              <FbTextArea label="Why is this request urgent?" value={formState.urgentReason || ''} onChange={(value) => setField('urgentReason', value)} required subfield />
            </FbRadio>
            {@render radio('urgency', 'usc', 'USC')}
          </FbGroup>
          <FbGroup label="Appointment type" required subfield>
            {@render radio('appointmentType', 'walk-around', 'Walk around')}{@render radio('appointmentType', 'send-out-appointment', 'Send out appointment')}
          </FbGroup>
          <FbCheck name="ambulanceRequired" checked={!!formState.ambulanceRequired} label="Ambulance required" onChange={(checked) => setField('ambulanceRequired', checked)} />
          <FbCheck name="patientContactChecked" checked={!!formState.patientContactChecked} label="Patient contact information checked" onChange={(checked) => setField('patientContactChecked', checked)} />
        </FbRadio>
      </FbGroup>
      <FbGridRow cols={4}>
        <FbGridCell><FbGroup label="Patient category" required>{@render radio('patientCategory', 'nhs', 'NHS')}{@render radio('patientCategory', 'clinical-trial', 'Clinical trial')}</FbGroup></FbGridCell>
        <FbGridCell><FbGroup label="Does the patient have capacity to consent to the test(s)?" required>{@render radio('capacity', 'yes', 'Yes')}{@render radio('capacity', 'no', 'No')}{@render radio('capacity', 'unknown', 'Unknown or not recorded')}</FbGroup></FbGridCell>
        <FbGridCell><FbGroup label="Defer test(s)?"><FbRadio name="deferTests" value="yes" checked={formState.deferTests === 'yes'} label="Yes" onChange={() => setField('deferTests', 'yes')}><FbQuestion label="Defer test(s) until" subfield><FbDateExact name="deferTestsUntil" value={formState.deferTestsUntil || ''} onChange={(value) => setField('deferTestsUntil', value)} /></FbQuestion><FbTextArea label="Reason for deferral" value={formState.deferReason || ''} onChange={(value) => setField('deferReason', value)} required subfield /></FbRadio>{@render radio('deferTests', 'no', 'No')}</FbGroup></FbGridCell>
        <FbGridCell><FbQuestion label="Report required by"><FbDateExact name="reportRequiredBy" value={formState.reportRequiredBy || ''} onChange={(value) => setField('reportRequiredBy', value)}><FbTextArea label="Reason required by" value={formState.reportRequiredByReason || ''} onChange={(value) => setField('reportRequiredByReason', value)} required subfield /></FbDateExact></FbQuestion></FbGridCell>
      </FbGridRow>
    </FbSection>
    <FbSection id="testsRequired" title="Tests required">
      <FbGroup>
        <FbCheck name="testAbpm" checked={!!formState.testAbpm} label="Ambulatory BP monitoring" onChange={(checked) => setField('testAbpm', checked)}>{@render cardiologyIndications('abpm')}</FbCheck>
        <FbCheck name="testAecg" checked={!!formState.testAecg} label="Ambulatory ECG" onChange={(checked) => setField('testAecg', checked)}>{@render cardiologyIndications('aecg')}</FbCheck>
        <FbCheck name="testEtt" checked={!!formState.testEtt} label="Exercise tolerance test" onChange={(checked) => setField('testEtt', checked)}><FbBoxedWarning text="This test is NOT available in St Elsewhere UHB." />{@render cardiologyIndications('ett')}</FbCheck>
        <FbCheck name="testIlrDownload" checked={!!formState.testIlrDownload} label="Implantable loop recorder (ILR) download" onChange={(checked) => setField('testIlrDownload', checked)}>{@render cardiologyIndications('ilr')}</FbCheck>
        <FbCheck name="testCiedCheck" checked={!!formState.testCiedCheck} label="Cardiac implanted electronic device (CIED) check" onChange={(checked) => setField('testCiedCheck', checked)}>
          <FbDropdown label="Implant centre" value={formState.implantCentre || ''} onChange={(value) => setField('implantCentre', value)} options={implantCentreOptions} placeholder="Select" subfield />
          <FbDropdown label="Manufacturer" value={formState.manufacturer || ''} onChange={(value) => setField('manufacturer', value)} options={manufacturerOptions} placeholder="Select" subfield />
          {#if formState.manufacturer === 'Other'}<div class="dropdown-subq"><FbTextInput label="Other manufacturer" value={formState.manufacturerOther || ''} onChange={(value) => setField('manufacturerOther', value)} required subfield /></div>{/if}
          {@render cardiologyIndications('cied')}
        </FbCheck>
        <FbCheck name="testTilt" checked={!!formState.testTilt} label="Tilt test" onChange={(checked) => setField('testTilt', checked)}><FbBoxedWarning text="This test is only available in St Elsewhere UHB." />{@render cardiologyIndications('tilt')}</FbCheck>
        <FbCheck name="testTte" checked={!!formState.testTte} label="Transthoracic echocardiogram" onChange={(checked) => setField('testTte', checked)}>{@render cardiologyIndications('tte')}</FbCheck>
      </FbGroup>
    </FbSection>
    <FbSection id="pastMedicalHistory" title="Past medical history">
      <FbGroup label="Does the patient have a cardiac implanted device?" required>
        {@render radio('cardiacDevice', 'No', 'No')}
        {@render radio('cardiacDevice', 'Cardiac resynchronisation therapy (CRT-P)', 'Cardiac resynchronisation therapy (CRT-P)')}
        <FbRadio name="cardiacDevice" value="Implantable cardioverter defibrillator (ICD)" checked={formState.cardiacDevice === 'Implantable cardioverter defibrillator (ICD)'} label="Implantable cardioverter defibrillator (ICD)" onChange={() => setField('cardiacDevice', 'Implantable cardioverter defibrillator (ICD)')}>
          <FbCheck name="cardiacDeviceIcdCrtD" checked={!!formState.cardiacDeviceIcdCrtD} label="with cardiac resynchronisation therapy (CRT-D)" onChange={(checked) => setField('cardiacDeviceIcdCrtD', checked)} />
        </FbRadio>
        {@render radio('cardiacDevice', 'Implantable loop recorder (ILR)', 'Implantable loop recorder (ILR)')}
        {@render radio('cardiacDevice', 'Pacemaker', 'Pacemaker')}
        {@render radio('cardiacDevice', 'Unknown or not recorded', 'Unknown or not recorded')}
      </FbGroup>
      <FbGroup label="Has the patient undergone any previous cardiac surgery?" required>
        <FbRadio name="previousCardiacSurgery" value="yes" checked={formState.previousCardiacSurgery === 'yes'} label="Yes" onChange={() => setField('previousCardiacSurgery', 'yes')}>
          <FbGroup subfield>
            <FbCheck name="previousCabg" checked={!!formState.previousCabg} label="Coronary artery bypass graft" onChange={(checked) => setField('previousCabg', checked)} />
            <FbCheck name="previousValveSurgery" checked={!!formState.previousValveSurgery} label="Valve surgery" onChange={(checked) => setField('previousValveSurgery', checked)}>
              <FbGroup subfield>
                <FbCheck name="previousAorticValve" checked={!!formState.previousAorticValve} label="Aortic valve" onChange={(checked) => setField('previousAorticValve', checked)}>
                  <FbGroup subfield>
                    <FbRadio name="previousAorticValveProcedure" value="Replacement" checked={formState.previousAorticValveProcedure === 'Replacement'} label="Replacement" onChange={() => setField('previousAorticValveProcedure', 'Replacement')}>
                      <FbGroup subfield>{@render radio('previousAorticValveReplacementType', 'Biological', 'Biological')}{@render radio('previousAorticValveReplacementType', 'Mechanical', 'Mechanical')}{@render radio('previousAorticValveReplacementType', 'TAVI', 'TAVI')}{@render radio('previousAorticValveReplacementType', 'Unknown or not recorded', 'Unknown or not recorded')}</FbGroup>
                    </FbRadio>
                    {@render radio('previousAorticValveProcedure', 'Repair', 'Repair')}
                  </FbGroup>
                </FbCheck>
                <FbCheck name="previousMitralValve" checked={!!formState.previousMitralValve} label="Mitral valve" onChange={(checked) => setField('previousMitralValve', checked)}>
                  <FbGroup subfield>
                    <FbRadio name="previousMitralValveProcedure" value="Replacement" checked={formState.previousMitralValveProcedure === 'Replacement'} label="Replacement" onChange={() => setField('previousMitralValveProcedure', 'Replacement')}>
                      <FbGroup subfield>{@render radio('previousMitralValveReplacementType', 'Biological', 'Biological')}{@render radio('previousMitralValveReplacementType', 'Mechanical', 'Mechanical')}{@render radio('previousMitralValveReplacementType', 'Unknown or not recorded', 'Unknown or not recorded')}</FbGroup>
                    </FbRadio>
                    {@render radio('previousMitralValveProcedure', 'Repair', 'Repair')}
                  </FbGroup>
                </FbCheck>
              </FbGroup>
            </FbCheck>
            <FbCheck name="previousOtherSurgery" checked={!!formState.previousOtherSurgery} label="Other" onChange={(checked) => setField('previousOtherSurgery', checked)}><FbTextInput label="Please specify" value={formState.previousOtherSurgeryDetails || ''} onChange={(value) => setField('previousOtherSurgeryDetails', value)} subfield /></FbCheck>
          </FbGroup>
        </FbRadio>
        {@render radio('previousCardiacSurgery', 'no', 'No')}{@render radio('previousCardiacSurgery', 'unknown', 'Unknown or not recorded')}
      </FbGroup>
      <FbGroup label="Tick all of the following that apply">
        <FbCheck name="pmhAortopathy" checked={!!formState.pmhAortopathy} label="Aortopathy" onChange={(checked) => setField('pmhAortopathy', checked)}>{@render statusRadios('pmhAortopathyStatus')}<FbTextInput label="Diagnosis" value={formState.pmhAortopathyDiagnosis || ''} onChange={(value) => setField('pmhAortopathyDiagnosis', value)} subfield /></FbCheck>
        <FbCheck name="pmhArrhythmia" checked={!!formState.pmhArrhythmia} label="Arrhythmia or palpitations" onChange={(checked) => setField('pmhArrhythmia', checked)}><FbGroup subfield><FbCheck name="pmhAtrialFibrillation" checked={!!formState.pmhAtrialFibrillation} label="Atrial fibrillation" onChange={(checked) => setField('pmhAtrialFibrillation', checked)}>{@render statusRadios('pmhAtrialFibrillationStatus')}</FbCheck><FbCheck name="pmhBradyarrhythmia" checked={!!formState.pmhBradyarrhythmia} label="Bradyarrhythmia" onChange={(checked) => setField('pmhBradyarrhythmia', checked)}>{@render statusRadios('pmhBradyarrhythmiaStatus')}</FbCheck><FbCheck name="pmhSvt" checked={!!formState.pmhSvt} label="Supraventricular tachycardia" onChange={(checked) => setField('pmhSvt', checked)}>{@render statusRadios('pmhSvtStatus')}</FbCheck><FbCheck name="pmhVentricularTachycardia" checked={!!formState.pmhVentricularTachycardia} label="Ventricular tachycardia" onChange={(checked) => setField('pmhVentricularTachycardia', checked)}>{@render statusRadios('pmhVentricularTachycardiaStatus')}</FbCheck></FbGroup></FbCheck>
        <FbCheck name="pmhCardiomyopathy" checked={!!formState.pmhCardiomyopathy} label="Cardiomyopathy" onChange={(checked) => setField('pmhCardiomyopathy', checked)}><FbGroup subfield><FbCheck name="pmhArvc" checked={!!formState.pmhArvc} label="Arrythmogenic right ventricular cardiomyopathy (ARVC)" onChange={(checked) => setField('pmhArvc', checked)}>{@render statusRadios('pmhArvcStatus')}<FbCheck name="pmhArvcStatusFamilyHistory" checked={!!formState.pmhArvcStatusFamilyHistory} label="Family history screening" onChange={(checked) => setField('pmhArvcStatusFamilyHistory', checked)} /></FbCheck><FbCheck name="pmhDilatedCardiomyopathy" checked={!!formState.pmhDilatedCardiomyopathy} label="Dilated cardiomyopathy" onChange={(checked) => setField('pmhDilatedCardiomyopathy', checked)}>{@render statusRadios('pmhDilatedCardiomyopathyStatus')}</FbCheck><FbCheck name="pmhHypertrophicCardiomyopathy" checked={!!formState.pmhHypertrophicCardiomyopathy} label="Hypertrophic cardiomyopathy" onChange={(checked) => setField('pmhHypertrophicCardiomyopathy', checked)}>{@render statusRadios('pmhHypertrophicCardiomyopathyStatus')}</FbCheck><FbCheck name="pmhOtherCardiomyopathy" checked={!!formState.pmhOtherCardiomyopathy} label="Other" onChange={(checked) => setField('pmhOtherCardiomyopathy', checked)}><FbTextInput label="Diagnosis" value={formState.pmhOtherCardiomyopathyDiagnosis || ''} onChange={(value) => setField('pmhOtherCardiomyopathyDiagnosis', value)} subfield />{@render statusRadios('pmhOtherCardiomyopathyStatus')}</FbCheck></FbGroup></FbCheck>
        <FbCheck name="pmhChemotherapy" checked={!!formState.pmhChemotherapy} label="Chemotherapy" onChange={(checked) => setField('pmhChemotherapy', checked)} />
        <FbCheck name="pmhCongenitalHeartDisease" checked={!!formState.pmhCongenitalHeartDisease} label="Congenital heart disease" onChange={(checked) => setField('pmhCongenitalHeartDisease', checked)}><FbGroup subfield>{@render radio('pmhCongenitalHeartDiseaseStatus', 'Confirmed', 'Confirmed')}{@render radio('pmhCongenitalHeartDiseaseStatus', 'Suspected', 'Suspected')}<FbCheck name="pmhCongenitalHeartDiseaseOperated" checked={!!formState.pmhCongenitalHeartDiseaseOperated} label="Operated" onChange={(checked) => setField('pmhCongenitalHeartDiseaseOperated', checked)} /><FbTextInput label="Diagnosis" value={formState.pmhCongenitalHeartDiseaseDiagnosis || ''} onChange={(value) => setField('pmhCongenitalHeartDiseaseDiagnosis', value)} subfield /></FbGroup></FbCheck>
        <FbCheck name="pmhCoronaryArteryDisease" checked={!!formState.pmhCoronaryArteryDisease} label="Coronary artery disease" onChange={(checked) => setField('pmhCoronaryArteryDisease', checked)}><FbGroup subfield><FbCheck name="pmhMyocardialInfarction" checked={!!formState.pmhMyocardialInfarction} label="Myocardial infarction" onChange={(checked) => setField('pmhMyocardialInfarction', checked)}>{@render statusRadios('pmhMyocardialInfarctionStatus')}</FbCheck><FbCheck name="pmhAcuteCoronarySyndrome" checked={!!formState.pmhAcuteCoronarySyndrome} label="Acute coronary syndrome" onChange={(checked) => setField('pmhAcuteCoronarySyndrome', checked)}>{@render statusRadios('pmhAcuteCoronarySyndromeStatus')}</FbCheck><FbCheck name="pmhExerciseInducedAngina" checked={!!formState.pmhExerciseInducedAngina} label="Exercise induced angina" onChange={(checked) => setField('pmhExerciseInducedAngina', checked)}>{@render statusRadios('pmhExerciseInducedAnginaStatus')}</FbCheck></FbGroup></FbCheck>
        <FbCheck name="pmhEndocarditis" checked={!!formState.pmhEndocarditis} label="Endocarditis" onChange={(checked) => setField('pmhEndocarditis', checked)}>{@render statusRadios('pmhEndocarditisStatus')}</FbCheck>
        <FbCheck name="pmhHeartFailure" checked={!!formState.pmhHeartFailure} label="Heart failure or breathlessness" onChange={(checked) => setField('pmhHeartFailure', checked)}><FbGroup subfield>{@render radio('pmhHeartFailureStatus', 'Confirmed', 'Confirmed')}<FbRadio name="pmhHeartFailureStatus" value="Suspected" checked={formState.pmhHeartFailureStatus === 'Suspected'} label="Suspected" onChange={() => setField('pmhHeartFailureStatus', 'Suspected')}><FbTextInput label="BNP" value={formState.pmhHeartFailureBnp || ''} onChange={(value) => setField('pmhHeartFailureBnp', value)} subfield /></FbRadio><FbCheck name="pmhHeartFailureFamilyHistory" checked={!!formState.pmhHeartFailureFamilyHistory} label="Family history" onChange={(checked) => setField('pmhHeartFailureFamilyHistory', checked)} /></FbGroup></FbCheck>
        <FbCheck name="pmhInheritedCardiacConditions" checked={!!formState.pmhInheritedCardiacConditions} label="Inherited cardiac conditions" onChange={(checked) => setField('pmhInheritedCardiacConditions', checked)}><FbGroup subfield><FbCheck name="pmhLongQt" checked={!!formState.pmhLongQt} label="Long QT syndrome" onChange={(checked) => setField('pmhLongQt', checked)} /><FbCheck name="pmhBrugada" checked={!!formState.pmhBrugada} label="Brugada" onChange={(checked) => setField('pmhBrugada', checked)} /><FbCheck name="pmhCpvt" checked={!!formState.pmhCpvt} label="Catecholaminergic polymorphic condition (CPVT)" onChange={(checked) => setField('pmhCpvt', checked)} /></FbGroup></FbCheck>
        <FbCheck name="pmhStroke" checked={!!formState.pmhStroke} label="Stroke or embolic event" onChange={(checked) => setField('pmhStroke', checked)}>{@render statusRadios('pmhStrokeStatus')}</FbCheck>
        <FbCheck name="pmhPericardialDisease" checked={!!formState.pmhPericardialDisease} label="Pericardial disease" onChange={(checked) => setField('pmhPericardialDisease', checked)}>{@render statusRadios('pmhPericardialDiseaseStatus')}</FbCheck>
        <FbCheck name="pmhPulmonaryEmbolism" checked={!!formState.pmhPulmonaryEmbolism} label="Pulmonary embolism" onChange={(checked) => setField('pmhPulmonaryEmbolism', checked)}>{@render statusRadios('pmhPulmonaryEmbolismStatus')}</FbCheck>
        <FbCheck name="pmhTloc" checked={!!formState.pmhTloc} label="Transient loss of consciousness or syncope" onChange={(checked) => setField('pmhTloc', checked)} />
        <FbCheck name="pmhValveDisease" checked={!!formState.pmhValveDisease} label="Valve disease" onChange={(checked) => setField('pmhValveDisease', checked)}><FbGroup subfield><FbCheck name="pmhAorticRegurgitation" checked={!!formState.pmhAorticRegurgitation} label="Aortic regurgitation" onChange={(checked) => setField('pmhAorticRegurgitation', checked)}>{@render statusRadios('pmhAorticRegurgitationStatus')}</FbCheck><FbCheck name="pmhAorticStenosis" checked={!!formState.pmhAorticStenosis} label="Aortic stenosis" onChange={(checked) => setField('pmhAorticStenosis', checked)}>{@render statusRadios('pmhAorticStenosisStatus')}</FbCheck><FbCheck name="pmhMitralRegurgitation" checked={!!formState.pmhMitralRegurgitation} label="Mitral regurgitation" onChange={(checked) => setField('pmhMitralRegurgitation', checked)}>{@render statusRadios('pmhMitralRegurgitationStatus')}</FbCheck><FbCheck name="pmhMitralStenosis" checked={!!formState.pmhMitralStenosis} label="Mitral stenosis" onChange={(checked) => setField('pmhMitralStenosis', checked)}>{@render statusRadios('pmhMitralStenosisStatus')}</FbCheck><FbCheck name="pmhPulmonaryValveDisease" checked={!!formState.pmhPulmonaryValveDisease} label="Pulmonary valve disease" onChange={(checked) => setField('pmhPulmonaryValveDisease', checked)}>{@render statusRadios('pmhPulmonaryValveDiseaseStatus')}</FbCheck><FbCheck name="pmhTricuspidValveDisease" checked={!!formState.pmhTricuspidValveDisease} label="Tricuspid valve disease" onChange={(checked) => setField('pmhTricuspidValveDisease', checked)}>{@render statusRadios('pmhTricuspidValveDiseaseStatus')}</FbCheck></FbGroup></FbCheck>
        <FbCheck name="pmhOther" checked={!!formState.pmhOther} label="Other relevant history" onChange={(checked) => setField('pmhOther', checked)}><FbTextArea value={formState.pmhOtherDetails || ''} onChange={(value) => setField('pmhOtherDetails', value)} required subfield /></FbCheck>
      </FbGroup>
    </FbSection>
    <FbSection id="otherPatientInformation" title="Other patient information">
      <FbGridRow cols={3}>
        <FbGridCell><FbGroup label="Special requirements"><FbCheck name="confusionDementia" checked={!!formState.confusionDementia} label="Confusion / dementia" onChange={(checked) => setField('confusionDementia', checked)} /><FbCheck name="requiresInterpreter" checked={!!formState.requiresInterpreter} label="Interpreter required" onChange={(checked) => setField('requiresInterpreter', checked)} /><FbCheck name="hearingImpairment" checked={!!formState.hearingImpairment} label="Hearing impairment" onChange={(checked) => setField('hearingImpairment', checked)} /><FbCheck name="languageDifficulty" checked={!!formState.languageDifficulty} label="Language difficulty" onChange={(checked) => setField('languageDifficulty', checked)} /><FbCheck name="learningDifficulty" checked={!!formState.learningDifficulty} label="Learning difficulty" onChange={(checked) => setField('learningDifficulty', checked)} /><FbCheck name="visualImpairment" checked={!!formState.visualImpairment} label="Visual impairment" onChange={(checked) => setField('visualImpairment', checked)} /></FbGroup></FbGridCell>
        <FbGridCell><FbGroup label="Preferred language">{@render radio('preferredLanguage', 'english', 'English')}{@render radio('preferredLanguage', 'welsh', 'Welsh')}</FbGroup></FbGridCell>
        <FbGridCell><FbTextArea label="Clinical trial" value={formState.clinicalTrial || ''} onChange={(value) => setField('clinicalTrial', value)} /></FbGridCell>
      </FbGridRow>
      <FbGridRow cols={2}>
        <FbGridCell><FbTextArea label="Other relevant information" value={formState.otherRelevantInformation || ''} onChange={(value) => setField('otherRelevantInformation', value)} fullWidth /></FbGridCell>
        <FbGridCell><FbTextArea label="Any infection control issues" value={formState.infectionControlIssues || ''} onChange={(value) => setField('infectionControlIssues', value)} fullWidth /></FbGridCell>
      </FbGridRow>
      <FbGroup label="Height and weight">
        <FbDateHeightWeightBMIRow dateRecorded={formState.bmiDateRecorded || ''} heightCm={formState.heightCm || ''} weightKg={formState.weightKg || ''} onDateRecordedChange={(value) => setField('bmiDateRecorded', value)} onHeightCmChange={(value) => setField('heightCm', value)} onWeightKgChange={(value) => setField('weightKg', value)} />
      </FbGroup>
    </FbSection>
    <FbSection id="requestor" title="Requestor">
      <FbGridRow cols={1}>
        <FbGridCell><FbMSISelector label="Requestor" name="requestor" value={formState.requestor || ''} coded={!!formState.requestorCoded} onChange={(value, coded) => { setField('requestor', value); setField('requestorCoded', coded); }} required /></FbGridCell>
        <FbGridCell><FbTextInput label="Contact details" value={formState.requestorContact || ''} onChange={(value) => setField('requestorContact', value)} required /></FbGridCell>
      </FbGridRow>
    </FbSection>
    <svelte:fragment slot="bottomControls">
      <FbBottomControlsRow>
        <FbButton type="button" onClick={() => (isReadOnlyView = true)}>RoV</FbButton>
        <div style="flex: 1;"></div>
        <FbAuthAndSensitivity bind:username bind:password bind:highlySensitive bind:finalChecked {formChanged} finalDisabled={requiredFieldsIncomplete} />
        <FbSaveCancelButtons saveDisabled={!formChanged || requiredFieldsIncomplete} {formChanged} saving={showSavingPopup} showRov={false} onSave={requestSave} onCancel={() => formChanged ? (showCancelPopup = true) : closeForm()} />
      </FbBottomControlsRow>
    </svelte:fragment>
  </FbLayout>
{/if}

{#if showDraftPopup}<FbModalDraft onSaveDraft={() => { showDraftPopup = false; void saveCardiology('draft'); }} onCancel={() => (showDraftPopup = false)} />{/if}
{#if showCancelPopup}<FbModalCancel onDiscard={closeForm} onReturnToForm={() => (showCancelPopup = false)} />{/if}
{#if showSavingPopup}<FbModalSaving />{/if}
{#if showSavedPopup}<FbModalSaved />{/if}
{#if saveError}<FbModalSaveError error={saveError} onReturnToForm={() => (saveError = '')} />{/if}

<style>
  .dropdown-subq {
    padding-left: 1.5rem;
  }
</style>
