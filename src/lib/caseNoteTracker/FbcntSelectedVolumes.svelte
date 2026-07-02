<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';
  import FbcntTag from './FbcntTag.svelte';
  import HighlightBlock from './fbcntHighlightBlock.svelte';

  export let store: CntStore | undefined = undefined;
  export let volumes: CntVolume[] = [];
  export let compact = false;

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
  <div class="volume-tree" class:compact>
    {#each Object.entries(tree) as [hb, localities]}
      <div class="level">
        <HighlightBlock level={0} style={compact ? 'padding-top: 0; padding-bottom: 0; margin-top: 0;' : ''}>{hb}</HighlightBlock>
        {#each Object.entries(localities) as [locality, types]}
          <div class="level indented">
            <HighlightBlock level={1} style={compact ? 'padding-top: 0; padding-bottom: 0; margin-top: 0;' : ''}>{locality}</HighlightBlock>
            {#each Object.entries(types) as [type, items]}
              <div class="level indented">
                <HighlightBlock level={2} style={compact ? 'padding-top: 0; padding-bottom: 0; margin-top: 0;' : ''}>{type}</HighlightBlock>
                {#each sortVolumes(items) as volume (volume.uuid)}
                  <HighlightBlock level={3} style={`${compact ? 'padding-top: 0; padding-bottom: 0; margin-top: 0;' : ''} margin-left: 1rem;`}>
                    <span class="volume-name">
                      {#if hasActiveTag(volume)}<FbcntTag />{/if}
                      <span>{volumeLabel(volume)}</span>
                    </span>
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
  .volume-tree.compact { line-height: 1.05; }
  .level.indented { margin-left: 1rem; }
  .volume-name { display: inline-flex; gap: 0.25rem; align-items: center; }
  .empty { color: #555; font-style: italic; }
</style>
