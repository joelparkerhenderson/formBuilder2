<script lang="ts">
  import type { CntPickListEntry, CntStore, CntVolume } from './cntStore';
  import FbcntBadgeRequested from './FbcntBadgeRequested.svelte';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import HighlightBlock from './fbcntHighlightBlock.svelte';

  export let store: CntStore;
  export let volumes: CntVolume[] = [];
  export let pickListEntries: CntPickListEntry[] = [];
  export let requestedLocationUuid = '';

  $: received = new Set(pickListEntries.filter((entry) => entry.received).map((entry) => entry.volumeUuid));
  $: requested = new Set((store?.requests || [])
    .filter((request) => request.status === 'open' && (!requestedLocationUuid || request.toLocationUuid === requestedLocationUuid))
    .map((request) => request.volumeUuid));
  $: tree = buildTree(volumes);

  function buildTree(items: CntVolume[]) {
    const result: Record<string, Record<string, Record<string, Record<string, CntVolume[]>>>> = {};
    for (const volume of items) {
      result[volume.healthBoard] ||= {};
      result[volume.healthBoard][volume.locality] ||= {};
      result[volume.healthBoard][volume.locality][volume.type] ||= {};
      const location = locationText(volume);
      result[volume.healthBoard][volume.locality][volume.type][location] ||= [];
      result[volume.healthBoard][volume.locality][volume.type][location].push(volume);
    }
    return result;
  }

  function locationText(volume: CntVolume) {
    const location = store.locations.find((item) => item.uuid === volume.currentLocationUuid);
    return location ? [location.extra, location.department, location.facility, location.healthBoard].filter(Boolean).join(' / ') : '';
  }

  function volumeLabel(volume: CntVolume) {
    return volume.temporary ? `Temporary volume ${volume.volumeNumber}` : `Volume ${volume.volumeNumber}`;
  }

  function sortVolumes(items: CntVolume[]) {
    return [...items].sort((a, b) => a.volumeNumber - b.volumeNumber || a.uuid.localeCompare(b.uuid));
  }

  function volumeRangeLabel(items: CntVolume[]) {
    if (items.length === 1) return volumeLabel(items[0]);
    const prefix = items.every((volume) => volume.temporary) ? 'Temporary volumes' : 'Volumes';
    return `${prefix} ${summariseNumberRanges(items.map((volume) => volume.volumeNumber))}`;
  }

  function summariseNumberRanges(numbers: number[]) {
    const uniqueNumbers = Array.from(new Set(numbers)).sort((a, b) => a - b);
    const ranges: string[] = [];
    for (let index = 0; index < uniqueNumbers.length; index += 1) {
      const start = uniqueNumbers[index];
      let end = start;
      while (index + 1 < uniqueNumbers.length && uniqueNumbers[index + 1] === end + 1) {
        index += 1;
        end = uniqueNumbers[index];
      }
      ranges.push(start === end ? String(start) : `${start}-${end}`);
    }
    return ranges.join(', ');
  }
</script>

{#if !volumes.length}
  <span class="empty">No volumes selected</span>
{:else}
  <div class="volume-tree">
    {#each Object.entries(tree) as [hb, localities]}
      <div class="level">
        <HighlightBlock level={0}>{hb}</HighlightBlock>
        {#each Object.entries(localities) as [locality, types]}
          <div class="level indented">
            <HighlightBlock level={1}>{locality}</HighlightBlock>
            {#each Object.entries(types) as [type, locations]}
              <div class="level indented">
                <HighlightBlock level={2}>{type}</HighlightBlock>
                {#each Object.entries(locations) as [location, items]}
                  {@const sorted = sortVolumes(items)}
                  {@const allReceived = sorted.every((volume) => received.has(volume.uuid))}
                  {@const anyRequested = sorted.some((volume) => requested.has(volume.uuid) && !received.has(volume.uuid))}
                  <HighlightBlock level={3} style="margin-left: 1rem;">
                    <div>{volumeRangeLabel(sorted)}</div>
                    <div class="location-under-volume">
                      {#if anyRequested}
                        <FbcntBadgeRequested />
                      {:else}
                        <span class="material-icons tick" class:visible={allReceived} aria-hidden="true">check_circle</span>
                      {/if}
                      <FbcntLocationDisplay {store} volume={sorted[0]} withIcon compact />
                    </div>
                  </HighlightBlock>
                {/each}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  </div>
{/if}

<style>
  .volume-tree { font-family: 'Roboto', sans-serif; font-size: 0.95rem; line-height: 1.35; }
  .level.indented { margin-left: 1rem; }
  .location-under-volume {
    margin-left: 1rem;
    display: grid;
    grid-template-columns: 1.1rem minmax(0, 1fr);
    column-gap: 0.25rem;
    align-items: start;
  }
  .tick {
    background-color: transparent;
    border-radius: 50%;
    color: #008000;
    font-family: 'Material Icons';
    font-size: 1rem;
    line-height: 1.2;
    visibility: hidden;
  }
  .tick.visible { visibility: visible; }
  .empty { color: #555; font-style: italic; }
</style>
