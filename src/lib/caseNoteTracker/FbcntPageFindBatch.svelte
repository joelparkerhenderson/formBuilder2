<script lang="ts">
  import type { CntStore } from './cntStore';
  import FbcntBatchFilter from './FbcntBatchFilter.svelte';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import Table from './cntTable.svelte';

  export let store: CntStore;
  export let userUuid = '';
  export let filter: { healthBoard: string; locality: string; facility: string; purpose: string } = {
    healthBoard: '',
    locality: '',
    facility: '',
    purpose: '',
  };
  export let setFilter: (next: { healthBoard: string; locality: string; facility: string; purpose: string }) => void = () => {};
  export let addBatchFavourite: (batchUuid: string) => void = () => {};

  $: favouriteUuids = new Set(store.preferences[userUuid]?.batchUuids || []);
  $: batches = store.batches
    .filter((batch) => !favouriteUuids.has(batch.uuid))
    .filter((batch) => {
      const location = store.locations.find((item) => item.uuid === batch.currentLocationUuid);
      return (!filter.healthBoard || location?.healthBoard === filter.healthBoard)
        && (!filter.locality || location?.locality === filter.locality)
        && (!filter.facility || location?.facility === filter.facility)
        && (!filter.purpose || (batch.intendedPurpose || batch.purpose) === filter.purpose);
    });
</script>

<div class="select-page">
  <FbcntBatchFilter {store} {filter} {setFilter} />
  <div class="table-wrap">
    <Table>
      <thead>
        <tr>
          <th>Batch</th>
          <th>Purpose</th>
          <th>Current location</th>
          <th>Destination</th>
          <th class="right">Action</th>
        </tr>
      </thead>
      <tbody>
        {#each batches as batch (batch.uuid)}
          <tr>
            <td><strong>{batch.barcode}</strong></td>
            <td>{batch.intendedPurpose || batch.purpose}</td>
            <td><FbcntLocationDisplay {store} locationUuid={batch.currentLocationUuid} compact /></td>
            <td><FbcntLocationDisplay {store} locationUuid={batch.intendedDestinationUuid} compact /></td>
            <td class="right">
              <FbcntSmallButton onClick={() => addBatchFavourite(batch.uuid)}>Select</FbcntSmallButton>
            </td>
          </tr>
        {/each}
      </tbody>
    </Table>
  </div>
</div>

<style>
  .select-page {
    display: grid;
    gap: 0.8rem;
  }

  .table-wrap {
    max-height: min(32rem, 60vh);
    overflow: auto;
  }

  .right {
    text-align: right;
    width: 5rem;
  }
</style>
