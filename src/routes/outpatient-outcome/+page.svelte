<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import FbAuthAndSensitivity from '$lib/components/fb/fbAuthAndSensitivity.svelte';
  import FbBottomControlsRow from '$lib/components/fb/fbBottomControlsRow.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbCancelPopup from '$lib/components/fb/fbModalCancel.svelte';
  import FbCheck from '$lib/components/fb/fbCheck.svelte';
  import FbDraftPopup from '$lib/components/fb/fbModalDraft.svelte';
  import FbExactDate from '$lib/components/fb/fbDateExact.svelte';
  import FbGroup from '$lib/components/fb/fbGroup.svelte';
  import FbHeader from '$lib/components/fb/fbHeader.svelte';
  import FbLayout from '$lib/components/fb/fbLayout.svelte';
  import FbModalPassword from '$lib/components/fb/fbModalPassword.svelte';
  import FbQuestion from '$lib/components/fb/fbQuestion.svelte';
  import FbRadio from '$lib/components/fb/fbRadio.svelte';
  import FbReadOnly from '$lib/components/fb/fbReadOnly.svelte';
  import FbSCTDiagnosis from '$lib/components/fb/fbSCTDiagnosis.svelte';
  import FbSaveErrorPopup from '$lib/components/fb/fbModalSaveError.svelte';
  import FbSavedPopup from '$lib/components/fb/fbModalSaved.svelte';
  import FbSavingPopup from '$lib/components/fb/fbModalSaving.svelte';
  import FbTextArea from '$lib/components/fb/fbTextArea.svelte';
  import FbTextInput from '$lib/components/fb/fbTextInput.svelte';
  import FbToolTip from '$lib/components/fb/fbToolTip.svelte';
  import FbFormHistoryMenu, { type FbFormHistoryItem } from '$lib/components/fb/fbFormHistoryMenu.svelte';
  import WaitingListCard from '../waiting-list-card/+page.svelte';
  import {
    hospitalLabels,
    organisationLabels,
    specialityLabels,
  } from '$lib/data/formLabels';
  import { compareFormStatesObj } from '$lib/utils/formStateUtils';
  import { formatFormDate, generateUUID } from '$lib/utils/dateFormat';
  import { returnByHref } from '$lib/utils/fbHrefNavigation';
  import { getForm, getFormHistory, getFormVersion, getPatient, insertForm, insertFormsIndex } from '$lib/api/legacy';
  import FbModalStaleSave from '$lib/components/fb/fbModalStaleSave.svelte';
  import { assertFormVersionIsLatest, isStaleFormVersionError } from '$lib/utils/formVersion';
  import type { Patient } from '$lib/types';

  type SaveStatus = 'final' | 'draft';

  let {
    data = {
      patientUuid: '',
      formUuid: '',
      formVersion: null,
      appointmentUuid: '',
      openInRoV: false,
      readOnlyBackOnly: false,
    },
    patientUuid: patientUuidProp = data.patientUuid,
    formUuid: formUuidProp = data.formUuid,
    formVersion: formVersionProp = data.formVersion,
    appointmentUuid: appointmentUuidProp = data.appointmentUuid,
    openInRoV: openInRoVProp = data.openInRoV,
    readOnlyBackOnly: readOnlyBackOnlyProp = data.readOnlyBackOnly,
    inline = false,
    onClose = () => backToRecord(),
  }: { data?: {
    patientUuid: string;
    formUuid: string;
    formVersion: number | null;
    appointmentUuid: string;
    openInRoV: boolean;
    readOnlyBackOnly: boolean;
  };
    patientUuid?: string;
    formUuid?: string;
    formVersion?: number | null;
    appointmentUuid?: string;
    openInRoV?: boolean;
    readOnlyBackOnly?: boolean;
    inline?: boolean;
    onClose?: () => void;
  } = $props();
  let patientUuid = $state(patientUuidProp);
  let formUuid = $state(formUuidProp);
  let formVersion = $state(formVersionProp);
  let appointmentUuid = $state(appointmentUuidProp);
  let openInRoV = $state(openInRoVProp);
  let readOnlyBackOnly = $state(readOnlyBackOnlyProp);
  const outpatientWlcBridgeKey = `fb_svelte_oo_wlc_bridge_${patientUuid}`;
  const dateTooltip = 'Date of consultation';
  const timeTooltip = 'Time of consultation';
  const wasNotBroughtTooltip = 'Check if the patient is aged less than 18 years or depends on another adult to attend. This check box does not fulfil safeguarding obligations.';
  const uscTooltip = 'Required for monitoring performance against cancer targets';
  const stopReferralTooltip = 'Checking this indicates that the patient should not be offered active treatment. Treatment here means: surgery, chemotherapy, radiotherapy, biological therapy and transplant';
  const referralTooltip = 'Checking this does not generate a referral';

  let patient: Patient | null = $state(null);
  let loadingData = $state(true);
  let isReadOnlyView = $state(false);
  let formState: Record<string, any> = $state(initialFormState());
  let workingDiagnosisValue = $state('');
  let workingDiagnosisCoded = $state(false);
  let cleanSnapshot: Record<string, any> = $state({});
  let finalChecked = $state(false);
  let highlySensitive = $state(false);
  let username = $state('demoUser');
  let password = $state('');
  let pendingSaveStatus: SaveStatus = $state('final');
  let isSaving = $state(false);
  let showDraftPopup = $state(false);
  let showPasswordPopup = $state(false);
  let showCancelPopup = $state(false);
  let showSavingPopup = $state(false);
  let showSavedPopup = $state(false);
  let showSaveErrorPopup = $state(false);
  let saveErrorDetails = $state('');
  let formHistory: FbFormHistoryItem[] = $state([]);
  let showHistoryMenu = $state(false);
  let showStaleSavePopup = $state(false);
  const latestKnownVersion = $derived(formHistory.reduce((max, item) => Math.max(max, Number(item.form_version) || 0), 0));
  const superseded = $derived(formVersion !== null && latestKnownVersion > formVersion);
  const dischargedChecked = $derived(Boolean(formState.discharged ?? formState.discharge));
  const sosChecked = $derived(Boolean(formState.sos));
  const pifuChecked = $derived(Boolean(formState.pifu));
  const remoteMonitoringChecked = $derived(Boolean(formState.remoteMonitoring));
  const testsReqChecked = $derived(Boolean(formState.testsReq));
  const waitListedChecked = $derived(Boolean(formState.waitListed ?? formState.waitingList));
  const oprxPlannedChecked = $derived(Boolean(formState.oprxPlanned));
  const admittedChecked = $derived(Boolean(formState.admitted));
  const mdtReviewChecked = $derived(Boolean(formState.mdtReview));
  const rxGivenChecked = $derived(Boolean(formState.rxGiven));
  const stopRefClockChecked = $derived(Boolean(formState.stopRefClock));
  const refToTherapiesChecked = $derived(Boolean(formState.refToTherapies));
  const refToConsultantChecked = $derived(Boolean(formState.refToConsultant));
  const fuOPAChecked = $derived(Boolean(formState.fuOPA));
  const wasNotBroughtChecked = $derived(Boolean(formState.wasNotBrought));
  const cancerPathwayChecked = $derived(Boolean(formState.cancerPathway));
  const sameClinicChecked = $derived(Boolean(formState.sameClinic));
  const sameClinicianChecked = $derived(Boolean(formState.sameClinician));
  const tier1OutcomeChecked = $derived(dischargedChecked || sosChecked || pifuChecked);
  const tier2OutcomeChecked = $derived(remoteMonitoringChecked || testsReqChecked || waitListedChecked || oprxPlannedChecked || admittedChecked || mdtReviewChecked || fuOPAChecked);
  const dischargeDisabled = $derived(sosChecked || pifuChecked || tier2OutcomeChecked);
  const sosDisabled = $derived(dischargedChecked || pifuChecked || tier2OutcomeChecked);
  const pifuDisabled = $derived(dischargedChecked || sosChecked || tier2OutcomeChecked);
  const remoteMonitoringDisabled = $derived(tier1OutcomeChecked);
  const testsReqDisabled = $derived(tier1OutcomeChecked);
  const waitListedDisabled = $derived(tier1OutcomeChecked);
  const oprxPlannedDisabled = $derived(tier1OutcomeChecked);
  const admittedDisabled = $derived(tier1OutcomeChecked);
  const mdtReviewDisabled = $derived(tier1OutcomeChecked);
  const fuOPADisabled = $derived(tier1OutcomeChecked);
  let inlineWaitingListCard: {
    formUuid?: string;
    openInRoV: boolean;
    openedFromOutpatientOutcomeButton: boolean;
  } | null = $state(null);

  const formChanged = $derived(!compareFormStatesObj(cleanSnapshot, formState));
  const requiredComplete = $derived(areRequiredFieldsComplete());
  const effectiveFormStatus = $derived(finalChecked ? 'final' : 'draft');
  function initialFormState() {
    return {
      organisation: 'Cwm Taf Morgannwg',
      speciality: 'Urology',
      site: 'Princess of Wales Hospital',
      seniorClinician: 'HURLE, Rhidian A, Mr (GMC:567890)',
      clinicName: 'General Urology',
      date: formatFormDate(new Date()),
      time: '09:00',
      consultationType: 'faceToFace',
    };
  }

  function setField(key: string, value: any) {
    formState[key] = value;
  }

  function setCodedField(key: string, value: string, coded: boolean) {
    formState[key] = value;
    formState[`${key}_coded`] = coded;
  }

  function syncWorkingDiagnosisFromFormState() {
    workingDiagnosisValue = formState.workingDiagnosis || '';
    workingDiagnosisCoded = Boolean(formState.workingDiagnosis_coded);
  }

  function setWorkingDiagnosis(value: string, coded: boolean) {
    workingDiagnosisValue = value;
    workingDiagnosisCoded = coded;
    formState.workingDiagnosis = value;
    formState.workingDiagnosis_coded = coded;
  }

  function bool(key: string) {
    return Boolean(formState[key]);
  }

  function setBool(key: string, value: boolean) {
    setField(key, value);
  }

  function mapLabelToValue(value: any, labels: Record<string, string>, fallback: string) {
    if (!value) return fallback;
    if (labels[value]) return value;
    const match = Object.entries(labels).find(([, label]) => label.toLowerCase() === String(value).toLowerCase());
    return match ? match[0] : fallback;
  }

  function applyWaitingListSummary(summary: any) {
    const savedState = summary?.formState || {};
    const savedProcedures = Array.isArray(summary?.procedures) ? summary.procedures : [];
    const wlOptions = savedState.intendedManagement === 'daycase'
      ? 'dayCase'
      : savedState.intendedManagement === 'inpatient'
        ? 'inpatient'
        : formState.wlOptions;
    const treatmentPlanned = savedProcedures
      .map((procedure: any) => {
        const side = String(procedure.side || '').trim();
        const procedureText = String(procedure.procedure || '').trim();
        const displaySide = side && side.toLowerCase() !== 'na' && side.toLowerCase() !== 'not applicable' ? side : '';
        return [displaySide, procedureText].filter(Boolean).join(' ');
      })
      .filter(Boolean)
      .join(', ');
    formState = {
      ...formState,
      waitListed: true,
      linkedWaitingListCardUuid: summary.uuid,
      wlOptions,
      treatmentPlanned: treatmentPlanned || formState.treatmentPlanned,
    };
  }

  function consumeWaitingListBridge() {
    const raw = sessionStorage.getItem(outpatientWlcBridgeKey);
    if (!raw) return false;
    try {
      const bridge = JSON.parse(raw);
      sessionStorage.removeItem(outpatientWlcBridgeKey);
      if (bridge.patientUuid && bridge.patientUuid !== patientUuid) return false;
      formState = bridge.formState ? { ...bridge.formState } : formState;
      syncWorkingDiagnosisFromFormState();
      cleanSnapshot = bridge.cleanSnapshot ? { ...bridge.cleanSnapshot } : cleanSnapshot;
      finalChecked = Boolean(bridge.finalChecked);
      highlySensitive = Boolean(bridge.highlySensitive);
      if (bridge.savedWaitingListCard) applyWaitingListSummary(bridge.savedWaitingListCard);
      return true;
    } catch {
      sessionStorage.removeItem(outpatientWlcBridgeKey);
      return false;
    }
  }

  function storeWaitingListBridge() {
    sessionStorage.setItem(outpatientWlcBridgeKey, JSON.stringify({
      patientUuid,
      formState,
      cleanSnapshot,
      finalChecked,
      highlySensitive,
    }));
  }

  function createWaitingListCardFromOutcome() {
    const initialFormState = {
      organisation: mapLabelToValue(formState.organisation, organisationLabels, 'cwm-taf'),
      speciality: mapLabelToValue(formState.speciality, specialityLabels, 'urology'),
      hospital: mapLabelToValue(formState.site || formState.hospital, hospitalLabels, 'princess-wales'),
      seniorClinician: formState.seniorClinician || '',
      seniorClinician_coded: formState.seniorClinician_coded,
      dateListed: formatFormDate(new Date()),
      urgency: formState.usc === 'yes' ? 'usc' : '',
    };
    sessionStorage.setItem(`${outpatientWlcBridgeKey}_initial_wlc`, JSON.stringify({
      formState: initialFormState,
      procedures: [{ id: 1, side: '', procedure: '', additionalInfo: '' }],
    }));
    inlineWaitingListCard = {
      openInRoV: false,
      openedFromOutpatientOutcomeButton: false,
    };
  }

  function openLinkedWaitingListCard() {
    if (!formState.linkedWaitingListCardUuid) return;
    inlineWaitingListCard = {
      formUuid: formState.linkedWaitingListCardUuid,
      openInRoV: true,
      openedFromOutpatientOutcomeButton: true,
    };
  }

  function handleWaitingListCardReturn(savedWaitingListCard?: { uuid: string; formState: Record<string, any>; procedures: any[] }) {
    inlineWaitingListCard = null;
    if (savedWaitingListCard) {
      applyWaitingListSummary(savedWaitingListCard);
    }
  }

  function areRequiredFieldsComplete() {
    if (!formState.attendedOption) return false;
    if (formState.attendedOption !== 'attended') return true;
    if (!formState.usc) return false;
    return [
      'discharged',
      'sos',
      'pifu',
      'remoteMonitoring',
      'testsReq',
      'waitListed',
      'oprxPlanned',
      'admitted',
      'mdtReview',
      'rxGiven',
      'stopRefClock',
      'refToTherapies',
      'refToConsultant',
      'fuOPA',
    ].some((key) => bool(key));
  }

  async function loadData() {
    try {
      patient = await getPatient(patientUuid);
    } catch {
      patient = null;
    }
    formState = initialFormState();
    if (appointmentUuid) {
      formState = { ...formState, appointmentUuid };
    }
    if (formUuid) {
      try {
        const saved = formVersion ? await getFormVersion('outpatient_outcome', formUuid, formVersion) : await getForm('outpatient_outcome', formUuid);
        formState = { ...formState, ...(saved?.form_data || {}), uuid: formUuid };
        syncWorkingDiagnosisFromFormState();
        finalChecked = saved?.form_status === 'final';
        highlySensitive = Boolean(saved?.highly_sensitive ?? saved?.form_data?.highlySensitive);
        const savedVersion = Number(saved?.version);
        if (!Number.isNaN(savedVersion)) formVersion = savedVersion;
        isReadOnlyView = openInRoV;
        formHistory = await getFormHistory(formUuid);
      } catch (error) {
        console.error('Error loading outpatient outcome:', error);
      }
    } else {
      isReadOnlyView = openInRoV;
    }
    syncWorkingDiagnosisFromFormState();
    cleanSnapshot = { ...formState };
    consumeWaitingListBridge();
    loadingData = false;
  }

  onMount(loadData);

  async function viewHistoryVersion(version: number) {
    if (!formUuid) return;
    const saved = await getFormVersion('outpatient_outcome', formUuid, version);
    formState = { ...initialFormState(), ...(saved?.form_data || {}), uuid: formUuid };
    syncWorkingDiagnosisFromFormState();
    finalChecked = saved?.form_status === 'final';
    highlySensitive = Boolean(saved?.highly_sensitive ?? saved?.form_data?.highlySensitive);
    cleanSnapshot = { ...formState };
    formVersion = version;
    isReadOnlyView = true;
    showHistoryMenu = false;
  }

  async function saveForm(status: SaveStatus) {
    if (formChanged && !password.trim()) {
      pendingSaveStatus = status;
      showPasswordPopup = true;
      return;
    }
    if (status === 'final' && !finalChecked) {
      pendingSaveStatus = 'draft';
      showDraftPopup = true;
      return;
    }
    isSaving = true;
    showSavingPopup = true;
    try {
      const formUuid = formState.uuid || generateUUID();
      const latestVersion = await assertFormVersionIsLatest('outpatient_outcome', formUuid, formVersion);
      const version = (latestVersion || 0) + 1;
      const formData = {
        ...formState,
        workingDiagnosis: workingDiagnosisValue,
        workingDiagnosis_coded: workingDiagnosisCoded,
        discharged: Boolean(formState.discharged ?? formState.discharge),
        waitListed: Boolean(formState.waitListed ?? formState.waitingList),
        highlySensitive,
        finalChecked: status === 'final',
        savedBy: username
      };
      await insertForm('outpatient_outcome', {
        uuid: formUuid,
        version,
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: new Date().toISOString(),
        form_status: status,
        form_data: formData,
        highly_sensitive: highlySensitive,
      });
      await insertFormsIndex({
        form_uuid: formUuid,
        form_version: version,
        form_type: 'outpatient_outcome',
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: new Date().toISOString(),
        document_datetime: new Date().toISOString(),
        form_status: status,
        highly_sensitive: highlySensitive,
        event_or_document: 'Document',
        title: 'Outpatient outcome',
        summary: 'Outpatient outcome',
      });
      formState = { ...formData, uuid: formUuid };
      cleanSnapshot = { ...formState };
      formVersion = version;
      showSavingPopup = false;
      showSavedPopup = true;
      if (inline) {
        window.setTimeout(() => {
          showSavedPopup = false;
          onClose();
        }, 1000);
      }
    } catch (error) {
      showSavingPopup = false;
      if (isStaleFormVersionError(error)) {
        showStaleSavePopup = true;
      } else {
        saveErrorDetails = error instanceof Error ? error.message : String(error);
        showSaveErrorPopup = true;
      }
    } finally {
      isSaving = false;
    }
  }

  async function continueAfterStaleSave() {
    showStaleSavePopup = false;
    const formUuid = formState.uuid;
    if (!formUuid) return;
    try {
      const saved = await getForm('outpatient_outcome', formUuid);
      formState = { ...initialFormState(), ...(saved?.form_data || {}), uuid: formUuid };
      syncWorkingDiagnosisFromFormState();
      finalChecked = saved?.form_status === 'final';
      highlySensitive = Boolean(saved?.highly_sensitive ?? saved?.form_data?.highlySensitive);
      const savedVersion = Number(saved?.version);
      if (!Number.isNaN(savedVersion)) formVersion = savedVersion;
      formHistory = await getFormHistory(formUuid);
      cleanSnapshot = { ...formState };
    } catch {
      // fall through to RoV with the local state if the reload fails
    }
    isReadOnlyView = true;
  }

  function bullet(label: string) {
    return `\u25cf ${label}`;
  }

  function displayValue(value: any) {
    if (value === true) return 'Yes';
    if (value === false || value === undefined || value === null) return '';
    return String(value);
  }

  function backToRecord() {
    if (inline) {
      onClose();
      return;
    }
    returnByHref(readOnlyBackOnly ? `${base}/patient-record/${encodeURIComponent(patientUuid)}` : `${base}/`);
  }
</script>

{#snippet readonlyContent()}
  <div class="oo-content">
    <div class="oo-group fb-question-container">
      <div class="oo-group-label">Appointment</div>
      <div class="oo-grid">
        <FbReadOnly label="Organisation" value={formState.organisation} />
        <FbReadOnly label="Speciality" value={formState.speciality} />
        <FbReadOnly label="Site" value={formState.site} />
        <FbReadOnly label="Senior responsible clinician" value={formState.seniorClinician} />
        <FbReadOnly label="Clinic name" value={formState.clinicName} />
        <FbReadOnly label="Date" tooltip={dateTooltip} value={formState.date} />
        <FbReadOnly label="Time" tooltip={timeTooltip} value={formState.time} />
      </div>
    </div>
    <FbReadOnly label="Attendance" value={formState.attendedOption === 'attended' ? 'Attended' : formState.attendedOption === 'unableToAttend' ? 'Unable to attend' : formState.attendedOption === 'didNotAttend' ? 'Did not attend' : ''} />
    {#if formState.attendedOption === 'attended'}
      <FbReadOnly label="Urgent suspected cancer" tooltip={uscTooltip} value={formState.usc === 'yes' ? 'Yes' : formState.usc === 'no' ? 'No' : ''} />
      <FbReadOnly label="Working diagnosis" value={formState.workingDiagnosis} coded={formState.workingDiagnosis_coded} />
      <div class="oo-group fb-question-container">
        <div class="oo-group-label">Outcome</div>
        <div class="oo-choices">
          {#if bool('discharged')}<div>{bullet('Discharge')}</div>{/if}
          {#if bool('sos')}<div>{bullet('See on symptom')} {formState.sosInterval ? `- ${formState.sosInterval}` : ''}</div>{/if}
          {#if bool('pifu')}<div>{bullet('Patient initiated follow-up')}</div>{/if}
          {#if bool('remoteMonitoring')}<div>{bullet('Remote monitoring')}</div>{/if}
          {#if bool('testsReq')}<div>{bullet('Tests requested')}</div>{/if}
          {#if bool('waitListed')}<div>{bullet('Add to waiting list for surgery or other treatment')}</div>{/if}
          {#if bool('oprxPlanned')}<div>{bullet('Outpatient treatment planned')}</div>{/if}
          {#if bool('admitted')}<div>{bullet('Admitted from clinic to ward or department')}</div>{/if}
          {#if bool('mdtReview')}<div>{bullet('MDT review')}</div>{/if}
          {#if bool('rxGiven')}<div>{bullet('Treatment given in clinic today')}</div>{/if}
          {#if bool('stopRefClock')}<FbToolTip text={stopReferralTooltip} as="div">{bullet('Stop referral to treatment clock')}</FbToolTip>{/if}
          {#if bool('refToTherapies')}<FbToolTip text={referralTooltip} as="div">{bullet('Referred to therapies')}</FbToolTip>{/if}
          {#if bool('refToConsultant')}<FbToolTip text={referralTooltip} as="div">{bullet('Referred to another consultant, speciality or hospital')}</FbToolTip>{/if}
          {#if bool('fuOPA')}<div>{bullet('Follow up appointment')}</div>{/if}
        </div>
      </div>
    {/if}
    <FbReadOnly label="Notes" value={formState.notes} />
  </div>
{/snippet}

{#snippet editContent()}
  <div class="oo-content">
    <div class="oo-group fb-question-container">
      <div class="oo-group-label">Appointment</div>
      <div class="oo-grid">
        <div><div class="oo-small-label">Organisation</div><div class="oo-readonly-value">{formState.organisation}</div></div>
        <div><div class="oo-small-label">Speciality</div><div class="oo-readonly-value">{formState.speciality}</div></div>
        <div><div class="oo-small-label">Site</div><div class="oo-readonly-value">{formState.site}</div></div>
        <div><div class="oo-small-label">Senior responsible clinician</div><div class="oo-readonly-value">{formState.seniorClinician}</div></div>
        <div><div class="oo-small-label">Clinic name</div><div class="oo-readonly-value">{formState.clinicName}</div></div>
        <FbToolTip text={dateTooltip} as="div"><div class="oo-small-label">Date</div><div class="oo-readonly-value">{formState.date}</div></FbToolTip>
        <FbToolTip text={timeTooltip} as="div"><div class="oo-small-label">Time</div><div class="oo-readonly-value">{formState.time}</div></FbToolTip>
      </div>
    </div>

    <div class="oo-group fb-question-container">
      <div class="oo-group-label">Attendance <span class="required">*</span></div>
      <div class="oo-choices">
        <FbRadio name="attendedOption" value="attended" label="Attended" checked={formState.attendedOption === 'attended'} required showRequiredMarkers={false} onChange={(value) => setField('attendedOption', value)} />
        <FbRadio name="attendedOption" value="unableToAttend" label="Unable to attend" checked={formState.attendedOption === 'unableToAttend'} required showRequiredMarkers={false} onChange={(value) => setField('attendedOption', value)}>
          <div class="oo-check-subquestions">
            <FbTextInput label="Reason" subfield value={formState.unableReason || ''} onChange={(value) => setField('unableReason', value)} />
            <FbRadio name="unableAction" value="anotherMade" label="Another appointment already made" checked={formState.unableAction === 'anotherMade'} onChange={(value) => setField('unableAction', value)}>
              <FbQuestion label="Date" subfield><FbExactDate name="anotherApptDate" value={formState.anotherApptDate || ''} onChange={(value) => setField('anotherApptDate', value)} /></FbQuestion>
            </FbRadio>
            <FbRadio name="unableAction" value="sendAnother" label="Send another appointment" checked={formState.unableAction === 'sendAnother'} onChange={(value) => setField('unableAction', value)} />
            <FbRadio name="unableAction" value="noFurther" label="No further appointment" checked={formState.unableAction === 'noFurther'} onChange={(value) => setField('unableAction', value)}>
              <FbRadio name="letterAction" value="sendLetter" label="Send system-generated letter to GP and patient" checked={formState.letterAction === 'sendLetter'} onChange={(value) => setField('letterAction', value)} />
              <FbRadio name="letterAction" value="letterDone" label="Letter to GP and patient done" checked={formState.letterAction === 'letterDone'} onChange={(value) => setField('letterAction', value)} />
            </FbRadio>
          </div>
        </FbRadio>
        <FbRadio name="attendedOption" value="didNotAttend" label="Did not attend" checked={formState.attendedOption === 'didNotAttend'} required showRequiredMarkers={false} onChange={(value) => setField('attendedOption', value)}>
          <div class="oo-check-subquestions">
            <FbToolTip text={wasNotBroughtTooltip} as="div">
              <FbCheck name="wasNotBrought" label="Was not brought" checked={wasNotBroughtChecked} onChange={(checked) => setBool('wasNotBrought', checked)} />
            </FbToolTip>
            <FbRadio name="dnaAction" value="sendAnother" label="Send another appointment" checked={formState.dnaAction === 'sendAnother'} onChange={(value) => setField('dnaAction', value)} />
            <FbRadio name="dnaAction" value="noFurther" label="No further appointment" checked={formState.dnaAction === 'noFurther'} onChange={(value) => setField('dnaAction', value)}>
              <FbRadio name="dnaLetterAction" value="sendLetter" label="Send system-generated letter to GP and patient" checked={formState.dnaLetterAction === 'sendLetter'} onChange={(value) => setField('dnaLetterAction', value)} />
              <FbRadio name="dnaLetterAction" value="letterDone" label="Letter to GP and patient done" checked={formState.dnaLetterAction === 'letterDone'} onChange={(value) => setField('dnaLetterAction', value)} />
            </FbRadio>
          </div>
        </FbRadio>
      </div>
    </div>

    {#if formState.attendedOption === 'attended'}
      <FbToolTip text={uscTooltip} as="div" className="oo-group fb-question-container">
        <div class="oo-group-label">Urgent suspected cancer <span class="required">*</span></div>
        <FbRadio name="usc" value="yes" label="Yes" checked={formState.usc === 'yes'} required showRequiredMarkers={false} onChange={(value) => setField('usc', value)} />
        <FbRadio name="usc" value="no" label="No" checked={formState.usc === 'no'} required showRequiredMarkers={false} onChange={(value) => setField('usc', value)} />
      </FbToolTip>

      <div class="oo-group fb-question-container">
        <FbSCTDiagnosis
          label="Working diagnosis"
          name="workingDiagnosis"
          value={workingDiagnosisValue}
          coded={workingDiagnosisCoded}
          placeholder="Search for diagnosis..."
          onChange={setWorkingDiagnosis}
        />
      </div>

      <div class="oo-group fb-question-container">
        <div class="oo-group-label">Outcome <span class="required">*</span></div>
        <div class="oo-choices">
          <FbCheck name="discharge" label="Discharge" checked={dischargedChecked} disabled={dischargeDisabled} onChange={(checked) => setBool('discharged', checked)} />
          <FbCheck name="sos" label="See on symptom" checked={sosChecked} disabled={sosDisabled} onChange={(checked) => setBool('sos', checked)}>
            <FbRadio name="sosInterval" value="sixMonths" label="Six months" checked={formState.sosInterval === 'sixMonths' || !formState.sosInterval} required={sosChecked} showRequiredMarkers={false} onChange={(value) => setField('sosInterval', value)} />
            <FbRadio name="sosInterval" value="twelveMonths" label="Twelve months" checked={formState.sosInterval === 'twelveMonths'} required={sosChecked} showRequiredMarkers={false} onChange={(value) => setField('sosInterval', value)} />
          </FbCheck>
          <FbCheck name="pifu" label="Patient initiated follow-up" checked={pifuChecked} disabled={pifuDisabled} onChange={(checked) => setBool('pifu', checked)} />
          <FbCheck name="remoteMonitoring" label="Remote monitoring" checked={remoteMonitoringChecked} disabled={remoteMonitoringDisabled} onChange={(checked) => setBool('remoteMonitoring', checked)} />
          <FbCheck name="testsReq" label="Tests requested" checked={testsReqChecked} disabled={testsReqDisabled} onChange={(checked) => setBool('testsReq', checked)}>
            <FbRadio name="testsReason" value="beforeTreatment" label="Result required before deciding treatment" checked={formState.testsReason === 'beforeTreatment' || !formState.testsReason} required={testsReqChecked} showRequiredMarkers={false} onChange={(value) => setField('testsReason', value)} />
            <FbRadio name="testsReason" value="afterTreatment" label="Result required for monitoring or after treatment" checked={formState.testsReason === 'afterTreatment'} required={testsReqChecked} showRequiredMarkers={false} onChange={(value) => setField('testsReason', value)} />
            <FbTextArea id="testsRequested" name="testsRequested" label="Tests requested" subfield value={formState.testsRequested || ''} onChange={(value) => setField('testsRequested', value)} />
          </FbCheck>
          <FbCheck name="waitingList" label="Add to waiting list for surgery or other treatment" checked={waitListedChecked} disabled={waitListedDisabled} onChange={(checked) => setBool('waitListed', checked)}>
            <div class="oo-small-button-row">
              {#if formState.linkedWaitingListCardUuid}
                <button type="button" class="oo-small-add-button" onclick={openLinkedWaitingListCard}>Open waiting list card</button>
              {:else}
                <button type="button" class="oo-small-add-button" onclick={createWaitingListCardFromOutcome}>Create waiting list card</button>
              {/if}
            </div>
            <FbGroup label="Waiting list" required={waitListedChecked} subfield class="oo-subquestion-group">
              <FbRadio name="wlOptions" value="dayCase" label="Day case" checked={formState.wlOptions === 'dayCase'} required={waitListedChecked} onChange={(value) => setField('wlOptions', value)} />
              <FbRadio name="wlOptions" value="inpatient" label="Inpatient" checked={formState.wlOptions === 'inpatient'} required={waitListedChecked} onChange={(value) => setField('wlOptions', value)} />
            </FbGroup>
            <FbTextArea id="treatmentPlanned" name="treatmentPlanned" label="Treatment planned" required subfield value={formState.treatmentPlanned || ''} onChange={(value) => setField('treatmentPlanned', value)} />
          </FbCheck>
          <FbCheck name="oprxPlanned" label="Outpatient treatment planned" checked={oprxPlannedChecked} disabled={oprxPlannedDisabled} onChange={(checked) => setBool('oprxPlanned', checked)}>
            <FbTextArea id="oprxTreatmentPlanned" name="oprxTreatmentPlanned" label="Treatment planned" required subfield value={formState.oprxTreatmentPlanned || ''} onChange={(value) => setField('oprxTreatmentPlanned', value)} />
            <FbGroup label="Priority" required={oprxPlannedChecked} subfield class="oo-subquestion-group">
              <FbRadio name="rxPriority" value="routine" label="Routine" checked={formState.rxPriority === 'routine'} required={oprxPlannedChecked} onChange={(value) => setField('rxPriority', value)} />
              <FbRadio name="rxPriority" value="urgent" label="Urgent" checked={formState.rxPriority === 'urgent'} required={oprxPlannedChecked} onChange={(value) => setField('rxPriority', value)} />
              <FbRadio name="rxPriority" value="usc" label="Urgent suspected cancer" checked={formState.rxPriority === 'usc'} required={oprxPlannedChecked} onChange={(value) => setField('rxPriority', value)} />
            </FbGroup>
          </FbCheck>
          <FbCheck name="admitted" label="Admitted from clinic to ward or department" checked={admittedChecked} disabled={admittedDisabled} onChange={(checked) => setBool('admitted', checked)} />
          <FbCheck name="mdtReview" label="MDT review" checked={mdtReviewChecked} disabled={mdtReviewDisabled} onChange={(checked) => setBool('mdtReview', checked)} />
          <FbCheck name="rxGiven" label="Treatment given in clinic today" checked={rxGivenChecked} onChange={(checked) => setBool('rxGiven', checked)}>
            <FbTextArea id="treatmentGiven" name="treatmentGiven" label="Treatment given" required subfield value={formState.treatmentGiven || ''} onChange={(value) => setField('treatmentGiven', value)} />
          </FbCheck>
          <FbToolTip text={stopReferralTooltip} as="div">
            <FbCheck name="stopRefClock" label="Stop referral to treatment clock" checked={stopRefClockChecked} onChange={(checked) => setBool('stopRefClock', checked)} />
          </FbToolTip>
          <FbToolTip text={referralTooltip} as="div">
            <FbCheck name="refToTherapies" label="Referred to therapies" checked={refToTherapiesChecked} onChange={(checked) => setBool('refToTherapies', checked)}>
              <FbTextArea id="therapyDetails" name="therapyDetails" label="Therapy or department (for example physiotherapy)" required subfield value={formState.therapyDetails || ''} onChange={(value) => setField('therapyDetails', value)} />
            </FbCheck>
          </FbToolTip>
          <FbToolTip text={referralTooltip} as="div">
            <FbCheck name="refToConsultant" label="Referred to another consultant, speciality or hospital" checked={refToConsultantChecked} onChange={(checked) => setBool('refToConsultant', checked)}>
              <FbTextInput id="consultantDetails" name="consultantDetails" label="Consultant, speciality or hospital" required subfield value={formState.consultantDetails || ''} onChange={(value) => setField('consultantDetails', value)} />
            </FbCheck>
          </FbToolTip>
          <FbCheck name="fuOPA" label="Follow up appointment" checked={fuOPAChecked} disabled={fuOPADisabled} onChange={(checked) => setBool('fuOPA', checked)}>
            <FbCheck name="cancerPathway" label="Patient to remain on cancer pathway" checked={cancerPathwayChecked} onChange={(checked) => setBool('cancerPathway', checked)} />
            <FbTextInput id="interval" name="interval" label="Interval" required subfield placeholder="Specify days, weeks or months" value={formState.interval || ''} onChange={(value) => setField('interval', value)} />
            <FbCheck name="sameClinic" label="Must be seen in the same clinic" checked={sameClinicChecked} onChange={(checked) => setBool('sameClinic', checked)} />
            <FbCheck name="sameClinician" label="Must be seen by the same senior responsible clinician" checked={sameClinicianChecked} onChange={(checked) => setBool('sameClinician', checked)} />
            <FbGroup label="Consultation type" required={fuOPAChecked} subfield class="oo-subquestion-group">
              <FbRadio name="consultationType" value="faceToFace" label="Face to face" checked={formState.consultationType === 'faceToFace' || !formState.consultationType} required={fuOPAChecked} onChange={(value) => setField('consultationType', value)}>
                <FbTextInput id="hospitalDifferent" name="hospitalDifferent" label="Hospital (if different)" subfield value={formState.hospitalDifferent || ''} onChange={(value) => setField('hospitalDifferent', value)} />
              </FbRadio>
              <FbRadio name="consultationType" value="telephone" label="Telephone consultation" checked={formState.consultationType === 'telephone'} required={fuOPAChecked} onChange={(value) => setField('consultationType', value)} />
              <FbRadio name="consultationType" value="videoCall" label="Video call" checked={formState.consultationType === 'videoCall'} required={fuOPAChecked} onChange={(value) => setField('consultationType', value)} />
              <FbRadio name="consultationType" value="caseReview" label="Case review (patient not required to attend)" checked={formState.consultationType === 'caseReview'} required={fuOPAChecked} onChange={(value) => setField('consultationType', value)} />
            </FbGroup>
            <FbGroup label="Priority (appointment directive)" required={fuOPAChecked} subfield class="oo-subquestion-group">
              <FbRadio name="fuApptPriority" value="overbook" label="A* : Overbook" checked={formState.fuApptPriority === 'overbook'} required={fuOPAChecked} onChange={(value) => setField('fuApptPriority', value)} />
              <FbRadio name="fuApptPriority" value="doNotPostpone" label="A : Do not postpone appointment" checked={formState.fuApptPriority === 'doNotPostpone'} required={fuOPAChecked} onChange={(value) => setField('fuApptPriority', value)} />
              <FbRadio name="fuApptPriority" value="fourWeeks" label="B : Do not postpone appointment for more than four weeks" checked={formState.fuApptPriority === 'fourWeeks'} required={fuOPAChecked} onChange={(value) => setField('fuApptPriority', value)} />
              <FbRadio name="fuApptPriority" value="afterTests" label="D : After test results" checked={formState.fuApptPriority === 'afterTests'} required={fuOPAChecked} onChange={(value) => setField('fuApptPriority', value)} />
              <FbRadio name="fuApptPriority" value="treatmentWL" label="T : Add to outpatient treatment waiting list" checked={formState.fuApptPriority === 'treatmentWL'} required={fuOPAChecked} onChange={(value) => setField('fuApptPriority', value)} />
            </FbGroup>
            <FbTextInput id="testsOnArrival" name="testsOnArrival" label="Tests to be done on arrival" subfield placeholder="Filling in this box does not generate a test request" value={formState.testsOnArrival || ''} onChange={(value) => setField('testsOnArrival', value)} />
          </FbCheck>
        </div>
      </div>
    {/if}

    <div class="oo-notes">
      <FbTextArea label="Notes" rows={4} value={formState.notes || ''} onChange={(value) => setField('notes', value)} />
    </div>
  </div>
{/snippet}

{#if loadingData}
  <p style="padding: 0.8rem;">Loading...</p>
{:else if inlineWaitingListCard}
  <WaitingListCard
    {patientUuid}
    formUuid={inlineWaitingListCard.formUuid || ''}
    openInRoV={inlineWaitingListCard.openInRoV}
    inline
    fromOutpatientOutcome
    openedFromOutpatientOutcomeButton={inlineWaitingListCard.openedFromOutpatientOutcomeButton}
    onClose={() => (inlineWaitingListCard = null)}
    onReturnToOutpatientOutcome={handleWaitingListCardReturn}
  />
{:else}
  <FbLayout sections={[]} {formState} isReadOnlyView={isReadOnlyView}>
    {#snippet header()}<FbHeader title="Outpatient outcome" {patient} formStatus={effectiveFormStatus} {highlySensitive} superseded={isReadOnlyView && superseded} />{/snippet}
    {#if isReadOnlyView}
      {@render readonlyContent()}
    {:else}
      {@render editContent()}
    {/if}
    {#snippet bottomControls()}
      <FbBottomControlsRow>
        {#if isReadOnlyView}
          {#if !readOnlyBackOnly && !superseded && (effectiveFormStatus !== 'final' || !openInRoV)}
            <FbButton type="button" onClick={() => (isReadOnlyView = false)}>EV</FbButton>
          {/if}
          {#if formUuid && !superseded}
            <FbButton type="button" onClick={() => (showHistoryMenu = true)}>History</FbButton>
          {/if}
          <div style="flex: 1;"></div>
          <FbButton type="button" onClick={backToRecord}>Back</FbButton>
        {:else}
          {#if !readOnlyBackOnly}
            <FbButton type="button" onClick={() => (isReadOnlyView = true)}>RoV</FbButton>
          {/if}
          <div style="flex: 1;"></div>
          <FbAuthAndSensitivity bind:username bind:password bind:highlySensitive bind:finalChecked {formChanged} finalDisabled={!requiredComplete} />
          <FbButton type="button" variant={formChanged ? 'success' : 'secondary'} disabled={!requiredComplete || isSaving || !formChanged} onClick={() => saveForm('final')}>Save and close</FbButton>
          <FbButton type="button" variant="danger" onClick={() => formChanged ? (showCancelPopup = true) : backToRecord()}>Cancel</FbButton>
        {/if}
      </FbBottomControlsRow>
    {/snippet}
  </FbLayout>
{/if}

{#if showDraftPopup}<FbDraftPopup onSaveDraft={() => { showDraftPopup = false; saveForm('draft'); }} onCancel={() => (showDraftPopup = false)} />{/if}
{#if showPasswordPopup}<FbModalPassword on:confirm={(event) => { password = event.detail; showPasswordPopup = false; saveForm(pendingSaveStatus); }} on:cancel={() => (showPasswordPopup = false)} />{/if}
{#if showCancelPopup}<FbCancelPopup onDiscard={backToRecord} onReturnToForm={() => (showCancelPopup = false)} />{/if}
{#if showSavingPopup}<FbSavingPopup />{/if}
{#if showSavedPopup}<FbSavedPopup />{/if}
{#if showSaveErrorPopup}<FbSaveErrorPopup error={saveErrorDetails} onReturnToForm={() => (showSaveErrorPopup = false)} />{/if}
{#if showStaleSavePopup}<FbModalStaleSave onContinue={continueAfterStaleSave} />{/if}
{#if showHistoryMenu}
  <FbFormHistoryMenu history={formHistory} onViewVersion={viewHistoryVersion} onClose={() => (showHistoryMenu = false)} />
{/if}

<style>
  .oo-content {
    padding: 0.4rem;
  }

  .oo-group {
    padding: 0.4rem;
    border-radius: 0.4rem;
    margin-top: 0.4rem;
  }

  .oo-group-label {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.2rem;
  }

  .oo-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    column-gap: 1rem;
    row-gap: 0.4rem;
  }

  .oo-small-label {
    font-size: 0.8rem;
    font-weight: 300;
  }

  .oo-readonly-value {
    font-size: 1rem;
    font-weight: 500;
    margin-left: 0.4rem;
  }

  .oo-choices {
    margin-left: 0.4rem;
  }

  .oo-subq {
    margin-left: 1.5rem;
    margin-top: 0.4rem;
  }

  .oo-check-subquestions {
    margin-top: 0.4rem;
  }

  .oo-notes {
    padding: 0.4rem;
    border-radius: 0.4rem;
    margin-top: 0.4rem;
  }

  .required {
    color: var(--fb-red);
    font-weight: 500;
  }

  .oo-small-button-row {
    margin: 0.4rem 0;
  }

  .oo-subquestion-group {
    margin-top: 0.4rem;
  }

  .oo-subquestion-label {
    display: block;
    font-size: 1rem;
    font-weight: 300;
  }

  .oo-subquestion-options {
    margin-top: 0.2rem;
  }

  .oo-small-add-button {
    border: 0.1rem solid var(--fb-blue);
    border-radius: 0.4rem;
    background: white;
    color: var(--fb-blue);
    font-size: 0.9rem;
    font-weight: 300;
    padding: 0.1rem 0.5rem;
    cursor: pointer;
  }

  .oo-small-add-button:hover,
  .oo-small-add-button:focus {
    background: var(--fb-active-darker-yellow);
    color: black;
    border-color: black;
  }

  @media (max-width: 767px) {
    .oo-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

