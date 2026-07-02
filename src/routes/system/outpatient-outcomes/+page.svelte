<script lang="ts">
  import { onMount } from 'svelte';
  import FbAddressograph from '$lib/components/fb/fbAddressograph.svelte';
  import FbButton from '$lib/components/fb/fbButton.svelte';
  import FbButtonSmaller from '$lib/components/fb/fbButtonSmaller.svelte';
  import FbDateExact from '$lib/components/fb/fbDateExact.svelte';
  import FbDropdown from '$lib/components/fb/fbDropdown.svelte';
  import FbHBSelector from '$lib/components/fb/fbHBSelector.svelte';
  import FbMSISelector from '$lib/components/fb/fbMSISelector.svelte';
  import FbModal from '$lib/components/fb/fbModal.svelte';
  import FbModalActions from '$lib/components/fb/FbModalActions.svelte';
  import FbModalMessage from '$lib/components/fb/FbModalMessage.svelte';
  import FbQuestion from '$lib/components/fb/fbQuestion.svelte';
  import FbReadOnly from '$lib/components/fb/fbReadOnly.svelte';
  import FbSmartDropdown from '$lib/components/fb/fbSmartDropdown.svelte';
  import FbTable from '$lib/components/fb/fbTable.svelte';
  import FbTableBody from '$lib/components/fb/fbTableBody.svelte';
  import FbTableCell from '$lib/components/fb/fbTableCell.svelte';
  import FbTableHeader from '$lib/components/fb/fbTableHeader.svelte';
  import FbTableHeaderCell from '$lib/components/fb/fbTableHeaderCell.svelte';
  import FbTableRow from '$lib/components/fb/fbTableRow.svelte';
  import FbToolTipUser from '$lib/components/fb/fbToolTipUser.svelte';
  import FbUserName from '$lib/components/fb/fbUserName.svelte';
  import OutpatientOutcome from '../../outpatient-outcome/+page.svelte';
  import { specialities } from '$lib/data/specialities';
  import { formatFormDate } from '$lib/utils/dateFormat';
  import { getOutpatientOutcomes, getUsersByNadexIds, markOutpatientOutcomeActioned } from '$lib/api/legacy';
  import { createInitialCntStore } from '$lib/caseNoteTracker/cntStore';

  type OutcomeRow = Record<string, any>;

  let rows: OutcomeRow[] = $state([]);
  let visibleRows: OutcomeRow[] = $state([]);
  let filter = $state({ healthBoard: '', facility: '', speciality: '', src: '', srcCoded: false, srcNadexId: '', clinicName: '' });
  let showActioned = $state(false);
  let loading = $state(true);
  let errorModal = $state('');
  let username = $state('demoUser');
  let actioning: OutcomeRow | null = $state(null);
  let dateActioned = $state(formatFormDate(new Date()));
  let activeOutcome: OutcomeRow | null = $state(null);
  let usersByNadex: Record<string, any> = $state({});
  const cntLocations = createInitialCntStore().locations;
  const cntHealthBoardOptions = Array.from(new Set(cntLocations.map((location) => location.healthBoard).filter(Boolean))).sort();

  function unique(key: string) {
    return Array.from(new Set(rows.map((row) => row[key]).filter(Boolean))).sort() as string[];
  }

  function cntFacilityOptions(healthBoard: string) {
    return Array.from(new Set(cntLocations
      .filter((location) => !healthBoard || location.healthBoard === healthBoard)
      .map((location) => location.facility)
      .filter(Boolean)))
      .sort();
  }

  function updateHealthBoardFilter(healthBoard: string) {
    const facilities = cntFacilityOptions(healthBoard);
    const facility = filter.facility && facilities.includes(filter.facility) ? filter.facility : '';
    filter = { ...filter, healthBoard, facility };
    applyFilters();
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

  function displayClinicianName(value: string | null | undefined) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const withoutCodes = raw.replace(/\([^)]*(?:GMC|NADEX|NMC|GDC|HCPC)[^)]*\)/gi, '').replace(/\s+/g, ' ').trim();
    const parts = withoutCodes.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const surname = parts[0].toLocaleUpperCase('en-GB');
      const firstName = parts[1].replace(/\([^)]*\)/g, '').trim().split(/\s+/)[0] || '';
      const titleSource = parts.slice(2).join(' ') || (parts[1].match(/\(([^)]+)\)/)?.[1] || '');
      const title = titleSource.replace(/\([^)]*\)/g, '').trim().split(/\s+/)[0] || '';
      return `${surname}${firstName ? `, ${firstName}` : ''}${title ? ` (${title})` : ''}`;
    }
    return raw;
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
    const appointmentUuid = actioning.appointment_uuid || actioning.uuid;
    if (!appointmentUuid) {
      errorModal = 'Appointment UUID is missing for this outcome row.';
      return;
    }
    try {
      const updated = await markOutpatientOutcomeActioned(appointmentUuid, dateActioned, username);
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
    <label><input type="checkbox" bind:checked={showActioned} onchange={() => applyFilters(filter, showActioned)} /> Show actioned outcomes</label>
  </header>
  <section class="body">
    <fieldset class="filters">
      <legend>Filter</legend>
      <div class="filter-grid">
        <FbHBSelector label="Health board" value={filter.healthBoard} options={[{ value: '', label: 'All' }, ...cntHealthBoardOptions.map((value) => ({ value, label: value }))]} onChange={updateHealthBoardFilter} />
        <FbDropdown label="Facility" value={filter.facility} options={[{ value: '', label: 'All' }, ...cntFacilityOptions(filter.healthBoard).map((value) => ({ value, label: value }))]} onChange={(value) => { filter = { ...filter, facility: value }; applyFilters(); }} />
        <FbSmartDropdown label="Speciality" value={filter.speciality} options={[{ value: '', label: 'All' }, ...specialities]} onChange={(value) => { filter = { ...filter, speciality: value }; applyFilters(); }} />
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
      <FbTable style="table-layout: auto; width: 100%;">
        <colgroup>
          <col class="compact-col-width" />
          <col />
          <col class="patient-col-width" />
          <col class="actioned-col-width" />
          <col class="compact-col-width" />
        </colgroup>
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell class="nowrap">Appointment</FbTableHeaderCell>
            <FbTableHeaderCell class="clinic-cell">Clinic</FbTableHeaderCell>
            <FbTableHeaderCell class="addressograph-cell">Patient</FbTableHeaderCell>
            <FbTableHeaderCell class="actioned-col-width">Actioned</FbTableHeaderCell>
            <FbTableHeaderCell class="nowrap"></FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {#each visibleRows as row}
            <FbTableRow>
              <FbTableCell class="nowrap compact-col">{displayDate(row.appointment_datetime || row.appointment_date)}<br />{displayTime(row)}</FbTableCell>
              <FbTableCell class="clinic-cell">{row.clinic_name || ''}<br />{row.speciality || ''}<br />{displayClinicianName(row.senior_responsible_clinician)}<br />{row.facility || ''}</FbTableCell>
              <FbTableCell class="addressograph-cell">
                <FbAddressograph
                  nhsNumber={row.nhs_number || ''}
                  surname={row.surname || ''}
                  forenames={row.forenames || ''}
                  title={row.title || ''}
                  hospitalNumber={row.hospital_number || ''}
                  dateOfBirth={row.date_of_birth || ''}
                  sex={row.sex || ''}
                />
              </FbTableCell>
              <FbTableCell class="wrapping-cell actioned-col-width">
                {#if row.outcome_actioned_date}
                  {displayDate(row.outcome_actioned_date)}<br />
                  {#if usersByNadex[row.outcome_actioned_user_id]}<FbToolTipUser user={usersByNadex[row.outcome_actioned_user_id]} />{:else}{row.outcome_actioned_user_id}{/if}
                {/if}
              </FbTableCell>
              <FbTableCell class="nowrap compact-col">
                <div class="row-actions">
                  <FbButtonSmaller onclick={() => (activeOutcome = row)}>Outcome form</FbButtonSmaller>
                  <FbButtonSmaller disabled={row.outcome_form_status !== 'final'} onclick={() => { actioning = row; dateActioned = formatFormDate(new Date()); }}>Actioned</FbButtonSmaller>
                </div>
              </FbTableCell>
            </FbTableRow>
          {/each}
        </FbTableBody>
      </FbTable>
      {#if visibleRows.length === 0}<div class="empty">No outpatient outcomes match the current filters.</div>{/if}
    {/if}
  </section>
  <footer>
    <FbUserName bind:value={username} />
    <FbButton onClick={() => (window.location.href = '/formBuilder2/')}>Back</FbButton>
  </footer>
</main>
{/if}

{#if errorModal}
  <FbModal title="Error" onEscape={() => (errorModal = '')}>
    <FbModalMessage>{errorModal}</FbModalMessage>
    <FbModalActions><FbButton variant="success" onClick={() => (errorModal = '')}>Ok</FbButton></FbModalActions>
  </FbModal>
{/if}

{#if actioning}
  <FbModal title="Confirm actioned" onEscape={() => (actioning = null)}>
    <FbReadOnly label="User id" value={username} />
    <FbQuestion label="Date actioned" required>
      <FbDateExact name="dateActioned" value={dateActioned} onChange={(value) => (dateActioned = value)} required />
    </FbQuestion>
    <FbModalActions>
      <FbButton variant="success" onClick={confirmActioned}>Confirm actioned</FbButton>
      <FbButton variant="danger" onClick={() => (actioning = null)}>Cancel</FbButton>
    </FbModalActions>
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
  :global(.oo-list-page .fb-table) { table-layout: auto; width: 100%; }
  :global(.oo-list-page .fb-table td) { border: 0; border-bottom: 0.1rem solid silver; padding: 0.35rem; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
  :global(.oo-list-page .nowrap) { white-space: nowrap; }
  :global(.oo-list-page .compact-col) { width: 1%; }
  :global(.oo-list-page .compact-col-width) { width: 1%; }
  :global(.oo-list-page .actioned-col-width) { width: 100%; }
  :global(.oo-list-page .clinic-cell) { white-space: nowrap; overflow-wrap: normal; }
  :global(.oo-list-page .patient-col-width) { width: 90mm; }
  :global(.oo-list-page .addressograph-cell) { width: 90mm; min-width: 90mm; max-width: 90mm; }
  :global(.oo-list-page .wrapping-cell) { min-width: 0; white-space: normal; overflow-wrap: anywhere; }
  .row-actions { display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem; }
  footer { display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; min-height: 2.8rem; padding: 0.4rem 0.8rem; border-top: 0.2rem solid #1b6ec2; box-sizing: border-box; }
  .empty { padding: 0.8rem; }
</style>
