<script lang="ts">
  import { fbBlue } from './cntStyles';
  import type { CntLocation, CntStore, CntVolume } from './cntStore';

  export let store: CntStore;
  export let locationUuid = '';
  export let volume: CntVolume | undefined = undefined;
  export let withIcon = false;
  export let compact = false;

  $: location = store?.locations.find((item) => item.uuid === (locationUuid || volume?.currentLocationUuid));
  $: lines = location ? locationDisplayLines(location, volume) : [];

  export function locationDisplayLines(locationValue: CntLocation, volumeValue?: Pick<CntVolume, 'healthBoard' | 'locality'>) {
    return [
      locationValue.extra,
      locationValue.department,
      locationValue.facility,
      locationValue.healthBoard,
    ].filter(Boolean);
  }
</script>

{#if lines.length}
  <span class="location-display">
    {#if withIcon}
      <span class="material-icons location-icon" aria-hidden="true">view_list</span>
    {/if}
    <span class="location-lines" class:compact>
      {#each lines as line, index (`${line}-${index}`)}
        <span>{line}</span>
      {/each}
    </span>
  </span>
{/if}

<style>
  .location-display {
    display: inline-flex;
    gap: 0.25rem;
    align-items: start;
    width: max-content;
    max-width: 100%;
    min-width: 0;
  }

  .location-icon {
    font-family: 'Material Icons';
    color: #1b6ec2;
    font-size: 1rem;
    line-height: 1.15;
    margin-top: 0.05rem;
  }

  .location-lines {
    display: grid;
    gap: 0.04rem;
    min-width: 0;
    max-width: 100%;
  }

  .location-lines.compact {
    gap: 0;
  }

  .location-lines span {
    display: block;
    overflow-wrap: break-word;
  }
</style>
