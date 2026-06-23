<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';
  import { patientName } from './cntStore';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbcntBadgeActive from './FbcntBadgeActive.svelte';
  import FbcntBadgeClosed from './FbcntBadgeClosed.svelte';
  import FbcntBadgeDestroyed from './FbcntBadgeDestroyed.svelte';
  import PatientChooser from './fbcntPatientChooser.svelte';
  import HighlightBlock from './fbcntHighlightBlock.svelte';
  import TreeNode from './fbcntTreeNode.svelte';
  import VolumeTagIcon from './fbcntVolumeTagIcon.svelte';

  export let store: CntStore;
  export let selectedPatientUuid = '';
  export let selectedVolumeUuids: string[] = [];
  export let toggleVolume: (volumeUuid: string) => void = () => {};

  let collapsed: Record<string, boolean> = {};

  $: patient = store.patients.find((item) => item.uuid === selectedPatientUuid);
  $: volumes = store.volumes
    .filter((volume) => volume.patientUuid === selectedPatientUuid)
    .sort(volumeSort);
  $: tree = buildVolumeTree(volumes);

  function volumeSort(a: CntVolume, b: CntVolume) {
    return a.healthBoard.localeCompare(b.healthBoard)
      || a.locality.localeCompare(b.locality)
      || a.type.localeCompare(b.type)
      || Number(a.temporary) - Number(b.temporary)
      || a.volumeNumber - b.volumeNumber;
  }

  function buildVolumeTree(items: CntVolume[]) {
    const result: Record<string, Record<string, Record<string, CntVolume[]>>> = {};
    for (const volume of items) {
      result[volume.healthBoard] ||= {};
      result[volume.healthBoard][volume.locality] ||= {};
      result[volume.healthBoard][volume.locality][volume.type] ||= [];
      result[volume.healthBoard][volume.locality][volume.type].push(volume);
    }
    return result;
  }

  function toggleCollapsed(key: string) {
    collapsed = { ...collapsed, [key]: !collapsed[key] };
  }

  function selectAllVolumes(items: CntVolume[]) {
    for (const volume of items) {
      if (volume.status !== 'destroyed' && !selectedVolumeUuids.includes(volume.uuid)) toggleVolume(volume.uuid);
    }
  }

  function isSelected(volume: CntVolume) {
    return volume.status !== 'destroyed' && selectedVolumeUuids.includes(volume.uuid);
  }
</script>

{#if !patient}
  <PatientChooser {store} />
{:else}
  <section class="locator-shell" aria-label={`Select case-note volumes for ${patientName(store, patient.uuid)}`}>
    <div class="locator-scroll">
      <div class="tree">
        {#each Object.entries(tree) as [healthBoard, localities] (healthBoard)}
          <TreeNode
            label={healthBoard}
            level={0}
            nodeKey={`selector-hb:${healthBoard}`}
            {collapsed}
            {toggleCollapsed}
            preventCollapse={volumes.some((volume) => volume.healthBoard === healthBoard && selectedVolumeUuids.includes(volume.uuid))}
          >
            {#each Object.entries(localities) as [locality, types] (`${healthBoard}:${locality}`)}
              <TreeNode
                label={locality}
                level={1}
                nodeKey={`selector-loc:${healthBoard}:${locality}`}
                {collapsed}
                {toggleCollapsed}
                preventCollapse={volumes.some((volume) => volume.healthBoard === healthBoard && volume.locality === locality && selectedVolumeUuids.includes(volume.uuid))}
              >
                {#each Object.entries(types) as [type, items] (`${healthBoard}:${locality}:${type}`)}
                  <TreeNode
                    label={type}
                    level={2}
                    nodeKey={`selector-type:${healthBoard}:${locality}:${type}`}
                    {collapsed}
                    {toggleCollapsed}
                    preventCollapse={items.some((volume) => selectedVolumeUuids.includes(volume.uuid))}
                  >
                    {#if items.filter((volume) => volume.status !== 'destroyed').length > 1}
                      <div class="select-all-row">
                        <button type="button" class="select-all-button" onclick={() => selectAllVolumes(items)}>Select all</button>
                      </div>
                    {/if}
                    {#each items as volume (volume.uuid)}
                      <HighlightBlock level={3} style="grid-template-columns: minmax(10rem, 1fr) 6.5rem minmax(16rem, 2fr) 2rem; padding-left: 4.8rem;">
                        <label class:disabled={volume.status === 'destroyed'} class="volume-label">
                          <input
                            type="checkbox"
                            checked={isSelected(volume)}
                            disabled={volume.status === 'destroyed'}
                            onchange={() => toggleVolume(volume.uuid)}
                          />
                          <span>Volume {volume.volumeNumber}{volume.temporary ? ' temporary' : ''}</span>
                        </label>
                        <span class="status-cell">
                          {#if volume.status === 'destroyed'}
                            <FbcntBadgeDestroyed />
                          {:else if volume.status === 'closed'}
                            <FbcntBadgeClosed />
                          {:else}
                            <FbcntBadgeActive />
                          {/if}
                        </span>
                        <span class="volume-meta"><FbcntLocationDisplay {store} {volume} withIcon /></span>
                        <VolumeTagIcon {store} {volume} />
                      </HighlightBlock>
                    {/each}
                  </TreeNode>
                {/each}
              </TreeNode>
            {/each}
          </TreeNode>
        {/each}
      </div>
    </div>
  </section>
{/if}

<style>
  .locator-shell {
    min-height: 20rem;
  }

  .locator-scroll {
    max-height: min(34rem, 68vh);
    overflow: auto;
  }

  .tree {
    display: grid;
    gap: 0.08rem;
  }

  .select-all-row {
    padding-left: 4.8rem;
    margin: 0.15rem 0;
  }

  .select-all-button {
    border: 0;
    border-radius: 0.4rem;
    background: #1b6ec2;
    color: white;
    padding: 0.18rem 0.45rem;
    font-family: 'Roboto', sans-serif;
    font-size: 0.8rem;
    cursor: pointer;
  }

  :global(.fbcnt-highlight-level-3) {
    display: grid;
    align-items: start;
    gap: 0.5rem;
  }

  .volume-label {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.35rem;
    font-weight: 500;
  }

  .volume-label.disabled {
    color: #666;
  }

  .status-cell,
  .volume-meta {
    min-width: 0;
  }
</style>
