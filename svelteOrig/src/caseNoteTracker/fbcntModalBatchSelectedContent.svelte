<script lang="ts">
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';

  export let store: any;
  export let batches: any[] = [];
  export let selectBatch: (batchUuid: string) => void = () => {};
</script>

<div class="batch-list">
  {#each batches as batch (batch.uuid)}
    <button type="button" onclick={() => selectBatch(batch.uuid)}>
      <strong>{batch.barcode}</strong>
      <span>{batch.intendedPurpose || batch.purpose}</span>
      <FbcntLocationDisplay {store} locationUuid={batch.intendedDestinationUuid} compact />
    </button>
  {/each}
</div>

<style>
  .batch-list { display: grid; gap: 0.5rem; }
  button {
    display: grid;
    gap: 0.15rem;
    text-align: left;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    background: white;
    padding: 0.6rem;
    font: inherit;
    cursor: pointer;
  }
</style>
