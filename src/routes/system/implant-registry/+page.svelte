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
  import { healthBoards } from '$lib/data/clinicalDestinations';
  import { getImplants, markImplantRemoved } from '$lib/api/legacy';
  import { formatFormDate } from '$lib/utils/dateFormat';
  import { organisationLabels, specialityLabels } from '$lib/data/formLabels';
  import { specialities } from '$lib/data/specialities';

  type ImplantRow = Record<string, any>;

  let rows: ImplantRow[] = $state([]);
  let loading = $state(true);
  let errorModal = $state('');
  let showRemoved = $state(false);
  let showNoRemoval = $state(false);
  let filter = $state({ healthBoard: '', speciality: '', src: '', srcCoded: false, srcNadexId: '' });
  let removing: ImplantRow | null = $state(null);
  let dateRemoved = $state(formatFormDate(new Date()));

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

  function clinicalContext(row: ImplantRow) {
    const healthBoard = row.health_board_text || organisationLabels[row.health_board] || row.health_board || '';
    const speciality = specialityLabels[row.speciality] || row.speciality || '';
    const src = srcDisplay(row.surgeon_src_text);
    return { healthBoard, speciality, src };
  }

  const visibleRows = $derived(rows.filter((row) => {
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
  }));

  async function confirmRemoved() {
    if (!removing) return;
    try {
      await markImplantRemoved(removing.id, dateRemoved);
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
        <FbHBSelector label="Health board" value={filter.healthBoard} options={[{ value: '', label: 'All' }, ...healthBoards.map(({ value, label }) => ({ value, label }))]} onChange={(value) => (filter = { ...filter, healthBoard: value })} />
        <FbSmartDropdown label="Speciality" value={filter.speciality} options={[{ value: '', label: 'All' }, ...specialities]} onChange={(value) => (filter = { ...filter, speciality: value })} />
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
      <FbTable>
        <FbTableHeader>
          <FbTableRow>
            <FbTableHeaderCell class="nowrap">Inserted</FbTableHeaderCell>
            <FbTableHeaderCell>Patient</FbTableHeaderCell>
            <FbTableHeaderCell>Clinical context</FbTableHeaderCell>
            <FbTableHeaderCell>Implant</FbTableHeaderCell>
            <FbTableHeaderCell>Removal</FbTableHeaderCell>
            <FbTableHeaderCell class="nowrap"></FbTableHeaderCell>
          </FbTableRow>
        </FbTableHeader>
        <FbTableBody>
          {#each visibleRows as row}
            <FbTableRow>
              <FbTableCell class="nowrap compact-col">{displayDate(row.date_inserted)}</FbTableCell>
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
              <FbTableCell class="wrapping-cell">
                {@const context = clinicalContext(row)}
                <div>{context.healthBoard}</div>
                <div>{context.speciality}</div>
                <div>{context.src}</div>
              </FbTableCell>
              <FbTableCell class="implant-cell">
                <strong>{row.implant_id || ''}</strong><br />{row.implant_description || ''}
                <details>
                  <summary>Traceability</summary>
                  <div>Operation note {row.operation_note_uuid}</div>
                  <div>Version {row.operation_note_version}</div>
                  <div>Implant row {row.operation_note_implant_row_uuid}</div>
                </details>
              </FbTableCell>
              <FbTableCell class="wrapping-cell">
                {row.remove_by_display || displayDate(row.remove_by_date) || 'Not required'}
                {#if row.remove_by_display && row.remove_by_date && row.remove_by_display !== row.remove_by_date}<br /><small>Sorts as {displayDate(row.remove_by_date)}</small>{/if}
                {#if row.date_removed}<br />Removed {displayDate(row.date_removed)}{/if}
              </FbTableCell>
              <FbTableCell class="nowrap compact-col"><FbButtonSmaller disabled={!!row.date_removed} onclick={() => { removing = row; dateRemoved = formatFormDate(new Date()); }}>Remove</FbButtonSmaller></FbTableCell>
            </FbTableRow>
          {/each}
        </FbTableBody>
      </FbTable>
      {#if visibleRows.length === 0}<div class="empty">No implants match the current filters.</div>{/if}
    {/if}
  </section>
  <footer class="page-footer">
    <FbButton variant="primary" onClick={() => { window.location.href = '/formBuilder2/'; }}>Back</FbButton>
  </footer>
</main>

{#if errorModal}
  <FbModal title="Error" onEscape={() => (errorModal = '')}>
    <FbModalMessage>{errorModal}</FbModalMessage>
    <FbModalActions>
      <FbButton variant="success" onClick={() => (errorModal = '')}>Ok</FbButton>
    </FbModalActions>
  </FbModal>
{/if}

{#if removing}
  <FbModal title="Confirm removed" onEscape={() => (removing = null)}>
    <FbReadOnly label="Implant" value={`${removing.implant_id || ''} ${removing.implant_description || ''}`.trim()} />
    <FbQuestion label="Date implant removed" required>
      <FbDateExact name="dateRemoved" value={dateRemoved} onChange={(value) => (dateRemoved = value)} required />
    </FbQuestion>
    <FbModalActions>
      <FbButton variant="success" onClick={confirmRemoved}>Confirm removed</FbButton>
      <FbButton variant="danger" onClick={() => (removing = null)}>Cancel</FbButton>
    </FbModalActions>
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

  :global(.implant-registry-page .fb-table) {
    table-layout: auto;
  }

  :global(.implant-registry-page .fb-table td) {
    border: 0;
    border-bottom: 0.1rem solid silver;
    padding: 0.35rem;
    vertical-align: top;
    text-align: left;
    overflow-wrap: anywhere;
  }

  :global(.implant-registry-page .nowrap) {
    white-space: nowrap;
  }

  :global(.implant-registry-page .compact-col) {
    width: 1%;
  }

  :global(.implant-registry-page .addressograph-cell) {
    width: 90mm;
    min-width: 90mm;
  }

  :global(.implant-registry-page .wrapping-cell),
  :global(.implant-registry-page .implant-cell) {
    min-width: 0;
  }

  small {
    color: #555;
  }

  details {
    margin-top: 0.25rem;
    font-size: 0.78rem;
    color: #555;
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
