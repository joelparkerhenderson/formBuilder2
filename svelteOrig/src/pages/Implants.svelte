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
  import { healthBoards, specialityValuesForHealthBoard } from '../lib/clinicalDestinations';
  import { getImplants, markImplantRemoved } from '../lib/api';
  import { formatFormDate } from '../lib/dateFormat';
  import { organisationLabels, specialityLabels } from '../lib/constants';

  type ImplantRow = Record<string, any>;

  let rows: ImplantRow[] = [];
  let loading = true;
  let errorModal = '';
  let showRemoved = false;
  let showNoRemoval = false;
  let filter = { healthBoard: '', speciality: '', src: '', srcCoded: false, srcNadexId: '' };
  let removing: ImplantRow | null = null;
  let dateRemoved = formatFormDate(new Date());

  async function loadRows() {
    try {
      loading = true;
      rows = await getImplants();
    } catch (err) {
      errorModal = err instanceof Error ? err.message : String(err);
    } finally {
      loading = false;
    }
  }

  function unique(values: Array<string | null | undefined>) {
    return Array.from(new Set(values.filter(Boolean) as string[])).sort();
  }

  function displayDate(value: string | null | undefined) {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatFormDate(`${value.slice(0, 10)}T00:00:00`);
    return value;
  }

  function srcDisplay(value: string | null | undefined) {
    return String(value || '').replace(/\s*-\s*NADEX\s*:\s*[A-Za-z0-9._-]+\s*$/i, '').trim();
  }

  $: visibleRows = rows.filter((row) => {
    if (!showRemoved && row.date_removed) return false;
    if (!showNoRemoval && !row.remove_by_date && !row.remove_by_display) return false;
    if (filter.healthBoard && row.health_board !== filter.healthBoard) return false;
    if (filter.speciality && row.speciality !== filter.speciality) return false;
    if (filter.src || filter.srcNadexId) {
      const rowText = String(row.surgeon_src_text || '').toLowerCase();
      const rowId = String(row.surgeon_src_nadex_id || '').toLowerCase();
      const filterText = filter.src.toLowerCase();
      const filterId = filter.srcNadexId.toLowerCase();
      if (filterId ? rowId !== filterId : !(rowText.includes(filterText) || rowId.includes(filterText))) return false;
    }
    return true;
  });
  $: specialityFilterOptions = Object.entries(specialityLabels)
    .filter(([value]) => specialityValuesForHealthBoard(filter.healthBoard).includes(value))
    .map(([value, label]) => ({ value, label }));

  function updateHealthBoardFilter(value: string) {
    const allowedValues = specialityValuesForHealthBoard(value);
    filter = {
      ...filter,
      healthBoard: value,
      speciality: !filter.speciality || allowedValues.includes(filter.speciality) ? filter.speciality : '',
    };
  }

  async function confirmRemoved() {
    if (!removing) return;
    try {
      await markImplantRemoved(removing.id, dateRemoved);
      rows = rows.map((row) => row.id === removing?.id ? { ...row, date_removed: dateRemoved } : row);
      removing = null;
      await loadRows();
    } catch (err) {
      errorModal = err instanceof Error ? err.message : String(err);
    }
  }

  onMount(loadRows);
</script>

<main class="implant-registry-page">
  <header class="page-header">
    <div class="kicker">NHS Wales</div>
    <h1>Implant registry</h1>
    <div class="top-options">
    <label><input type="checkbox" bind:checked={showRemoved} /> Show removed implants</label>
    <label><input type="checkbox" bind:checked={showNoRemoval} /> Show implants that do not need to be removed</label>
    </div>
  </header>
  <section class="page-body">
    <fieldset class="filters">
      <legend>Filter</legend>
      <div class="filter-grid">
        <FbDropdown label="Health board" value={filter.healthBoard} options={[{ value: '', label: 'All' }, ...healthBoards.map(({ value, label }) => ({ value, label }))]} onChange={updateHealthBoardFilter} />
        <FbDropdown label="Speciality" value={filter.speciality} options={[{ value: '', label: 'All' }, ...specialityFilterOptions]} onChange={(value) => (filter = { ...filter, speciality: value })} />
        <FbMSISelector
          label="Senior responsible clinician"
          name="implant-registry-src-filter"
          value={filter.src}
          coded={filter.src ? filter.srcCoded : undefined}
          onChange={(value, coded, nadexId) => (filter = { ...filter, src: value, srcCoded: coded, srcNadexId: nadexId || '' })}
        />
      </div>
    </fieldset>
    {#if loading}
      <div>Loading implants...</div>
    {:else}
      <table>
        <thead>
          <tr>
            <th class="nowrap">Inserted</th>
            <th>Patient</th>
            <th>Implant</th>
            <th>Removal</th>
            <th class="nowrap"></th>
          </tr>
        </thead>
        <tbody>
          {#each visibleRows as row}
            <tr>
              <td class="nowrap compact-col">{displayDate(row.date_inserted)}</td>
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
              <td class="implant-cell">
                <strong>{row.implant_id || ''}</strong><br />{row.implant_description || ''}
                <details>
                  <summary>Traceability</summary>
                  <div>Operation note {row.operation_note_uuid}</div>
                  <div>Version {row.operation_note_version}</div>
                  <div>Implant row {row.operation_note_implant_row_uuid}</div>
                </details>
                <details>
                  <summary>Clinical context</summary>
                  <div>{row.health_board_text || organisationLabels[row.health_board] || row.health_board || ''}</div>
                  {#if row.facility_text}<div>{row.facility_text}</div>{/if}
                  <div>{specialityLabels[row.speciality] || row.speciality || ''}</div>
                  {#if srcDisplay(row.surgeon_src_text)}<div>{srcDisplay(row.surgeon_src_text)}</div>{/if}
                </details>
              </td>
              <td class="wrapping-cell">
                {row.remove_by_display || displayDate(row.remove_by_date) || 'Not required'}
                {#if row.remove_by_display && row.remove_by_date && row.remove_by_display !== row.remove_by_date}<br /><small>Sorts as {displayDate(row.remove_by_date)}</small>{/if}
                {#if row.date_removed}<br />Removed {displayDate(row.date_removed)}{/if}
              </td>
              <td class="nowrap compact-col"><FbButtonSmaller disabled={!!row.date_removed} onClick={() => { removing = row; dateRemoved = formatFormDate(new Date()); }}>Remove</FbButtonSmaller></td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if visibleRows.length === 0}<div class="empty">No implants match the current filters.</div>{/if}
    {/if}
  </section>
  <footer class="page-footer">
    <FbButton variant="primary" onClick={() => { window.location.href = 'index.html'; }}>Back</FbButton>
  </footer>
</main>

{#if errorModal}
  <FbModal title="Error">
    <div class="modal-message">{errorModal}</div>
    <div class="modal-footer">
      <FbButton variant="success" onClick={() => (errorModal = '')}>Ok</FbButton>
    </div>
  </FbModal>
{/if}

{#if removing}
  <FbModal title="Confirm removed">
    <FbReadOnly label="Implant" value={`${removing.implant_id || ''} ${removing.implant_description || ''}`.trim()} />
    <FbQuestion label="Date implant removed" required>
      <FbDateExact name="dateRemoved" value={dateRemoved} onChange={(value) => (dateRemoved = value)} required />
    </FbQuestion>
    <div class="modal-footer">
      <FbButton variant="success" onClick={confirmRemoved}>Confirm removed</FbButton>
      <FbButton variant="danger" onClick={() => (removing = null)}>Cancel</FbButton>
    </div>
  </FbModal>
{/if}

<style>
  .implant-registry-page {
    height: 100vh;
    background: white;
    font-family: 'Roboto', sans-serif;
    display: flex;
    flex-direction: column;
  }

  .page-header {
    background: white;
    border-bottom: 0.2rem solid #1b6ec2;
    padding: 1rem 1rem 0.55rem 1rem;
    box-sizing: border-box;
  }

  .kicker {
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.05;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 500;
    line-height: 1.05;
  }

  .top-options {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    margin-top: 0.7rem;
  }

  .page-body {
    flex: 1;
    padding: 0.8rem 1rem;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .filters {
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.65rem;
    margin: 0 0 0.8rem 0;
  }

  legend {
    padding: 0 0.35rem;
    font-weight: 500;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 0.6rem;
  }

  table {
    width: 100%;
    table-layout: auto;
    border-collapse: collapse;
  }

  th,
  td {
    border: 0.1rem solid silver;
    padding: 0.35rem;
    vertical-align: top;
    text-align: left;
    overflow-wrap: anywhere;
  }

  .nowrap {
    white-space: nowrap;
  }

  .compact-col {
    width: 1%;
  }

  .addressograph-cell {
    width: 63.6mm;
    min-width: 63.6mm;
  }

  .wrapping-cell,
  .implant-cell {
    min-width: 0;
  }

  th {
    background: #1b6ec2;
    color: white;
    font-weight: 500;
  }

  small {
    color: #555;
  }

  details {
    margin-top: 0.25rem;
    font-size: 0.78rem;
    color: #555;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .modal-message {
    max-width: 42rem;
    overflow-wrap: anywhere;
  }

  .empty {
    padding: 0.8rem;
  }

  .page-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    border-top: 0.2rem solid #1b6ec2;
    background: white;
    min-height: 2.8rem;
    box-sizing: border-box;
  }
</style>
