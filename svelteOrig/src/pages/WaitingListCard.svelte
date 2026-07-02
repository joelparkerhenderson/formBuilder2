<script lang="ts">
  import { onMount } from 'svelte';
  import FbLayout from '../components/fbLayout.svelte';
  import FbHeader from '../components/fbHeader.svelte';
  import FbSection from '../components/fbSection.svelte';
  import FbGridRow from '../components/fbGridRow.svelte';
  import FbGridCell from '../components/fbGridCell.svelte';
  import FbQuestion from '../components/fbQuestion.svelte';
  import FbDropdown from '../components/fbDropdown.svelte';
  import FbTextInput from '../components/fbTextInput.svelte';
  import FbTextArea from '../components/fbTextArea.svelte';
  import FbNumberInput from '../components/fbNumberInput.svelte';
  import FbRadio from '../components/fbRadio.svelte';
  import FbCheck from '../components/fbCheck.svelte';
  import FbGroup from '../components/fbGroup.svelte';
  import FbExactDate from '../components/fbDateExact.svelte';
  import FbPartialDate from '../components/fbDatePartial.svelte';
  import FbMSISelector from '../components/fbMSISelector.svelte';
  import FbSCTProcedure from '../components/fbSCTProcedure.svelte';
  import FbTable from '../components/fbTable.svelte';
  import FbTableHeader from '../components/fbTableHeader.svelte';
  import FbTableBody from '../components/fbTableBody.svelte';
  import FbTableRow from '../components/fbTableRow.svelte';
  import FbTableHeaderCell from '../components/fbTableHeaderCell.svelte';
  import FbTableCell from '../components/fbTableCell.svelte';
  import FbBottomControlsRow from '../components/fbBottomControlsRow.svelte';
  import FbAuthAndSensitivity from '../components/fbAuthAndSensitivity.svelte';
  import FbSaveCancelButtons from '../components/fbSaveCancelButtons.svelte';
  import FbButton from '../components/fbButton.svelte';
  import FbAddButton from '../components/fbAddButton.svelte';
  import FbDraftPopup from '../components/fbModalDraft.svelte';
  import FbModalPassword from '../components/fbModalPassword.svelte';
  import FbCancelPopup from '../components/fbModalCancel.svelte';
  import FbSavingPopup from '../components/fbModalSaving.svelte';
  import FbSavedPopup from '../components/fbModalSaved.svelte';
  import FbSaveErrorPopup from '../components/fbModalSaveError.svelte';
  import FbReadOnly from '../components/fbReadOnly.svelte';
  import FbFormHistoryMenu, { type FbFormHistoryItem } from '../components/fbFormHistoryMenu.svelte';
  import type { Patient, ProcedureRow, SectionSpec } from '../lib/types';
  import {
    hospitalLabels,
    hospitalOptions,
    organisationLabels,
    organisationOptions,
    sideLabels,
    specialities,
    specialityLabels,
    yesNoUnknownLabels,
  } from '../lib/constants';
  import { formDateToIsoDate, formatFormDate, generateUUID } from '../lib/dateFormat';
  import { getForm, getFormHistory, getFormVersion, getLatestVersion, getPatient, insertForm, insertFormsIndex } from '../lib/api';
  import { cleanArrayOfObjects, compareFormStatesObj } from '../lib/formStateUtils';

  type SaveStatus = 'final' | 'draft';

  const params = new URLSearchParams(window.location.search);
  export let patientUuid = params.get('patientUuid') || 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
  export let formUuid = params.get('formUuid') || '';
  export let formVersion = Number(params.get('formVersion') || '') || null;
  export let openInRoV = params.get('openInRoV') === 'true';
  export let readOnlyBackOnly = params.get('readOnlyBackOnly') === 'true';
  export let inline = false;
  export let onClose: () => void = () => {};
  export let fromOutpatientOutcome = params.get('fromOutpatientOutcome') === '1';
  export let openedFromOutpatientOutcomeButton = params.get('openedFromOutpatientOutcomeButton') === '1';
  export let onReturnToOutpatientOutcome: (savedWaitingListCard?: { uuid: string; formState: Record<string, any>; procedures: ProcedureRow[] }) => void = () => {};
  $: outpatientReturnReadOnly = openInRoV || openedFromOutpatientOutcomeButton;
  const outpatientWlcBridgeKey = `fb_svelte_oo_wlc_bridge_${patientUuid}`;

  let patient: Patient | null = null;
  let loadingData = true;
  let activeSection = 'section-from';
  let isReadOnlyView = false;
  let formChanged = false;
  let finalChecked = false;
  let highlySensitive = false;
  let username = 'demoUser';
  let password = '';
  let showDraftPopup = false;
  let showPasswordPopup = false;
  let pendingSaveStatus: SaveStatus = 'final';
  let showCancelPopup = false;
  let isSaving = false;
  let showSavedPopup = false;
  let saveError = '';
  let cleanSnapshot: FormSnapshot | null = null;
  let formHistory: FbFormHistoryItem[] = [];
  let showHistoryMenu = false;

  let formState: Record<string, any> = {
    organisation: 'cwm-taf',
    hospital: 'princess-wales',
    dateListed: formatFormDate(new Date()),
    urgency: '',
    operatingSurgeon: '',
    shortNotice: 'unknown',
    rcsPriority: 'unknown',
    intendedManagement: 'unknown',
    admitBefore: 0,
    imagingRequired: 'unknown',
    anaestheticType: 'unknown',
    bedRequirement: 'unknown',
    outsourcing: 'unknown',
    risks: [],
    namedClinicianName: '',
    additionalNotes: '',
  };

  function normaliseWaitingListFormState(state: Record<string, any>) {
    const oldNotesKey = 'clinical' + 'Notes';
    const next = { ...state };
    if (next.additionalNotes === undefined && next[oldNotesKey] !== undefined) {
      next.additionalNotes = next[oldNotesKey];
    }
    delete next[oldNotesKey];
    return next;
  }

  let procedures: ProcedureRow[] = [{ id: 1, side: '', procedure: '', additionalInfo: '' }];
  let anticoagChecked = {
    doac: false,
    warfarin: false,
    aspirin: false,
    clopidogrel: false,
    other: false,
  };

  const sectionsConfig: SectionSpec[] = [
    { id: 'section-from', name: 'From', requiredFields: ['organisation', 'speciality', 'hospital', 'seniorClinician'] },
    {
      id: 'section-listing',
      name: 'Listing & priority',
      requiredFields: ['dateListed', 'urgency'],
      getIncompleteCount: (state) => state.operatingSurgeon === 'named_clinician' && !state.namedClinicianName ? 1 : 0,
    },
    { id: 'section-procedure', name: 'Planned procedure(s)' },
    {
      id: 'section-risks',
      name: 'Specific operative risks',
      getIncompleteCount: (state) => {
        let count = 0;
        if ((state.risks || []).includes('other') && !state.riskOtherDetail) count += 1;
        if (anticoagChecked.doac && !state['doac-name']) count += 1;
        if (anticoagChecked.other && !state['anticoag-other-med']) count += 1;
        if (anticoagChecked.other && !state['anticoag-other-indication']) count += 1;
        return count;
      },
    },
    { id: 'section-preop', name: 'Pre-operative', requiredFields: ['intendedManagement'] },
    { id: 'section-anaesthesia', name: 'Anaesthesia' },
    { id: 'section-postop', name: 'Post-op' },
    { id: 'section-other', name: 'Other' },
  ];

  const urgencyOptions = [
    { value: 'routine', label: 'Routine' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'usc', label: 'USC (Urgent Suspected Cancer)' },
  ];
  const operatingSurgeonOptions = [
    { value: 'supervision', label: 'Any grade with supervision' },
    { value: 'discuss', label: 'Discuss with consultant' },
    { value: 'consultant', label: 'Consultant only' },
    { value: 'named_clinician', label: 'Named clinician' },
    { value: 'unknown', label: 'Unknown or not recorded' },
  ];
  const rcsPriorityOptions = [
    { value: 'p2', label: '2: Within 4 weeks' },
    { value: 'p3', label: '3: Within 3 months' },
    { value: 'p4', label: '4: Can be delayed more than 3 months' },
    { value: 'unknown', label: 'Unknown or not recorded' },
  ];
  const yesNoUnknownOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'unknown', label: 'Unknown or not recorded' },
  ];
  const thromboembolismIndicationOptions = [
    { value: 'dvt-pe-acute', label: 'DVT/PE (acute)' },
    { value: 'dvt-pe-prev', label: 'DVT/PE (prevention)' },
    { value: 'af', label: 'Atrial fibrillation' },
    { value: 'other', label: 'Other' },
  ];
  const aspirinIndicationOptions = [
    { value: 'pain', label: 'Pain' },
    { value: 'stroke', label: 'Stroke prevention' },
    { value: 'other', label: 'Other' },
  ];
  const aspirinDoseOptions = [
    { value: '75mg', label: '75mg' },
    { value: '300mg', label: '300mg' },
    { value: 'other', label: 'Other' },
  ];

  function setField(field: string, value: any, coded?: boolean, nadexId?: string) {
    formState = { ...formState, [field]: value };
    if (coded !== undefined) formState = { ...formState, [`${field}_coded`]: coded, [`${field}_text`]: value, [`${field}_NADEXId`]: nadexId || '' };
  }

  function setRisk(risk: string, checked: boolean) {
    const current = formState.risks || [];
    const next = checked ? [...current, risk] : current.filter((item: string) => item !== risk);
    setField('risks', next);
  }

  function setAnticoag(name: keyof typeof anticoagChecked, checked: boolean) {
    anticoagChecked = { ...anticoagChecked, [name]: checked };
  }

  function returnToOutpatientOutcome(savedWaitingListCard?: { uuid: string; formState: Record<string, any>; procedures: ProcedureRow[] }) {
    if (inline) {
      onReturnToOutpatientOutcome(savedWaitingListCard);
      return;
    }
    if (savedWaitingListCard) {
      try {
        const raw = sessionStorage.getItem(outpatientWlcBridgeKey);
        const bridge = raw ? JSON.parse(raw) : { patientUuid };
        sessionStorage.setItem(outpatientWlcBridgeKey, JSON.stringify({
          ...bridge,
          patientUuid,
          savedWaitingListCard,
        }));
      } catch {
        sessionStorage.setItem(outpatientWlcBridgeKey, JSON.stringify({ patientUuid, savedWaitingListCard }));
      }
    }
    window.location.href = `outpatientOutcome.html?patientUuid=${encodeURIComponent(patientUuid)}`;
  }

  function handleFormActivity(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    if (!target?.name) return;

    const targetName = target.name;
    if (target instanceof HTMLInputElement && (target.type === 'radio' || target.type === 'checkbox') && !target.checked) return;

    if (targetName.startsWith('side-')) {
      updateProcedure(Number.parseInt(targetName.replace('side-', ''), 10), { side: (target as HTMLSelectElement).value });
      return;
    }

    if (targetName.startsWith('procedure-')) {
      updateProcedure(Number.parseInt(targetName.replace('procedure-', ''), 10), { procedure: target.value, procedure_coded: false });
      return;
    }

    if (targetName.startsWith('risk-')) {
      setRisk(targetName.replace('risk-', ''), (target as HTMLInputElement).checked);
      return;
    }

    if (targetName.startsWith('anticoag-')) {
      const anticoagName = targetName.replace('anticoag-', '') as keyof typeof anticoagChecked;
      if (anticoagName in anticoagChecked) setAnticoag(anticoagName, (target as HTMLInputElement).checked);
      return;
    }

    const value = target instanceof HTMLInputElement && target.type === 'number'
      ? (Number.parseInt(target.value, 10) || 0)
      : target.value;
    setField(targetName, value);
  }

  function updateProcedure(id: number, patch: Partial<ProcedureRow>) {
    procedures = procedures.map((row) => row.id === id ? { ...row, ...patch } : row);
  }

  function addProcedure() {
    const nextId = Math.max(0, ...procedures.map((row) => row.id)) + 1;
    procedures = [...procedures, { id: nextId, side: '', procedure: '', additionalInfo: '' }];
  }

  function removeProcedure(id: number) {
    if (procedures.length <= 1) return;
    procedures = procedures.filter((row) => row.id !== id);
  }

  function sectionIncomplete(section: SectionSpec) {
    let count = 0;
    if (section.requiredFields) count += section.requiredFields.filter((field) => !formState[field] || formState[field] === '').length;
    if (section.getIncompleteCount) count += section.getIncompleteCount(formState);
    return count;
  }

  type FormSnapshot = {
    formState: Record<string, any>;
    procedures: ProcedureRow[];
    anticoagChecked: typeof anticoagChecked;
    finalChecked: boolean;
    highlySensitive: boolean;
  };

  function createFormSnapshot(
    nextFormState: Record<string, any>,
    nextProcedures: ProcedureRow[],
    nextAnticoagChecked: typeof anticoagChecked,
    nextFinalChecked: boolean,
    nextHighlySensitive: boolean,
  ): FormSnapshot {
    return {
      formState: { ...nextFormState },
      procedures: nextProcedures.map((procedure) => ({ ...procedure })),
      anticoagChecked: { ...nextAnticoagChecked },
      finalChecked: nextFinalChecked,
      highlySensitive: nextHighlySensitive,
    };
  }

  function isStateEqual(stateA: FormSnapshot | null, stateB: FormSnapshot | null): boolean {
    if (!stateA || !stateB) return false;

    const formStatesMatch = compareFormStatesObj(stateA.formState, stateB.formState);
    const proceduresMatch = JSON.stringify(cleanArrayOfObjects(stateA.procedures, ['side', 'procedure', 'additionalInfo'])) ===
      JSON.stringify(cleanArrayOfObjects(stateB.procedures, ['side', 'procedure', 'additionalInfo']));
    const anticoagMatch = JSON.stringify(cleanArrayOfObjects([stateA.anticoagChecked], ['doac', 'warfarin', 'aspirin', 'clopidogrel', 'other'])) ===
      JSON.stringify(cleanArrayOfObjects([stateB.anticoagChecked], ['doac', 'warfarin', 'aspirin', 'clopidogrel', 'other']));

    return formStatesMatch &&
      proceduresMatch &&
      anticoagMatch &&
      Boolean(stateA.highlySensitive) === Boolean(stateB.highlySensitive) &&
      Boolean(stateA.finalChecked) === Boolean(stateB.finalChecked);
  }

  $: requiredFieldsIncomplete = sectionsConfig.some((section) => sectionIncomplete(section) > 0);
  $: liveSnapshot = createFormSnapshot(formState, procedures, anticoagChecked, finalChecked, highlySensitive);
  $: formChanged = !loadingData && cleanSnapshot !== null && !isStateEqual(cleanSnapshot, liveSnapshot);
  $: effectiveFormStatus = finalChecked ? 'final' : 'draft';
  $: saveDisabled = !formChanged;

  async function saveWaitingListCard(formStatus: SaveStatus) {
    try {
      isSaving = true;
      saveError = '';
      const formUuid = formState.uuid || generateUUID();
      const latest = formState.uuid ? await getLatestVersion('waiting_list_cards', formUuid) : { version: null };
      const version = latest.version === null ? 0 : latest.version + 1;
      const eventDate = formDateToIsoDate(formState.dateListed) || new Date().toISOString();
      const formData = {
        ...normaliseWaitingListFormState(formState),
        uuid: formUuid,
        procedures,
        anticoagChecked,
        password,
        username,
        finalChecked: formStatus === 'final',
        highlySensitive,
      };

      await insertForm('waiting_list_card', {
        uuid: formUuid,
        version,
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: eventDate,
        form_status: formStatus,
        form_data: formData,
      });

      await insertFormsIndex({
        form_uuid: formUuid,
        form_version: version,
        form_type: 'waiting_list_card',
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: eventDate,
        document_datetime: new Date().toISOString(),
        form_status: formStatus,
        event_or_document: 'Document',
        details: username,
      });

      formState = normaliseWaitingListFormState({ ...formData });
      cleanSnapshot = createFormSnapshot(formState, procedures, anticoagChecked, finalChecked, highlySensitive);
      showSavedPopup = true;
      window.setTimeout(() => {
        showSavedPopup = false;
        if (fromOutpatientOutcome) {
          returnToOutpatientOutcome({ uuid: formUuid, formState: formData, procedures });
        } else if (inline) {
          onClose();
        } else {
          window.location.href = 'index.html';
        }
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
    if (formChanged && !password.trim()) {
      pendingSaveStatus = 'final';
      showPasswordPopup = true;
      return;
    }
    saveWaitingListCard('final');
  }

  function cancel() {
    if (formChanged) {
      showCancelPopup = true;
    } else {
      if (fromOutpatientOutcome) {
        returnToOutpatientOutcome();
      } else if (inline) {
        onClose();
      } else {
        window.location.href = 'index.html';
      }
    }
  }

  onMount(async () => {
    try {
      patient = await getPatient(patientUuid);
      if (formUuid) {
        const saved = formVersion ? await getFormVersion('waiting_list_card', formUuid, formVersion) : await getForm('waiting_list_card', formUuid);
        const savedData = saved?.form_data || {};
        formState = normaliseWaitingListFormState({ ...savedData, uuid: formUuid });
        procedures = Array.isArray(savedData.procedures) && savedData.procedures.length
          ? savedData.procedures.map((procedure: any, index: number) => ({ id: procedure.id || index + 1, ...procedure }))
          : procedures;
        anticoagChecked = savedData.anticoagChecked || anticoagChecked;
        highlySensitive = Boolean(savedData.highlySensitive);
        finalChecked = saved.form_status === 'final';
        isReadOnlyView = outpatientReturnReadOnly;
        formHistory = await getFormHistory(formUuid);
      } else if (fromOutpatientOutcome) {
        const raw = sessionStorage.getItem(`${outpatientWlcBridgeKey}_initial_wlc`);
        if (raw) {
          sessionStorage.removeItem(`${outpatientWlcBridgeKey}_initial_wlc`);
          const initial = JSON.parse(raw);
          formState = normaliseWaitingListFormState({ ...formState, ...(initial.formState || {}) });
          procedures = Array.isArray(initial.procedures) && initial.procedures.length ? initial.procedures : procedures;
        }
      }
    } finally {
      loadingData = false;
      cleanSnapshot = createFormSnapshot(formState, procedures, anticoagChecked, finalChecked, highlySensitive);
    }
  });

  async function viewHistoryVersion(version: number) {
    if (!formUuid) return;
    const saved = await getFormVersion('waiting_list_card', formUuid, version);
    const savedData = saved?.form_data || {};
    formState = normaliseWaitingListFormState({ ...savedData, uuid: formUuid });
    procedures = Array.isArray(savedData.procedures) && savedData.procedures.length
      ? savedData.procedures.map((procedure: any, index: number) => ({ id: procedure.id || index + 1, ...procedure }))
      : [{ id: 1, side: '', procedure: '', additionalInfo: '' }];
    anticoagChecked = savedData.anticoagChecked || { warfarin: false, doac: false, antiplatelet: false, heparin: false };
    highlySensitive = Boolean(savedData.highlySensitive);
    finalChecked = saved.form_status === 'final';
    isReadOnlyView = true;
    showHistoryMenu = false;
    cleanSnapshot = createFormSnapshot(formState, procedures, anticoagChecked, finalChecked, highlySensitive);
  }
</script>

{#if loadingData}
  <p style="padding: 0.8rem;">Loading...</p>
{:else if isReadOnlyView}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection isReadOnlyView={true}>
    <svelte:fragment slot="header"><FbHeader title="Waiting list card" {patient} formStatus={effectiveFormStatus} /></svelte:fragment>
    <div style="padding: 0.4rem;">
      <FbSection id="section-from" title="From">
        <FbGridRow cols={4}>
          <FbReadOnly label="Organisation" value={formState.organisation} lookupTable={organisationLabels} />
          <FbReadOnly label="Speciality" value={formState.speciality} lookupTable={specialityLabels} />
          <FbReadOnly label="Hospital" value={formState.hospital} lookupTable={hospitalLabels} />
          <FbReadOnly label="Senior responsible clinician" value={formState.seniorClinician} coded={formState.seniorClinician_coded} />
        </FbGridRow>
      </FbSection>
      <FbSection id="section-listing" title="Listing and priority">
        <FbGridRow cols={4}>
          <FbReadOnly label="Date listed" value={formState.dateListed} />
          <FbReadOnly label="Listed by" value={formState.listedBy} coded={formState.listedBy_coded} />
          <FbReadOnly label="Urgency" value={formState.urgency} lookupTable={Object.fromEntries(urgencyOptions.map((item) => [item.value, item.label]))} />
          <FbReadOnly label="Operating surgeon" value={formState.operatingSurgeon} lookupTable={Object.fromEntries(operatingSurgeonOptions.map((item) => [item.value, item.label]))} />
        </FbGridRow>
      </FbSection>
      <FbSection id="section-procedure" title="Planned procedure(s)">
        <FbTable>
          <FbTableHeader><FbTableRow><FbTableHeaderCell width="25%">Side</FbTableHeaderCell><FbTableHeaderCell>Procedure</FbTableHeaderCell></FbTableRow></FbTableHeader>
          <FbTableBody>
            {#each procedures.filter((row) => row.procedure) as procedure}
              <FbTableRow>
                <FbTableCell>{sideLabels[procedure.side] || procedure.side}</FbTableCell>
                <FbTableCell>{procedure.procedure}</FbTableCell>
              </FbTableRow>
            {/each}
          </FbTableBody>
        </FbTable>
      </FbSection>
      <FbSection id="section-other" title="Other">
        <FbReadOnly label="Any other information" value={formState.otherInfo} />
      </FbSection>
    </div>
    <svelte:fragment slot="bottomControls">
      <FbBottomControlsRow>
        {#if openedFromOutpatientOutcomeButton}
          <div style="flex: 1;"></div>
          <FbButton type="button" onClick={() => (isReadOnlyView = false)}>Edit</FbButton>
          <FbButton type="button" onClick={returnToOutpatientOutcome}>Close</FbButton>
        {:else}
          {#if !readOnlyBackOnly && (effectiveFormStatus !== 'final' || !openInRoV)}
            <FbButton type="button" onClick={() => (isReadOnlyView = false)}>EV</FbButton>
          {/if}
          {#if formUuid}
            <FbButton type="button" onClick={() => (showHistoryMenu = true)}>History</FbButton>
          {/if}
          <div style="flex: 1;"></div>
          <FbButton type="button" onClick={() => fromOutpatientOutcome ? returnToOutpatientOutcome() : (inline ? onClose() : (window.location.href = 'index.html'))}>Back</FbButton>
        {/if}
      </FbBottomControlsRow>
    </svelte:fragment>
  </FbLayout>
{:else}
  <FbLayout sections={sectionsConfig} formState={formState} bind:activeSection onFormActivity={handleFormActivity}>
    <svelte:fragment slot="header"><FbHeader title="Waiting list card" {patient} /></svelte:fragment>

    <FbSection id="section-from" title="From">
      <FbGridRow cols={4}>
        <FbDropdown id="organisation" name="organisation" label="Organisation" required value={formState.organisation} options={organisationOptions} change={(value) => setField('organisation', value)} />
        <FbDropdown id="speciality" name="speciality" label="Speciality" required value={formState.speciality || ''} options={specialities} change={(value) => setField('speciality', value)} />
        <FbDropdown id="hospital" name="hospital" label="Hospital" required value={formState.hospital} options={hospitalOptions} change={(value) => setField('hospital', value)} />
        <FbMSISelector id="seniorClinician" name="seniorClinician" label="Senior responsible clinician" required value={formState.seniorClinician || ''} coded={formState.seniorClinician_coded} change={(value, coded, nadexId) => setField('seniorClinician', value, coded, nadexId)} />
      </FbGridRow>
    </FbSection>

    <FbSection id="section-listing" title="Listing and priority">
      <FbGridRow cols={4}>
        <FbQuestion label="Date listed" required><FbExactDate name="dateListed" value={formState.dateListed || ''} showRequiredMarkers={false} change={(value) => setField('dateListed', value)} /></FbQuestion>
        <FbGridCell span={2}><FbMSISelector id="listedBy" name="listedBy" label="Listed by" value={formState.listedBy || ''} coded={formState.listedBy_coded} change={(value, coded, nadexId) => setField('listedBy', value, coded, nadexId)} /></FbGridCell>
        <div></div>
        <FbQuestion label="Urgency" required>
          {#each urgencyOptions as option}
            <FbRadio name="urgency" value={option.value} checked={formState.urgency === option.value} label={option.label} change={(value) => setField('urgency', value)} />
          {/each}
        </FbQuestion>
        <FbQuestion label="Operating surgeon">
          {#each operatingSurgeonOptions as option}
            <FbRadio name="operatingSurgeon" value={option.value} checked={formState.operatingSurgeon === option.value} label={option.label} change={(value) => setField('operatingSurgeon', value)} />
          {/each}
          {#if formState.operatingSurgeon === 'named_clinician'}
            <div class="fb-subquestion"><FbTextInput id="namedClinicianName" name="namedClinicianName" label="Clinician name" required subfield value={formState.namedClinicianName || ''} change={(value) => setField('namedClinicianName', value)} /></div>
          {/if}
        </FbQuestion>
        <FbQuestion label="Patient available at short notice">
          {#each yesNoUnknownOptions as option}
            <FbRadio name="shortNotice" value={option.value} checked={formState.shortNotice === option.value} label={option.label} change={(value) => setField('shortNotice', value)} />
          {/each}
        </FbQuestion>
        <FbQuestion label="Royal College of Surgeons priority">
          {#each rcsPriorityOptions as option}
            <FbRadio name="rcsPriority" value={option.value} checked={formState.rcsPriority === option.value} label={option.label} change={(value) => setField('rcsPriority', value)} />
          {/each}
        </FbQuestion>
      </FbGridRow>
    </FbSection>

    <FbSection id="section-procedure" title="Planned procedure(s)">
      <FbTable>
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell width="5%"></FbTableHeaderCell>
            <FbTableHeaderCell width="20%">Side</FbTableHeaderCell>
            <FbTableHeaderCell width="65%">Procedure</FbTableHeaderCell>
            <FbTableHeaderCell width="5%"></FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {#if procedures.length === 0 || procedures.every((procedure) => !procedure.procedure || String(procedure.procedure).trim() === '')}
            <FbTableRow>
              <td colspan="4" class="fb-validation-row">Enter at least one procedure</td>
            </FbTableRow>
          {/if}
          {#each procedures as procedure (procedure.id)}
            <FbTableRow>
              <FbTableCell>
                <span class="material-icons fb-row-drag" title="Drag up or down to order list">swap_vertical_circle</span>
              </FbTableCell>
              <FbTableCell><FbDropdown name={`side-${procedure.id}`} value={procedure.side} placeholder="Select side" options={Object.entries(sideLabels).map(([value, label]) => ({ value, label }))} change={(value) => updateProcedure(procedure.id, { side: value })} /></FbTableCell>
              <FbTableCell><FbSCTProcedure id={`procedure-${procedure.id}`} name={`procedure-${procedure.id}`} value={procedure.procedure} coded={procedure.procedure_coded} change={(value, coded) => updateProcedure(procedure.id, { procedure: value, procedure_coded: coded })} /></FbTableCell>
              <FbTableCell>
                {#if procedures.length > 1}
                  <button type="button" class="fb-row-remove" onclick={() => removeProcedure(procedure.id)} aria-label="Delete row" title="Delete row">
                    <span class="material-icons">highlight_off</span>
                  </button>
                {/if}
              </FbTableCell>
            </FbTableRow>
          {/each}
        </FbTableBody>
      </FbTable>
      <div class="fb-add-row"><FbAddButton label="Add procedure" onclick={addProcedure} /></div>
    </FbSection>

    <FbSection id="section-risks" title="Specific operative risks">
      <FbGridRow cols={3}>
        <FbQuestion label="Risks">
          {#each [
            ['diabetic', 'Diabetic'],
            ['latex', 'Latex allergy'],
            ['mrsa', 'MRSA'],
            ['pacemaker', 'Pacemaker/implant'],
            ['blood', 'Blood transfusion refusal'],
            ['reactions', 'Previous anaesthetic reactions'],
            ['other', 'Other'],
          ] as risk}
            <FbCheck name={`risk-${risk[0]}`} checked={(formState.risks || []).includes(risk[0])} label={risk[1]} change={(checked) => setRisk(risk[0], checked)}>
              {#if risk[0] === 'reactions'}<FbTextArea id="riskReactionsDetail" name="riskReactionsDetail" label="Details" subfield value={formState.riskReactionsDetail || ''} change={(value) => setField('riskReactionsDetail', value)} />{/if}
              {#if risk[0] === 'other'}<FbTextArea id="riskOtherDetail" name="riskOtherDetail" placeholder="Other risks" required subfield value={formState.riskOtherDetail || ''} change={(value) => setField('riskOtherDetail', value)} />{/if}
            </FbCheck>
          {/each}
        </FbQuestion>
        <FbQuestion label="Anticoagulants & antiplatelets">
          <FbCheck name="anticoag-doac" checked={anticoagChecked.doac} label="DOAC" change={(checked) => setAnticoag('doac', checked)}>
            <FbTextInput id="doac-name" name="doac-name" label="Drug name" required subfield value={formState['doac-name'] || ''} change={(value) => setField('doac-name', value)} />
            <FbGroup label="Indication" className="fb-subquestion" subfield>
              {#each thromboembolismIndicationOptions as option}
                <FbRadio name="doac-indication" value={option.value} checked={formState['doac-indication'] === option.value} label={option.label} change={(value) => setField('doac-indication', value)} />
              {/each}
            </FbGroup>
            {#if formState['doac-indication'] === 'other'}
              <div class="fb-subquestion"><FbTextInput id="doac-indication-other" name="doac-indication-other" placeholder="Specify" value={formState['doac-indication-other'] || ''} change={(value) => setField('doac-indication-other', value)} /></div>
            {/if}
          </FbCheck>
          <FbCheck name="anticoag-warfarin" checked={anticoagChecked.warfarin} label="Warfarin" change={(checked) => setAnticoag('warfarin', checked)}>
            <FbGroup label="Indication" className="fb-subquestion" subfield>
              {#each thromboembolismIndicationOptions as option}
                <FbRadio name="warfarin-indication" value={option.value} checked={formState['warfarin-indication'] === option.value} label={option.label} change={(value) => setField('warfarin-indication', value)} />
              {/each}
            </FbGroup>
            {#if formState['warfarin-indication'] === 'other'}
              <div class="fb-subquestion"><FbTextInput id="warfarin-indication-other" name="warfarin-indication-other" placeholder="Specify" value={formState['warfarin-indication-other'] || ''} change={(value) => setField('warfarin-indication-other', value)} /></div>
            {/if}
          </FbCheck>
          <FbCheck name="anticoag-aspirin" checked={anticoagChecked.aspirin} label="Aspirin" change={(checked) => setAnticoag('aspirin', checked)}>
            <FbGroup label="Indication" className="fb-subquestion" subfield>
              {#each aspirinIndicationOptions as option}
                <FbRadio name="aspirin-indication" value={option.value} checked={formState['aspirin-indication'] === option.value} label={option.label} change={(value) => setField('aspirin-indication', value)} />
              {/each}
            </FbGroup>
            {#if formState['aspirin-indication'] === 'other'}
              <div class="fb-subquestion"><FbTextInput id="aspirin-indication-other" name="aspirin-indication-other" placeholder="Specify" value={formState['aspirin-indication-other'] || ''} change={(value) => setField('aspirin-indication-other', value)} /></div>
            {/if}
            <FbGroup label="Dose" className="fb-subquestion" subfield>
              {#each aspirinDoseOptions as option}
                <FbRadio name="aspirin-dose" value={option.value} checked={formState['aspirin-dose'] === option.value} label={option.label} change={(value) => setField('aspirin-dose', value)} />
              {/each}
            </FbGroup>
            {#if formState['aspirin-dose'] === 'other'}
              <div class="fb-subquestion"><FbTextInput id="aspirin-dose-other" name="aspirin-dose-other" placeholder="Specify" value={formState['aspirin-dose-other'] || ''} change={(value) => setField('aspirin-dose-other', value)} /></div>
            {/if}
          </FbCheck>
          <FbCheck name="anticoag-clopidogrel" checked={anticoagChecked.clopidogrel} label="Clopidogrel" change={(checked) => setAnticoag('clopidogrel', checked)} />
          <FbCheck name="anticoag-other" checked={anticoagChecked.other} label="Other anticoagulant or antiplatelet" change={(checked) => setAnticoag('other', checked)}>
            <FbTextInput id="anticoag-other-med" name="anticoag-other-med" label="Medication and dose" required subfield value={formState['anticoag-other-med'] || ''} change={(value) => setField('anticoag-other-med', value)} />
            <FbTextInput id="anticoag-other-indication" name="anticoag-other-indication" label="Indication" required subfield value={formState['anticoag-other-indication'] || ''} change={(value) => setField('anticoag-other-indication', value)} />
          </FbCheck>
        </FbQuestion>
        <FbQuestion label="Surgeon's specific anticoagulant instructions">
          <FbTextArea id="anticoagInstructions" name="anticoagInstructions" value={formState.anticoagInstructions || ''} change={(value) => setField('anticoagInstructions', value)} />
        </FbQuestion>
      </FbGridRow>
    </FbSection>

    <FbSection id="section-preop" title="Pre-operative">
      <FbGridRow cols={4}>
        <FbQuestion label="Intended management" required>
          {#each [
            ['outpatient', 'Outpatient'],
            ['daycase', 'Daycase'],
            ['inpatient', 'Inpatient'],
            ['unknown', 'Unknown or not recorded'],
          ] as option}
            <FbRadio name="intendedManagement" value={option[0]} checked={formState.intendedManagement === option[0]} label={option[1]} change={(value) => setField('intendedManagement', value)} />
          {/each}
        </FbQuestion>
        <FbNumberInput id="admitBefore" name="admitBefore" label="Admit before surgery" value={formState.admitBefore ?? 0} units="days" min={0} change={(value) => setField('admitBefore', parseInt(value) || 0)} />
        <FbQuestion label="Estimated date of admission"><FbPartialDate name="estimatedAdmission" value={formState.estimatedAdmission || ''} change={(value) => setField('estimatedAdmission', value)} /></FbQuestion>
        <FbQuestion label="Pre-operative imaging required">
          {#each yesNoUnknownOptions as option}
            <FbRadio name="imagingRequired" value={option.value} checked={formState.imagingRequired === option.value} label={option.label} change={(value) => setField('imagingRequired', value)}>
              {#if option.value === 'yes'}<FbTextArea id="imagingDetails" name="imagingDetails" label="Details" subfield value={formState.imagingDetails || ''} change={(value) => setField('imagingDetails', value)} />{/if}
            </FbRadio>
          {/each}
        </FbQuestion>
      </FbGridRow>
    </FbSection>

    <FbSection id="section-anaesthesia" title="Anaesthesia">
      <FbGridRow cols={3}>
        <FbQuestion label="Planned anaesthetic type">
          {#each [
            ['general', 'General'],
            ['regional', 'Regional'],
            ['local', 'Local'],
            ['none', 'None'],
            ['unknown', 'Unknown or not recorded'],
          ] as option}
            <FbRadio name="anaestheticType" value={option[0]} checked={formState.anaestheticType === option[0]} label={option[1]} change={(value) => setField('anaestheticType', value)} />
          {/each}
        </FbQuestion>
        <FbGridCell span={2}><FbQuestion label="Anaesthesia special requirements or issues"><FbTextArea id="anaesthesiaRequirements" name="anaesthesiaRequirements" value={formState.anaesthesiaRequirements || ''} change={(value) => setField('anaesthesiaRequirements', value)} /></FbQuestion></FbGridCell>
      </FbGridRow>
    </FbSection>

    <FbSection id="section-postop" title="Post-op">
      <FbGridRow cols={3}>
        <FbNumberInput id="postopStay" name="postopStay" label="Planned length of post-op stay" value={formState.postopStay ?? ''} units="days" min={0} change={(value) => setField('postopStay', parseInt(value) || 0)} />
        <FbQuestion label="Bed requirement">
          {#each [
            ['itu', 'ITU: Intensive care bed'],
            ['hdu', 'HDU: High dependency bed'],
            ['pacu', 'PACU: Post-anaesthetic care unit bed'],
            ['ward', 'Ward bed'],
            ['unknown', 'Unknown or not recorded'],
          ] as option}
            <FbRadio name="bedRequirement" value={option[0]} checked={formState.bedRequirement === option[0]} label={option[1]} change={(value) => setField('bedRequirement', value)} />
          {/each}
        </FbQuestion>
        <FbQuestion label="Special post-op requirements"><FbTextArea id="postopRequirements" name="postopRequirements" value={formState.postopRequirements || ''} change={(value) => setField('postopRequirements', value)} /></FbQuestion>
      </FbGridRow>
    </FbSection>

    <FbSection id="section-other" title="Other">
      <FbGridRow cols={3}>
        <FbQuestion label="Could this case be outsourced?">
          {#each yesNoUnknownOptions as option}
            <FbRadio name="outsourcing" value={option.value} checked={formState.outsourcing === option.value} label={option.label} change={(value) => setField('outsourcing', value)} />
          {/each}
        </FbQuestion>
        <FbGridCell span={2}><FbQuestion label="Any other information"><FbTextArea id="otherInfo" name="otherInfo" value={formState.otherInfo || ''} change={(value) => setField('otherInfo', value)} /></FbQuestion></FbGridCell>
      </FbGridRow>
    </FbSection>

    <svelte:fragment slot="bottomControls">
      <FbBottomControlsRow>
        {#if !readOnlyBackOnly}
          <FbButton type="button" onClick={() => (isReadOnlyView = true)}>RoV</FbButton>
        {/if}
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
  <FbDraftPopup onSaveDraft={() => {
    showDraftPopup = false;
    if (formChanged && !password.trim()) {
      pendingSaveStatus = 'draft';
      showPasswordPopup = true;
    } else {
      saveWaitingListCard('draft');
    }
  }} onCancel={() => (showDraftPopup = false)} />
{/if}

{#if showPasswordPopup}
  <FbModalPassword on:confirm={(event) => { password = event.detail; showPasswordPopup = false; saveWaitingListCard(pendingSaveStatus); }} on:cancel={() => (showPasswordPopup = false)} />
{/if}

{#if showCancelPopup}
  <FbCancelPopup onDiscard={() => fromOutpatientOutcome ? returnToOutpatientOutcome() : (inline ? onClose() : (window.location.href = 'index.html'))} onReturnToForm={() => (showCancelPopup = false)} />
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

{#if showHistoryMenu}
  <FbFormHistoryMenu history={formHistory} onViewVersion={viewHistoryVersion} onClose={() => (showHistoryMenu = false)} />
{/if}

<style>
  .fb-add-row {
    margin-top: 0.4rem;
  }

  .fb-validation-row {
    border-bottom: 0.1rem solid silver;
    padding: 0.4rem;
    color: #d50000;
    font-size: 0.8rem;
    font-style: italic;
    font-weight: 500;
  }

  .fb-row-drag {
    border: none;
    color: #1b6ec2;
    cursor: grab;
    font-size: 1.2rem;
    vertical-align: middle;
  }

  .fb-row-remove {
    border: none;
    background: none;
    color: #d50000;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none;
    padding: 0;
  }

  .fb-row-remove .material-icons {
    font-size: 1.2rem;
  }
</style>
