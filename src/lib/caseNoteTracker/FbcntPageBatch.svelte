<script lang="ts">
  import FbcntBatchVolumeSet from './FbcntBatchVolumeSet.svelte';

  export let store: any;
  export let batch: any;

  $: volumes = batch ? store.volumes.filter((volume) => batch.volumeUuids.includes(volume.uuid)) : [];
  $: patientUuids = Array.from(new Set(volumes.map((volume) => volume.patientUuid)));
</script>

{#if batch}
  <div class="stack">
    {#each patientUuids as patientUuid}
      <FbcntBatchVolumeSet {store} {patientUuid} volumes={volumes.filter((volume) => volume.patientUuid === patientUuid)} />
    {/each}
  </div>
{/if}

<style>
  .stack { display: grid; gap: 0.8rem; }
</style>
