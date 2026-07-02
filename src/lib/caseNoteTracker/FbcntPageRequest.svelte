<script lang="ts">
  import FbTextInput from '$lib/components/fb/fbTextInput.svelte';
  import type { CntStore, CntVolume } from './cntStore';
  import FbGroupWithBorder from './FbGroupWithBorder.svelte';
  import FbcntLocation from './FbcntLocation.svelte';
  import FbcntSelectedVolumes from './FbcntSelectedVolumes.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';
  import PatientAddressograph from './fbcntPatientAddressograph.svelte';

  export let store: CntStore;
  export let patientUuid = '';
  export let openPatientSelector: () => void = () => {};
  export let openVolumeSelector: () => void = () => {};
  export let selectedVolumeUuids: string[] = [];
  export let requiredFor = '';
  export let setRequiredFor: (value: string) => void = () => {};
  export let fromLocationUuid = '';
  export let setFromLocationUuid: (value: string) => void = () => {};
  export let toLocationUuid = '';
  export let setToLocationUuid: (value: string) => void = () => {};

  $: patient = store.patients.find((item) => item.uuid === patientUuid);
  $: selectedVolumesForRequest = store.volumes
    .filter((volume) => selectedVolumeUuids.includes(volume.uuid))
    .sort(volumeSort);

  function volumeSort(a: CntVolume, b: CntVolume) {
    return a.healthBoard.localeCompare(b.healthBoard)
      || a.locality.localeCompare(b.locality)
      || a.type.localeCompare(b.type)
      || Number(a.temporary) - Number(b.temporary)
      || a.volumeNumber - b.volumeNumber;
  }
</script>

<section class="form-stack">
  <div class="patient-request-block">
    {#if patient}
      <PatientAddressograph {patient} />
    {:else}
      <p class="note">No patient selected.</p>
    {/if}
    <div class="inline-actions">
      <FbcntSmallButton onClick={openPatientSelector}>Select patient</FbcntSmallButton>
    </div>
  </div>
  <FbTextInput label="Required for" value={requiredFor} onChange={setRequiredFor} />
  <FbcntLocation label="From" {store} value={fromLocationUuid} onChange={setFromLocationUuid} />
  <FbcntLocation label="To" {store} value={toLocationUuid} onChange={setToLocationUuid} />
  <FbGroupWithBorder label="Case notes">
    <FbcntSelectedVolumes {store} volumes={selectedVolumesForRequest} />
    <div class="inline-actions">
      <FbcntSmallButton onClick={openVolumeSelector}>Select</FbcntSmallButton>
    </div>
  </FbGroupWithBorder>
</section>

<style>
  .form-stack {
    width: min(48rem, 100%);
    display: grid;
    gap: 0.8rem;
  }

  .patient-request-block {
    display: grid;
    gap: 0.4rem;
  }

  .inline-actions {
    display: flex;
    gap: 0.4rem;
    justify-content: flex-start;
  }

  .note {
    margin: 0;
    color: #555;
    font-style: italic;
  }
</style>
