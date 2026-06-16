<script lang="ts">
  import { onMount } from 'svelte';
  import FbAddressograph from '../components/fbAddressograph.svelte';
  import FbAddButtonForPage from '../components/fbAddButtonForPage.svelte';
  import FbAddFormMenu from '../components/fbAddFormMenu.svelte';
  import FbButton from '../components/fbButton.svelte';
  import FbDraftBadge from '../components/fbDraftBadge.svelte';
  import FbFormTile from '../components/fbFormTile.svelte';
  import FbOutpatientAppointmentTile from '../components/fbOutpatientAppointmentTile.svelte';
  import FbUserName from '../components/fbUserName.svelte';
  import { getPatient, getPatientAppointments, getPatientForms } from '../lib/api';
  import { specialityLabels } from '../lib/constants';
  import type { Patient } from '../lib/types';

  export let patientUuid = new URLSearchParams(window.location.search).get('patientUuid') || sessionStorage.getItem('fb_prev_patient_uuid') || 'fd55880a-7ada-47a8-adbb-65850af6f7e2';
  export let inline = false;
  export let username = 'demoUser';
  export let onClose: () => void = () => {};

  type FormIndexItem = {
    form_uuid: string;
    form_version?: number;
    form_type: string;
    patient_uuid: string;
    event_datetime: string;
    document_datetime?: string | null;
    form_status: string;
    speciality?: string;
    senior_responsible_clinician?: string;
  };

  let patient: Patient | null = null;
  let forms: FormIndexItem[] = [];
  let appointments: any[] = [];
  let loading = true;
  let showAddMenu = false;

  onMount(() => {
    sessionStorage.setItem('fb_prev_main_page', '/patient-record');
    sessionStorage.setItem('fb_prev_patient_uuid', patientUuid);
    void fetchPatientRecord();
  });

  async function fetchPatientRecord() {
    loading = true;
    try {
      const [patientData, formData, appointmentData] = await Promise.all([
        getPatient(patientUuid),
        getPatientForms(patientUuid),
        getPatientAppointments(patientUuid),
      ]);
      patient = patientData;
      forms = formData || [];
      appointments = appointmentData || [];
    } catch (error) {
      console.error('Error fetching patient record:', error);
      forms = [];
      appointments = [];
    } finally {
      loading = false;
    }
  }

  function closeRecord() {
    if (inline) onClose();
    else window.location.href = 'index.html';
  }

  function formTypeDisplay(type: string) {
    if (type === 'waiting_list_card') return 'Waiting list card';
    if (type === 'operation_note') return 'Operation note';
    if (type === 'outpatient_outcome') return 'Outpatient outcome';
    if (type === 'treatment_summary') return 'Treatment summary';
    if (type === 'outpatient_appointment') return 'Outpatient appointment';
    return type;
  }

  function formTypeHref(type: string) {
    if (type === 'waiting_list_card') return 'waitingListCard.html';
    if (type === 'operation_note') return 'operationNote.html';
    if (type === 'outpatient_outcome') return 'outpatientOutcome.html';
    if (type === 'treatment_summary') return 'treatmentSummary.html';
    return '';
  }

  function openForm(form: FormIndexItem) {
    const href = formTypeHref(form.form_type);
    if (!href) return;
    window.location.href = `${href}?patientUuid=${encodeURIComponent(patientUuid)}&formUuid=${encodeURIComponent(form.form_uuid)}&openInRoV=true`;
  }

  function openAppointmentOutcome(form: FormIndexItem) {
    const appt = appointments.find((item) => item.uuid === form.form_uuid);
    const outcomeUuid = appt?.outcome_form_uuid;
    if (outcomeUuid) {
      window.location.href = `outpatientOutcome.html?patientUuid=${encodeURIComponent(patientUuid)}&formUuid=${encodeURIComponent(outcomeUuid)}&openInRoV=true`;
    } else {
      window.location.href = `outpatientOutcome.html?patientUuid=${encodeURIComponent(patientUuid)}&appointmentUuid=${encodeURIComponent(form.form_uuid)}`;
    }
  }

  function addNewForm(type: string) {
    showAddMenu = false;
    const mapped = type === 'waiting_list' ? 'waiting_list_card' : type;
    const href = formTypeHref(mapped);
    if (href) window.location.href = `${href}?patientUuid=${encodeURIComponent(patientUuid)}`;
  }

  function formatDateTime(value?: string | null) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  function specialityDisplay(value?: string) {
    if (!value) return '';
    return specialityLabels[value] || specialityLabels[value.toLowerCase()] || value;
  }

  function appointmentFor(form: FormIndexItem) {
    return appointments.find((item) => item.uuid === form.form_uuid);
  }

  function isFutureAppointment(form: FormIndexItem) {
    return form.form_type === 'outpatient_appointment' && new Date(form.event_datetime) > new Date();
  }

  function needsOutcome(form: FormIndexItem) {
    const appt = appointmentFor(form);
    const matchingForm = forms.find((item) => item.form_uuid === appt?.outcome_form_uuid);
    return form.form_type === 'outpatient_appointment' && !isFutureAppointment(form) && matchingForm?.form_status !== 'final';
  }
</script>

<main class="patient-record-page">
  <header class="patient-record-header">
    <button type="button" class="patient-record-title" onclick={() => (window.location.href = 'index.html')}>Patient record</button>
    <div class="patient-record-spacer"></div>
    {#if patient}
      <FbAddressograph
        nhsNumber={patient.nhs_number || ''}
        surname={patient.surname || ''}
        forenames={patient.forenames || ''}
        title={patient.title || ''}
        addressLine1={patient.address_line1 || ''}
        addressLine2={patient.address_line2 || ''}
        addressLine3={patient.address_line3 || ''}
        addressLine4={patient.address_line4 || ''}
        crn={patient.crn || ''}
        dateOfBirth={patient.date_of_birth || ''}
        sex={patient.sex || ''}
      />
    {:else}
      <FbAddressograph />
    {/if}
  </header>

  <section class="patient-record-main" aria-label="Patient documents">
    {#if loading}
      <div class="patient-record-muted">Loading forms...</div>
    {:else if forms.length === 0}
      <div class="patient-record-muted italic">No forms recorded for this patient yet. Use the button in the bottom left corner to add a form.</div>
    {:else}
      <div class="patient-record-list">
        {#each forms as form (form.form_uuid)}
          <div class="patient-record-row">
            <div class="patient-record-badge">
              {#if form.form_type === 'outpatient_appointment'}
                {#if isFutureAppointment(form)}
                  <div class="patient-record-badge-box future">Future appt</div>
                {:else if needsOutcome(form)}
                  <div class="patient-record-badge-box overdue">Not outcomed</div>
                {/if}
              {:else if form.form_status === 'draft'}
                <FbDraftBadge />
              {/if}
            </div>
            <div>
              {#if form.form_type === 'outpatient_appointment'}
                <FbOutpatientAppointmentTile
                  dateTime={formatDateTime(form.event_datetime)}
                  clinicName={appointmentFor(form)?.clinic_name || ''}
                  speciality={specialityDisplay(form.speciality)}
                  src={form.senior_responsible_clinician || ''}
                />
              {:else}
                <FbFormTile
                  dateTime={formatDateTime(form.document_datetime || form.event_datetime)}
                  formTypeName={formTypeDisplay(form.form_type)}
                  speciality={specialityDisplay(form.speciality)}
                  src={form.senior_responsible_clinician || ''}
                />
              {/if}
            </div>
            <div class="patient-record-row-button">
              {#if form.form_type === 'outpatient_appointment'}
                {#if !isFutureAppointment(form)}
                  <FbButton type="button" onClick={() => openAppointmentOutcome(form)}>Outcome form</FbButton>
                {/if}
              {:else}
                <FbButton type="button" onClick={() => openForm(form)}>Open</FbButton>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <footer class="patient-record-footer">
    <div class="patient-record-add-wrap">
      <FbAddButtonForPage id="new-form-document-button" label="New form or document" onClick={() => (showAddMenu = !showAddMenu)} />
      {#if showAddMenu}
        <FbAddFormMenu onSelectFormType={addNewForm} onCancel={() => (showAddMenu = false)} />
      {/if}
    </div>
    <div class="patient-record-footer-right">
      <FbUserName bind:value={username} />
      <FbButton type="button" onClick={closeRecord}>Close</FbButton>
    </div>
  </footer>
</main>

<style>
  .patient-record-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .patient-record-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.4rem;
    border-bottom: 0.2rem solid var(--fb-blue);
    background: white;
    flex: 0 0 auto;
  }

  .patient-record-title {
    border: 0;
    background: transparent;
    color: black;
    cursor: pointer;
    font-size: 2rem;
    font-weight: 500;
    margin: 0;
    padding: 0;
  }

  .patient-record-spacer {
    flex: 1;
  }

  .patient-record-main {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .patient-record-muted {
    color: #666;
    font-size: 1.1rem;
  }

  .italic {
    font-style: italic;
  }

  .patient-record-list {
    display: flex;
    flex-direction: column;
  }

  .patient-record-row {
    display: grid;
    grid-template-columns: 170px 1fr auto;
    align-items: start;
    gap: 1.5rem;
    padding: 0.2rem 0;
    border-bottom: 0.1rem solid silver;
  }

  .patient-record-badge {
    display: flex;
    align-items: start;
    justify-content: flex-start;
  }

  .patient-record-badge-box {
    display: inline-block;
    padding: 0.2rem 0.4rem;
    color: white;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .future {
    background: #2e7d32;
  }

  .overdue {
    background: var(--fb-red);
  }

  .patient-record-row-button {
    min-width: 8rem;
    text-align: right;
  }

  .patient-record-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    min-height: 2.8rem;
    padding: 0.4rem 0.8rem;
    border-top: 0.2rem solid var(--fb-blue);
    background: white;
    box-sizing: border-box;
  }

  .patient-record-add-wrap {
    position: relative;
  }

  .patient-record-footer-right {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  @media (max-width: 767px) {
    .patient-record-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .patient-record-row {
      grid-template-columns: 1fr;
      gap: 0.4rem;
    }

    .patient-record-row-button {
      text-align: left;
    }
  }
</style>
