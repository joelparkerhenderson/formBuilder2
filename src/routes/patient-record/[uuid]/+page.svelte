<script lang="ts">
  import { base } from '$app/paths';
  import { invalidateAll } from '$app/navigation';
  import FbAddButtonForPage from '$lib/components/fb/fbAddButtonForPage.svelte';
  import FbAddFormMenu from '$lib/components/fb/fbAddFormMenu.svelte';
  import FbAddressograph from '$lib/components/fb/fbAddressograph.svelte';
  import FbBadgeDraft from '$lib/components/fb/fbBadgeDraft.svelte';
  import FbBadgeHighlySensitive from '$lib/components/fb/fbBadgeHighlySensitive.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbFormTile from '$lib/components/fb/fbFormTile.svelte';
  import FbOutpatientAppointmentTile from '$lib/components/fb/fbOutpatientAppointmentTile.svelte';
  import FbUserName from '$lib/components/fb/fbUserName.svelte';
  import { specialities } from '$lib/data/specialities';
  import type { FormIndexItem, OutpatientAppointment, Patient } from '$lib/types';
  import { openHrefWithReturn, returnByHref } from '$lib/utils/fbHrefNavigation';

  type PageData = {
    patient: Patient | null;
    forms: FormIndexItem[];
    appointments: OutpatientAppointment[];
    loadError: string;
  };

  let { data }: { data: PageData } = $props();

  let username = $state('demoUser');
  let showAddMenu = $state(false);
  let addButtonElement = $state<HTMLButtonElement | undefined>();
  let selectedFormMessage = $state('');

  const patient = $derived(data.patient);
  const forms = $derived(data.forms || []);
  const appointments = $derived(data.appointments || []);

  $effect(() => {
    const params = new URLSearchParams(window.location.search);
    username = params.get('username') || sessionStorage.getItem('fbUserName') || username;
    sessionStorage.setItem('fb_prev_main_page', `${base}/patient-record/${patient?.uuid || ''}`);
    if (patient?.uuid) sessionStorage.setItem('fb_prev_patient_uuid', patient.uuid);
  });

  function getFormTypeDisplay(type: string) {
    if (type === 'waiting_list_card') return 'Waiting list card';
    if (type === 'operation_note') return 'Operation note';
    if (type === 'outpatient_outcome') return 'Outpatient outcome';
    if (type === 'treatment_summary') return 'Treatment summary';
    if (type === 'cardiology_test_request') return 'Cardiology test request';
    if (type === 'outpatient_appointment') return 'Outpatient appointment';
    return type;
  }

  function getSpecialityDisplay(specVal?: string) {
    if (!specVal) return '';
    const found = specialities.find((speciality) => speciality.value === specVal || speciality.value.toLowerCase() === specVal.toLowerCase());
    return found ? found.label : specVal;
  }

  function formatDateTime(isoString?: string | null) {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate().toString().padStart(2, '0');
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
      return isoString;
    }
  }

  function appointmentFor(form: FormIndexItem) {
    return appointments.find((appointment) => appointment.uuid === form.form_uuid);
  }

  function isFutureAppointment(form: FormIndexItem) {
    return form.form_type === 'outpatient_appointment' && new Date(form.event_datetime) > new Date();
  }

  function appointmentNeedsOutcome(form: FormIndexItem) {
    const appointment = appointmentFor(form);
    const outcomeFormUuid = appointment?.outcome_form_uuid;
    const matchingFormStatus = forms.find((candidate) => candidate.form_uuid === outcomeFormUuid)?.form_status;
    return !isFutureAppointment(form) && matchingFormStatus !== 'final';
  }

  function openForm(form: FormIndexItem) {
    if (form.form_type === 'waiting_list_card') {
      openHrefWithReturn(`${base}/waiting-list-card?patientUuid=${encodeURIComponent(form.patient_uuid)}&formUuid=${encodeURIComponent(form.form_uuid)}&openInRoV=true&readOnlyBackOnly=true&username=${encodeURIComponent(username)}`);
      return;
    }
    if (form.form_type === 'operation_note') {
      openHrefWithReturn(`${base}/operation-note?patientUuid=${encodeURIComponent(form.patient_uuid)}&formUuid=${encodeURIComponent(form.form_uuid)}&openInRoV=true&readOnlyBackOnly=true&username=${encodeURIComponent(username)}`);
      return;
    }
    if (form.form_type === 'treatment_summary') {
      openHrefWithReturn(`${base}/treatment-summary?patientUuid=${encodeURIComponent(form.patient_uuid)}&formUuid=${encodeURIComponent(form.form_uuid)}&openInRoV=true&readOnlyBackOnly=true&username=${encodeURIComponent(username)}`);
      return;
    }
    if (form.form_type === 'outpatient_outcome') {
      openHrefWithReturn(`${base}/outpatient-outcome?patientUuid=${encodeURIComponent(form.patient_uuid)}&formUuid=${encodeURIComponent(form.form_uuid)}&openInRoV=true&readOnlyBackOnly=true&username=${encodeURIComponent(username)}`);
      return;
    }
    if (form.form_type === 'cardiology_test_request') {
      openHrefWithReturn(`${base}/cardiology-test-request?patientUuid=${encodeURIComponent(form.patient_uuid)}&formUuid=${encodeURIComponent(form.form_uuid)}&openInRoV=true&readOnlyBackOnly=true&username=${encodeURIComponent(username)}`);
      return;
    }
    selectedFormMessage = `The ${getFormTypeDisplay(form.form_type)} renderer has not yet been translated into the new SvelteKit tree.`;
  }

  function openOutcome(form: FormIndexItem) {
    const appointment = appointmentFor(form);
    if (!appointment) {
      selectedFormMessage = 'Appointment details are not available.';
      return;
    }
    const params = new URLSearchParams({
      patientUuid: patient?.uuid || form.patient_uuid,
      username
    });
    if (appointment.outcome_form_uuid) {
      params.set('formUuid', appointment.outcome_form_uuid);
      params.set('openInRoV', 'true');
      params.set('readOnlyBackOnly', 'true');
    } else if (appointment.uuid) {
      params.set('appointmentUuid', appointment.uuid);
    }
    openHrefWithReturn(`${base}/outpatient-outcome?${params.toString()}`);
  }

  function handleAddNewForm(formType: string) {
    showAddMenu = false;
    if (formType === 'waiting_list') {
      openHrefWithReturn(`${base}/waiting-list-card?patientUuid=${encodeURIComponent(patient?.uuid || '')}&username=${encodeURIComponent(username)}`);
      return;
    }
    if (formType === 'operation_note') {
      openHrefWithReturn(`${base}/operation-note?patientUuid=${encodeURIComponent(patient?.uuid || '')}&username=${encodeURIComponent(username)}`);
      return;
    }
    if (formType === 'treatment_summary') {
      openHrefWithReturn(`${base}/treatment-summary?patientUuid=${encodeURIComponent(patient?.uuid || '')}&username=${encodeURIComponent(username)}`);
      return;
    }
    if (formType === 'outpatient_outcome') {
      openHrefWithReturn(`${base}/outpatient-outcome?patientUuid=${encodeURIComponent(patient?.uuid || '')}&username=${encodeURIComponent(username)}`);
      return;
    }
    if (formType === 'cardiology_test_request') {
      openHrefWithReturn(`${base}/cardiology-test-request?patientUuid=${encodeURIComponent(patient?.uuid || '')}&username=${encodeURIComponent(username)}`);
      return;
    }
    const display = getFormTypeDisplay(formType === 'waiting_list' ? 'waiting_list_card' : formType);
    selectedFormMessage = `New ${display} is waiting for the form renderer translation.`;
  }

  function handleClose() {
    returnByHref(`${base}/patient-registry`);
  }
</script>

<main class="patient-record-page">
  <section id="patient-record-page-container" class="patient-record-container">
    <header class="patient-record-header">
      <a class="patient-record-title" href={`${base}/`}>Patient record</a>
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
          hospitalNumber={patient.hospital_number || ''}
          dateOfBirth={patient.date_of_birth || ''}
          sex={patient.sex || ''}
        />
      {:else}
        <FbAddressograph />
      {/if}
    </header>

    <section class="patient-record-main" aria-label="Patient documents">
      {#if data.loadError}
        <div class="patient-record-muted" role="alert">{data.loadError}</div>
      {:else if selectedFormMessage}
        <div class="patient-record-message" role="status">
          <p>{selectedFormMessage}</p>
          <FbButton variant="primary" onclick={() => { selectedFormMessage = ''; invalidateAll(); }}>Back to record</FbButton>
        </div>
      {:else if forms.length === 0}
        <div class="patient-record-muted italic">No forms recorded for this patient yet. Use the button in the bottom left corner to add a form.</div>
      {:else}
        <div class="patient-record-list">
          {#each forms as form, index (`${form.form_uuid || form.form_type || 'form'}-${index}`)}
            {@const isAppointment = form.form_type === 'outpatient_appointment'}
            {@const appointment = isAppointment ? appointmentFor(form) : null}
            <article class="patient-record-row">
              <div class="patient-record-badge-cell">
                {#if isAppointment}
                  {#if isFutureAppointment(form)}
                    <div class="patient-record-status-badge future">Future appt</div>
                  {:else if appointmentNeedsOutcome(form)}
                    <div class="patient-record-status-badge missing-outcome">Not outcomed</div>
                  {/if}
                {:else if form.form_status === 'draft' || form.highly_sensitive}
                  <div class="patient-record-badge-stack">
                    {#if form.form_status === 'draft'}<FbBadgeDraft />{/if}
                    {#if form.highly_sensitive}<FbBadgeHighlySensitive />{/if}
                  </div>
                {/if}
              </div>

              <div class="patient-record-tile-cell">
                {#if isAppointment}
                  <FbOutpatientAppointmentTile
                    dateTime={formatDateTime(form.event_datetime)}
                    clinicName={appointment?.clinic_name || ''}
                    speciality={getSpecialityDisplay(form.speciality)}
                    src={form.senior_responsible_clinician || ''}
                  />
                {:else}
                  <FbFormTile
                    dateTime={formatDateTime(form.document_datetime || form.event_datetime)}
                    formTypeName={getFormTypeDisplay(form.form_type)}
                    speciality={getSpecialityDisplay(form.speciality)}
                    src={form.senior_responsible_clinician || ''}
                    highlySensitive={!!form.highly_sensitive}
                  />
                {/if}
              </div>

              <div class="patient-record-action-cell">
                {#if isAppointment}
                  {#if !isFutureAppointment(form)}
                    <FbButton variant="primary" id={`outcome-btn-${form.form_uuid}`} onclick={() => openOutcome(form)}>Outcome form</FbButton>
                  {/if}
                {:else}
                  <FbButton variant="primary" id={`open-btn-${form.form_uuid}`} onclick={() => openForm(form)}>Open</FbButton>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>

    <footer class="patient-record-footer bottom-control-bar">
      <div class="patient-record-add-wrapper">
        <FbAddButtonForPage
          id="new-form-document-button"
          label="New form or document"
          onclick={() => showAddMenu = !showAddMenu}
          bind:element={addButtonElement}
        />
        {#if showAddMenu}
          <FbAddFormMenu
            anchor={addButtonElement}
            onSelectFormType={handleAddNewForm}
            onCancel={() => showAddMenu = false}
          />
        {/if}
      </div>
      <div class="patient-record-footer-right">
        <FbUserName bind:value={username} />
        <FbButton variant="primary" id="patient-record-close-button" onclick={handleClose}>Close</FbButton>
      </div>
    </footer>
  </section>
</main>

<style>
  .patient-record-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Roboto', sans-serif;
    background-color: white;
  }

  .patient-record-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .patient-record-header {
    border-bottom: 0.2rem solid rgb(27 110 194);
    padding: 0.4rem;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .patient-record-title {
    font-size: 2rem;
    font-weight: 500;
    margin: 0;
    cursor: pointer;
    color: black;
    text-decoration: none;
  }

  .patient-record-spacer {
    flex: 1;
  }

  .patient-record-main {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .patient-record-muted {
    font-size: 1.1rem;
    color: #666;
  }

  .italic {
    font-style: italic;
  }

  .patient-record-message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    color: #333;
  }

  .patient-record-list {
    display: flex;
    flex-direction: column;
  }

  .patient-record-row {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr) auto;
    align-items: start;
    gap: 1.5rem;
    border-bottom: 1px solid silver;
    padding: 0.2rem 0;
  }

  .patient-record-badge-cell {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    min-height: 1.5rem;
  }

  .patient-record-status-badge {
    color: white;
    font-weight: 700;
    padding: 0.2rem 0.4rem;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    display: inline-block;
    line-height: 1.2;
  }

  .patient-record-status-badge.future {
    background-color: #2e7d32;
  }

  .patient-record-status-badge.missing-outcome {
    background-color: #d50000;
  }

  .patient-record-badge-stack {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .patient-record-tile-cell {
    min-width: 0;
  }

  .patient-record-action-cell {
    display: flex;
    justify-content: flex-end;
  }

  .patient-record-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.8rem;
    background-color: white;
    border-top: 0.2rem solid rgb(27 110 194);
    min-height: 2.8rem;
    box-sizing: border-box;
    z-index: 100;
  }

  .patient-record-add-wrapper {
    position: relative;
  }

  .patient-record-footer-right {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  @media (max-width: 780px) {
    .patient-record-header {
      align-items: flex-start;
      gap: 0.8rem;
    }

    .patient-record-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
      padding: 0.7rem 0;
    }

    .patient-record-action-cell {
      justify-content: flex-start;
    }
  }
</style>
