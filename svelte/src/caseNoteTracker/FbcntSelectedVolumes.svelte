<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';
  import FbcntTag from './FbcntTag.svelte';

  export let store: CntStore | undefined = undefined;
  export let volumes: CntVolume[] = [];

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

  function volumeLabel(volume: CntVolume) {
    return volume.temporary ? `Temporary volume ${volume.volumeNumber}` : `Volume ${volume.volumeNumber}`;
  }

  function sortVolumes(items: CntVolume[]) {
    return [...items].sort((a, b) => a.volumeNumber - b.volumeNumber || a.uuid.localeCompare(b.uuid));
  }

  function hasActiveTag(volume: CntVolume) {
    return !!store?.tags?.some((tag) => tag.volumeUuid === volume.uuid && tag.status === 'active');
  }
</script>

{#if !volumes.length}
  <span class="empty">No volumes selected</span>
{:else}
  <div class="volume-tree">
    {#each Object.entries(tree) as [hb, localities]}
      <div class="level level-0">
        <div class="level-label">{hb}</div>
        {#each Object.entries(localities) as [locality, types]}
          <div class="level level-1">
            <div class="level-label">{locality}</div>
            {#each Object.entries(types) as [type, items]}
              <div class="level level-2">
                <div class="level-label">{type}</div>
                {#each sortVolumes(items) as volume (volume.uuid)}
                  <div class="level level-3">
                    <span class="volume-name">
                      {#if hasActiveTag(volume)}<FbcntTag />{/if}
                      <span>{volumeLabel(volume)}</span>
                    </span>
                  </div>
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
  .level { border-radius: 0.2rem; padding: 0.08rem 0.2rem; margin-top: 0.08rem; }
  .level-label { border-radius: 0.2rem; padding: 0.08rem 0.2rem; }
  .level-1, .level-2, .level-3 { margin-left: 1rem; }
  .level-0 > .level-label:hover, .level-2 > .level-label:hover { background: #ffffcc; }
  .level-1 > .level-label:hover, .level-3:hover, .level-3:focus-visible { background: #fee715; }
  .volume-name { display: inline-flex; gap: 0.25rem; align-items: center; }
  .empty { color: #555; font-style: italic; }
</style>
