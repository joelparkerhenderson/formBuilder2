<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import FbAuthAndSensitivity from '$lib/components/fb/fbAuthAndSensitivity.svelte';
  import FbBottomControlsRow from '$lib/components/fb/fbBottomControlsRow.svelte';
  import FbBloodPressure from '$lib/components/fb/fbBloodPressure.svelte';
  import FbBoxedWarning from '$lib/components/fb/fbBoxedWarning.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbCheck from '$lib/components/fb/fbCheck.svelte';
  import FbDateExact from '$lib/components/fb/fbDateExact.svelte';
  import FbDateHeightWeightBMIRow from '$lib/components/fb/fbDateHeightWeightBMIRow.svelte';
  import FbDropdown from '$lib/components/fb/fbDropdown.svelte';
  import FbGridCell from '$lib/components/fb/fbGridCell.svelte';
  import FbGridRow from '$lib/components/fb/fbGridRow.svelte';
  import FbGroup from '$lib/components/fb/fbGroup.svelte';
  import FbHBSelector from '$lib/components/fb/fbHBSelector.svelte';
  import FbHeader from '$lib/components/fb/fbHeader.svelte';
  import FbInverseSubq from '$lib/components/fb/fbInverseSubq.svelte';
  import FbLayout from '$lib/components/fb/fbLayout.svelte';
  import FbMSISelector from '$lib/components/fb/fbMSISelector.svelte';
  import FbNumberInput from '$lib/components/fb/fbNumberInput.svelte';
  import FbModalCancel from '$lib/components/fb/fbModalCancel.svelte';
  import FbModalDraft from '$lib/components/fb/fbModalDraft.svelte';
  import FbModalSaveError from '$lib/components/fb/fbModalSaveError.svelte';
  import FbModalSaved from '$lib/components/fb/fbModalSaved.svelte';
  import FbModalSaving from '$lib/components/fb/fbModalSaving.svelte';
  import FbNotificationTypeGroup from '$lib/components/fb/fbNotificationTypeGroup.svelte';
  import FbQuestion from '$lib/components/fb/fbQuestion.svelte';
  import FbRadio from '$lib/components/fb/fbRadio.svelte';
  import FbReadOnly from '$lib/components/fb/fbReadOnly.svelte';
  import FbSCTDiagnosis from '$lib/components/fb/fbSCTDiagnosis.svelte';
  import FbSaveCancelButtons from '$lib/components/fb/fbSaveCancelButtons.svelte';
  import FbSection from '$lib/components/fb/fbSection.svelte';
  import FbSmartDropdown from '$lib/components/fb/fbSmartDropdown.svelte';
  import FbTextArea from '$lib/components/fb/fbTextArea.svelte';
  import FbTextInput from '$lib/components/fb/fbTextInput.svelte';
  import FbTime from '$lib/components/fb/fbTime.svelte';
  import { facilities, facilitiesForHealthBoard, healthBoards, patientLocations, specialityValuesForFacility } from '$lib/data/clinicalDestinations';
  import { getForm, getFormHistory, getFormVersion, getLatestVersion, getPatient, insertForm, insertFormsIndex } from '$lib/api/legacy';
  import { generateUUID } from '$lib/utils/dateFormat';
  import { returnByHref } from '$lib/utils/fbHrefNavigation';
  import { compareFormStatesObj } from '$lib/utils/formStateUtils';
  import type { Patient, SectionSpec } from '$lib/types';

  type SaveStatus = 'final' | 'draft';
  type FormState = Record<string, any>;

  let { data }: { data: {
    patientUuid: string;
    formUuid: string;
    formVersion: number | null;
    openInRoV: boolean;
    readOnlyBackOnly: boolean;
  } } = $props();
  let patientUuid = $state(data.patientUuid);
  let formUuid = $state(data.formUuid);
  let formVersion = $state(data.formVersion);
  let openInRoV = $state(data.openInRoV);
  let readOnlyBackOnly = $state(data.readOnlyBackOnly);
  let inline = false;
  const onClose = () => closeForm();

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
  const implantCentreOptions = [
    'AB - Cardiac device clinic Neville Hall',
    'AB - Cardiac device clinic Royal Gwent',
    'BCU - Cardiac device clinic Ysbyty Glan Clwyd',
    'BCU - Cardiac device clinic Ysbyty Gwynedd',
    'BCU - Cardiac device clinic Ysbyty Wrexham Maelor',
    'CAV - Cardiac device clinic University Hospital of Wales',
    'CTM - Cardiac device clinic Prince Charles',
    'CTM - Cardiac device clinic Royal Glamorgan',
    'HDD - Cardiac device clinic Bronglais',
    'HDD - Cardiac device clinic Glangwili',
    'SB - Cardiac device clinic Morriston',
    'Other',
    'Unknown or not recorded',
  ];
  const manufacturerOptions = ['Abbott', 'Biotronik', 'Boston Scientific', 'Medtronic', 'Microport', 'Sorin', 'St. Jude Medical', 'Vitatron', 'Other', 'Unknown or not recorded'];

  const sectionsConfig: SectionSpec[] = [
    { id: 'to', name: 'To', requiredFields: ['organisation', 'hospital'] },
    { id: 'from', name: 'From', requiredFields: ['fromOrganisation', 'fromSpeciality', 'fromHospital', 'seniorResponsibleClinician'] },
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
    notificationType: 'inpatient-ed-non-specialist',
    patientCategory: 'nhs',
    implantCentre: 'Unknown or not recorded',
    manufacturer: 'Unknown or not recorded',
    ettStopMedication: 'No',
    ettGtnContraindications: 'Unknown or not recorded',
    tiltSwallowingReflex: 'Unknown or not recorded',
    tiltCarotidSinusMassage: 'Unknown or not recorded',
    tiltGtnContraindications: 'Unknown or not recorded',
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

  let patient = $state<Patient | null>(null);
  let loadingData = $state(true);
  let activeSection = $state('to');
  let isReadOnlyView = $state(openInRoV);
  let formState = $state<FormState>({ ...defaultState });
  let cleanSnapshot = $state<FormState | null>(null);
  let finalChecked = $state(false);
  let highlySensitive = $state(false);
  let username = $state('demoUser');
  let password = $state('');
  let showDraftPopup = $state(false);
  let showCancelPopup = $state(false);
  let showSavingPopup = $state(false);
  let showSavedPopup = $state(false);
  let saveError = $state('');
  let formHistory = $state<any[]>([]);
  let showHistoryMenu = $state(false);

  const filteredSpecialities = $derived(specialityValuesForFacility(formState.fromHospital || formState.hospital).length
    ? specialities.filter((item) => specialityValuesForFacility(formState.fromHospital || formState.hospital).includes(item.value))
    : specialities);
  const formChanged = $derived(cleanSnapshot !== null && !compareFormStatesObj(cleanState({ ...formState, finalChecked, highlySensitive }), cleanState(cleanSnapshot)));
  const requiredFieldsIncomplete = $derived(sectionsConfig.some((section) => {
    const required = section.requiredFields?.filter((field) => !formState[field]).length || 0;
    return required + (section.getIncompleteCount?.(formState) || 0) > 0;
  }));
  const formStatus = $derived(finalChecked ? 'final' : 'draft');
  const latestKnownVersion = $derived(formHistory.reduce((max, item) => Math.max(max, Number(item.form_version) || 0), 0));
  const superseded = $derived(formVersion !== null && latestKnownVersion > formVersion);

  function selectedTests(state: FormState) {
    return testFields.filter(([key]) => !!state[key]).map(([, label]) => label);
  }

  function cleanState(state: FormState) {
    return Object.fromEntries(Object.entries(state).filter(([, value]) => value !== undefined && value !== null && value !== ''));
  }

  function setField(field: string, value: any) {
    formState = { ...formState, [field]: value };
  }

  function setMsiField(field: string, value: string, coded: boolean, nadexId?: string) {
    formState = {
      ...formState,
      [field]: value,
      [`${field}Coded`]: coded,
      [`${field}_coded`]: coded,
      [`${field}_text`]: value,
      [`${field}_NADEXId`]: nadexId || '',
    };
  }

  function displayValue(value: string, labels?: Record<string, string>) {
    return labels?.[value] || value;
  }

  function closeForm() {
    if (inline) onClose();
    else returnByHref(readOnlyBackOnly ? `${base}/patient-record/${encodeURIComponent(patientUuid)}` : `${base}/`);
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
        finalChecked = saved?.form_status === 'final';
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

{#snippet frequencyGroup(field: string, required = true)}
  <FbGroup label="Frequency of symptoms" {required} subfield>
    {@render radio(field, 'Daily', 'Daily')}
    {@render radio(field, 'Weekly', 'Weekly')}
    {@render radio(field, 'Monthly', 'Monthly')}
  </FbGroup>
{/snippet}

{#snippet dateTimeGroup(prefix: string)}
  <FbGroup label="Date and time of last episode (if known)" subfield>
    <FbGridRow cols={4}>
      <FbGridCell><FbDateExact name={`${prefix}Date`} value={formState[`${prefix}Date`] || ''} onChange={(value) => setField(`${prefix}Date`, value)} /></FbGridCell>
      <FbGridCell><FbTime name={`${prefix}Time`} value={formState[`${prefix}Time`] || ''} onChange={(value) => setField(`${prefix}Time`, value)} /></FbGridCell>
      <FbGridCell><div aria-hidden="true"></div></FbGridCell>
      <FbGridCell><div aria-hidden="true"></div></FbGridCell>
    </FbGridRow>
  </FbGroup>
{/snippet}

{#snippet abpmIndications()}
  <FbGroup label="Indication" required subfield>
    <FbCheck name="abpmBpControl" checked={!!formState.abpmBpControl} label="Blood pressure (BP) control" onChange={(checked) => setField('abpmBpControl', checked)}>
      <FbGroup subfield>
        <FbCheck name="abpmBpLying" checked={!!formState.abpmBpLying} label="Lying" onChange={(checked) => setField('abpmBpLying', checked)}><FbBloodPressure systolic={formState.abpmLyingBpSystolic || ''} diastolic={formState.abpmLyingBpDiastolic || ''} onChange={(value) => { setField('abpmLyingBpSystolic', value.systolic); setField('abpmLyingBpDiastolic', value.diastolic); }} /></FbCheck>
        <FbCheck name="abpmBpSitting" checked={!!formState.abpmBpSitting} label="Sitting" onChange={(checked) => setField('abpmBpSitting', checked)}><FbBloodPressure systolic={formState.abpmSittingBpSystolic || ''} diastolic={formState.abpmSittingBpDiastolic || ''} onChange={(value) => { setField('abpmSittingBpSystolic', value.systolic); setField('abpmSittingBpDiastolic', value.diastolic); }} /></FbCheck>
        <FbCheck name="abpmBpStanding" checked={!!formState.abpmBpStanding} label="Standing" onChange={(checked) => setField('abpmBpStanding', checked)}><FbBloodPressure systolic={formState.abpmStandingBpSystolic || ''} diastolic={formState.abpmStandingBpDiastolic || ''} onChange={(value) => { setField('abpmStandingBpSystolic', value.systolic); setField('abpmStandingBpDiastolic', value.diastolic); }} /></FbCheck>
      </FbGroup>
    </FbCheck>
    <FbCheck name="abpmHypertension" checked={!!formState.abpmHypertension} label="Hypertension" onChange={(checked) => setField('abpmHypertension', checked)}><FbBoxedWarning text="Patients with excessive palpitations and hypertension may find this test uncomfortable or intolerable" /></FbCheck>
    <FbCheck name="abpmHypotension" checked={!!formState.abpmHypotension} label="Hypotension" onChange={(checked) => setField('abpmHypotension', checked)} />
    <FbCheck name="abpmOther" checked={!!formState.abpmOther} label="Other" onChange={(checked) => setField('abpmOther', checked)}><FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.abpmOtherDetails || ''} onChange={(value) => setField('abpmOtherDetails', value)} required subfield /></FbCheck>
  </FbGroup>
{/snippet}

{#snippet aecgIndications()}
  <FbGroup label="Indication" required subfield>
    <FbCheck name="aecgQtc" checked={!!formState.aecgQtc} label="Assessment of QTc" onChange={(checked) => setField('aecgQtc', checked)} />
    <FbCheck name="aecgAfRate" checked={!!formState.aecgAfRate} label="Atrial fibrillation (AF) rate" onChange={(checked) => setField('aecgAfRate', checked)}><FbGroup subfield>{@render radio('aecgAfRatePurpose', 'Burden', 'Burden')}{@render radio('aecgAfRatePurpose', 'Control', 'Control')}</FbGroup></FbCheck>
    <FbCheck name="aecgBradyarrhythmia" checked={!!formState.aecgBradyarrhythmia} label="Bradyarrhythmia" onChange={(checked) => setField('aecgBradyarrhythmia', checked)} />
    <FbCheck name="aecgEctopicBurden" checked={!!formState.aecgEctopicBurden} label="Ectopic burden" onChange={(checked) => setField('aecgEctopicBurden', checked)} />
    <FbCheck name="aecgIrregularRhythm" checked={!!formState.aecgIrregularRhythm} label="Irregular rhythm" onChange={(checked) => setField('aecgIrregularRhythm', checked)}>{@render frequencyGroup('aecgIrregularRhythmFrequency', false)}</FbCheck>
    <FbCheck name="aecgPalpitations" checked={!!formState.aecgPalpitations} label="Palpitations" onChange={(checked) => setField('aecgPalpitations', checked)}>{@render frequencyGroup('aecgPalpitationsFrequency')}</FbCheck>
    <FbCheck name="aecgPreSyncope" checked={!!formState.aecgPreSyncope} label="Pre-syncope" onChange={(checked) => setField('aecgPreSyncope', checked)}>{@render frequencyGroup('aecgPreSyncopeFrequency')}</FbCheck>
    <FbCheck name="aecgStAnalysis" checked={!!formState.aecgStAnalysis} label="ST analysis" onChange={(checked) => setField('aecgStAnalysis', checked)} />
    <FbCheck name="aecgSyncope" checked={!!formState.aecgSyncope} label="Syncope" onChange={(checked) => setField('aecgSyncope', checked)}>{@render frequencyGroup('aecgSyncopeFrequency')}</FbCheck>
    <FbCheck name="aecgTachyarrhythmia" checked={!!formState.aecgTachyarrhythmia} label="Tachyarrhythmia" onChange={(checked) => setField('aecgTachyarrhythmia', checked)} />
    <FbCheck name="aecgClinicianRequestedMonitor" checked={!!formState.aecgClinicianRequestedMonitor} label="Clinician requested monitor (Cardiology use only)" onChange={(checked) => setField('aecgClinicianRequestedMonitor', checked)}>
      <FbGroup subfield>
        {@render radio('aecgMonitorDuration', '24-hour', '24-hour')}
        <FbRadio name="aecgMonitorDuration" value="Prolonged heart rhythm monitor" checked={formState.aecgMonitorDuration === 'Prolonged heart rhythm monitor'} label="Prolonged heart rhythm monitor" onChange={() => setField('aecgMonitorDuration', 'Prolonged heart rhythm monitor')}><FbGroup subfield>{@render radio('aecgProlongedMonitorDuration', 'Weekly', 'Weekly')}{@render radio('aecgProlongedMonitorDuration', 'Fortnightly', 'Fortnightly')}{@render radio('aecgProlongedMonitorDuration', 'Monthly', 'Monthly')}</FbGroup></FbRadio>
      </FbGroup>
    </FbCheck>
    <FbCheck name="aecgOther" checked={!!formState.aecgOther} label="Other" onChange={(checked) => setField('aecgOther', checked)}><FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.aecgOtherDetails || ''} onChange={(value) => setField('aecgOtherDetails', value)} required subfield /></FbCheck>
  </FbGroup>
{/snippet}

{#snippet ettIndications()}
  <FbGroup label="Exercise type protocol" required subfield>
    {@render radio('ettProtocol', 'Ergometer', 'Ergometer')}
    <FbRadio name="ettProtocol" value="Treadmill" checked={formState.ettProtocol === 'Treadmill'} label="Treadmill" onChange={() => setField('ettProtocol', 'Treadmill')}><FbGroup subfield>{@render radio('ettTreadmillProtocol', 'Bruce protocol', 'Bruce protocol')}{@render radio('ettTreadmillProtocol', 'Modified Bruce', 'Modified Bruce')}{@render radio('ettTreadmillProtocol', 'Modified Naughton', 'Modified Naughton')}{@render radio('ettTreadmillProtocol', 'Naughton', 'Naughton')}{@render radio('ettTreadmillProtocol', 'Weber', 'Weber')}</FbGroup></FbRadio>
  </FbGroup>
  <FbGroup label="Reason for test" required subfield>
    <FbCheck name="ettBpResponse" checked={!!formState.ettBpResponse} label="Blood pressure (BP) response" onChange={(checked) => setField('ettBpResponse', checked)} />
    <FbCheck name="ettChestDiscomfort" checked={!!formState.ettChestDiscomfort} label="Chest discomfort on exertion" onChange={(checked) => setField('ettChestDiscomfort', checked)} />
    <FbCheck name="ettChronotropicIncompetence" checked={!!formState.ettChronotropicIncompetence} label="Chronotropic incompetence" onChange={(checked) => setField('ettChronotropicIncompetence', checked)} />
    <FbCheck name="ettInducibleIschaemia" checked={!!formState.ettInducibleIschaemia} label="Evaluation of inducible ischaemia" onChange={(checked) => setField('ettInducibleIschaemia', checked)} />
    <FbCheck name="ettExerciseInducedArrhythmia" checked={!!formState.ettExerciseInducedArrhythmia} label="Exercised induced arrhythmia" onChange={(checked) => setField('ettExerciseInducedArrhythmia', checked)}><FbGroup subfield><FbCheck name="ettAtrial" checked={!!formState.ettAtrial} label="Atrial" onChange={(checked) => setField('ettAtrial', checked)} /><FbCheck name="ettEctopy" checked={!!formState.ettEctopy} label="Ectopy" onChange={(checked) => setField('ettEctopy', checked)} /><FbCheck name="ettVentricular" checked={!!formState.ettVentricular} label="Ventricular" onChange={(checked) => setField('ettVentricular', checked)} /></FbGroup></FbCheck>
    <FbCheck name="ettExerciseCapacity" checked={!!formState.ettExerciseCapacity} label="Exercise capacity" onChange={(checked) => setField('ettExerciseCapacity', checked)} />
    <FbCheck name="ettInheritedCardiacConditions" checked={!!formState.ettInheritedCardiacConditions} label="Inherited cardiac conditions" onChange={(checked) => setField('ettInheritedCardiacConditions', checked)}><FbGroup subfield><FbCheck name="ettBrugada" checked={!!formState.ettBrugada} label="Brugada" onChange={(checked) => setField('ettBrugada', checked)} /><FbCheck name="ettCpvt" checked={!!formState.ettCpvt} label="Catecholaminergic polymorphic condition (CPVT)" onChange={(checked) => setField('ettCpvt', checked)} /><FbCheck name="ettHcm" checked={!!formState.ettHcm} label="Hypertrophic cardiomyopathy (HCM)" onChange={(checked) => setField('ettHcm', checked)} /><FbCheck name="ettLongQt" checked={!!formState.ettLongQt} label="Long QT syndrome" onChange={(checked) => setField('ettLongQt', checked)} /></FbGroup></FbCheck>
    <FbCheck name="ettOther" checked={!!formState.ettOther} label="Other" onChange={(checked) => setField('ettOther', checked)}><FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.ettOtherDetails || ''} onChange={(value) => setField('ettOtherDetails', value)} required subfield /></FbCheck>
  </FbGroup>
  <FbGroup label="Does the patient need to stop any medication?" required subfield>
    <FbRadio name="ettStopMedication" value="Yes" checked={formState.ettStopMedication === 'Yes'} label="Yes" onChange={() => setField('ettStopMedication', 'Yes')}><FbTextArea label="What medication?" value={formState.ettMedicationToStop || ''} onChange={(value) => setField('ettMedicationToStop', value)} subfield /><FbGroup label="How long should it be stopped for?" subfield>{@render radio('ettMedicationStopDuration', '24 hours', '24 hours')}{@render radio('ettMedicationStopDuration', '48 hours', '48 hours')}<FbRadio name="ettMedicationStopDuration" value="Other" checked={formState.ettMedicationStopDuration === 'Other'} label="Other" onChange={() => setField('ettMedicationStopDuration', 'Other')}><FbTextInput value={formState.ettMedicationStopDurationOther || ''} onChange={(value) => setField('ettMedicationStopDurationOther', value)} subfield /></FbRadio></FbGroup></FbRadio>
    {@render radio('ettStopMedication', 'No', 'No')}
  </FbGroup>
  <FbGroup label="Does the patient have any of the contraindications for using glyceryl trinitrate (GTN) spray?" subfield>{@render radio('ettGtnContraindications', 'Yes', 'Yes')}{@render radio('ettGtnContraindications', 'No', 'No')}{@render radio('ettGtnContraindications', 'Unknown or not recorded', 'Unknown or not recorded')}</FbGroup>
{/snippet}

{#snippet ilrIndications()}
  <FbGroup label="Reason for test" required subfield>
    <FbCheck name="ilrClinicalSymptoms" checked={!!formState.ilrClinicalSymptoms} label="Clinical symptoms" onChange={(checked) => setField('ilrClinicalSymptoms', checked)}><FbTextArea value={formState.ilrClinicalSymptomsDetails || ''} onChange={(value) => setField('ilrClinicalSymptomsDetails', value)} subfield /></FbCheck>
    <FbCheck name="ilrPalpitations" checked={!!formState.ilrPalpitations} label="Palpitations" onChange={(checked) => setField('ilrPalpitations', checked)}>{@render dateTimeGroup('ilrPalpitationsLastEpisode')}</FbCheck>
    <FbCheck name="ilrPreMri" checked={!!formState.ilrPreMri} label="Pre-MRI" onChange={(checked) => setField('ilrPreMri', checked)} />
    <FbCheck name="ilrPreSyncope" checked={!!formState.ilrPreSyncope} label="Pre-syncope" onChange={(checked) => setField('ilrPreSyncope', checked)}>{@render dateTimeGroup('ilrPreSyncopeLastEpisode')}</FbCheck>
    <FbCheck name="ilrSyncope" checked={!!formState.ilrSyncope} label="Syncope" onChange={(checked) => setField('ilrSyncope', checked)}>{@render dateTimeGroup('ilrSyncopeLastEpisode')}</FbCheck>
  </FbGroup>
{/snippet}

{#snippet ciedIndications()}
  <FbGroup label="Reason for test" required subfield>
    <FbCheck name="ciedAfBurden" checked={!!formState.ciedAfBurden} label="Atrial fibrillation (AF) burden" onChange={(checked) => setField('ciedAfBurden', checked)} />
    <FbCheck name="ciedPacemakerMalfunction" checked={!!formState.ciedPacemakerMalfunction} label="Evidence of pacemaker malfunction (ECG recording)" onChange={(checked) => setField('ciedPacemakerMalfunction', checked)}><FbTextArea value={formState.ciedPacemakerMalfunctionDetails || ''} onChange={(value) => setField('ciedPacemakerMalfunctionDetails', value)} subfield /></FbCheck>
    <FbCheck name="ciedPalpitations" checked={!!formState.ciedPalpitations} label="Palpitations" onChange={(checked) => setField('ciedPalpitations', checked)}>{@render dateTimeGroup('ciedPalpitationsLastEpisode')}</FbCheck>
    <FbCheck name="ciedIcdDeactivation" checked={!!formState.ciedIcdDeactivation} label="Patient end of life ICD deactivation" onChange={(checked) => setField('ciedIcdDeactivation', checked)}><FbBoxedWarning text="You MUST print and complete the departmental policy deactivation form, receive approval from a cardiologist and discuss directly with the department to arrange." /></FbCheck>
    <FbCheck name="ciedPostChemotherapy" checked={!!formState.ciedPostChemotherapy} label="Post chemotherapy" onChange={(checked) => setField('ciedPostChemotherapy', checked)}><FbTextArea label="Enter details of who can be contacted for further information when this request is processed" value={formState.ciedPostChemotherapyContact || ''} onChange={(value) => setField('ciedPostChemotherapyContact', value)} subfield /></FbCheck>
    <FbCheck name="ciedPrePostMri" checked={!!formState.ciedPrePostMri} label="Pre or post MRI" onChange={(checked) => setField('ciedPrePostMri', checked)}><FbTextArea label="Enter details of who can be contacted for further information when this request is processed" value={formState.ciedPrePostMriContact || ''} onChange={(value) => setField('ciedPrePostMriContact', value)} subfield /></FbCheck>
    <FbCheck name="ciedPrePostSurgery" checked={!!formState.ciedPrePostSurgery} label="Pre or post surgery" onChange={(checked) => setField('ciedPrePostSurgery', checked)}><FbTextArea label="Enter details of who can be contacted for further information when this request is processed" value={formState.ciedPrePostSurgeryContact || ''} onChange={(value) => setField('ciedPrePostSurgeryContact', value)} subfield /></FbCheck>
    <FbCheck name="ciedPrePostRadiotherapy" checked={!!formState.ciedPrePostRadiotherapy} label="Pre or post radiotherapy" onChange={(checked) => setField('ciedPrePostRadiotherapy', checked)}><FbTextArea label="Enter details of who can be contacted for further information when this request is processed" value={formState.ciedPrePostRadiotherapyContact || ''} onChange={(value) => setField('ciedPrePostRadiotherapyContact', value)} subfield /></FbCheck>
    <FbCheck name="ciedPreSyncope" checked={!!formState.ciedPreSyncope} label="Pre-syncope" onChange={(checked) => setField('ciedPreSyncope', checked)}>{@render dateTimeGroup('ciedPreSyncopeLastEpisode')}<FbBoxedWarning text="Not appropriate if there has been a pacemaker check within six months" /></FbCheck>
    <FbCheck name="ciedShockTherapyDelivered" checked={!!formState.ciedShockTherapyDelivered} label="Shock therapy delivered" onChange={(checked) => setField('ciedShockTherapyDelivered', checked)}><FbGroup label="Date and time" subfield><FbGridRow cols={4}><FbGridCell><FbDateExact name="ciedShockDate" value={formState.ciedShockDate || ''} onChange={(value) => setField('ciedShockDate', value)} /></FbGridCell><FbGridCell><FbTime name="ciedShockTime" value={formState.ciedShockTime || ''} onChange={(value) => setField('ciedShockTime', value)} /></FbGridCell><FbGridCell><div aria-hidden="true"></div></FbGridCell><FbGridCell><div aria-hidden="true"></div></FbGridCell></FbGridRow></FbGroup></FbCheck>
    <FbCheck name="ciedSymptomReview" checked={!!formState.ciedSymptomReview} label="Symptom review" onChange={(checked) => setField('ciedSymptomReview', checked)} />
    <FbCheck name="ciedSyncope" checked={!!formState.ciedSyncope} label="Syncope" onChange={(checked) => setField('ciedSyncope', checked)}>{@render dateTimeGroup('ciedSyncopeLastEpisode')}</FbCheck>
    <FbCheck name="ciedBiventricularPacing" checked={!!formState.ciedBiventricularPacing} label="% of biventricular pacing" onChange={(checked) => setField('ciedBiventricularPacing', checked)} />
    <FbCheck name="ciedOther" checked={!!formState.ciedOther} label="Other" onChange={(checked) => setField('ciedOther', checked)}><FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.ciedOtherDetails || ''} onChange={(value) => setField('ciedOtherDetails', value)} subfield /></FbCheck>
  </FbGroup>
{/snippet}

{#snippet tiltIndications()}
  <FbGroup label="Reason for test" required subfield>
    <FbCheck name="tiltPots" checked={!!formState.tiltPots} label="Postural orthostatic tachycardia syndrome (PoTS)" onChange={(checked) => setField('tiltPots', checked)} />
    <FbCheck name="tiltSyncope" checked={!!formState.tiltSyncope} label="Syncope" onChange={(checked) => setField('tiltSyncope', checked)} />
    <FbCheck name="tiltBpResponse" checked={!!formState.tiltBpResponse} label="Blood pressure (BP) response" onChange={(checked) => setField('tiltBpResponse', checked)} />
    <FbCheck name="tiltOther" checked={!!formState.tiltOther} label="Other" onChange={(checked) => setField('tiltOther', checked)}><FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.tiltOtherDetails || ''} onChange={(value) => setField('tiltOtherDetails', value)} required subfield /></FbCheck>
  </FbGroup>
  <FbCheck name="tiltCanStand45Minutes" checked={!!formState.tiltCanStand45Minutes} label="The patient can stand for 45 minutes" onChange={(checked) => setField('tiltCanStand45Minutes', checked)} />
  <FbGroup label="Is swallowing reflex required?" subfield>{@render radio('tiltSwallowingReflex', 'Yes', 'Yes')}{@render radio('tiltSwallowingReflex', 'No', 'No')}{@render radio('tiltSwallowingReflex', 'Unknown or not recorded', 'Unknown or not recorded')}</FbGroup>
  <FbGroup label="Is carotid sinus massage required?" subfield>{@render radio('tiltCarotidSinusMassage', 'Yes', 'Yes')}{@render radio('tiltCarotidSinusMassage', 'No', 'No')}{@render radio('tiltCarotidSinusMassage', 'Unknown or not recorded', 'Unknown or not recorded')}</FbGroup>
  <FbGroup label="Are there any contraindications to GTN spray?" subfield>{@render radio('tiltGtnContraindications', 'Yes', 'Yes')}{@render radio('tiltGtnContraindications', 'No', 'No')}{@render radio('tiltGtnContraindications', 'Unknown or not recorded', 'Unknown or not recorded')}</FbGroup>
{/snippet}

{#snippet tteIndications()}
  <FbGroup subfield>{@render radio('tteStudyKind', 'New study', 'New study')}{@render radio('tteStudyKind', 'Re-assessment', 'Re-assessment')}</FbGroup>
  <FbGroup subfield>
    {@render radio('tteStudyScope', 'Full study', 'Full study')}
    <FbRadio name="tteStudyScope" value="Focussed study" checked={formState.tteStudyScope === 'Focussed study'} label="Focussed study" onChange={() => setField('tteStudyScope', 'Focussed study')}>
      <FbGroup subfield>
        <FbCheck name="tteLeftVentricle" checked={!!formState.tteLeftVentricle} label="Left ventricle" onChange={(checked) => setField('tteLeftVentricle', checked)}><FbCheck name="tteLeftVentricleDesynchrony" checked={!!formState.tteLeftVentricleDesynchrony} label="Desynchrony" onChange={(checked) => setField('tteLeftVentricleDesynchrony', checked)} /></FbCheck>
        <FbCheck name="tteRightVentricle" checked={!!formState.tteRightVentricle} label="Right ventricle" onChange={(checked) => setField('tteRightVentricle', checked)} />
        <FbCheck name="tteValveDisease" checked={!!formState.tteValveDisease} label="Valve disease" onChange={(checked) => setField('tteValveDisease', checked)} />
        <FbCheck name="ttePulmonaryArteryPressure" checked={!!formState.ttePulmonaryArteryPressure} label="Pulmonary artery pressure" onChange={(checked) => setField('ttePulmonaryArteryPressure', checked)} />
        <FbCheck name="ttePericardium" checked={!!formState.ttePericardium} label="Pericardium" onChange={(checked) => setField('ttePericardium', checked)} />
        <FbCheck name="tteStructuralHeartDisease" checked={!!formState.tteStructuralHeartDisease} label="Structural heart disease" onChange={(checked) => setField('tteStructuralHeartDisease', checked)} />
      </FbGroup>
    </FbRadio>
  </FbGroup>
  <FbTextArea label="Clinical question to be answered and relevant clinical information" value={formState.tteClinicalQuestion || ''} onChange={(value) => setField('tteClinicalQuestion', value)} required subfield />
{/snippet}

{#if loadingData}
  <p style="padding: 0.8rem;">Loading cardiology test request...</p>
{:else if isReadOnlyView}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection isReadOnlyView={true}>
    {#snippet header()}<FbHeader title="Cardiology test request" {patient} {formStatus} {highlySensitive} {superseded} />{/snippet}
    <div style="padding: 0.4rem;">
      <FbSection id="to" title="To">
        <FbGridRow cols={3}>
          <FbReadOnly label="Health board" value={displayValue(formState.organisation, organisationLabels)} />
          <FbReadOnly label="Hospital / Department" value={displayValue(formState.hospital, hospitalLabels)} />
          <FbReadOnly label="For attention of" value={formState.forAttentionOf} />
        </FbGridRow>
      </FbSection>
      <FbSection id="from" title="From">
        <FbGridRow cols={4}>
          <FbReadOnly label="Health board" value={displayValue(formState.fromOrganisation, organisationLabels)} />
          <FbReadOnly label="Hospital" value={displayValue(formState.fromHospital, hospitalLabels)} />
          <FbReadOnly label="Speciality" value={displayValue(formState.fromSpeciality, specialityLabels)} />
          <FbReadOnly label="Senior responsible clinician" value={formState.seniorResponsibleClinician} />
        </FbGridRow>
      </FbSection>
      <FbSection id="requestType" title="Request type">
        <FbReadOnly label="Request type" value={formState.requestType} />
        <FbReadOnly label="Patient location" value={formState.patientLocation} />
        <FbReadOnly label="Transport" value={formState.transport} />
        <FbReadOnly label="Urgency" value={formState.urgency} />
        <FbReadOnly label="Capacity" value={formState.capacity} />
        <FbReadOnly label="Report required by" value={formState.reportRequiredBy} />
        <FbReadOnly label="Reason required by" value={formState.reportRequiredByReason} />
      </FbSection>
      <FbSection id="testsRequired" title="Tests required"><FbReadOnly label="Tests required" value={selectedTests(formState).join(', ')} /></FbSection>
      <FbSection id="pastMedicalHistory" title="Past medical history">
        <FbReadOnly label="Cardiac implanted device" value={formState.cardiacDevice} />
        <FbReadOnly label="Previous cardiac surgery" value={formState.previousCardiacSurgery} />
        <FbReadOnly label="Other relevant history" value={formState.pmhOtherDetails} />
      </FbSection>
      <FbSection id="otherPatientInformation" title="Other patient information">
        <FbReadOnly label="Preferred language" value={formState.preferredLanguage} />
        <FbReadOnly label="Clinical trial" value={formState.clinicalTrial} />
        <FbReadOnly label="Other relevant information" value={formState.otherRelevantInformation} />
        <FbReadOnly label="Any infection control issues" value={formState.infectionControlIssues} />
        <FbReadOnly label="Height" value={formState.heightCm} units="cm" />
        <FbReadOnly label="Weight" value={formState.weightKg} units="kg" />
      </FbSection>
      <FbSection id="requestor" title="Requestor">
        <FbReadOnly label="Requestor" value={formState.requestor} coded={!!formState.requestorCoded} />
        <FbReadOnly label="Contact details" value={formState.requestorContact} />
      </FbSection>
    </div>
    {#snippet bottomControls()}
      <FbBottomControlsRow>
        {#if !readOnlyBackOnly && !superseded && (formStatus !== 'final' || !openInRoV)}
          <FbButton type="button" onClick={() => (isReadOnlyView = false)}>EV</FbButton>
        {/if}
        {#if formUuid && !superseded}<FbButton type="button" onClick={() => (showHistoryMenu = true)}>History</FbButton>{/if}
        {#if showHistoryMenu && formHistory.length}
          <select onchange={(event) => {
            const version = Number((event.currentTarget as HTMLSelectElement).value);
            if (version >= 0) {
              void getFormVersion('cardiology_test_requests', formUuid, version).then((saved) => {
                formState = { ...defaultState, ...(saved?.form_data || {}), uuid: formUuid };
                finalChecked = saved?.form_status === 'final';
                highlySensitive = Boolean(saved?.highly_sensitive || saved?.form_data?.highlySensitive);
                cleanSnapshot = cleanState({ ...formState, finalChecked, highlySensitive });
                formVersion = version;
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
    {/snippet}
  </FbLayout>
{:else}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection onFormActivity={() => (formState = { ...formState })}>
    {#snippet header()}<FbHeader title="Cardiology test request" {patient} {formStatus} {highlySensitive} />{/snippet}
    <FbSection id="to" title="To">
      <FbGridRow cols={3}>
        <FbGridCell><FbHBSelector label="Health board" value={formState.organisation || ''} onChange={(value) => { setField('organisation', value); setField('hospital', ''); }} options={healthBoards} required /></FbGridCell>
        <FbGridCell><FbDropdown label="Hospital / Department" value={formState.hospital || ''} onChange={(value) => setField('hospital', value)} options={facilitiesForHealthBoard(formState.organisation || '')} placeholder="Select" required /></FbGridCell>
        <FbGridCell><FbTextInput label="For attention of" value={formState.forAttentionOf || ''} onChange={(value) => setField('forAttentionOf', value)} /></FbGridCell>
      </FbGridRow>
    </FbSection>
    <FbSection id="from" title="From (requesting organisation and clinician)">
      <FbGridRow cols={4}>
        <FbGridCell><FbHBSelector label="Health board" value={formState.fromOrganisation || ''} onChange={(value) => { setField('fromOrganisation', value); setField('fromHospital', ''); }} options={healthBoards} required /></FbGridCell>
        <FbGridCell><FbDropdown label="Hospital" value={formState.fromHospital || ''} onChange={(value) => setField('fromHospital', value)} options={facilitiesForHealthBoard(formState.fromOrganisation || '')} placeholder="Select" required /></FbGridCell>
        <FbGridCell><FbDropdown label="Speciality" value={formState.fromSpeciality || ''} onChange={(value) => setField('fromSpeciality', value)} options={filteredSpecialities} placeholder="Select" required /></FbGridCell>
        <FbGridCell><FbMSISelector label="Senior responsible clinician" name="seniorResponsibleClinician" value={formState.seniorResponsibleClinician || ''} coded={!!formState.seniorResponsibleClinicianCoded} onChange={(value, coded, nadexId) => setMsiField('seniorResponsibleClinician', value, coded, nadexId)} required /></FbGridCell>
      </FbGridRow>
    </FbSection>
    <FbSection id="requestType" title="Request type">
      <FbGroup label="Request type" required>
        <FbRadio name="requestType" value="inpatient-ed" checked={formState.requestType === 'inpatient-ed'} label="Inpatient / ED" onChange={() => setField('requestType', 'inpatient-ed')}>
          <FbSmartDropdown label="Patient location" value={formState.patientLocation || ''} onChange={(value) => setField('patientLocation', value)} options={patientLocations} required subfield />
          <FbCheck name="uscPathway" checked={!!formState.uscPathway} label="USC pathway" onChange={(checked) => setField('uscPathway', checked)}><FbDropdown label="Cancer pathway" value={formState.inpatientCancerPathway || ''} onChange={(value) => setField('inpatientCancerPathway', value)} options={['', 'Suspected cancer', 'Confirmed cancer', 'Cancer follow-up']} subfield /></FbCheck>
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
            <FbRadio name="urgency" value="usc" checked={formState.urgency === 'usc'} label="USC" onChange={() => setField('urgency', 'usc')}><FbDropdown label="Cancer pathway" value={formState.outpatientCancerPathway || ''} onChange={(value) => setField('outpatientCancerPathway', value)} options={['', 'Suspected cancer', 'Confirmed cancer', 'Cancer follow-up']} subfield /></FbRadio>
          </FbGroup>
          <FbGroup label="Appointment type" required subfield>
            {@render radio('appointmentType', 'walk-around', 'Walk around')}{@render radio('appointmentType', 'send-out-appointment', 'Send out appointment')}
          </FbGroup>
          <FbCheck name="ambulanceRequired" checked={!!formState.ambulanceRequired} label="Ambulance required" onChange={(checked) => setField('ambulanceRequired', checked)} />
          <FbCheck name="patientContactChecked" checked={!!formState.patientContactChecked} label="Patient contact information checked" onChange={(checked) => setField('patientContactChecked', checked)} />
        </FbRadio>
      </FbGroup>
      <FbGridRow cols={4}>
        <FbGridCell><FbGroup label="Patient category" required>{@render radio('patientCategory', 'nhs', 'NHS')}{@render radio('patientCategory', 'fee-paying-nhs', 'Fee-paying NHS (cat II)')}{@render radio('patientCategory', 'private', 'Private (cat III)')}<FbRadio name="patientCategory" value="clinical-trial" checked={formState.patientCategory === 'clinical-trial'} label="Clinical trial" onChange={() => setField('patientCategory', 'clinical-trial')}><FbTextArea label="Trial name" value={formState.trialName || ''} onChange={(value) => setField('trialName', value)} required subfield /></FbRadio></FbGroup></FbGridCell>
        <FbGridCell><FbGroup label="Does the patient have capacity to consent to the test(s)?" required>{@render radio('capacity', 'yes', 'Yes')}{@render radio('capacity', 'no', 'No')}{@render radio('capacity', 'unknown', 'Unknown or not recorded')}</FbGroup></FbGridCell>
        <FbGridCell><FbGroup label="Defer test(s)?"><FbRadio name="deferTests" value="yes" checked={formState.deferTests === 'yes'} label="Yes" onChange={() => setField('deferTests', 'yes')}><FbQuestion label="Defer test(s) until" subfield><FbDateExact name="deferTestsUntil" value={formState.deferTestsUntil || ''} onChange={(value) => setField('deferTestsUntil', value)} /></FbQuestion><FbTextArea label="Reason for deferral" value={formState.deferReason || ''} onChange={(value) => setField('deferReason', value)} required subfield /></FbRadio>{@render radio('deferTests', 'no', 'No')}</FbGroup></FbGridCell>
        <FbGridCell><FbQuestion label="Report required by"><FbDateExact name="reportRequiredBy" value={formState.reportRequiredBy || ''} onChange={(value) => setField('reportRequiredBy', value)}><FbTextArea label="Reason required by" value={formState.reportRequiredByReason || ''} onChange={(value) => setField('reportRequiredByReason', value)} required subfield /></FbDateExact></FbQuestion></FbGridCell>
      </FbGridRow>
    </FbSection>
    <FbSection id="testsRequired" title="Tests required">
      <FbGroup>
        <FbCheck name="testAbpm" checked={!!formState.testAbpm} label="Ambulatory BP monitoring" onChange={(checked) => setField('testAbpm', checked)}>{@render abpmIndications()}</FbCheck>
        <FbCheck name="testAecg" checked={!!formState.testAecg} label="Ambulatory ECG" onChange={(checked) => setField('testAecg', checked)}>{@render aecgIndications()}</FbCheck>
        <FbCheck name="testEtt" checked={!!formState.testEtt} label="Exercise tolerance test" onChange={(checked) => setField('testEtt', checked)}><FbBoxedWarning text="This test is NOT available in St Elsewhere UHB." />{@render ettIndications()}</FbCheck>
        <FbCheck name="testIlrDownload" checked={!!formState.testIlrDownload} label="Implantable loop recorder (ILR) download" onChange={(checked) => setField('testIlrDownload', checked)}>{@render ilrIndications()}</FbCheck>
        <FbCheck name="testCiedCheck" checked={!!formState.testCiedCheck} label="Cardiac implanted electronic device (CIED) check" onChange={(checked) => setField('testCiedCheck', checked)}>
          <FbDropdown label="Follow-up implant centre" value={formState.implantCentre || 'Unknown or not recorded'} onChange={(value) => setField('implantCentre', value)} options={implantCentreOptions} placeholder="Select" subfield />
          {#if formState.implantCentre === 'Other'}<div class="dropdown-subq"><FbTextArea label="Please specify" value={formState.implantCentreOther || ''} onChange={(value) => setField('implantCentreOther', value)} required subfield /></div>{/if}
          <FbDropdown label="Manufacturer" value={formState.manufacturer || 'Unknown or not recorded'} onChange={(value) => setField('manufacturer', value)} options={manufacturerOptions} placeholder="Select" subfield />
          {#if formState.manufacturer === 'Other'}<div class="dropdown-subq"><FbTextArea label="Please specify" value={formState.manufacturerOther || ''} onChange={(value) => setField('manufacturerOther', value)} required subfield /></div>{/if}
          {@render ciedIndications()}
        </FbCheck>
        <FbCheck name="testTilt" checked={!!formState.testTilt} label="Tilt test" onChange={(checked) => setField('testTilt', checked)}><FbBoxedWarning text="This test is only available in St Elsewhere UHB." />{@render tiltIndications()}</FbCheck>
        <FbCheck name="testTte" checked={!!formState.testTte} label="Transthoracic echocardiogram" onChange={(checked) => setField('testTte', checked)}>{@render tteIndications()}</FbCheck>
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
        <FbCheck name="pmhAortopathy" checked={!!formState.pmhAortopathy} label="Aortopathy" onChange={(checked) => setField('pmhAortopathy', checked)}><FbGroup subfield>{@render radio('pmhAortopathyStatus', 'Confirmed', 'Confirmed')}{@render radio('pmhAortopathyStatus', 'Suspected', 'Suspected')}<FbSCTDiagnosis label="Diagnosis" name="pmhAortopathyDiagnosis" value={formState.pmhAortopathyDiagnosis || ''} coded={!!formState.pmhAortopathyDiagnosisCoded} onChange={(value, coded) => { setField('pmhAortopathyDiagnosis', value); setField('pmhAortopathyDiagnosisCoded', coded); }} subfield /></FbGroup></FbCheck>
        <FbCheck name="pmhArrhythmia" checked={!!formState.pmhArrhythmia} label="Arrhythmia or palpitations" onChange={(checked) => setField('pmhArrhythmia', checked)}><FbGroup subfield><FbCheck name="pmhAtrialFibrillation" checked={!!formState.pmhAtrialFibrillation} label="Atrial fibrillation" onChange={(checked) => setField('pmhAtrialFibrillation', checked)}>{@render statusRadios('pmhAtrialFibrillationStatus')}</FbCheck><FbCheck name="pmhBradyarrhythmia" checked={!!formState.pmhBradyarrhythmia} label="Bradyarrhythmia" onChange={(checked) => setField('pmhBradyarrhythmia', checked)}>{@render statusRadios('pmhBradyarrhythmiaStatus')}</FbCheck><FbCheck name="pmhSvt" checked={!!formState.pmhSvt} label="Supraventricular tachycardia" onChange={(checked) => setField('pmhSvt', checked)}>{@render statusRadios('pmhSvtStatus')}</FbCheck><FbCheck name="pmhVentricularTachycardia" checked={!!formState.pmhVentricularTachycardia} label="Ventricular tachycardia" onChange={(checked) => setField('pmhVentricularTachycardia', checked)}>{@render statusRadios('pmhVentricularTachycardiaStatus')}</FbCheck></FbGroup></FbCheck>
        <FbCheck name="pmhCardiomyopathy" checked={!!formState.pmhCardiomyopathy} label="Cardiomyopathy" onChange={(checked) => setField('pmhCardiomyopathy', checked)}><FbGroup subfield><FbCheck name="pmhArvc" checked={!!formState.pmhArvc} label="Arrythmogenic right ventricular cardiomyopathy (ARVC)" onChange={(checked) => setField('pmhArvc', checked)}>{@render statusRadios('pmhArvcStatus')}<FbCheck name="pmhArvcStatusFamilyHistory" checked={!!formState.pmhArvcStatusFamilyHistory} label="Family history screening" onChange={(checked) => setField('pmhArvcStatusFamilyHistory', checked)} /></FbCheck><FbCheck name="pmhDilatedCardiomyopathy" checked={!!formState.pmhDilatedCardiomyopathy} label="Dilated cardiomyopathy" onChange={(checked) => setField('pmhDilatedCardiomyopathy', checked)}>{@render statusRadios('pmhDilatedCardiomyopathyStatus')}<FbCheck name="pmhDilatedCardiomyopathyStatusFamilyHistory" checked={!!formState.pmhDilatedCardiomyopathyStatusFamilyHistory} label="Family history screening" onChange={(checked) => setField('pmhDilatedCardiomyopathyStatusFamilyHistory', checked)} /></FbCheck><FbCheck name="pmhHypertrophicCardiomyopathy" checked={!!formState.pmhHypertrophicCardiomyopathy} label="Hypertrophic cardiomyopathy" onChange={(checked) => setField('pmhHypertrophicCardiomyopathy', checked)}>{@render statusRadios('pmhHypertrophicCardiomyopathyStatus')}<FbCheck name="pmhHypertrophicCardiomyopathyStatusFamilyHistory" checked={!!formState.pmhHypertrophicCardiomyopathyStatusFamilyHistory} label="Family history screening" onChange={(checked) => setField('pmhHypertrophicCardiomyopathyStatusFamilyHistory', checked)} /></FbCheck><FbCheck name="pmhOtherCardiomyopathy" checked={!!formState.pmhOtherCardiomyopathy} label="Other" onChange={(checked) => setField('pmhOtherCardiomyopathy', checked)}><FbSCTDiagnosis label="Diagnosis" name="pmhOtherCardiomyopathyDiagnosis" value={formState.pmhOtherCardiomyopathyDiagnosis || ''} coded={!!formState.pmhOtherCardiomyopathyDiagnosisCoded} onChange={(value, coded) => { setField('pmhOtherCardiomyopathyDiagnosis', value); setField('pmhOtherCardiomyopathyDiagnosisCoded', coded); }} subfield />{@render statusRadios('pmhOtherCardiomyopathyStatus')}<FbCheck name="pmhOtherCardiomyopathyStatusFamilyHistory" checked={!!formState.pmhOtherCardiomyopathyStatusFamilyHistory} label="Family history screening" onChange={(checked) => setField('pmhOtherCardiomyopathyStatusFamilyHistory', checked)} /></FbCheck></FbGroup></FbCheck>
        <FbCheck name="pmhChemotherapy" checked={!!formState.pmhChemotherapy} label="Chemotherapy" onChange={(checked) => setField('pmhChemotherapy', checked)} />
        <FbCheck name="pmhCongenitalHeartDisease" checked={!!formState.pmhCongenitalHeartDisease} label="Congenital heart disease" onChange={(checked) => setField('pmhCongenitalHeartDisease', checked)}><FbGroup subfield>{@render radio('pmhCongenitalHeartDiseaseStatus', 'Confirmed', 'Confirmed')}{@render radio('pmhCongenitalHeartDiseaseStatus', 'Suspected', 'Suspected')}<FbCheck name="pmhCongenitalHeartDiseaseOperated" checked={!!formState.pmhCongenitalHeartDiseaseOperated} label="Operated" onChange={(checked) => setField('pmhCongenitalHeartDiseaseOperated', checked)} /><FbSCTDiagnosis label="Diagnosis" name="pmhCongenitalHeartDiseaseDiagnosis" value={formState.pmhCongenitalHeartDiseaseDiagnosis || ''} coded={!!formState.pmhCongenitalHeartDiseaseDiagnosisCoded} onChange={(value, coded) => { setField('pmhCongenitalHeartDiseaseDiagnosis', value); setField('pmhCongenitalHeartDiseaseDiagnosisCoded', coded); }} subfield /></FbGroup></FbCheck>
        <FbCheck name="pmhCoronaryArteryDisease" checked={!!formState.pmhCoronaryArteryDisease} label="Coronary artery disease" onChange={(checked) => setField('pmhCoronaryArteryDisease', checked)}><FbGroup subfield><FbCheck name="pmhMyocardialInfarction" checked={!!formState.pmhMyocardialInfarction} label="Myocardial infarction" onChange={(checked) => setField('pmhMyocardialInfarction', checked)}>{@render statusRadios('pmhMyocardialInfarctionStatus')}</FbCheck><FbCheck name="pmhAcuteCoronarySyndrome" checked={!!formState.pmhAcuteCoronarySyndrome} label="Acute coronary syndrome" onChange={(checked) => setField('pmhAcuteCoronarySyndrome', checked)}>{@render statusRadios('pmhAcuteCoronarySyndromeStatus')}</FbCheck><FbCheck name="pmhExerciseInducedAngina" checked={!!formState.pmhExerciseInducedAngina} label="Exercise induced angina" onChange={(checked) => setField('pmhExerciseInducedAngina', checked)}>{@render statusRadios('pmhExerciseInducedAnginaStatus')}</FbCheck></FbGroup></FbCheck>
        <FbCheck name="pmhEndocarditis" checked={!!formState.pmhEndocarditis} label="Endocarditis" onChange={(checked) => setField('pmhEndocarditis', checked)}>{@render statusRadios('pmhEndocarditisStatus')}</FbCheck>
        <FbCheck name="pmhHeartFailure" checked={!!formState.pmhHeartFailure} label="Heart failure or breathlessness" onChange={(checked) => setField('pmhHeartFailure', checked)}><FbGroup subfield>{@render radio('pmhHeartFailureStatus', 'Confirmed', 'Confirmed')}<FbRadio name="pmhHeartFailureStatus" value="Suspected" checked={formState.pmhHeartFailureStatus === 'Suspected'} label="Suspected" onChange={() => setField('pmhHeartFailureStatus', 'Suspected')}><FbNumberInput label="BNP" value={formState.pmhHeartFailureBnp || ''} units="pg/ml" onChange={(value) => setField('pmhHeartFailureBnp', value)} subfield /></FbRadio><FbCheck name="pmhHeartFailureFamilyHistory" checked={!!formState.pmhHeartFailureFamilyHistory} label="Family history" onChange={(checked) => setField('pmhHeartFailureFamilyHistory', checked)} /></FbGroup></FbCheck>
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
        <FbGridCell><FbMSISelector label="Requestor" name="requestor" value={formState.requestor || ''} coded={!!formState.requestorCoded} onChange={(value, coded, nadexId) => setMsiField('requestor', value, coded, nadexId)} required /></FbGridCell>
        <FbGridCell><FbTextInput label="Contact details" value={formState.requestorContact || ''} onChange={(value) => setField('requestorContact', value)} required /></FbGridCell>
      </FbGridRow>
    </FbSection>
    {#snippet bottomControls()}
      <FbBottomControlsRow>
        {#if !readOnlyBackOnly}
          <FbButton type="button" onClick={() => (isReadOnlyView = true)}>RoV</FbButton>
        {/if}
        <div style="flex: 1;"></div>
        <FbAuthAndSensitivity bind:username bind:password bind:highlySensitive bind:finalChecked {formChanged} finalDisabled={requiredFieldsIncomplete} />
        <FbSaveCancelButtons saveDisabled={!formChanged || requiredFieldsIncomplete} {formChanged} saving={showSavingPopup} showRov={false} onSave={requestSave} onCancel={() => formChanged ? (showCancelPopup = true) : closeForm()} />
      </FbBottomControlsRow>
    {/snippet}
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

