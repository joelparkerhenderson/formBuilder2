<script lang="ts">
  import FbAddressograph from '../components/fbAddressograph.svelte';
  import type { CntPatient } from './cntStore';

  export let patient: CntPatient | undefined = undefined;
</script>

{#if patient}
  <div class="addressograph-wrap">
    <FbAddressograph
      nhsNumber={patient.nhsNumber}
      surname={patient.surname}
      forenames={patient.forenames}
      title={patient.title}
      addressLine1={patient.addressLine1}
      addressLine2={patient.addressLine2}
      addressLine3={patient.addressLine3}
      addressLine4={patient.addressLine4}
      crn={patient.hospitalNumber}
      dateOfBirth={patient.dateOfBirth}
      sex={patient.sex}
    />
  </div>
{/if}

<style>
  .addressograph-wrap {
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
  }
</style>
