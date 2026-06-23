<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';
  import FbcntLocationDisplay from './FbcntLocationDisplay.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import FbcntButtonManageVolume from './FbcntButtonManageVolume.svelte';
  import FbcntBadgeActive from './FbcntBadgeActive.svelte';
  import FbcntBadgeClosed from './FbcntBadgeClosed.svelte';
  import FbcntBadgeDestroyed from './FbcntBadgeDestroyed.svelte';
  import VolumeTagIcon from './fbcntVolumeTagIcon.svelte';
  import PatientChooser from './fbcntPatientChooser.svelte';

  export let store: CntStore;
  export let selectedPatientUuid = '';
  export let selectedVolumeUuids: string[] = [];
  export let toggleVolume: (volumeUuid: string) => void = () => {};
  export let openHistory: (volumeUuid: string) => void = () => {};
  export let openManageVolume: ((volumeUuid: string) => void) | undefined = undefined;
  export let selectPatient: (patientUuid: string) => void = () => {};

  let collapsed: Record<string, boolean> = {};

  $: patient = store?.patients.find((item) => item.uuid === selectedPatientUuid);
  $: volumes = (store?.volumes || []).filter((volume) => volume.patientUuid === selectedPatientUuid).sort(volumeSort);
  $: groups = grouped(volumes);

  function volumeSort(a: CntVolume, b: CntVolume) {
    return a.healthBoard.localeCompare(b.healthBoard) || a.locality.localeCompare(b.locality) || a.type.localeCompare(b.type) || Number(a.temporary) - Number(b.temporary) || a.volumeNumber - b.volumeNumber;
  }
  function grouped(items: CntVolume[]) {
    const result = new Map<string, CntVolume[]>();
    for (const volume of items) {
      const key = `${volume.healthBoard}|${volume.locality}|${volume.type}`;
      result.set(key, [...(result.get(key) || []), volume]);
    }
    return Array.from(result.entries()).map(([key, groupVolumes]) => {
      const [healthBoard, locality, type] = key.split('|');
      return { key, healthBoard, locality, type, volumes: groupVolumes };
    });
  }
  function toggleGroup(key: string) {
    collapsed = { ...collapsed, [key]: !collapsed[key] };
  }
</script>

{#if !patient}
  <PatientChooser {store} {selectPatient} />
{:else}
  <section class="locator-shell">
    {#each groups as group (group.key)}
      <div class="group">
        <button type="button" class="group-toggle" onclick={() => toggleGroup(group.key)}>
          <span class="material-icons" aria-hidden="true">{collapsed[group.key] ? 'chevron_right' : 'expand_more'}</span>
          <span>{group.healthBoard} / {group.locality} / {group.type}</span>
        </button>
        {#if !collapsed[group.key]}
          {#each group.volumes as volume (volume.uuid)}
            {@const disabled = volume.status === 'destroyed'}
            <div class="volume-row">
              <label class:disabled>
                <input type="checkbox" checked={!disabled && selectedVolumeUuids.includes(volume.uuid)} disabled={disabled} onchange={() => toggleVolume(volume.uuid)} />
                <span>{volume.temporary ? 'Temporary volume' : 'Volume'} {volume.volumeNumber}</span>
              </label>
              <span>{#if volume.status === 'destroyed'}<FbcntBadgeDestroyed />{:else if volume.status === 'closed'}<FbcntBadgeClosed />{:else}<FbcntBadgeActive />{/if}</span>
              <FbcntLocationDisplay {store} {volume} withIcon />
              <VolumeTagIcon {store} {volume} />
              {#if openManageVolume}<FbcntButtonManageVolume onClick={() => openManageVolume?.(volume.uuid)} />{/if}
              <FbcntSmallButton onClick={() => openHistory(volume.uuid)}>History</FbcntSmallButton>
            </div>
          {/each}
        {/if}
      </div>
    {/each}
  </section>
{/if}

<style>
  .locator-shell { height: 100%; min-height: 0; overflow: auto; background: white; }
  .group { margin-bottom: 0.25rem; }
  .group-toggle {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    width: 100%;
    border: 0;
    background: white;
    color: #111;
    padding: 0.25rem;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .group-toggle:hover,
  .group-toggle:focus-visible { background: #ffffcc; }
  .volume-row {
    display: grid;
    grid-template-columns: minmax(10rem, 1fr) 6.5rem minmax(16rem, 2fr) 2rem auto auto;
    gap: 0.6rem;
    align-items: center;
    border-top: 0.1rem solid #eee;
    padding: 0.25rem 0.25rem 0.25rem 2.2rem;
  }
  .volume-row:hover,
  .volume-row:focus-within { background: #fee715; }
  label { display: flex; align-items: center; gap: 0.35rem; }
  .disabled { color: #666; cursor: not-allowed; }
</style>
