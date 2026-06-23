<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbcntBadgeActive from './FbcntBadgeActive.svelte';
  import FbcntBadgeClosed from './FbcntBadgeClosed.svelte';
  import FbcntBadgeDestroyed from './FbcntBadgeDestroyed.svelte';

  export let store: CntStore;
  export let volumes: CntVolume[] = [];
  export let ariaLabel = 'Selected volumes';

  function label(volume: CntVolume) {
    return `${volume.temporary ? 'Temporary volume' : 'Volume'} ${volume.volumeNumber} - ${volume.healthBoard} / ${volume.locality} / ${volume.type}`;
  }
</script>

<ul class="selected-volume-list" aria-label={ariaLabel}>
  {#each volumes as volume (volume.uuid)}
    <li>
      <span>{label(volume)}</span>
      {#if volume.status === 'destroyed'}
        <FbcntBadgeDestroyed />
      {:else if volume.status === 'closed'}
        <FbcntBadgeClosed />
      {:else}
        <FbcntBadgeActive />
      {/if}
      <FbcntLocationDisplay {store} volume={volume} compact />
    </li>
  {/each}
</ul>

<style>
  .selected-volume-list {
    display: grid;
    gap: 0.35rem;
    margin: 0;
    padding-left: 1.2rem;
  }
  li {
    display: grid;
    grid-template-columns: minmax(10rem, 1fr) auto minmax(12rem, 1.5fr);
    gap: 0.5rem;
    align-items: start;
  }
</style>
