<script lang="ts">
  import FbcntManageVolume, { type FbcntManageVolumeValue } from './FbcntManageVolume.svelte';
  import type { CntStore } from './cntStore';

  export let store: CntStore;
  export let volumeUuid = '';
  export let value: FbcntManageVolumeValue | null = null;
  export let setValue: (next: FbcntManageVolumeValue) => void = () => {};

  $: volume = store?.volumes.find((item) => item.uuid === volumeUuid);
</script>

{#if !volume}
  <section class="card">Volume not found.</section>
{:else if !value}
  <section class="card">Volume not loaded.</section>
{:else}
  <FbcntManageVolume {store} {value} onChange={setValue} showReadOnlyIdentifiers />
{/if}

<style>
  .card {
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 1rem;
    background: white;
  }
</style>
