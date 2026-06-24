<script lang="ts">
  import FbAddressograph from './fbAddressograph.svelte';
  import FbBadgeDraft from './fbBadgeDraft.svelte';
  import FbBadgeHighlySensitive from './fbBadgeHighlySensitive.svelte';
  import type { Patient } from '../lib/types';
  import { fbBlue } from '../lib/constants';

  export let title = '';
  export let patient: Patient | null = null;
  export let formStatus = '';
  export let highlySensitive = false;
</script>

<header class="fb-header" style="border-bottom: 0.2rem solid {fbBlue};">
  <div class="fb-header-title-block">
    <div class="fb-header-badges">
      {#if formStatus === 'draft'}<FbBadgeDraft />{/if}
      {#if highlySensitive}<FbBadgeHighlySensitive />{/if}
    </div>
    <h1>{title}</h1>
  </div>
  <FbAddressograph
    nhsNumber={patient?.nhs_number}
    surname={patient?.surname}
    forenames={patient?.forenames}
    title={patient?.title}
    addressLine1={patient?.address_line1}
    addressLine2={patient?.address_line2}
    addressLine3={patient?.address_line3}
    addressLine4={patient?.address_line4}
    crn={patient?.crn}
    dateOfBirth={patient?.date_of_birth}
    sex={patient?.sex}
  />
</header>

<style>
  .fb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.4rem;
    background: white;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 500;
  }

  .fb-header-title-block {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }

  .fb-header-badges {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    min-height: 1.4rem;
  }

  @media (max-width: 767px) {
    .fb-header {
      flex-direction: column;
    }
  }
</style>
