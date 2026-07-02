<script lang="ts">
  import { onMount } from 'svelte';
  import FbAddressograph from '../components/fbAddressograph.svelte';
  import FbButton from '../components/fbButton.svelte';
  import FbButtonSmaller from '../components/fbButtonSmaller.svelte';
  import FbDateExact from '../components/fbDateExact.svelte';
  import FbDropdown from '../components/fbDropdown.svelte';
  import FbMSISelector from '../components/fbMSISelector.svelte';
  import FbModal from '../components/fbModal.svelte';
  import FbQuestion from '../components/fbQuestion.svelte';
  import FbReadOnly from '../components/fbReadOnly.svelte';
  import FbToolTipUser from '../components/fbToolTipUser.svelte';
  import FbUserName from '../components/fbUserName.svelte';
  import OutpatientOutcome from './OutpatientOutcome.svelte';
  import { formatFormDate } from '../lib/dateFormat';
  import { getOutpatientOutcomes, getUsersByNadexIds, markOutpatientOutcomeActioned } from '../lib/api';

  type OutcomeRow = Record<string, any>;

  let rows: OutcomeRow[] = [];
  let visibleRows: OutcomeRow[] = [];
  let filter = { healthBoard: '', facility: '', speciality: '', src: '', srcCoded: false, srcNadexId: '', clinicName: '' };
  let showActioned = false;
  let loading = true;
  let errorModal = '';
  let username = 'demoUser';
  let actioning: OutcomeRow | null = null;
  let dateActioned = formatFormDate(new Date());
  let activeOutcome: OutcomeRow | null = null;
  let usersByNadex: Record<string, any> = {};

  function unique(key: string) {
    return Array.from(new Set(rows.map((row) => row[key]).filter(Boolean))).sort() as string[];
  }

  function matches(row: OutcomeRow, nextFilter = filter, nextShowActioned = showActioned) {
    if (!nextShowActioned && row.outcome_actioned_date) return false;
    return (!nextFilter.healthBoard || String(row.health_board || '').toLowerCase() === nextFilter.healthBoard.toLowerCase())
      && (!nextFilter.facility || String(row.facility || '').toLowerCase() === nextFilter.facility.toLowerCase())
      && (!nextFilter.speciality || String(row.speciality || '').toLowerCase() === nextFilter.speciality.toLowerCase())
      && clinicianMatches(row.senior_responsible_clinician, nextFilter.src, nextFilter.srcNadexId)
      && (!nextFilter.clinicName || String(row.clinic_name || '').toLowerCase() === nextFilter.clinicName.toLowerCase());
  }

  function clinicianMatches(rowValue: string | null | undefined, filterValue: string, filterNadexId: string) {
    if (!filterValue && !filterNadexId) return true;
    const text = String(rowValue || '').toLowerCase();
    const value = filterValue.toLowerCase();
    const nadex = filterNadexId.toLowerCase();
    if (nadex && text.includes(nadex)) return true;
    return !!value && text.includes(value);
  }

  function applyFilters(nextFilter = filter, nextShowActioned = showActioned) {
    visibleRows = rows.filter((row) => matches(row, nextFilter, nextShowActioned));
  }

  async function loadRows() {
    try {
      loading = true;
      rows = await getOutpatientOutcomes();
      applyFilters();
      setTimeout(loadUsers, 0);
    } catch (err) {
      errorModal = err instanceof Error ? err.message : String(err);
    } finally {
      loading = false;
    }
  }

  async function loadUsers() {
    const ids = Array.from(new Set(rows.map((row) => row.outcome_actioned_user_id).filter(Boolean))) as string[];
    if (!ids.length) return;
    try {
      const users = await getUsersByNadexIds(ids);
      usersByNadex = Object.fromEntries(users.map((user) => [user.nadexId, user]));
    } catch {
      // Tooltip enrichment should not block the page.
    }
  }

  function displayDate(value: string | null | undefined) {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatFormDate(`${value.slice(0, 10)}T00:00:00`);
    return value;
  }

  function displayTime(row: OutcomeRow) {
    if (row.appointment_time) return row.appointment_time;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(row.appointment_datetime || '')) return row.appointment_datetime.slice(11, 16);
    return '';
  }

  async function confirmActioned() {
    if (!actioning) return;
    try {
      const updated = await markOutpatientOutcomeActioned(actioning.appointment_uuid, dateActioned, username);
      rows = rows.map((row) => row.appointment_uuid === updated.appointment_uuid ? { ...row, ...updated } : row);
      visibleRows = visibleRows.map((row) => row.appointment_uuid === updated.appointment_uuid ? { ...row, ...updated } : row);
      actioning = null;
      await loadUsers();
    } catch (err) {
      errorModal = err instanceof Error ? err.message : String(err);
    }
  }

  onMount(loadRows);
</script>

{#if activeOutcome}
  <OutpatientOutcome patientUuid={activeOutcome.patient_uuid} formUuid={activeOutcome.outcome_form_uuid} openInRoV readOnlyBackOnly inline onClose={() => (activeOutcome = null)} />
{:else}
<main class="oo-list-page">
  <header>
    <div class="kicker">NHS Wales</div>
    <h1>Outpatient outcomes</h1>
    <label><input type="checkbox" bind:checked={showActioned} on:change={() => applyFilters(filter, showActioned)} /> Show actioned outcomes</label>
  </header>
  <section class="body">
    <fieldset class="filters">
      <legend>Filter</legend>
      <div class="filter-grid">
        <FbDropdown label="Health board" value={filter.healthBoard} options={[{ value: '', label: 'All' }, ...unique('health_board').map((value) => ({ value, label: value }))]} onChange={(value) => { filter = { ...filter, healthBoard: value }; applyFilters(); }} />
        <FbDropdown label="Facility" value={filter.facility} options={[{ value: '', label: 'All' }, ...unique('facility').map((value) => ({ value, label: value }))]} onChange={(value) => { filter = { ...filter, facility: value }; applyFilters(); }} />
        <FbDropdown label="Speciality" value={filter.speciality} options={[{ value: '', label: 'All' }, ...unique('speciality').map((value) => ({ value, label: value }))]} onChange={(value) => { filter = { ...filter, speciality: value }; applyFilters(); }} />
        <FbMSISelector
          label="Senior responsible clinician"
          name="outpatient-outcomes-src-filter"
          value={filter.src}
          coded={filter.src ? filter.srcCoded : undefined}
          onChange={(value, coded, nadexId) => { filter = { ...filter, src: value, srcCoded: coded, srcNadexId: nadexId || '' }; applyFilters(); }}
        />
        <FbDropdown label="Clinic name" value={filter.clinicName} options={[{ value: '', label: 'All' }, ...unique('clinic_name').map((value) => ({ value, label: value }))]} onChange={(value) => { filter = { ...filter, clinicName: value }; applyFilters(); }} />
      </div>
    </fieldset>
    {#if loading}
      <div>Loading outcomes...</div>
    {:else}
      <table>
        <thead><tr><th class="nowrap">Appointment</th><th>Clinic</th><th>Patient</th><th>Actioned</th><th class="nowrap"></th></tr></thead>
        <tbody>
          {#each visibleRows as row}
            <tr>
              <td class="nowrap compact-col">{displayDate(row.appointment_datetime || row.appointment_date)}<br />{displayTime(row)}</td>
              <td class="wrapping-cell">{row.clinic_name || ''}<br />{row.speciality || ''}<br />{row.senior_responsible_clinician || ''}<br />{row.facility || ''}</td>
              <td class="addressograph-cell">
                <FbAddressograph
                  nhsNumber={row.nhs_number || ''}
                  surname={row.surname || ''}
                  forenames={row.forenames || ''}
                  title={row.title || ''}
                  hospitalNumber={row.hospital_number || ''}
                  dateOfBirth={row.date_of_birth || ''}
                  sex={row.sex || ''}
                />
              </td>
              <td class="wrapping-cell">
                {#if row.outcome_actioned_date}
                  {displayDate(row.outcome_actioned_date)}<br />
                  {#if usersByNadex[row.outcome_actioned_user_id]}<FbToolTipUser user={usersByNadex[row.outcome_actioned_user_id]} />{:else}{row.outcome_actioned_user_id}{/if}
                {/if}
              </td>
              <td class="nowrap compact-col">
                <div class="row-actions">
                  <FbButtonSmaller onClick={() => (activeOutcome = row)}>Outcome form</FbButtonSmaller>
                  <FbButtonSmaller disabled={row.outcome_form_status !== 'final'} onClick={() => { actioning = row; dateActioned = formatFormDate(new Date()); }}>Actioned</FbButtonSmaller>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if visibleRows.length === 0}<div class="empty">No outpatient outcomes match the current filters.</div>{/if}
    {/if}
  </section>
  <footer>
    <FbUserName bind:value={username} />
    <FbButton onClick={() => (window.location.href = 'index.html')}>Back</FbButton>
  </footer>
</main>
{/if}

{#if errorModal}
  <FbModal title="Error">
    <div class="modal-message">{errorModal}</div>
    <div class="modal-footer"><FbButton variant="success" onClick={() => (errorModal = '')}>Ok</FbButton></div>
  </FbModal>
{/if}

{#if actioning}
  <FbModal title="Confirm actioned">
    <FbReadOnly label="User id" value={username} />
    <FbQuestion label="Date actioned" required>
      <FbDateExact name="dateActioned" value={dateActioned} onChange={(value) => (dateActioned = value)} required />
    </FbQuestion>
    <div class="modal-footer">
      <FbButton variant="success" onClick={confirmActioned}>Confirm actioned</FbButton>
      <FbButton variant="danger" onClick={() => (actioning = null)}>Cancel</FbButton>
    </div>
  </FbModal>
{/if}

<style>
  .oo-list-page { height: 100vh; background: white; display: flex; flex-direction: column; }
  header { border-bottom: 0.2rem solid #1b6ec2; padding: 1rem 1rem 0.55rem; }
  .kicker { font-size: 1rem; font-weight: 300; line-height: 1.05; }
  h1 { margin: 0 0 0.7rem; font-size: 2rem; font-weight: 500; line-height: 1.05; }
  .body { flex: 1; overflow-y: auto; padding: 0.8rem 1rem; }
  .filters { border: 0.1rem solid silver; border-radius: 0.4rem; padding: 0.65rem; margin-bottom: 0.8rem; }
  .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 0.6rem; }
  table { width: 100%; table-layout: auto; border-collapse: collapse; }
  th, td { border: 0.1rem solid silver; padding: 0.35rem; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
  th { background: #1b6ec2; color: white; font-weight: 500; }
  .nowrap { white-space: nowrap; }
  .compact-col { width: 1%; }
  .addressograph-cell { width: 63.6mm; min-width: 63.6mm; }
  .wrapping-cell { min-width: 0; }
  .row-actions { display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem; }
  footer { display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; min-height: 2.8rem; padding: 0.4rem 0.8rem; border-top: 0.2rem solid #1b6ec2; box-sizing: border-box; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
  .modal-message { max-width: 42rem; overflow-wrap: anywhere; }
  .empty { padding: 0.8rem; }
</style>
