<script lang="ts">
  import { onMount } from 'svelte';
  import FbAuthAndSensitivity from '../components/fbAuthAndSensitivity.svelte';
  import FbBottomControlsRow from '../components/fbBottomControlsRow.svelte';
  import FbButton from '../components/fbButton.svelte';
  import FbCancelPopup from '../components/fbModalCancel.svelte';
  import FbCheck from '../components/fbCheck.svelte';
  import FbDraftPopup from '../components/fbModalDraft.svelte';
  import FbExactDate from '../components/fbDateExact.svelte';
  import FbHeader from '../components/fbHeader.svelte';
  import FbLayout from '../components/fbLayout.svelte';
  import FbModalPassword from '../components/fbModalPassword.svelte';
  import FbQuestion from '../components/fbQuestion.svelte';
  import FbRadio from '../components/fbRadio.svelte';
  import FbReadOnly from '../components/fbReadOnly.svelte';
  import FbSCTDiagnosis from '../components/fbSCTDiagnosis.svelte';
  import FbSaveErrorPopup from '../components/fbModalSaveError.svelte';
  import FbSavedPopup from '../components/fbModalSaved.svelte';
  import FbSavingPopup from '../components/fbModalSaving.svelte';
  import FbTextArea from '../components/fbTextArea.svelte';
  import FbTextInput from '../components/fbTextInput.svelte';
  import FbToolTip from '../components/fbToolTip.svelte';
  import FbFormHistoryMenu, { type FbFormHistoryItem } from '../components/fbFormHistoryMenu.svelte';
  import WaitingListCard from './WaitingListCard.svelte';
  import {
    hospitalLabels,
    organisationLabels,
    specialityLabels,
  } from '../lib/constants';
  import { compareFormStatesObj } from '../lib/formStateUtils';
  import { formatFormDate, generateUUID } from '../lib/dateFormat';
  import { getForm, getFormHistory, getFormVersion, getLatestVersion, getPatient, insertForm, insertFormsIndex } from '../lib/api';
  import type { Patient } from '../lib/types';

  type SaveStatus = 'final' | 'draft';

  const params = new URLSearchParams(window.location.search);
  export let patientUuid = params.get('patientUuid') || 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
  export let formUuid = params.get('formUuid') || '';
  export let formVersion = Number(params.get('formVersion') || '') || null;
  export let appointmentUuid = params.get('appointmentUuid') || '';
  export let openInRoV = params.get('openInRoV') === 'true';
  export let readOnlyBackOnly = params.get('readOnlyBackOnly') === 'true';
  export let inline = false;
  export let onClose: () => void = () => {};
  const outpatientWlcBridgeKey = `fb_svelte_oo_wlc_bridge_${patientUuid}`;
  const dateTooltip = 'Date of consultation';
  const timeTooltip = 'Time of consultation';
  const wasNotBroughtTooltip = 'Check if the patient is aged less than 18 years or depends on another adult to attend. This check box does not fulfil safeguarding obligations.';
  const uscTooltip = 'Required for monitoring performance against cancer targets';
  const stopReferralTooltip = 'Checking this indicates that the patient should not be offered active treatment. Treatment here means: surgery, chemotherapy, radiotherapy, biological therapy and transplant';
  const referralTooltip = 'Checking this does not generate a referral';

  let patient: Patient | null = null;
  let loadingData = true;
  let isReadOnlyView = false;
  let formState: Record<string, any> = initialFormState();
  let cleanSnapshot: Record<string, any> = {};
  let formChanged = false;
  let finalChecked = false;
  let highlySensitive = false;
  let username = 'demoUser';
  let password = '';
  let pendingSaveStatus: SaveStatus = 'final';
  let isSaving = false;
  let showDraftPopup = false;
  let showPasswordPopup = false;
  let showCancelPopup = false;
  let showSavingPopup = false;
  let showSavedPopup = false;
  let showSaveErrorPopup = false;
  let saveErrorDetails = '';
  let formHistory: FbFormHistoryItem[] = [];
  let showHistoryMenu = false;
  let dischargeDisabled = false;
  let sosDisabled = false;
  let pifuDisabled = false;
  let remoteMonitoringDisabled = false;
  let testsReqDisabled = false;
  let waitListedDisabled = false;
  let oprxPlannedDisabled = false;
  let admittedDisabled = false;
  let mdtReviewDisabled = false;
  let fuOPADisabled = false;
  let dischargedChecked = false;
  let sosChecked = false;
  let pifuChecked = false;
  let remoteMonitoringChecked = false;
  let testsReqChecked = false;
  let waitListedChecked = false;
  let oprxPlannedChecked = false;
  let admittedChecked = false;
  let mdtReviewChecked = false;
  let rxGivenChecked = false;
  let stopRefClockChecked = false;
  let refToTherapiesChecked = false;
  let refToConsultantChecked = false;
  let fuOPAChecked = false;
  let inlineWaitingListCard: {
    formUuid?: string;
    openInRoV: boolean;
    openedFromOutpatientOutcomeButton: boolean;
  } | null = null;

  $: formChanged = !compareFormStatesObj(cleanSnapshot, formState);
  $: requiredComplete = (formState, areRequiredFieldsComplete());
  $: effectiveFormStatus = finalChecked ? 'final' : 'draft';
  $: {
    const state = formState;
    const discharged = Boolean(state.discharged);
    const sos = Boolean(state.sos);
    const pifu = Boolean(state.pifu);
    const remoteMonitoring = Boolean(state.remoteMonitoring);
    const testsReq = Boolean(state.testsReq);
    const waitListed = Boolean(state.waitListed);
    const oprxPlanned = Boolean(state.oprxPlanned);
    const admitted = Boolean(state.admitted);
    const mdtReview = Boolean(state.mdtReview);
    const fuOPA = Boolean(state.fuOPA);
    dischargedChecked = discharged;
    sosChecked = sos;
    pifuChecked = pifu;
    remoteMonitoringChecked = remoteMonitoring;
    testsReqChecked = testsReq;
    waitListedChecked = waitListed;
    oprxPlannedChecked = oprxPlanned;
    admittedChecked = admitted;
    mdtReviewChecked = mdtReview;
    rxGivenChecked = Boolean(state.rxGiven);
    stopRefClockChecked = Boolean(state.stopRefClock);
    refToTherapiesChecked = Boolean(state.refToTherapies);
    refToConsultantChecked = Boolean(state.refToConsultant);
    fuOPAChecked = fuOPA;
    const tier1 = discharged || sos || pifu;
    const tier2 = remoteMonitoring || testsReq || waitListed || oprxPlanned || admitted || mdtReview || fuOPA;
    dischargeDisabled = sos || pifu || tier2;
    sosDisabled = discharged || pifu || tier2;
    pifuDisabled = discharged || sos || tier2;
    remoteMonitoringDisabled = tier1;
    testsReqDisabled = tier1;
    waitListedDisabled = tier1;
    oprxPlannedDisabled = tier1;
    admittedDisabled = tier1;
    mdtReviewDisabled = tier1;
    fuOPADisabled = tier1;
  }

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
    formState = { ...formState, [key]: value };
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
        finalChecked = saved?.form_status === 'final';
        highlySensitive = Boolean(saved?.form_data?.highlySensitive);
        isReadOnlyView = openInRoV;
        formHistory = await getFormHistory(formUuid);
      } catch (error) {
        console.error('Error loading outpatient outcome:', error);
      }
    } else {
      isReadOnlyView = openInRoV;
    }
    cleanSnapshot = { ...formState };
    consumeWaitingListBridge();
    loadingData = false;
  }

  onMount(loadData);

  async function viewHistoryVersion(version: number) {
    if (!formUuid) return;
    const saved = await getFormVersion('outpatient_outcome', formUuid, version);
    formState = { ...initialFormState(), ...(saved?.form_data || {}), uuid: formUuid };
    finalChecked = saved?.form_status === 'final';
    highlySensitive = Boolean(saved?.form_data?.highlySensitive);
    cleanSnapshot = { ...formState };
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
      const latest = await getLatestVersion('outpatient_outcome', formUuid);
      const version = (latest.version || 0) + 1;
      const formData = { ...formState, highlySensitive, finalChecked: status === 'final', savedBy: username };
      await insertForm('outpatient_outcome', {
        uuid: formUuid,
        version,
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: new Date().toISOString(),
        form_status: status,
        form_data: formData,
      });
      await insertFormsIndex({
        form_uuid: formUuid,
        form_version: version,
        form_type: 'outpatient_outcome',
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: new Date().toISOString(),
        document_datetime: new Date().toISOString(),
        form_status: status,
        event_or_document: 'Document',
        title: 'Outpatient outcome',
        summary: 'Outpatient outcome',
      });
      formState = { ...formState, uuid: formUuid };
      cleanSnapshot = { ...formState, uuid: formUuid };
      showSavingPopup = false;
      showSavedPopup = true;
      if (inline) {
        window.setTimeout(() => {
          showSavedPopup = false;
          onClose();
        }, 1000);
      }
    } catch (error) {
      saveErrorDetails = error instanceof Error ? error.message : String(error);
      showSavingPopup = false;
      showSaveErrorPopup = true;
    } finally {
      isSaving = false;
    }
  }

  function bullet(label: string) {
    return `\u25cf ${label}`;
  }

  function displayValue(value: any) {
    if (value === true) return 'Yes';
    if (value === false || value === undefined || value === null) return '';
    return String(value);
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
        <FbRadio name="attendedOption" value="attended" label="Attended" checked={formState.attendedOption === 'attended'} onChange={(value) => setField('attendedOption', value)} />
        <FbRadio name="attendedOption" value="unableToAttend" label="Unable to attend" checked={formState.attendedOption === 'unableToAttend'} onChange={(value) => setField('attendedOption', value)} />
        {#if formState.attendedOption === 'unableToAttend'}
          <div class="oo-subq fb-subquestion">
            <FbTextInput label="Reason" subfield value={formState.unableReason || ''} onChange={(value) => setField('unableReason', value)} />
            <FbRadio name="unableAction" value="anotherMade" label="Another appointment already made" checked={formState.unableAction === 'anotherMade'} onChange={(value) => setField('unableAction', value)}>
              <FbQuestion label="Date" subfield><FbExactDate name="anotherApptDate" value={formState.anotherApptDate || ''} onChange={(value) => setField('anotherApptDate', value)} /></FbQuestion>
            </FbRadio>
            <FbRadio name="unableAction" value="sendAnother" label="Send another appointment" checked={formState.unableAction === 'sendAnother'} onChange={(value) => setField('unableAction', value)} />
            <FbRadio name="unableAction" value="noFurther" label="No further appointment" checked={formState.unableAction === 'noFurther'} onChange={(value) => setField('unableAction', value)} />
          </div>
        {/if}
        <FbRadio name="attendedOption" value="didNotAttend" label="Did not attend" checked={formState.attendedOption === 'didNotAttend'} onChange={(value) => setField('attendedOption', value)} />
        {#if formState.attendedOption === 'didNotAttend'}
          <div class="oo-subq fb-subquestion">
            <FbCheck name="wasNotBrought" label="Was not brought" tooltip={wasNotBroughtTooltip} checked={bool('wasNotBrought')} onChange={(checked) => setBool('wasNotBrought', checked)} />
            <FbRadio name="dnaAction" value="sendAnother" label="Send another appointment" checked={formState.dnaAction === 'sendAnother'} onChange={(value) => setField('dnaAction', value)} />
            <FbRadio name="dnaAction" value="noFurther" label="No further appointment" checked={formState.dnaAction === 'noFurther'} onChange={(value) => setField('dnaAction', value)} />
          </div>
        {/if}
      </div>
    </div>

    {#if formState.attendedOption === 'attended'}
        <FbToolTip text={uscTooltip} as="div" className="oo-group fb-question-container">
        <div class="oo-group-label">Urgent suspected cancer <span class="required">*</span></div>
        <FbRadio name="usc" value="yes" label="Yes" tooltip={uscTooltip} checked={formState.usc === 'yes'} onChange={(value) => setField('usc', value)} />
        <FbRadio name="usc" value="no" label="No" tooltip={uscTooltip} checked={formState.usc === 'no'} onChange={(value) => setField('usc', value)} />
      </FbToolTip>

      <div class="oo-group fb-question-container">
        <div class="oo-group-label">Working diagnosis</div>
        <FbSCTDiagnosis value={formState.workingDiagnosis || ''} coded={formState.workingDiagnosis_coded} onChange={(value, coded) => { setField('workingDiagnosis', value); setField('workingDiagnosis_coded', coded); }} />
      </div>

      <div class="oo-group fb-question-container">
        <div class="oo-group-label">Outcome <span class="required">*</span></div>
        <div class="oo-choices">
          <FbCheck name="discharge" label="Discharge" checked={dischargedChecked} disabled={dischargeDisabled} onChange={(checked) => setBool('discharged', checked)} />
          <FbCheck name="sos" label="See on symptom" checked={sosChecked} disabled={sosDisabled} onChange={(checked) => setBool('sos', checked)}>
            <FbRadio name="sosInterval" value="sixMonths" label="Six months" checked={formState.sosInterval === 'sixMonths' || !formState.sosInterval} onChange={(value) => setField('sosInterval', value)} />
            <FbRadio name="sosInterval" value="twelveMonths" label="Twelve months" checked={formState.sosInterval === 'twelveMonths'} onChange={(value) => setField('sosInterval', value)} />
          </FbCheck>
          <FbCheck name="pifu" label="Patient initiated follow-up" checked={pifuChecked} disabled={pifuDisabled} onChange={(checked) => setBool('pifu', checked)} />
          <FbCheck name="remoteMonitoring" label="Remote monitoring" checked={remoteMonitoringChecked} disabled={remoteMonitoringDisabled} onChange={(checked) => setBool('remoteMonitoring', checked)} />
          <FbCheck name="testsReq" label="Tests requested" checked={testsReqChecked} disabled={testsReqDisabled} onChange={(checked) => setBool('testsReq', checked)}>
            <FbRadio name="testsReason" value="beforeTreatment" label="Result required before deciding treatment" checked={formState.testsReason === 'beforeTreatment' || !formState.testsReason} onChange={(value) => setField('testsReason', value)} />
            <FbRadio name="testsReason" value="afterTreatment" label="Result required for monitoring or after treatment" checked={formState.testsReason === 'afterTreatment'} onChange={(value) => setField('testsReason', value)} />
            <FbTextArea label="Tests requested" subfield value={formState.testsRequested || ''} onChange={(value) => setField('testsRequested', value)} />
          </FbCheck>
          <FbCheck name="waitingList" label="Add to waiting list for surgery or other treatment" checked={waitListedChecked} disabled={waitListedDisabled} onChange={(checked) => setBool('waitListed', checked)}>
            <div class="oo-small-button-row">
              {#if formState.linkedWaitingListCardUuid}
                <button type="button" class="oo-small-add-button" onclick={openLinkedWaitingListCard}>Open waiting list card</button>
              {:else}
                <button type="button" class="oo-small-add-button" onclick={createWaitingListCardFromOutcome}>Create waiting list card</button>
              {/if}
            </div>
            <FbRadio name="wlOptions" value="dayCase" label="Day case" checked={formState.wlOptions === 'dayCase'} onChange={(value) => setField('wlOptions', value)} />
            <FbRadio name="wlOptions" value="inpatient" label="Inpatient" checked={formState.wlOptions === 'inpatient'} onChange={(value) => setField('wlOptions', value)} />
            <FbTextArea label="Treatment planned" required subfield value={formState.treatmentPlanned || ''} onChange={(value) => setField('treatmentPlanned', value)} />
          </FbCheck>
          <FbCheck name="oprxPlanned" label="Outpatient treatment planned" checked={oprxPlannedChecked} disabled={oprxPlannedDisabled} onChange={(checked) => setBool('oprxPlanned', checked)}>
            <FbTextArea label="Treatment planned" required subfield value={formState.oprxTreatmentPlanned || ''} onChange={(value) => setField('oprxTreatmentPlanned', value)} />
            <FbRadio name="rxPriority" value="routine" label="Routine" checked={formState.rxPriority === 'routine'} onChange={(value) => setField('rxPriority', value)} />
            <FbRadio name="rxPriority" value="urgent" label="Urgent" checked={formState.rxPriority === 'urgent'} onChange={(value) => setField('rxPriority', value)} />
            <FbRadio name="rxPriority" value="usc" label="Urgent suspected cancer" checked={formState.rxPriority === 'usc'} onChange={(value) => setField('rxPriority', value)} />
          </FbCheck>
          <FbCheck name="admitted" label="Admitted from clinic to ward or department" checked={admittedChecked} disabled={admittedDisabled} onChange={(checked) => setBool('admitted', checked)} />
          <FbCheck name="mdtReview" label="MDT review" checked={mdtReviewChecked} disabled={mdtReviewDisabled} onChange={(checked) => setBool('mdtReview', checked)} />
          <FbCheck name="rxGiven" label="Treatment given in clinic today" checked={rxGivenChecked} onChange={(checked) => setBool('rxGiven', checked)}>
            <FbTextArea label="Treatment given" required subfield value={formState.treatmentGiven || ''} onChange={(value) => setField('treatmentGiven', value)} />
          </FbCheck>
          <FbCheck name="stopRefClock" label="Stop referral to treatment clock" tooltip={stopReferralTooltip} checked={stopRefClockChecked} onChange={(checked) => setBool('stopRefClock', checked)} />
          <FbCheck name="refToTherapies" label="Referred to therapies" tooltip={referralTooltip} checked={refToTherapiesChecked} onChange={(checked) => setBool('refToTherapies', checked)}>
            <FbTextArea label="Therapy or department (for example physiotherapy)" required subfield value={formState.therapyDetails || ''} onChange={(value) => setField('therapyDetails', value)} />
          </FbCheck>
          <FbCheck name="refToConsultant" label="Referred to another consultant, speciality or hospital" tooltip={referralTooltip} checked={refToConsultantChecked} onChange={(checked) => setBool('refToConsultant', checked)}>
            <FbTextInput label="Consultant, speciality or hospital" required subfield value={formState.consultantDetails || ''} onChange={(value) => setField('consultantDetails', value)} />
          </FbCheck>
          <FbCheck name="fuOPA" label="Follow up appointment" checked={fuOPAChecked} disabled={fuOPADisabled} onChange={(checked) => setBool('fuOPA', checked)}>
            <FbCheck name="cancerPathway" label="Patient to remain on cancer pathway" checked={bool('cancerPathway')} onChange={(checked) => setBool('cancerPathway', checked)} />
            <FbTextInput label="Interval" required subfield placeholder="Specify days, weeks or months" value={formState.interval || ''} onChange={(value) => setField('interval', value)} />
            <FbCheck name="sameClinic" label="Must be seen in the same clinic" checked={bool('sameClinic')} onChange={(checked) => setBool('sameClinic', checked)} />
            <FbCheck name="sameClinician" label="Must be seen by the same senior responsible clinician" checked={bool('sameClinician')} onChange={(checked) => setBool('sameClinician', checked)} />
            <FbRadio name="consultationType" value="faceToFace" label="Face to face" checked={formState.consultationType === 'faceToFace' || !formState.consultationType} onChange={(value) => setField('consultationType', value)}>
              <FbTextInput label="Hospital (if different)" subfield value={formState.hospitalDifferent || ''} onChange={(value) => setField('hospitalDifferent', value)} />
            </FbRadio>
            <FbRadio name="consultationType" value="telephone" label="Telephone consultation" checked={formState.consultationType === 'telephone'} onChange={(value) => setField('consultationType', value)} />
            <FbRadio name="consultationType" value="videoCall" label="Video call" checked={formState.consultationType === 'videoCall'} onChange={(value) => setField('consultationType', value)} />
            <FbRadio name="consultationType" value="caseReview" label="Case review (patient not required to attend)" checked={formState.consultationType === 'caseReview'} onChange={(value) => setField('consultationType', value)} />
            <FbRadio name="fuApptPriority" value="overbook" label="A* : Overbook" checked={formState.fuApptPriority === 'overbook'} onChange={(value) => setField('fuApptPriority', value)} />
            <FbRadio name="fuApptPriority" value="doNotPostpone" label="A : Do not postpone appointment" checked={formState.fuApptPriority === 'doNotPostpone'} onChange={(value) => setField('fuApptPriority', value)} />
            <FbRadio name="fuApptPriority" value="fourWeeks" label="B : Do not postpone appointment for more than four weeks" checked={formState.fuApptPriority === 'fourWeeks'} onChange={(value) => setField('fuApptPriority', value)} />
            <FbRadio name="fuApptPriority" value="afterTests" label="D : After test results" checked={formState.fuApptPriority === 'afterTests'} onChange={(value) => setField('fuApptPriority', value)} />
            <FbRadio name="fuApptPriority" value="treatmentWL" label="T : Add to outpatient treatment waiting list" checked={formState.fuApptPriority === 'treatmentWL'} onChange={(value) => setField('fuApptPriority', value)} />
            <FbTextInput label="Tests to be done on arrival" subfield placeholder="Filling in this box does not generate a test request" value={formState.testsOnArrival || ''} onChange={(value) => setField('testsOnArrival', value)} />
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
  <FbLayout sections={[]} {formState} isReadOnlyView={isReadOnlyView} onFormActivity={() => (formState = { ...formState })}>
    <svelte:fragment slot="header"><FbHeader title="Outpatient outcome" {patient} formStatus={effectiveFormStatus} /></svelte:fragment>
    {#if isReadOnlyView}
      {@render readonlyContent()}
    {:else}
      {@render editContent()}
    {/if}
    <svelte:fragment slot="bottomControls">
      <FbBottomControlsRow>
        {#if isReadOnlyView}
          {#if !readOnlyBackOnly && (effectiveFormStatus !== 'final' || !openInRoV)}
            <FbButton type="button" onClick={() => (isReadOnlyView = false)}>EV</FbButton>
          {/if}
          {#if formUuid}
            <FbButton type="button" onClick={() => (showHistoryMenu = true)}>History</FbButton>
          {/if}
          <div style="flex: 1;"></div>
          <FbButton type="button" onClick={() => inline ? onClose() : (window.location.href = 'index.html')}>Back</FbButton>
        {:else}
          {#if !readOnlyBackOnly}
            <FbButton type="button" onClick={() => (isReadOnlyView = true)}>RoV</FbButton>
          {/if}
          <div style="flex: 1;"></div>
          <FbAuthAndSensitivity bind:username bind:password bind:highlySensitive bind:finalChecked {formChanged} finalDisabled={!requiredComplete} />
          <FbButton type="button" variant={formChanged ? 'success' : 'secondary'} disabled={!requiredComplete || isSaving || !formChanged} onClick={() => saveForm('final')}>Save and close</FbButton>
          <FbButton type="button" variant="danger" onClick={() => formChanged ? (showCancelPopup = true) : (inline ? onClose() : (window.location.href = 'index.html'))}>Cancel</FbButton>
        {/if}
      </FbBottomControlsRow>
    </svelte:fragment>
  </FbLayout>
{/if}

{#if showDraftPopup}<FbDraftPopup onSaveDraft={() => { showDraftPopup = false; saveForm('draft'); }} onCancel={() => (showDraftPopup = false)} />{/if}
{#if showPasswordPopup}<FbModalPassword on:confirm={(event) => { password = event.detail; showPasswordPopup = false; saveForm(pendingSaveStatus); }} on:cancel={() => (showPasswordPopup = false)} />{/if}
{#if showCancelPopup}<FbCancelPopup onDiscard={() => inline ? onClose() : (window.location.href = 'index.html')} onReturnToForm={() => (showCancelPopup = false)} />{/if}
{#if showSavingPopup}<FbSavingPopup />{/if}
{#if showSavedPopup}<FbSavedPopup />{/if}
{#if showSaveErrorPopup}<FbSaveErrorPopup error={saveErrorDetails} onReturnToForm={() => (showSaveErrorPopup = false)} />{/if}
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
