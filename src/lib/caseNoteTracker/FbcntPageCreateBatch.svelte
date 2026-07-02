<script lang="ts">
  import FbTextArea from '$lib/components/fb/fbTextArea.svelte';
  import FbTextInput from '$lib/components/fb/fbTextInput.svelte';
  import type { CntStore } from './cntStore';
  import FbcntLocation from './FbcntLocation.svelte';

  export let store: CntStore;
  export let purpose = '';
  export let setPurpose: (value: string) => void = () => {};
  export let currentLocationUuid = '';
  export let setCurrentLocationUuid: (value: string) => void = () => {};
  export let destinationUuid = '';
  export let setDestinationUuid: (value: string) => void = () => {};
  export let barcode = '';
  export let setBarcode: (value: string) => void = () => {};
</script>

<section class="form-stack">
  <FbTextArea label="Purpose" value={purpose} onChange={setPurpose} fullWidth />
  <FbcntLocation label="Current location" {store} value={currentLocationUuid} onChange={setCurrentLocationUuid} />
  <FbcntLocation label="Intended destination" {store} value={destinationUuid} onChange={setDestinationUuid} />
  <FbTextInput label="Bar code" value={barcode} onChange={setBarcode} />
</section>

<style>
  .form-stack {
    width: min(48rem, 100%);
    display: grid;
    gap: 0.8rem;
  }
</style>
