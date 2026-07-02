<script lang="ts">
  import FbButton from './fbButton.svelte';
  import FbTable from './fbTable.svelte';
  import FbTableBody from './fbTableBody.svelte';
  import FbTableCell from './fbTableCell.svelte';
  import FbTableHeader from './fbTableHeader.svelte';
  import FbTableHeaderCell from './fbTableHeaderCell.svelte';
  import FbTableRow from './fbTableRow.svelte';

  export type FbFormHistoryItem = {
    form_version: number;
    document_datetime?: string | null;
    event_datetime?: string | null;
    saved_by?: string | null;
    details?: string | null;
  };

  export let history: FbFormHistoryItem[] = [];
  export let onViewVersion: (version: number) => void = () => {};
  export let onClose: () => void = () => {};

  function formatDateTime(value?: string | null) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(date.getDate()).padStart(2, '0')}-${monthNames[date.getMonth()]}-${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
</script>

<button type="button" class="history-backdrop" aria-label="Close history" onclick={onClose}></button>
<section class="history-menu" aria-label="Form history">
  <h2>History</h2>
  <FbTable aria-label="Form history">
    <FbTableHeader>
      <FbTableRow>
        <FbTableHeaderCell>Date and time</FbTableHeaderCell>
        <FbTableHeaderCell>Saved by</FbTableHeaderCell>
        <FbTableHeaderCell></FbTableHeaderCell>
      </FbTableRow>
    </FbTableHeader>
    <FbTableBody>
      {#if history.length === 0}
        <FbTableRow>
          <FbTableCell colspan={3}><span class="empty">No saved versions found</span></FbTableCell>
        </FbTableRow>
      {:else}
        {#each history as item (item.form_version)}
          <FbTableRow>
            <FbTableCell>{formatDateTime(item.document_datetime || item.event_datetime)}</FbTableCell>
            <FbTableCell>{item.saved_by || item.details || ''}</FbTableCell>
            <FbTableCell><button type="button" class="view-old-version" onclick={() => onViewVersion(item.form_version)}>View old version</button></FbTableCell>
          </FbTableRow>
        {/each}
      {/if}
    </FbTableBody>
  </FbTable>
  <div class="history-actions">
    <FbButton type="button" onClick={onClose}>Close</FbButton>
  </div>
</section>

<style>
  .history-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10000;
    border: 0;
    background: rgb(0 0 0 / 25%);
  }

  .history-menu {
    position: fixed;
    left: 1rem;
    bottom: 3.6rem;
    z-index: 10001;
    width: min(44rem, calc(100vw - 2rem));
    max-height: calc(100vh - 5rem);
    overflow: auto;
    box-sizing: border-box;
    padding: 0.8rem;
    border: 0.1rem solid var(--fb-blue);
    border-radius: 0.4rem;
    background: white;
    font-family: 'Roboto', sans-serif;
  }

  h2 {
    margin: 0 0 0.6rem;
    font-size: 1.2rem;
    font-weight: 500;
  }

  .empty {
    display: inline-block;
    padding: 0.3rem;
    font-style: italic;
  }

  .view-old-version {
    border: 0.1rem solid var(--fb-blue);
    border-radius: 0.25rem;
    background: var(--fb-blue);
    color: white;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-size: 0.85rem;
    font-weight: 300;
    padding: 0.15rem 0.45rem;
  }

  .view-old-version:hover,
  .view-old-version:focus {
    border-color: var(--fb-yellow);
    background: var(--fb-yellow);
    color: black;
  }

  .history-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.8rem;
  }
</style>
