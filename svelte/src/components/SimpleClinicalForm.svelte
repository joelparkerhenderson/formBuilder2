<script lang="ts">
  import { onMount } from 'svelte';
  import FbAuthAndSensitivity from './fbAuthAndSensitivity.svelte';
  import FbBloodPressure from './fbBloodPressure.svelte';
  import FbBottomControlsRow from './fbBottomControlsRow.svelte';
  import FbBoxedAlert from './fbBoxedAlert.svelte';
  import FbBoxedInfo from './fbBoxedInfo.svelte';
  import FbBoxedWarning from './fbBoxedWarning.svelte';
  import FbButton from './fbButton.svelte';
  import FbCheck from './fbCheck.svelte';
  import FbDropdown from './fbDropdown.svelte';
  import FbExactDate from './fbExactDate.svelte';
  import FbGridCell from './fbGridCell.svelte';
  import FbGridRow from './fbGridRow.svelte';
  import FbGroup from './fbGroup.svelte';
  import FbHeader from './fbHeader.svelte';
  import FbLayout from './fbLayout.svelte';
  import FbMSISelector from './fbMSISelector.svelte';
  import FbNumberInput from './fbNumberInput.svelte';
  import FbPartialDate from './fbPartialDate.svelte';
  import FbQuestion from './fbQuestion.svelte';
  import FbRadio from './fbRadio.svelte';
  import FbRoVField from './fbRoVField.svelte';
  import FbSCTDiagnosis from './fbSCTDiagnosis.svelte';
  import FbSCTProcedure from './fbSCTProcedure.svelte';
  import FbSection from './fbSection.svelte';
  import FbTable from './fbTable.svelte';
  import FbTableBody from './fbTableBody.svelte';
  import FbTableCell from './fbTableCell.svelte';
  import FbTableHeader from './fbTableHeader.svelte';
  import FbTableHeaderCell from './fbTableHeaderCell.svelte';
  import FbTableRow from './fbTableRow.svelte';
  import FbTextArea from './fbTextArea.svelte';
  import FbTextInput from './fbTextInput.svelte';
  import FbTime from './fbTime.svelte';
  import FbToolTip from './fbToolTip.svelte';
  import FbCancelPopup from './fbCancelPopup.svelte';
  import FbDraftPopup from './fbDraftPopup.svelte';
  import FbPasswordPopup from './fbPasswordPopup.svelte';
  import FbSaveErrorPopup from './fbSaveErrorPopup.svelte';
  import FbSavedPopup from './fbSavedPopup.svelte';
  import FbSavingPopup from './fbSavingPopup.svelte';
  import { clinicalDateToIsoDate, formatClinicalDate, generateUUID } from '../lib/dateFormat';
  import { compareFormStatesObj } from '../lib/formStateUtils';
  import { getLatestVersion, getPatient, insertForm, insertFormsIndex } from '../lib/api';
  import type { Patient, SectionSpec } from '../lib/types';
  import type { SimpleClinicalSpec, SimpleField } from '../lib/simpleClinicalTypes';

  export let spec: SimpleClinicalSpec;

  type SaveStatus = 'final' | 'draft';

  const params = new URLSearchParams(window.location.search);
  const patientUuid = params.get('patientUuid') || 'fd55880a-7ada-47a8-adbb-65850af6f7e2';

  let patient: Patient | null = null;
  let loadingData = true;
  let activeSection = spec.sections[0]?.id || '';
  let formState: Record<string, any> = {};
  let cleanSnapshot: Record<string, any> = {};
  let formChanged = false;
  let finalChecked = false;
  let highlySensitive = false;
  let username = 'demoUser';
  let password = '';
  let isReadOnlyView = false;
  let isSaving = false;
  let showDraftPopup = false;
  let showPasswordPopup = false;
  let showCancelPopup = false;
  let showSavingPopup = false;
  let showSavedPopup = false;
  let showSaveErrorPopup = false;
  let saveErrorDetails = '';
  let pendingSaveStatus: SaveStatus = 'final';

  $: sectionsConfig = spec.sections.map((section) => ({
    id: section.id,
    name: section.name,
    requiredFields: section.requiredFields || [],
  })) satisfies SectionSpec[];

  $: requiredFieldsIncomplete = !areAllSectionsComplete(sectionsConfig, formState);
  $: formChanged = !compareFormStatesObj(cleanSnapshot, formState);

  function areAllSectionsComplete(sectionSpecs: SectionSpec[], state: Record<string, any>) {
    return sectionSpecs.every((section) => {
      const required = section.requiredFields || [];
      return required.every((field) => {
        const value = state[field];
        if (field === 'procedures' && Array.isArray(value)) {
          return value.some((row) => String(row?.procedure || '').trim() !== '');
        }
        if (field === 'urgency') {
          return value === 'emergency' || (value === 'elective' && Boolean(state.electiveUrgency));
        }
        return value !== undefined && value !== null && value !== '';
      });
    });
  }

  function today() {
    return formatClinicalDate(new Date());
  }

  function initialState() {
    const state: Record<string, any> = {
      organisation: 'cwm-taf',
      hospital: 'princess-wales',
      speciality: '',
    };
    for (const section of spec.sections) {
      for (const row of section.rows) {
        for (const cell of row.cells) {
          for (const field of cell.fields || []) {
            if (field.key && state[field.key] === undefined) {
              if (field.type === 'checkGroup') state[field.key] = [];
              else if (field.type === 'procedureTable') state[field.key] = [{ id: 1, side: '', procedure: '', additionalInfo: '' }];
              else if (field.type === 'diagnosisTable') state[field.key] = [{ id: 1, diagnosis: '', diagnosis_coded: false }];
              else if (field.type === 'specimenTable') state[field.key] = [
                { id: 1, label: '', description: '' },
                { id: 2, label: '', description: '' },
                { id: 3, label: '', description: '' },
              ];
              else if (field.type === 'implantTable') state[field.key] = [{ id: 1, implantId: '', description: '', requiresRemoval: '', removeBy: '' }];
              else if (field.type === 'surgeonGroup') state[field.key] = [{ id: 1, name: '', coded: false }];
              else if (field.type === 'anaesthetistGroup') state[field.key] = [{ id: 1, name: '', coded: false }];
              else if (field.type === 'bloodPressure') {
                state[`${field.key}_systolic`] = '';
                state[`${field.key}_diastolic`] = '';
              } else if (field.type === 'date' && (field.key === 'date' || field.key.toLowerCase().includes('date'))) state[field.key] = today();
              else state[field.key] = '';
            }
          }
        }
      }
    }
    return state;
  }

  function setValue(key: string, value: any) {
    formState = { ...formState, [key]: value };
  }

  function setCodedValue(key: string, value: string, coded: boolean) {
    formState = { ...formState, [key]: value, [`${key}_coded`]: coded };
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

  function addProcedureTableRow(key: string) {
    addTableRow(key, { side: '', procedure: '', additionalInfo: '' });
  }

  function addDiagnosisTableRow(key: string) {
    addTableRow(key, { diagnosis: '', diagnosis_coded: false });
  }

  function addSpecimenTableRow(key: string) {
    addTableRow(key, { label: '', description: '' });
  }

  function addImplantTableRow(key: string) {
    addTableRow(key, { implantId: '', description: '', requiresRemoval: '', removeBy: '' });
  }

  function removeTableRow(key: string, id: number) {
    const rows = tableRows(key);
    if (rows.length <= 1) return;
    setValue(key, rows.filter((row) => row.id !== id));
  }

  function staffLabel(kind: 'surgeon' | 'anaesthetist', index: number) {
    if (kind === 'surgeon') return index === 0 ? 'Second surgeon' : `Surgeon ${index + 2}`;
    return index === 0 ? 'Second anaesthetist' : `Anaesthetist ${index + 2}`;
  }

  function addStaffRow(key: string) {
    addTableRow(key, { name: '', coded: false });
  }

  function updateStaffRow(key: string, id: number, value: string, coded: boolean) {
    updateTableRow(key, id, { name: value, coded });
  }

  function optionLabel(field: SimpleField, value: any) {
    if (Array.isArray(value)) return value.map((item) => field.options?.find((option) => option.value === item)?.label || item).join(', ');
    return field.options?.find((option) => option.value === value)?.label || value;
  }

  function rowCols(row: { cols?: number; cells: Array<{ span?: number }> }) {
    if (row.cols) return row.cols;
    const spanTotal = row.cells.reduce((total, cell) => total + (cell.span || 1), 0);
    return Math.max(3, spanTotal);
  }

  function handleFormActivity() {
    formState = { ...formState };
  }

  async function loadData() {
    try {
      patient = await getPatient(patientUuid);
    } catch {
      patient = null;
    }
    formState = initialState();
    cleanSnapshot = { ...formState };
    loadingData = false;
  }

  onMount(loadData);

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
      const latest = await getLatestVersion(spec.formType, patient?.uuid || patientUuid);
      const version = (latest.version || 0) + 1;
      const formUuid = generateUUID();
      const eventDate = clinicalDateToIsoDate(formState.date || formState.operationDate || formState.clinicDate) || new Date().toISOString();
      const formStatus = status === 'final' ? 'final' : 'draft';
      const formData = {
        ...formState,
        highlySensitive,
        finalChecked: status === 'final',
        savedBy: username,
      };

      await insertForm(spec.formType, {
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
        form_type: spec.formType,
        patient_uuid: patient?.uuid || patientUuid,
        event_datetime: eventDate,
        document_datetime: new Date().toISOString(),
        form_status: formStatus,
        event_or_document: 'Document',
        title: spec.title,
        summary: spec.title,
      });

      cleanSnapshot = { ...formState };
      showSavingPopup = false;
      showSavedPopup = true;
      window.setTimeout(() => (window.location.href = 'index.html'), 1000);
    } catch (error) {
      saveErrorDetails = error instanceof Error ? error.message : String(error);
      showSavingPopup = false;
      showSaveErrorPopup = true;
    } finally {
      isSaving = false;
    }
  }
</script>

{#snippet fieldControl(field: SimpleField)}
  {#if field.type === 'text'}
    <FbTextInput label={field.label} required={field.required} subfield={field.subfield} tooltip={field.tooltip || ''} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'textarea'}
    <FbTextArea label={field.label} required={field.required} subfield={field.subfield} tooltip={field.tooltip || ''} rows={field.rows || 2} fullWidth={field.fullWidth || (field.span ? field.span > 1 : false)} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'dropdown'}
    <FbDropdown label={field.label} required={field.required} tooltip={field.tooltip || ''} value={formState[field.key] || ''} options={field.options || []} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'number'}
    <FbNumberInput label={field.label} required={field.required} tooltip={field.tooltip || ''} value={formState[field.key] || ''} units={field.units || ''} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'bloodPressure'}
    <FbBloodPressure label={field.label} required={field.required} tooltip={field.tooltip || ''} systolic={formState[`${field.key}_systolic`] || ''} diastolic={formState[`${field.key}_diastolic`] || ''} onChange={(value) => { setValue(`${field.key}_systolic`, value.systolic); setValue(`${field.key}_diastolic`, value.diastolic); }} />
  {:else if field.type === 'date'}
    <FbQuestion label={field.label} required={field.required} subfield={field.subfield} tooltip={field.tooltip || ''}>
      <FbExactDate name={field.key} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
    </FbQuestion>
  {:else if field.type === 'partialDate'}
    <FbQuestion label={field.label} required={field.required} subfield={field.subfield} tooltip={field.tooltip || ''}>
      <FbPartialDate name={field.key} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
    </FbQuestion>
  {:else if field.type === 'time'}
    <FbTime label={field.label} required={field.required} tooltip={field.tooltip || ''} value={formState[field.key] || ''} onChange={(value) => setValue(field.key, value)} />
  {:else if field.type === 'msi'}
    <FbMSISelector label={field.label} required={field.required} tooltip={field.tooltip || ''} value={formState[field.key] || ''} coded={formState[`${field.key}_coded`]} onChange={(value, coded) => setCodedValue(field.key, value, coded)} />
  {:else if field.type === 'sctProcedure'}
    <FbSCTProcedure label={field.label} required={field.required} tooltip={field.tooltip || ''} value={formState[field.key] || ''} coded={formState[`${field.key}_coded`]} onChange={(value, coded) => setCodedValue(field.key, value, coded)} />
  {:else if field.type === 'sctDiagnosis'}
    <FbSCTDiagnosis label={field.label} required={field.required} tooltip={field.tooltip || ''} value={formState[field.key] || ''} coded={formState[`${field.key}_coded`]} onChange={(value, coded) => setCodedValue(field.key, value, coded)} />
  {:else if field.type === 'surgeonGroup'}
    <div class="simple-staff-group fb-question-container">
      <div class="simple-staff-group-label">Surgeons</div>
      <div class="simple-staff-subquestion fb-subquestion">
        <div class="simple-staff-sublabel">Lead operating surgeon <span class="simple-table-required-star">*</span></div>
        <FbMSISelector value={formState.leadSurgeon || ''} coded={formState.leadSurgeon_coded} onChange={(value, coded) => setCodedValue('leadSurgeon', value, coded)} required />
      </div>
      {#each formState[field.key] || [] as row, index (row.id)}
        <div class="simple-staff-row">
          <div class="simple-staff-subquestion fb-subquestion">
            <div class="simple-staff-sublabel">{staffLabel('surgeon', index)}</div>
            <FbMSISelector value={row.name || ''} coded={row.coded} onChange={(value, coded) => updateStaffRow(field.key, row.id, value, coded)} />
          </div>
          {#if (formState[field.key] || []).length > 1}
            <button type="button" class="simple-table-icon-button simple-staff-delete" onclickcapture={() => removeTableRow(field.key, row.id)} aria-label="Delete surgeon"><span class="material-icons" aria-hidden="true">highlight_off</span></button>
          {/if}
        </div>
      {/each}
      <button type="button" class="fb-add-button simple-table-add-button" onclickcapture={() => addStaffRow(field.key)}>Add surgeon</button>
      <div class="simple-staff-subquestion simple-staff-after-add fb-subquestion">
        <div class="simple-staff-sublabel">Supervising surgeon present</div>
        <FbMSISelector value={formState.supervisingSurgeon || ''} coded={formState.supervisingSurgeon_coded} onChange={(value, coded) => setCodedValue('supervisingSurgeon', value, coded)} />
      </div>
      <div class="simple-staff-subquestion fb-subquestion">
        <div class="simple-staff-sublabel">SRC <span class="simple-table-required-star">*</span></div>
        <FbMSISelector value={formState.surgeonSRC || ''} coded={formState.surgeonSRC_coded} onChange={(value, coded) => setCodedValue('surgeonSRC', value, coded)} required />
      </div>
    </div>
  {:else if field.type === 'anaesthetistGroup'}
    <div class="simple-staff-group fb-question-container">
      <div class="simple-staff-group-label">Anaesthetists</div>
      <div class="simple-staff-subquestion fb-subquestion">
        <div class="simple-staff-sublabel">Lead anaesthetist <span class="simple-table-required-star">*</span></div>
        <FbMSISelector value={formState.leadAnaesthetist || ''} coded={formState.leadAnaesthetist_coded} onChange={(value, coded) => setCodedValue('leadAnaesthetist', value, coded)} required />
      </div>
      {#each formState[field.key] || [] as row, index (row.id)}
        <div class="simple-staff-row">
          <div class="simple-staff-subquestion fb-subquestion">
            <div class="simple-staff-sublabel">{staffLabel('anaesthetist', index)}</div>
            <FbMSISelector value={row.name || ''} coded={row.coded} onChange={(value, coded) => updateStaffRow(field.key, row.id, value, coded)} />
          </div>
          {#if (formState[field.key] || []).length > 1}
            <button type="button" class="simple-table-icon-button simple-staff-delete" onclickcapture={() => removeTableRow(field.key, row.id)} aria-label="Delete anaesthetist"><span class="material-icons" aria-hidden="true">highlight_off</span></button>
          {/if}
        </div>
      {/each}
      <button type="button" class="fb-add-button simple-table-add-button" onclickcapture={() => addStaffRow(field.key)}>Add anaesthetist</button>
      <div class="simple-staff-subquestion simple-staff-after-add fb-subquestion">
        <div class="simple-staff-sublabel">Supervising anaesthetist present</div>
        <FbMSISelector value={formState.supervisingAnaesthetist || ''} coded={formState.supervisingAnaesthetist_coded} onChange={(value, coded) => setCodedValue('supervisingAnaesthetist', value, coded)} />
      </div>
      <div class="simple-staff-subquestion fb-subquestion">
        <div class="simple-staff-sublabel">SRC <span class="simple-table-required-star">*</span></div>
        <FbMSISelector value={formState.anaesthetistSRC || ''} coded={formState.anaesthetistSRC_coded} onChange={(value, coded) => setCodedValue('anaesthetistSRC', value, coded)} required />
      </div>
    </div>
  {:else if field.type === 'urgencyGroup'}
    <FbGroup label={field.label} required={field.required} tooltip={field.tooltip || ''}>
      <FbRadio name="urgency" value="elective" label="Elective" checked={formState.urgency === 'elective'} onChange={(value) => setValue('urgency', value)} />
      {#if formState.urgency === 'elective'}
        <div class="simple-urgency-subgroup fb-subquestion">
          <FbGroup label="" subfield>
            <FbRadio name="electiveUrgency" value="routine" label="Routine" checked={formState.electiveUrgency === 'routine'} onChange={(value) => setValue('electiveUrgency', value)} />
            <FbRadio name="electiveUrgency" value="urgent" label="Urgent" checked={formState.electiveUrgency === 'urgent'} onChange={(value) => setValue('electiveUrgency', value)} />
            <FbRadio name="electiveUrgency" value="usc" label="USC" tooltip="Urgent Suspected Cancer" checked={formState.electiveUrgency === 'usc'} onChange={(value) => setValue('electiveUrgency', value)} />
          </FbGroup>
        </div>
      {/if}
      <FbRadio name="urgency" value="emergency" label="Emergency" checked={formState.urgency === 'emergency'} onChange={(value) => { setValue('urgency', value); setValue('electiveUrgency', ''); }} />
    </FbGroup>
  {:else if field.type === 'procedureTable'}
    <div class="simple-table-wrap">
      <FbTable>
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell width="2rem"></FbTableHeaderCell>
            <FbTableHeaderCell width="10rem">Side</FbTableHeaderCell>
            <FbTableHeaderCell>Procedure</FbTableHeaderCell>
            <FbTableHeaderCell>Additional information</FbTableHeaderCell>
            <FbTableHeaderCell width="2rem"></FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {#if (formState[field.key] || []).every((row) => !String(row.procedure || '').trim())}
            <FbTableRow>
              <td colspan="5" class="simple-table-error">Enter at least one procedure</td>
            </FbTableRow>
          {/if}
          {#each formState[field.key] || [] as row (row.id)}
            <FbTableRow>
              <FbTableCell><span class="material-icons simple-table-drag" aria-hidden="true">swap_vertical_circle</span></FbTableCell>
              <FbTableCell>
                <FbDropdown value={row.side || ''} placeholder="Select side" options={[
                  { value: 'left', label: 'Left' },
                  { value: 'right', label: 'Right' },
                  { value: 'bilateral', label: 'Bilateral' },
                  { value: 'na', label: 'Not applicable' },
                ]} onChange={(value) => updateTableRow(field.key, row.id, { side: value })} />
              </FbTableCell>
              <FbTableCell>
                <FbSCTProcedure value={row.procedure || ''} coded={row.procedure_coded} onChange={(value, coded) => updateTableRow(field.key, row.id, { procedure: value, procedure_coded: coded })} />
              </FbTableCell>
              <FbTableCell>
                <FbTextInput value={row.additionalInfo || ''} placeholder="Additional info" onChange={(value) => updateTableRow(field.key, row.id, { additionalInfo: value })} />
              </FbTableCell>
              <FbTableCell><button type="button" class="simple-table-icon-button" onclickcapture={() => removeTableRow(field.key, row.id)} aria-label="Delete procedure"><span class="material-icons" aria-hidden="true">highlight_off</span></button></FbTableCell>
            </FbTableRow>
          {/each}
        </FbTableBody>
      </FbTable>
    </div>
    <button
      type="button"
      class="fb-add-button simple-table-add-button"
      onclickcapture={() => addProcedureTableRow(field.key)}
    >Add another procedure</button>
  {:else if field.type === 'diagnosisTable'}
    <FbToolTip text={field.tooltip || ''} as="div" className="simple-table-question fb-question-container">
      <div class="simple-table-label">
        {field.label}
      </div>
      <div class="simple-table-note">if different</div>
      <div class="simple-table-wrap">
        <FbTable>
          <FbTableBody>
            {#each formState[field.key] || [] as row (row.id)}
              <FbTableRow>
                <FbTableCell><span class="material-icons simple-table-drag" aria-hidden="true">swap_vertical_circle</span></FbTableCell>
                <FbTableCell>
                  <FbSCTDiagnosis value={row.diagnosis || ''} coded={row.diagnosis_coded} onChange={(value, coded) => updateTableRow(field.key, row.id, { diagnosis: value, diagnosis_coded: coded })} />
                </FbTableCell>
                <FbTableCell>
                  <button type="button" class="simple-table-icon-button" onclickcapture={() => removeTableRow(field.key, row.id)} aria-label="Delete operative diagnosis"><span class="material-icons" aria-hidden="true">highlight_off</span></button>
                </FbTableCell>
              </FbTableRow>
            {/each}
          </FbTableBody>
        </FbTable>
      </div>
      <div class="simple-diagnosis-add-row"><button type="button" class="fb-add-button simple-table-add-button" onclickcapture={() => addDiagnosisTableRow(field.key)}>Add operative diagnosis</button></div>
    </FbToolTip>
  {:else if field.type === 'specimenTable'}
    <div class="simple-table-wrap">
      <FbTable>
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell width="2rem"></FbTableHeaderCell>
            <FbTableHeaderCell width="5rem">A, B, C</FbTableHeaderCell>
            <FbTableHeaderCell>Description</FbTableHeaderCell>
            <FbTableHeaderCell width="2rem"></FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {#each formState[field.key] || [] as row (row.id)}
            <FbTableRow>
              <FbTableCell><span class="material-icons simple-table-drag" aria-hidden="true">swap_vertical_circle</span></FbTableCell>
              <FbTableCell><FbTextInput value={row.label || ''} onChange={(value) => updateTableRow(field.key, row.id, { label: value })} /></FbTableCell>
              <FbTableCell><FbTextArea value={row.description || ''} rows={1} fullWidth onChange={(value) => updateTableRow(field.key, row.id, { description: value })} /></FbTableCell>
              <FbTableCell>
                {#if (formState[field.key] || []).length > 1}
                  <button type="button" class="simple-table-icon-button" onclickcapture={() => removeTableRow(field.key, row.id)} aria-label="Delete specimen"><span class="material-icons" aria-hidden="true">highlight_off</span></button>
                {/if}
              </FbTableCell>
            </FbTableRow>
          {/each}
        </FbTableBody>
      </FbTable>
    </div>
    <button
      type="button"
      class="fb-add-button simple-table-add-button"
      onclickcapture={() => addSpecimenTableRow(field.key)}
    >Add specimen</button>
  {:else if field.type === 'implantTable'}
    <div class="simple-table-note">Include implanted tissue and organs here</div>
    <div class="simple-table-wrap">
      <FbTable>
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell width="9rem">Implant Id</FbTableHeaderCell>
            <FbTableHeaderCell>Type / description</FbTableHeaderCell>
            <FbTableHeaderCell width="1%">Does this implant require exchange or removal?</FbTableHeaderCell>
            <FbTableHeaderCell width="12rem">Remove by</FbTableHeaderCell>
            <FbTableHeaderCell width="2rem"></FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {#each formState[field.key] || [] as row (row.id)}
            <FbTableRow>
              <FbTableCell style="width: 9rem;"><FbTextInput value={row.implantId || ''} onChange={(value) => updateTableRow(field.key, row.id, { implantId: value })} /></FbTableCell>
              <FbTableCell><FbTextArea value={row.description || ''} rows={1} fullWidth onChange={(value) => updateTableRow(field.key, row.id, { description: value })} /></FbTableCell>
              <FbTableCell style="width: 1%;">
                <FbGroup label="">
                  <FbRadio name={`${field.key}-removal-${row.id}`} value="yes" label="Yes" checked={row.requiresRemoval === 'yes'} onChange={(value) => updateTableRow(field.key, row.id, { requiresRemoval: value })} />
                  <FbRadio name={`${field.key}-removal-${row.id}`} value="no" label="No" checked={row.requiresRemoval === 'no'} onChange={(value) => updateTableRow(field.key, row.id, { requiresRemoval: value, removeBy: '' })} />
                </FbGroup>
              </FbTableCell>
              <FbTableCell>
                {#if row.requiresRemoval === 'yes'}
                  <div class="simple-table-required-date">
                    <FbPartialDate name={`${field.key}-remove-by-${row.id}`} value={row.removeBy || ''} onChange={(value) => updateTableRow(field.key, row.id, { removeBy: value })} />
                    <span class="simple-table-required-star">*</span>
                  </div>
                {/if}
              </FbTableCell>
              <FbTableCell>
                {#if (formState[field.key] || []).length > 1}
                  <button type="button" class="simple-table-icon-button" onclickcapture={() => removeTableRow(field.key, row.id)} aria-label="Delete implant"><span class="material-icons" aria-hidden="true">highlight_off</span></button>
                {/if}
              </FbTableCell>
            </FbTableRow>
          {/each}
        </FbTableBody>
      </FbTable>
    </div>
    <button
      type="button"
      class="fb-add-button simple-table-add-button"
      onclickcapture={() => addImplantTableRow(field.key)}
    >Add another implant</button>
  {:else if field.type === 'radioGroup'}
      <FbGroup label={field.label} required={field.required} tooltip={field.tooltip || ''}>
      {#each field.options || [] as option}
        <FbRadio name={field.key} value={option.value} label={option.label} checked={formState[field.key] === option.value} onChange={(value) => setValue(field.key, value)} />
      {/each}
    </FbGroup>
  {:else if field.type === 'checkGroup'}
      <FbGroup label={field.label} required={field.required} tooltip={field.tooltip || ''}>
      {#each field.options || [] as option}
        <FbCheck name={field.key} label={option.label} checked={(formState[field.key] || []).includes(option.value)} onChange={(checked) => setCheckValue(field.key, option.value, checked)} />
      {/each}
    </FbGroup>
  {:else if field.type === 'boxedInfo'}
    <FbBoxedInfo text={field.text || ''} />
  {:else if field.type === 'boxedWarning'}
    <FbBoxedWarning text={field.text || ''} />
  {:else if field.type === 'boxedAlert'}
    <FbBoxedAlert text={field.text || ''} />
  {/if}
{/snippet}

{#snippet rovField(field: SimpleField)}
  {#if field.type === 'boxedInfo'}
    <FbBoxedInfo text={field.text || ''} />
  {:else if field.type === 'boxedWarning'}
    <FbBoxedWarning text={field.text || ''} />
  {:else if field.type === 'boxedAlert'}
    <FbBoxedAlert text={field.text || ''} />
  {:else if field.type === 'bloodPressure'}
      <FbRoVField label={field.label} tooltip={field.tooltip || ''} value={[formState[`${field.key}_systolic`], formState[`${field.key}_diastolic`]].filter(Boolean).join('/')} units="mmHg" />
    {:else}
      <FbRoVField label={field.label} tooltip={field.tooltip || ''} value={optionLabel(field, formState[field.key])} coded={field.type === 'msi' || field.type === 'sctProcedure' || field.type === 'sctDiagnosis' ? formState[`${field.key}_coded`] : undefined} units={field.units || ''} />
  {/if}
{/snippet}

{#if loadingData}
  <p style="padding: 0.8rem;">Loading...</p>
{:else if isReadOnlyView}
  <FbLayout sections={sectionsConfig} {formState} bind:activeSection isReadOnlyView={true}>
    <svelte:fragment slot="header"><FbHeader title={spec.title} {patient} /></svelte:fragment>
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
                      {#each cell.fields || [] as field}
                        {@render rovField(field)}
                      {/each}
                    </FbGroup>
                  {:else}
                    {#each cell.fields || [] as field}
                      {@render rovField(field)}
                    {/each}
                  {/if}
                </FbGridCell>
              {/each}
            </FbGridRow>
          {/if}
        {/each}
      </FbSection>
    {/each}
    <svelte:fragment slot="bottomControls">
      <FbBottomControlsRow>
        <FbButton type="button" onClick={() => (isReadOnlyView = false)}>EV</FbButton>
        <div style="flex: 1;"></div>
        <FbButton type="button" onClick={() => (window.location.href = 'index.html')}>Back</FbButton>
      </FbBottomControlsRow>
    </svelte:fragment>
  </FbLayout>
{:else}
  <FbLayout sections={sectionsConfig} {formState} bind:activeSection onFormActivity={handleFormActivity}>
    <svelte:fragment slot="header"><FbHeader title={spec.title} {patient} /></svelte:fragment>
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
                      {#each cell.fields || [] as field}
                        {@render fieldControl(field)}
                      {/each}
                    </FbGroup>
                  {:else}
                    {#each cell.fields || [] as field}
                      {@render fieldControl(field)}
                    {/each}
                  {/if}
                </FbGridCell>
              {/each}
            </FbGridRow>
          {/if}
        {/each}
      </FbSection>
    {/each}
    <svelte:fragment slot="bottomControls">
      <FbBottomControlsRow>
        <FbButton type="button" onClick={() => (isReadOnlyView = true)}>RoV</FbButton>
        <div style="flex: 1;"></div>
        <FbAuthAndSensitivity bind:username bind:password bind:highlySensitive bind:finalChecked {formChanged} finalDisabled={requiredFieldsIncomplete} />
        <FbButton type="button" variant={formChanged ? 'success' : 'secondary'} disabled={requiredFieldsIncomplete || isSaving || !formChanged} onClick={() => saveForm('final')}>Save and close</FbButton>
        <FbButton type="button" variant="danger" onClick={() => formChanged ? (showCancelPopup = true) : (window.location.href = 'index.html')}>Cancel</FbButton>
      </FbBottomControlsRow>
    </svelte:fragment>
  </FbLayout>
{/if}

{#if showDraftPopup}<FbDraftPopup onSaveDraft={() => { showDraftPopup = false; saveForm('draft'); }} onCancel={() => (showDraftPopup = false)} />{/if}
{#if showPasswordPopup}<FbPasswordPopup on:confirm={(event) => { password = event.detail; showPasswordPopup = false; saveForm(pendingSaveStatus); }} on:cancel={() => (showPasswordPopup = false)} />{/if}
{#if showCancelPopup}<FbCancelPopup onDiscard={() => (window.location.href = 'index.html')} onReturnToForm={() => (showCancelPopup = false)} />{/if}
{#if showSavingPopup}<FbSavingPopup />{/if}
{#if showSavedPopup}<FbSavedPopup />{/if}
{#if showSaveErrorPopup}<FbSaveErrorPopup error={saveErrorDetails} onReturnToForm={() => (showSaveErrorPopup = false)} />{/if}

<style>
  .simple-table-wrap {
    width: 100%;
    overflow-x: auto;
    padding: 0.2rem 0;
  }

  .simple-table-wrap :global(.fb-table) {
    table-layout: auto;
  }

  :global(.simple-table-question) {
    padding: 0.2rem;
    border-radius: 0.4rem;
    box-sizing: border-box;
  }

  .simple-table-label {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.2rem;
  }

  .simple-table-error {
    color: var(--fb-red);
    font-size: 0.8rem;
    font-style: italic;
    font-weight: 500;
    padding: 0.4rem;
    border-bottom: 0.1rem solid silver;
  }

  .simple-table-drag {
    color: var(--fb-blue);
    cursor: grab;
    font-size: 1.5rem;
  }

  .simple-table-icon-button {
    border: none;
    background: transparent;
    color: var(--fb-red);
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .simple-table-icon-button .material-icons {
    font-size: 1.5rem;
  }

  .simple-table-icon-button:hover,
  .simple-table-icon-button:focus {
    background: transparent;
    color: var(--fb-red);
  }

  .simple-table-add-button {
    height: 2rem;
    line-height: 1.8rem;
    padding: 0 0.8rem;
    border: 0.1rem solid var(--fb-blue);
    border-radius: 0.4rem;
    background: white;
    color: var(--fb-blue);
    font-size: 1rem;
    font-weight: 300;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .simple-table-add-button:hover,
  .simple-table-add-button:focus {
    border-color: black;
    background: var(--fb-active-darker-yellow);
    color: black;
  }

  .simple-table-note {
    font-size: 0.9rem;
    font-style: italic;
    margin-bottom: 0.4rem;
  }

  .simple-diagnosis-add-row {
    margin-top: 0.4rem;
  }

  .simple-table-required-date {
    display: flex;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .simple-table-required-star {
    color: var(--fb-red);
    flex: 0 0 auto;
    font-weight: 500;
    line-height: 1.8rem;
  }

  .simple-staff-group {
    padding: 0.2rem;
    border-radius: 0.4rem;
    box-sizing: border-box;
  }

  .simple-staff-group-label {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.2rem;
  }

  .simple-staff-group > .simple-table-add-button {
    margin-top: 0.4rem;
  }

  .simple-staff-subquestion {
    padding: 0.2rem;
    border-radius: 0.4rem;
    box-sizing: border-box;
  }

  .simple-staff-sublabel {
    font-size: 1rem;
    font-weight: 300;
    margin-bottom: 0.2rem;
  }

  .simple-staff-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .simple-staff-row .simple-staff-subquestion {
    flex: 1 1 auto;
    min-width: 0;
  }

  .simple-staff-delete {
    flex: 0 0 auto;
    margin-top: 1.5rem;
  }

  .simple-staff-after-add {
    margin-top: 0.6rem;
  }

  .simple-urgency-subgroup {
    margin-left: 1.5rem;
    margin-top: 0.2rem;
  }
</style>
