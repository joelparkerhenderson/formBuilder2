<script lang="ts">
  import type { CntVolume } from './cntStore';
  import HighlightBlock from './fbcntHighlightBlock.svelte';

  export let volumes: CntVolume[] = [];
  export let checkedVolumeUuids: string[] = [];
  export let toggleVolume: (volumeUuid: string) => void = () => {};

  $: tree = buildTree(volumes);

  function buildTree(items: CntVolume[]) {
    const result: Record<string, Record<string, Record<string, CntVolume[]>>> = {};
    for (const volume of items) {
      result[volume.healthBoard] ||= {};
      result[volume.healthBoard][volume.locality] ||= {};
      result[volume.healthBoard][volume.locality][volume.type] ||= [];
      result[volume.healthBoard][volume.locality][volume.type].push(volume);
    }
    return result;
  }

  function sortVolumes(items: CntVolume[]) {
    return [...items].sort((a, b) => a.volumeNumber - b.volumeNumber || a.uuid.localeCompare(b.uuid));
  }

  function volumeLabel(volume: CntVolume) {
    return volume.temporary ? `Temporary volume ${volume.volumeNumber}` : `Volume ${volume.volumeNumber}`;
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
            {#each Object.entries(types) as [type, items]}
              <div class="level indented">
                <HighlightBlock level={2}>{type}</HighlightBlock>
                {#each sortVolumes(items) as volume (volume.uuid)}
                  <HighlightBlock level={3} style="margin-left: 1rem;">
                    <label class="volume-line">
                    <input type="checkbox" checked={checkedVolumeUuids.includes(volume.uuid)} onchange={() => toggleVolume(volume.uuid)} />
                    <span>{volumeLabel(volume)}</span>
                    </label>
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
  .volume-line {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.4rem;
    align-items: center;
  }
  .empty { color: #555; font-style: italic; }
</style>
