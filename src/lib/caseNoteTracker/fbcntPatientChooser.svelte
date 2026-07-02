<script lang="ts">
  import type { CntStore } from './cntStore';
  import FbAddressograph from '$lib/components/fb/fbAddressograph.svelte';
  import FbcntSmallButton from './FbcntSmallButton.svelte';

  export let store: CntStore;
  export let selectPatient: (patientUuid: string) => void = () => {};
  export let limit = 12;
</script>

<div class="patient-list">
  {#each (store?.patients || []).slice(0, limit) as patient (patient.uuid)}
    <div class="patient-row">
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
      <FbcntSmallButton onClick={() => selectPatient(patient.uuid)}>Case notes</FbcntSmallButton>
    </div>
  {/each}
</div>

<style>
  .patient-list {
    display: grid;
    gap: 0.6rem;
  }
  .patient-row {
    display: grid;
    grid-template-columns: minmax(18rem, 1fr) auto;
    gap: 0.8rem;
    align-items: start;
    border: 0.1rem solid silver;
    border-radius: 0.4rem;
    padding: 0.6rem;
  }
</style>
