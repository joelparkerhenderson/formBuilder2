<script lang="ts">
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import Table from './cntTable.svelte';

  export let store: any;
  export let batchUuids: string[] = [];
  export let openBatch: (batchUuid: string) => void = () => {};
  export let removeBatch: (batchUuid: string) => void = () => {};
</script>

<Table>
  <thead><tr><th>Batch</th><th>Purpose</th><th>Current location</th><th>Destination</th><th>Volumes</th><th class="right">Action</th></tr></thead>
  <tbody>
    {#each store.batches.filter((batch) => !batchUuids.length || batchUuids.includes(batch.uuid)) as batch (batch.uuid)}
      <tr>
        <td>{batch.barcode}</td>
        <td>{batch.intendedPurpose || batch.purpose}</td>
        <td><FbcntLocationDisplay {store} locationUuid={batch.currentLocationUuid} compact /></td>
        <td><FbcntLocationDisplay {store} locationUuid={batch.intendedDestinationUuid} compact /></td>
        <td>{batch.volumeUuids.length}</td>
        <td class="right"><FbcntSmallButton onClick={() => openBatch(batch.uuid)}>Open</FbcntSmallButton> <FbcntSmallButton onClick={() => removeBatch(batch.uuid)}>Remove</FbcntSmallButton></td>
      </tr>
    {/each}
  </tbody>
</Table>

<style>
  .right { text-align: right; }
</style>
