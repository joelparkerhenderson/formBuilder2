<script lang="ts">
  import type { CntStore, CntVolume } from './cntStore';
  import FbAddressograph from '$lib/components/fb/fbAddressograph.svelte';
  import FbcntSelectedVolumesLocation from './FbcntSelectedVolumesLocation.svelte';

  export let store: CntStore;
  export let patientUuid = '';
  export let volumes: CntVolume[] = [];
</script>

{@const patient = store?.patients.find((item) => item.uuid === patientUuid)}
<div class="batch-patient-group">
  {#if patient}
    <FbAddressograph
      nhsNumber={patient.nhsNumber}
      surname={patient.surname}
      forenames={patient.forenames}
      title={patient.title}
      addressLine1={patient.addressLine1}
      addressLine2={patient.addressLine2}
      addressLine3={patient.addressLine3}
      addressLine4={patient.addressLine4}
      hospitalNumber={patient.hospitalNumber}
      dateOfBirth={patient.dateOfBirth}
      sex={patient.sex}
    />
  {/if}
  <FbcntSelectedVolumesLocation {store} {volumes} />
</div>

<style>
  .batch-patient-group {
    display: grid;
    grid-template-columns: minmax(18rem, 22rem) 1fr;
    gap: 0.8rem;
    align-items: start;
    border-top: 0.1rem solid silver;
    padding-top: 0.8rem;
  }
</style>
