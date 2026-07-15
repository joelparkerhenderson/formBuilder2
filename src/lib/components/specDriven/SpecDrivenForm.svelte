<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { createApiClient } from '$lib/api/client';
  import { getForm, getFormHistory, getFormVersion } from '$lib/api/legacy';
  import FbBloodPressure from '$lib/components/fb/fbBloodPressure.svelte';
  import FbBottomControlsRow from '$lib/components/fb/fbBottomControlsRow.svelte';
  import FbBoxedMessage from '$lib/components/fb/fbBoxedMessage.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbCheck from '$lib/components/fb/fbCheck.svelte';
  import FbDateExact from '$lib/components/fb/fbDateExact.svelte';
  import FbDateHeightWeightBMIRow from '$lib/components/fb/fbDateHeightWeightBMIRow.svelte';
  import FbDatePartial from '$lib/components/fb/fbDatePartial.svelte';
  import FbDropdown from '$lib/components/fb/fbDropdown.svelte';
  import FbFormHistoryMenu, { type FbFormHistoryItem } from '$lib/components/fb/fbFormHistoryMenu.svelte';
  import FbModalStaleSave from '$lib/components/fb/fbModalStaleSave.svelte';
  import FbGridCell from '$lib/components/fb/fbGridCell.svelte';
  import FbGridRow from '$lib/components/fb/fbGridRow.svelte';
  import FbGroup from '$lib/components/fb/fbGroup.svelte';
  import FbHBSelector from '$lib/components/fb/fbHBSelector.svelte';
  import FbHeader from '$lib/components/fb/fbHeader.svelte';
  import FbLayout from '$lib/components/fb/fbLayout.svelte';
  import FbMSISelector from '$lib/components/fb/fbMSISelector.svelte';
  import FbNotificationTypeGroup from '$lib/components/fb/fbNotificationTypeGroup.svelte';
  import FbNumberInput from '$lib/components/fb/fbNumberInput.svelte';
  import FbNumberInputWithUnits from '$lib/components/fb/fbNumberInputWithUnits.svelte';
  import FbQuestion from '$lib/components/fb/fbQuestion.svelte';
  import FbRadio from '$lib/components/fb/fbRadio.svelte';
  import FbReadOnly from '$lib/components/fb/fbReadOnly.svelte';
  import FbSCTDiagnosis from '$lib/components/fb/fbSCTDiagnosis.svelte';
  import FbSCTProcedure from '$lib/components/fb/fbSCTProcedure.svelte';
  import FbSection from '$lib/components/fb/fbSection.svelte';
  import FbSmartDropdown from '$lib/components/fb/fbSmartDropdown.svelte';
  import FbTable from '$lib/components/fb/fbTable.svelte';
  import FbTableBody from '$lib/components/fb/fbTableBody.svelte';
  import FbTableCell from '$lib/components/fb/fbTableCell.svelte';
  import FbTableHeader from '$lib/components/fb/fbTableHeader.svelte';
  import FbTableHeaderCell from '$lib/components/fb/fbTableHeaderCell.svelte';
  import FbTableRow from '$lib/components/fb/fbTableRow.svelte';
  import FbTextArea from '$lib/components/fb/fbTextArea.svelte';
  import FbTextInput from '$lib/components/fb/fbTextInput.svelte';
  import FbTime from '$lib/components/fb/fbTime.svelte';
  import SpecDrivenTableField from './SpecDrivenTableField.svelte';
  import type { SimpleField, SimpleRow, SpecDrivenFormSpec } from '$lib/data/specDrivenFormTypes';
  import type { Patient, SectionSpec } from '$lib/types';
  import { formDateToIsoDate, formatFormDate, generateUUID } from '$lib/utils/dateFormat';
  import { returnByHref } from '$lib/utils/fbHrefNavigation';
  import { compareFormStatesObj } from '$lib/utils/formStateUtils';
  import { assertFormVersionIsLatest, isStaleFormVersionError } from '$lib/utils/formVersion';

  type SaveStatus = 'final' | 'draft';
  let {
    spec,
    patient,
    patientUuid,
    formUuid: initialFormUuid = '',
    savedForm = null,
    openInRoV = false,
    readOnlyBackOnly = false,
    inline = false,
    onClose = () => {}
  }: {
    spec: SpecDrivenFormSpec;
    patient: Patient | null;
    patientUuid: string;
    formUuid?: string;
    savedForm?: Record<string, any> | null;
    openInRoV?: boolean;
    readOnlyBackOnly?: boolean;
    inline?: boolean;
    onClose?: () => void;
  } = $props();

  const api = createApiClient();
  const sectionsConfig: SectionSpec[] = spec.sections.map((section) => ({
    id: section.id,
    name: section.name,
    requiredFields: section.requiredFields || []
  }));

  let activeSection = $state(spec.sections[0]?.id || '');
  let formUuid = $state(initialFormUuid || savedForm?.uuid || savedForm?.form_data?.uuid || generateUUID());
  let formState = $state<Record<string, any>>({ ...initialState(), ...(savedForm?.form_data || {}), uuid: formUuid });
  let cleanSnapshot = $state<Record<string, any>>({ ...formState });
  let finalChecked = $state(savedForm?.form_status === 'final');
  let highlySensitive = $state(Boolean(savedForm?.highly_sensitive ?? savedForm?.form_data?.highlySensitive));
  let username = $state(savedForm?.form_data?.savedBy || savedForm?.form_data?.username || 'demoUser');
  let password = $state('');
  let isReadOnlyView = $state(openInRoV);
  let isSaving = $state(false);
  let saveError = $state('');
  let currentVersion = $state(Number(savedForm?.version) || 0);
  let draggedTableRow = $state<{ key: string; id: number } | null>(null);
  let formHistory = $state<FbFormHistoryItem[]>([]);
  let showHistoryMenu = $state(false);
  let showStaleSavePopup = $state(false);
  let latestVersion = $state(0);

  const effectiveFormStatus = $derived(finalChecked ? 'final' : 'draft');
  const superseded = $derived(currentVersion > 0 && latestVersion > currentVersion);
  const formChanged = $derived(!compareFormStatesObj(cleanSnapshot, formState));
  const requiredFieldsComplete = $derived(areAllSectionsComplete(sectionsConfig, formState));

  function today() {
    return formatFormDate(new Date());
  }

  function initialState() {
    const state: Record<string, any> = {
      organisation: 'cwm-taf',
      hospital: 'princess-wales',
      speciality: ''
    };
    for (const section of spec.sections) {
      for (const row of section.rows) {
        for (const cell of row.cells) {
          for (const field of cell.fields || []) {
            if (!field.key || state[field.key] !== undefined) continue;
            if (field.type === 'checkGroup') state[field.key] = [];
            else if (field.type === 'procedureTable') state[field.key] = [{ id: 1, side: '', procedure: '', additionalInfo: '' }];
            else if (field.type === 'diagnosisTable') state[field.key] = [
              { id: 1, diagnosis: '', diagnosis_coded: false },
              { id: 2, diagnosis: '', diagnosis_coded: false },
              { id: 3, diagnosis: '', diagnosis_coded: false }
            ];
            else if (field.type === 'specimenTable') state[field.key] = [
              { id: 1, label: '', description: '' },
              { id: 2, label: '', description: '' },
              { id: 3, label: '', description: '' }
            ];
            else if (field.type === 'implantTable') state[field.key] = [{ id: 1, implantId: '', description: '', requiresRemoval: '', removeBy: '' }];
            else if (field.type === 'surgeonGroup') state[field.key] = [{ id: 1, name: '', coded: false }];
            else if (field.type === 'anaesthetistGroup') state[field.key] = [{ id: 1, name: '', coded: false }];
            else if (field.type === 'bloodPressure') {
              state[`${field.key}_systolic`] = '';
              state[`${field.key}_diastolic`] = '';
            } else if (field.type === 'dateHeightWeightBMIRow') {
              state[`${field.key}_dateRecorded`] = '';
              state[`${field.key}_heightCm`] = '';
              state[`${field.key}_weightKg`] = '';
            } else if (field.type === 'date' && (field.key === 'date' || field.key.toLowerCase().includes('date'))) state[field.key] = today();
            else state[field.key] = '';
          }
        }
      }
    }
    return state;
  }

  function areAllSectionsComplete(sectionSpecs: SectionSpec[], state: Record<string, any>) {
    return sectionSpecs.every((section) => (section.requiredFields || []).every((field) => {
      const value = state[field];
      if (field === 'procedures' && Array.isArray(value)) return value.some((row) => String(row?.procedure || '').trim() !== '');
      if (field === 'urgency') return value === 'emergency' || (value === 'elective' && Boolean(state.electiveUrgency));
      return value !== undefined && value !== null && value !== '';
    }));
  }

  function setValue(key: string, value: any) {
    formState = { ...formState, [key]: value };
  }

  function setCodedValue(key: string, value: string, coded: boolean, nadexId?: string) {
    formState = { ...formState, [key]: value, [`${key}_coded`]: coded, [`${key}_text`]: value, [`${key}_NADEXId`]: nadexId || '' };
  }

  function setCheckValue(key: string, optionValue: string, checked: boolean) {
    const values = Array.isArray(formState[key]) ? formState[key] : [];
    const next = checked ? Array.from(new Set([...values, optionValue])) : values.filter((value: string) => value !== optionValue);
    setValue(key, next);
  }

  function tableRows(key: string) {
    return Array.isArray(formState[key]) ? formState[key] : [];
  }

  function nextRowId(rows: Array<Record<string, any>>) {
    return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
  }

  function updateTableRow(key: string, id: number, patch: Record<string, any>) {
    const rows = tableRows(key);
    setValue(key, rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  function addTableRow(key: string, row: Record<string, any>) {
    const rows = tableRows(key);
    setValue(key, [...rows, { ...row, id: nextRowId(rows) }]);
  }

  function removeTableRow(key: string, id: number) {
    const rows = tableRows(key);
    if (rows.length <= 1) return;
    setValue(key, rows.filter((row) => row.id !== id));
  }

  function moveTableRow(key: string, fromId: number, toId: number) {
    const rows = tableRows(key);
    const fromIndex = rows.findIndex((row) => row.id === fromId);
    const toIndex = rows.findIndex((row) => row.id === toId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    const next = [...rows];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setValue(key, next);
  }

  function tableRowDragStart(event: DragEvent, key: string, id: number) {
    draggedTableRow = { key, id };
    event.dataTransfer?.setData('text/plain', `${key}:${id}`);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  function tableRowDragOver(event: DragEvent, key: string) {
    if (draggedTableRow?.key !== key) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  function tableRowDrop(event: DragEvent, key: string, id: number) {
    event.preventDefault();
    if (draggedTableRow?.key === key) moveTableRow(key, draggedTableRow.id, id);
    draggedTableRow = null;
  }

  function optionLabel(field: SimpleField, value: any) {
    if (Array.isArray(value)) return value.map((item) => field.options?.find((option) => option.value === item)?.label || item).join(', ');
    return field.options?.find((option) => option.value === value)?.label || value;
  }

  const rovSideLabels: Record<string, string> = { left: 'Left', right: 'Right', bilateral: 'Bilateral', not_applicable: 'Not applicable' };

  function rovRows(key: string) {
    return Array.isArray(formState[key]) ? formState[key] : [];
  }

  function rovStaffLabel(kind: 'surgeon' | 'anaesthetist', index: number) {
    if (kind === 'surgeon') return index === 0 ? 'Second surgeon' : `Surgeon ${index + 2}`;
    return index === 0 ? 'Second anaesthetist' : `Anaesthetist ${index + 2}`;
  }

  function rowCols(row: SimpleRow) {
    if (row.cols) return Math.max(1, Math.min(12, row.cols)) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    const spanTotal = row.cells.reduce((total, cell) => total + (cell.span || 1), 0);
    return Math.max(3, Math.min(12, spanTotal)) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  }

  function ensureSavedImplantRowUuids(state: Record<string, any>) {
    const next = { ...state };
    for (const section of spec.sections) {
      for (const row of section.rows) {
        for (const cell of row.cells) {
          for (const field of cell.fields || []) {
            if (field.type !== 'implantTable' || !field.key || !Array.isArray(next[field.key])) continue;
            next[field.key] = next[field.key].map((implant: Record<string, any>) => {
              const hasContent = Boolean(implant.implantId || implant.description || implant.requiresRemoval || implant.removeBy);
              return hasContent && !implant.uuid ? { ...implant, uuid: generateUUID() } : implant;
            });
          }
        }
      }
    }
    return next;
  }

  async function refreshFormHistory() {
    try {
      formHistory = await getFormHistory(formUuid);
      latestVersion = formHistory.reduce((max, item) => Math.max(max, Number(item.form_version) || 0), 0);
    } catch {
      formHistory = [];
    }
  }

  onMount(() => {
    if (savedForm) refreshFormHistory();
  });

  async function viewHistoryVersion(version: number) {
    const saved = await getFormVersion(spec.formType, formUuid, version);
    const savedData = saved?.form_data || {};
    formState = { ...initialState(), ...savedData, uuid: formUuid };
    highlySensitive = Boolean(saved?.highly_sensitive ?? savedData.highlySensitive);
    finalChecked = saved?.form_status === 'final';
    currentVersion = Number(saved?.version) || version;
    cleanSnapshot = { ...formState };
    isReadOnlyView = true;
    showHistoryMenu = false;
  }

  function backToRecord() {
    if (inline) {
      onClose();
      return;
    }
    returnByHref(readOnlyBackOnly ? `${base}/patient-record/${encodeURIComponent(patientUuid)}` : `${base}/`);
  }

  async function saveForm(event?: SubmitEvent) {
    event?.preventDefault();
    saveError = '';
    if (!password.trim()) {
      saveError = 'Enter password before saving.';
      return;
    }

    isSaving = true;
    try {
      const normalisedState = ensureSavedImplantRowUuids(formState);
      formState = normalisedState;
      // Refuse to save over a version written since this form was opened
      const serverLatest = savedForm || formHistory.length
        ? await assertFormVersionIsLatest(spec.formType, formUuid, currentVersion > 0 ? currentVersion : null)
        : null;
      const nextVersion = Math.max(Number(serverLatest) || 0, currentVersion) + 1;
      const eventDate = formDateToIsoDate(normalisedState.date || normalisedState.operationDate || normalisedState.clinicDate) || new Date().toISOString();
      const formData = {
        ...normalisedState,
        uuid: formUuid,
        highlySensitive,
        finalChecked,
        savedBy: username
      };

      await api.post(`/forms/${spec.formType}`, {
        uuid: formUuid,
        version: nextVersion,
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: eventDate,
        document_datetime: new Date().toISOString(),
        form_status: effectiveFormStatus,
        highly_sensitive: highlySensitive,
        form_data: formData
      });

      await api.post('/forms-index', {
        form_uuid: formUuid,
        form_version: nextVersion,
        form_type: spec.formType,
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: eventDate,
        document_datetime: new Date().toISOString(),
        form_status: effectiveFormStatus,
        highly_sensitive: highlySensitive,
        event_or_document: 'Document',
        title: spec.title,
        summary: spec.title
      });

      currentVersion = nextVersion;
      latestVersion = nextVersion;
      cleanSnapshot = { ...normalisedState };
      password = '';
      isReadOnlyView = true;
      refreshFormHistory();
    } catch (error) {
      if (isStaleFormVersionError(error)) {
        showStaleSavePopup = true;
      } else {
        saveError = error instanceof Error ? error.message : String(error);
      }
    } finally {
      isSaving = false;
    }
  }

  async function continueAfterStaleSave() {
    showStaleSavePopup = false;
    try {
      const saved = await getForm(spec.formType, formUuid);
      const savedData = saved?.form_data || {};
      formState = { ...initialState(), ...savedData, uuid: formUuid };
      highlySensitive = Boolean(saved?.highly_sensitive ?? savedData.highlySensitive);
      finalChecked = saved?.form_status === 'final';
      currentVersion = Number(saved?.version) || currentVersion;
      cleanSnapshot = { ...formState };
    } catch {
      // fall through to RoV with the local state if the reload fails
    }
    password = '';
    isReadOnlyView = true;
    refreshFormHistory();
  }
</script>

{#snippet fieldControl(field: SimpleField)}
  {#if field.type === 'text'}
    <FbTextInput label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} subfield={field.subfield} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'textarea'}
    <FbTextArea label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} subfield={field.subfield} rows={field.rows || 2} fullWidth={field.fullWidth || (field.span ? field.span > 1 : false)} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'hbSelector'}
    <FbHBSelector label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} value={formState[field.key] || ''} options={field.options || []} fullWidth={field.fullWidth} noWidthConstraint={field.noWidthConstraint} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'dropdown'}
    <FbDropdown label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} value={formState[field.key] || ''} options={field.options || []} fullWidth={field.fullWidth} noWidthConstraint={field.noWidthConstraint} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'smartDropdown'}
    <FbSmartDropdown label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} value={formState[field.key] || ''} options={field.options || []} fullWidth={field.fullWidth} noWidthConstraint={field.noWidthConstraint} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'number'}
    <FbNumberInput label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} value={formState[field.key] || ''} units={field.units || ''} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'numberWithUnits'}
    <FbNumberInputWithUnits label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} value={formState[field.key] || ''} units={field.units || ''} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'bloodPressure'}
    <FbBloodPressure label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} systolic={formState[`${field.key}_systolic`] || ''} diastolic={formState[`${field.key}_diastolic`] || ''} onChange={(value) => { setValue(`${field.key}_systolic`, value.systolic); setValue(`${field.key}_diastolic`, value.diastolic); }} />
  {:else if field.type === 'dateHeightWeightBMIRow'}
    <FbDateHeightWeightBMIRow dateRecorded={formState[`${field.key}_dateRecorded`] || ''} heightCm={formState[`${field.key}_heightCm`] || ''} weightKg={formState[`${field.key}_weightKg`] || ''} onDateRecordedChange={(value) => setValue(`${field.key}_dateRecorded`, value)} onHeightCmChange={(value) => setValue(`${field.key}_heightCm`, value)} onWeightKgChange={(value) => setValue(`${field.key}_weightKg`, value)} />
  {:else if field.type === 'date'}
    <FbQuestion label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} subfield={field.subfield}>
      <FbDateExact name={field.key} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
    </FbQuestion>
  {:else if field.type === 'partialDate'}
    <FbQuestion label={field.label} required={field.required} requiredForAudit={field.requiredForAudit} subfield={field.subfield}>
      <FbDatePartial name={field.key} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
    </FbQuestion>
  {:else if field.type === 'time'}
    <FbTime label={field.label} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} required={field.required} requiredForAudit={field.requiredForAudit} />
  {:else if field.type === 'msi'}
    <FbMSISelector label={field.label} name={field.key} value={formState[field.key] || ''} coded={formState[`${field.key}_coded`]} required={field.required} requiredForAudit={field.requiredForAudit} onChange={(value, coded, nadexId) => setCodedValue(field.key, value, coded, nadexId)} />
  {:else if field.type === 'sctProcedure'}
    <FbSCTProcedure label={field.label} name={field.key} value={formState[field.key] || ''} coded={formState[`${field.key}_coded`]} required={field.required} requiredForAudit={field.requiredForAudit} onChange={(value, coded) => setCodedValue(field.key, value, coded)} />
  {:else if field.type === 'sctDiagnosis'}
    <FbSCTDiagnosis label={field.label} name={field.key} value={formState[field.key] || ''} coded={formState[`${field.key}_coded`]} required={field.required} requiredForAudit={field.requiredForAudit} onChange={(value, coded) => setCodedValue(field.key, value, coded)} />
  {:else if field.type === 'urgencyGroup'}
    <FbGroup label={field.label} required={field.required}>
      <FbRadio name={field.key} value="elective" label="Elective" checked={formState[field.key] === 'elective'} onChange={() => setValue(field.key, 'elective')}>
        <div class="simple-urgency-subquestions">
          <FbRadio name="electiveUrgency" value="routine" label="Routine" checked={formState.electiveUrgency === 'routine'} required onChange={() => setValue('electiveUrgency', 'routine')} />
          <FbRadio name="electiveUrgency" value="urgent" label="Urgent" checked={formState.electiveUrgency === 'urgent'} required onChange={() => setValue('electiveUrgency', 'urgent')} />
          <FbRadio name="electiveUrgency" value="usc" label="USC" checked={formState.electiveUrgency === 'usc'} required onChange={() => setValue('electiveUrgency', 'usc')} />
        </div>
      </FbRadio>
      <FbRadio name={field.key} value="emergency" label="Emergency" checked={formState[field.key] === 'emergency'} onChange={() => { setValue(field.key, 'emergency'); setValue('electiveUrgency', ''); }} />
    </FbGroup>
  {:else if field.type === 'surgeonGroup' || field.type === 'anaesthetistGroup' || field.type === 'procedureTable' || field.type === 'diagnosisTable' || field.type === 'specimenTable' || field.type === 'implantTable'}
    <SpecDrivenTableField
      {field}
      {formState}
      rows={formState[field.key] || []}
      {setCodedValue}
      {updateTableRow}
      {addTableRow}
      {removeTableRow}
      {tableRowDragStart}
      {tableRowDragOver}
      {tableRowDrop}
    />
  {:else if field.type === 'radioGroup'}
    <FbGroup label={field.label} required={field.required} requiredForAudit={field.requiredForAudit}>
      {#each field.options || [] as option}
        <FbRadio name={field.key} value={option.value} label={option.label} checked={formState[field.key] === option.value} onChange={() => setValue(field.key, option.value)} />
      {/each}
    </FbGroup>
  {:else if field.type === 'checkGroup'}
    <FbGroup label={field.label} required={field.required} requiredForAudit={field.requiredForAudit}>
      {#each field.options || [] as option}
        <FbCheck name={field.key} value={option.value} label={option.label} checked={(formState[field.key] || []).includes(option.value)} onChange={(checked) => setCheckValue(field.key, option.value, checked)} />
      {/each}
    </FbGroup>
  {:else if field.type === 'notificationTypeGroup'}
    <FbNotificationTypeGroup name={field.key} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'imageTiles'}
    <div class="simple-image-section">
      <div class="simple-image-grid">
        {#each [1, 2, 3, 4, 5, 6] as imageNumber}
          <div class="simple-image-tile">Image {imageNumber}</div>
        {/each}
      </div>
      <button type="button" class="fb-add-button simple-table-add-button">Upload image</button>
    </div>
  {:else if field.type === 'boxedInfo'}
    <FbBoxedMessage text={field.text || ''} variant="info" />
  {:else if field.type === 'boxedWarning'}
    <FbBoxedMessage text={field.text || ''} variant="warning" />
  {:else if field.type === 'boxedAlert'}
    <FbBoxedMessage text={field.text || ''} variant="alert" />
  {/if}
{/snippet}

{#snippet rovField(field: SimpleField)}
  {#if field.type === 'boxedInfo'}
    <FbBoxedMessage text={field.text || ''} variant="info" />
  {:else if field.type === 'boxedWarning'}
    <FbBoxedMessage text={field.text || ''} variant="warning" />
  {:else if field.type === 'boxedAlert'}
    <FbBoxedMessage text={field.text || ''} variant="alert" />
  {:else if field.type === 'imageTiles'}
    <div class="simple-image-section">
      <div class="simple-image-grid">
        {#each [1, 2, 3, 4, 5, 6] as imageNumber}
          <div class="simple-image-tile">Image {imageNumber}</div>
        {/each}
      </div>
    </div>
  {:else if field.type === 'surgeonGroup' || field.type === 'anaesthetistGroup'}
    {@const kind = field.type === 'surgeonGroup' ? 'surgeon' : 'anaesthetist'}
    {@const leadKey = kind === 'surgeon' ? 'leadSurgeon' : 'leadAnaesthetist'}
    {@const srcKey = kind === 'surgeon' ? 'surgeonSRC' : 'anaesthetistSRC'}
    <div class="spec-driven-rov-staff">
      <div class="spec-driven-rov-table-label">{field.label}</div>
      <FbReadOnly label={kind === 'surgeon' ? 'Lead surgeon' : 'Lead anaesthetist'} value={formState[leadKey] || ''} coded={formState[`${leadKey}_coded`]} preserveGridSpace />
      <FbReadOnly label={kind === 'surgeon' ? 'Surgeon SRC' : 'Anaesthetist SRC'} value={formState[srcKey] || ''} coded={formState[`${srcKey}_coded`]} preserveGridSpace />
      {#each rovRows(field.key).filter((row) => row.name) as row, index (row.id)}
        <FbReadOnly label={rovStaffLabel(kind, index)} value={row.name} coded={row.coded} preserveGridSpace />
      {/each}
    </div>
  {:else if field.type === 'procedureTable'}
    {@const rows = rovRows(field.key).filter((row) => row.procedure)}
    {#if rows.length}
      <div class="spec-driven-rov-table">
        <div class="spec-driven-rov-table-label">{field.label}</div>
        <FbTable>
          <FbTableHeader><FbTableRow><FbTableHeaderCell width="20%">Side</FbTableHeaderCell><FbTableHeaderCell width="40%">Procedure</FbTableHeaderCell><FbTableHeaderCell>Additional information</FbTableHeaderCell></FbTableRow></FbTableHeader>
          <FbTableBody>
            {#each rows as row (row.id)}
              <FbTableRow><FbTableCell>{rovSideLabels[row.side] || row.side || '—'}</FbTableCell><FbTableCell>{row.procedure}</FbTableCell><FbTableCell>{row.additionalInfo || '—'}</FbTableCell></FbTableRow>
            {/each}
          </FbTableBody>
        </FbTable>
      </div>
    {/if}
  {:else if field.type === 'diagnosisTable'}
    {@const rows = rovRows(field.key).filter((row) => row.diagnosis)}
    {#if rows.length}
      <div class="spec-driven-rov-table">
        <div class="spec-driven-rov-table-label">{field.label}</div>
        <FbTable>
          <FbTableHeader><FbTableRow><FbTableHeaderCell>Diagnosis</FbTableHeaderCell></FbTableRow></FbTableHeader>
          <FbTableBody>
            {#each rows as row (row.id)}
              <FbTableRow><FbTableCell>{row.diagnosis}</FbTableCell></FbTableRow>
            {/each}
          </FbTableBody>
        </FbTable>
      </div>
    {/if}
  {:else if field.type === 'specimenTable'}
    {@const rows = rovRows(field.key).filter((row) => row.label || row.description)}
    {#if rows.length}
      <div class="spec-driven-rov-table">
        <div class="spec-driven-rov-table-label">{field.label}</div>
        <FbTable>
          <FbTableHeader><FbTableRow><FbTableHeaderCell width="5rem">A, B, C</FbTableHeaderCell><FbTableHeaderCell>Description</FbTableHeaderCell></FbTableRow></FbTableHeader>
          <FbTableBody>
            {#each rows as row (row.id)}
              <FbTableRow><FbTableCell>{row.label || '—'}</FbTableCell><FbTableCell>{row.description || '—'}</FbTableCell></FbTableRow>
            {/each}
          </FbTableBody>
        </FbTable>
      </div>
    {/if}
  {:else if field.type === 'implantTable'}
    {@const rows = rovRows(field.key).filter((row) => row.implantId || row.description || row.requiresRemoval || row.removeBy)}
    {#if rows.length}
      <div class="spec-driven-rov-table">
        <div class="spec-driven-rov-table-label">{field.label}</div>
        <FbTable>
          <FbTableHeader><FbTableRow><FbTableHeaderCell width="9rem">Implant Id</FbTableHeaderCell><FbTableHeaderCell>Type / description</FbTableHeaderCell><FbTableHeaderCell width="12rem">Requires exchange or removal?</FbTableHeaderCell><FbTableHeaderCell width="12rem">Remove by</FbTableHeaderCell></FbTableRow></FbTableHeader>
          <FbTableBody>
            {#each rows as row (row.id)}
              <FbTableRow><FbTableCell>{row.implantId || '—'}</FbTableCell><FbTableCell>{row.description || '—'}</FbTableCell><FbTableCell>{row.requiresRemoval === 'yes' ? 'Yes' : row.requiresRemoval === 'no' ? 'No' : '—'}</FbTableCell><FbTableCell>{row.requiresRemoval === 'yes' ? (row.removeBy || '—') : '—'}</FbTableCell></FbTableRow>
            {/each}
          </FbTableBody>
        </FbTable>
      </div>
    {/if}
  {:else if field.type === 'bloodPressure'}
    <FbReadOnly label={field.label} value={[formState[`${field.key}_systolic`], formState[`${field.key}_diastolic`]].filter(Boolean).join('/')} units="mmHg" preserveGridSpace />
  {:else if field.type === 'dateHeightWeightBMIRow'}
    <FbReadOnly label="Date recorded" value={formState[`${field.key}_dateRecorded`] || ''} preserveGridSpace />
    <FbReadOnly label="Height" value={formState[`${field.key}_heightCm`] || ''} units="cm" preserveGridSpace />
    <FbReadOnly label="Weight" value={formState[`${field.key}_weightKg`] || ''} units="kg" preserveGridSpace />
  {:else}
    <FbReadOnly label={field.label} value={optionLabel(field, formState[field.key])} coded={field.type === 'msi' || field.type === 'sctProcedure' || field.type === 'sctDiagnosis' ? formState[`${field.key}_coded`] : undefined} units={field.units || ''} preserveGridSpace />
  {/if}
{/snippet}

{#if isReadOnlyView}
  <FbLayout sections={sectionsConfig} {formState} bind:activeSection isReadOnlyView={true}>
    {#snippet header()}
      <FbHeader title={spec.title} {patient} formStatus={effectiveFormStatus} {highlySensitive} {superseded} />
    {/snippet}
    {#each spec.sections as section}
      <FbSection id={section.id} title={section.name}>
        {#each section.rows as row}
          {#if row.noGrid}
            {#each row.cells as cell}
              {#each cell.fields || [] as field}
                {@render rovField(field)}
              {/each}
            {/each}
          {:else}
            <FbGridRow cols={rowCols(row)}>
              {#each row.cells as cell}
                <FbGridCell span={cell.span || 1}>
                  {#if cell.groupLabel}
                    <FbGroup label={cell.groupLabel}>
                      {#each cell.fields || [] as field}{@render rovField(field)}{/each}
                    </FbGroup>
                  {:else}
                    {#each cell.fields || [] as field}{@render rovField(field)}{/each}
                  {/if}
                </FbGridCell>
              {/each}
            </FbGridRow>
          {/if}
        {/each}
      </FbSection>
    {/each}
    {#snippet bottomControls()}
      <div class="spec-driven-footer">
        {#if !readOnlyBackOnly && !superseded && effectiveFormStatus !== 'final'}
          <FbButton type="button" variant="primary" onclick={() => isReadOnlyView = false}>EV</FbButton>
        {/if}
        {#if formHistory.length > 0 && !superseded}
          <FbButton type="button" variant="primary" onclick={() => showHistoryMenu = true}>History</FbButton>
        {/if}
        <div class="spec-driven-footer-spacer"></div>
        <FbButton type="button" variant="primary" onclick={backToRecord}>Back</FbButton>
      </div>
    {/snippet}
  </FbLayout>
{:else}
  <FbLayout sections={sectionsConfig} {formState} bind:activeSection onSubmit={saveForm}>
    {#snippet header()}
      <FbHeader title={spec.title} {patient} formStatus="draft" {highlySensitive} />
    {/snippet}
    {#each spec.sections as section}
      <FbSection id={section.id} title={section.name}>
        {#each section.rows as row}
          {#if row.noGrid}
            {#each row.cells as cell}
              {#each cell.fields || [] as field}
                {@render fieldControl(field)}
              {/each}
            {/each}
          {:else}
            <FbGridRow cols={rowCols(row)}>
              {#each row.cells as cell}
                <FbGridCell span={cell.span || 1}>
                  {#if cell.groupLabel}
                    <FbGroup label={cell.groupLabel}>
                      {#each cell.fields || [] as field}{@render fieldControl(field)}{/each}
                    </FbGroup>
                  {:else}
                    {#each cell.fields || [] as field}{@render fieldControl(field)}{/each}
                  {/if}
                </FbGridCell>
              {/each}
            </FbGridRow>
          {/if}
        {/each}
      </FbSection>
    {/each}
    {#if saveError}<div class="spec-driven-save-error" role="alert">{saveError}</div>{/if}
    {#snippet bottomControls()}
      <FbBottomControlsRow
        openedFromPatientRecord={readOnlyBackOnly}
        bind:highlySensitive
        bind:finalChecked
        {requiredFieldsComplete}
        bind:username
        bind:password
        {formChanged}
        {isSaving}
        saveLabel="Save and close"
        onRoVClick={() => isReadOnlyView = true}
        onCancel={backToRecord}
      />
    {/snippet}
  </FbLayout>
{/if}

{#if showHistoryMenu}
  <FbFormHistoryMenu history={formHistory} onViewVersion={viewHistoryVersion} onClose={() => (showHistoryMenu = false)} />
{/if}

{#if showStaleSavePopup}
  <FbModalStaleSave onContinue={continueAfterStaleSave} />
{/if}

<style>
  .simple-urgency-subquestions {
    padding-left: 1.5rem;
  }

  .simple-table-add-button {
    height: 2rem;
    line-height: 1.8rem;
    padding: 0 0.8rem;
    border: 0.1rem solid #1b6ec2;
    border-radius: 0.4rem;
    background: white;
    color: #1b6ec2;
    font-size: 1rem;
    font-weight: 300;
    cursor: pointer;
  }

  .simple-image-section {
    margin-top: 0.4rem;
    margin-bottom: 0.6rem;
  }

  .simple-image-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    padding: 1rem 0;
  }

  .simple-image-tile {
    align-items: center;
    background-color: #f0f0f0;
    border: 0.1rem solid #cccccc;
    border-radius: 0.4rem;
    color: #666666;
    display: flex;
    font-size: 0.8rem;
    height: 150px;
    justify-content: center;
    width: 150px;
  }


  .spec-driven-footer {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-height: 2.8rem;
    padding: 0.4rem;
    border-top: 0.2rem solid #1b6ec2;
    box-sizing: border-box;
  }

  .spec-driven-footer-spacer {
    flex: 1;
  }

  .spec-driven-save-error {
    color: #d50000;
    font-weight: 500;
    margin: 0.6rem;
  }

  .spec-driven-rov-table {
    margin: 0.4rem 0 0.6rem;
    overflow-x: auto;
  }

  .spec-driven-rov-table-label {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.2rem;
  }

  .spec-driven-rov-staff {
    margin: 0.4rem 0 0.6rem;
  }
</style>
